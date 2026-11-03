/* Sr. Navalha — WhatsApp helper 4.0.0 (Firefox / Floorp / Chrome).
 * Existing WhatsApp tabs are NEVER navigated or reloaded. The content script
 * operates the visible New Chat UI, and never clicks Send.
 */
const isFirefox = typeof browser !== 'undefined' && !!browser.tabs;
const ext = isFirefox ? browser : chrome;
const api = (object, method, ...args) => isFirefox
  ? Promise.resolve(object[method](...args))
  : new Promise((resolve, reject) => object[method](...args, value => {
      const error = chrome.runtime.lastError;
      error ? reject(new Error(error.message)) : resolve(value);
    }));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function authorized(urlString) {
  try {
    const url = new URL(urlString);
    if (url.pathname !== '/admin.html') return false;
    const host = url.hostname;
    return (url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(host)) ||
      (url.protocol === 'https:' && (host === 'srnavalha.vercel.app' ||
        host === 'srnavalha.com.br' ||
        /^srnavalha-[a-z0-9-]+-murilo15\.vercel\.app$/.test(host)));
  } catch { return false; }
}
function extractRequest(input) {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.hostname !== 'web.whatsapp.com' ||
      url.pathname !== '/send') throw Error('Destino WhatsApp inválido');
  const phone = url.searchParams.get('phone') || '';
  const text = url.searchParams.get('text') || '';
  if (!/^55\d{10,11}$/.test(phone) || !text.trim() || text.length > 6000)
    throw Error('Número ou mensagem inválidos');
  return {phone, text};
}

async function requestInTab(tabId, data) {
  try { return await api(ext.tabs, 'sendMessage', tabId, data); }
  catch {
    // Tabs open before extension installation lack the injected script.
    await api(ext.scripting, 'executeScript', {
      target: {tabId}, files: ['whatsapp-page.js']
    });
    return api(ext.tabs, 'sendMessage', tabId, data);
  }
}
async function activate(tab) {
  await api(ext.tabs, 'update', tab.id, {active: true});
  if (Number.isInteger(tab.windowId)) {
    try { await api(ext.windows, 'update', tab.windowId, {focused: true}); }
    catch { /* Window focus is optional. */ }
  }
}
async function openChat(url, sender) {
  if (!authorized(sender?.url) && !authorized(sender?.tab?.url))
    return {ok: false, error: 'Painel administrativo não autorizado'};
  let request;
  try { request = extractRequest(url); }
  catch (error) { return {ok: false, error: error.message}; }

  const found = await api(ext.tabs, 'query', {url: ['https://web.whatsapp.com/*']});
  const inWindow = found.filter(tab => tab.windowId === sender?.tab?.windowId);
  const pool = inWindow.length ? inWindow : found;
  const target = [...pool].sort((a, b) =>
    Number(b.active) - Number(a.active) ||
    (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];

  if (target?.id != null) {
    await activate(target);
    try {
      const result = await requestInTab(target.id, {
        type: 'SRN_WHATSAPP_OPEN_CHAT_IN_APP', ...request
      });
      return { ...result, reused: true, tabId: target.id, reloaded: false };
    } catch (error) {
      return {ok: false, reused: true, reloaded: false,
        error: 'Falha ao acessar o WhatsApp já aberto: ' + error.message};
    }
  }

  // Only the *first* WhatsApp visit loads a page, because no tab exists.
  const options = {url: 'https://web.whatsapp.com/', active: true};
  if (Number.isInteger(sender?.tab?.windowId)) options.windowId = sender.tab.windowId;
  const created = await api(ext.tabs, 'create', options);
  for (let i = 0; i < 35; i++) {
    await delay(450);
    try {
      const result = await requestInTab(created.id, {
        type: 'SRN_WHATSAPP_OPEN_CHAT_IN_APP', ...request
      });
      return {...result, reused: false, tabId: created.id, reloaded: false};
    } catch { /* WhatsApp may still be loading. */ }
  }
  return {ok: false, reused: false, reloaded: false,
    error: 'O WhatsApp abriu, mas ainda não está pronto. Aguarde o login e tente novamente.'};
}

ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'SRN_EXTENSION_PING') {
    sendResponse({ok: true, version: '4.0.0'});
    return false;
  }
  if (message?.type !== 'SRN_OPEN_WHATSAPP_TAB') return false;
  openChat(message.url, sender).then(sendResponse).catch(error => sendResponse({
    ok: false, reloaded: false, error: String(error?.message || error)
  }));
  return true;
});
