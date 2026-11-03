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

async function searchInsideWhatsApp(tabId, phone) {
  const request = {type: 'SRN_WHATSAPP_FIND_CONTACT', phone};
  try {
    return await apiCall(API.tabs, 'sendMessage', tabId, request);
  } catch {
    // An already-open WhatsApp tab may predate installation of the extension.
    // Inject the lightweight search script without navigating or reloading.
    await apiCall(API.scripting, 'executeScript', {
      target: {tabId},
      files: ['whatsapp-page.js']
    });
    return await apiCall(API.tabs, 'sendMessage', tabId, request);
  }
}

async function reuseWhatsApp(link, sender) {
  if (!allowedAdmin(sender?.url) && !allowedAdmin(sender?.tab?.url)) {
    return {ok: false, error: 'Painel não autorizado. Abra admin.html do Sr. Navalha.'};
  }
  if (!validChat(link)) return {ok: false, error: 'Link do WhatsApp inválido.'};

  const url = new URL(link);
  const phone = url.searchParams.get('phone');
  const tabs = await apiCall(API.tabs, 'query', {
    url: ['https://web.whatsapp.com/*', 'https://api.whatsapp.com/*']
  });
  const web = tabs.filter(tab => tab.url?.startsWith('https://web.whatsapp.com/'));
  const candidates = web.length ? web : tabs;
  const sameWindow = candidates.filter(tab => tab.windowId === sender?.tab?.windowId);
  const available = sameWindow.length ? sameWindow : candidates;
  const target = [...available].sort((a,b) =>
    (Number(b.active) - Number(a.active)) ||
    ((b.lastAccessed || 0) - (a.lastAccessed || 0))
  )[0];

  if (Number.isInteger(target?.id)) {
    // CRITICAL: never pass a URL into tabs.update for an existing
    // WhatsApp Web tab. That reloads the whole app for every customer.
    await apiCall(API.tabs, 'update', target.id, {active: true});
    if (Number.isInteger(target.windowId)) {
      try { await apiCall(API.windows, 'update', target.windowId, {focused: true}); }
      catch { /* focusing is optional */ }
    }
    if (target.url?.startsWith('https://web.whatsapp.com/')) {
      try {
        const result = await searchInsideWhatsApp(target.id, phone);
        return {
          ok: Boolean(result?.ok),
          reused: true,
          mode: result?.mode || 'search-unavailable',
          error: result?.error || '',
          message: result?.message || '',
          tabId: target.id
        };
      } catch (error) {
        return {ok: false, reused: true, mode: 'search-unavailable',
          error: 'Não foi possível pesquisar na aba existente: ' +
            String(error?.message || error), tabId: target.id};
      }
    }
    // This was merely the intermediate api.whatsapp.com page, not an active
    // WhatsApp Web tab; one initial navigation is needed to enter the app.
    await apiCall(API.tabs, 'update', target.id, {url: link, active: true});
    return {ok: true, reused: true, mode: 'first-navigation', tabId: target.id};
  }

  // No WhatsApp tabs exist. One initial load is unavoidable.
  const options = {url: link, active: true};
  if (Number.isInteger(sender?.tab?.windowId)) options.windowId = sender.tab.windowId;
  const created = await apiCall(API.tabs, 'create', options);
  return {ok: true, reused: false, mode: 'first-navigation', tabId: created?.id};
}

// Use sendResponse + return true in BOTH browser families.
// Returning only a Promise from an MV3 listener is unreliable in Chrome.
API.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'SRN_EXTENSION_PING') {
    sendResponse({ok: true, version: '2.1.0'});
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
