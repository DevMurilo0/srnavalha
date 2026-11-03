/* Sr. Navalha · Cross-browser WebExtension MV3 background.
 * Chrome: service worker + callback API. Firefox/Floorp: background script +
 * Promise API. Only navigates tabs; never reads or sends WhatsApp messages.
 */
const isFirefoxApi = typeof browser !== 'undefined' && Boolean(browser?.tabs);
const API = isFirefoxApi ? browser : chrome;

function apiCall(target, method, ...args) {
  if (isFirefoxApi) return Promise.resolve(target[method](...args));
  return new Promise((resolve, reject) => {
    target[method](...args, result => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(result);
    });
  });
}

function allowedAdmin(input) {
  try {
    const url = new URL(input);
    const host = url.hostname;
    const local = ['127.0.0.1', 'localhost'].includes(host) && url.protocol === 'http:';
    const deployed = url.protocol === 'https:' && (
      host === 'srnavalha.vercel.app' ||
      host === 'srnavalha.com.br' ||
      /^srnavalha-[a-z0-9-]+-murilo15\.vercel\.app$/.test(host)
    );
    return url.pathname === '/admin.html' && (local || deployed);
  } catch {
    return false;
  }
}

function validChat(input) {
  try {
    const url = new URL(input);
    const phone = url.searchParams.get('phone') || '';
    const message = url.searchParams.get('text') || '';
    return url.protocol === 'https:' &&
      url.hostname === 'web.whatsapp.com' &&
      url.pathname === '/send' &&
      /^55\d{10,11}$/.test(phone) &&
      message.length >= 1 && message.length <= 6000;
  } catch {
    return false;
  }
}

async function reuseWhatsApp(link, sender) {
  // sender.url is the content script's own document URL; sender.tab.url
  // may be absent depending on browser permissions and privacy settings.
  if (!allowedAdmin(sender?.url) && !allowedAdmin(sender?.tab?.url)) {
    return {ok: false, error: 'Painel não autorizado. Abra admin.html do Sr. Navalha.'};
  }
  if (!validChat(link)) return {ok: false, error: 'Link do WhatsApp inválido.'};

  const tabs = await apiCall(API.tabs, 'query', {
    url: ['https://web.whatsapp.com/*', 'https://api.whatsapp.com/*']
  });
  const web = tabs.filter(t => t.url?.startsWith('https://web.whatsapp.com/'));
  const candidates = web.length ? web : tabs;
  // Prefer the WhatsApp tab in the same browser window, then the most recent.
  const sameWindow = candidates.filter(t => t.windowId === sender?.tab?.windowId);
  const available = sameWindow.length ? sameWindow : candidates;
  const target = [...available].sort((a,b) =>
    (Number(b.active) - Number(a.active)) ||
    ((b.lastAccessed || 0) - (a.lastAccessed || 0))
  )[0];

  if (Number.isInteger(target?.id)) {
    await apiCall(API.tabs, 'update', target.id, {url: link, active: true});
    if (Number.isInteger(target.windowId)) {
      try { await apiCall(API.windows, 'update', target.windowId, {focused: true}); }
      catch { /* navigation succeeded, focus is optional */ }
    }
    return {ok: true, reused: true, tabId: target.id};
  }
  const options = {url: link, active: true};
  if (Number.isInteger(sender?.tab?.windowId)) options.windowId = sender.tab.windowId;
  const created = await apiCall(API.tabs, 'create', options);
  return {ok: true, reused: false, tabId: created?.id};
}

// Use sendResponse + return true in BOTH browser families.
// Returning only a Promise from an MV3 listener is unreliable in Chrome.
API.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'SRN_EXTENSION_PING') {
    sendResponse({ok: true, version: '2.0.0'});
    return false;
  }
  if (message?.type !== 'SRN_OPEN_WHATSAPP_TAB') return false;
  reuseWhatsApp(message.url, sender)
    .then(sendResponse)
    .catch(error => sendResponse({
      ok: false, error: String(error?.message || error)
    }));
  return true;
});
