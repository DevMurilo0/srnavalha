/* Sr. Navalha · Firefox / Floorp / Chrome content script.
 * Bridges same-origin messages from admin.html to the extension runtime.
 */
const extensionIsFirefox = typeof browser !== 'undefined' && Boolean(browser?.runtime);
const extensionRuntime = extensionIsFirefox ? browser.runtime : chrome.runtime;
const extensionHost = location.hostname;
const extensionAllowed = location.pathname === '/admin.html' && (
  extensionHost === 'srnavalha.vercel.app' ||
  extensionHost === 'srnavalha.com.br' ||
  /^srnavalha-[a-z0-9-]+-murilo15\.vercel\.app$/.test(extensionHost) ||
  ((extensionHost === 'localhost' || extensionHost === '127.0.0.1') &&
   location.protocol === 'http:')
);

function extensionRequest(message) {
  if (extensionIsFirefox) return Promise.resolve(extensionRuntime.sendMessage(message));
  return new Promise((resolve, reject) => {
    extensionRuntime.sendMessage(message, reply => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(reply);
    });
  });
}

function extensionResponse(type, id, data = {}) {
  window.postMessage({
    scope: 'srnavalha.whatsapp-tabs',
    sender: 'extension',
    type, id, ...data
  }, location.origin);
}

if (extensionAllowed) {
  window.addEventListener('message', async event => {
    if (event.source !== window || event.origin !== location.origin) return;
    const request = event.data;
    if (request?.scope !== 'srnavalha.whatsapp-tabs' ||
        request.sender !== 'page' ||
        !Number.isSafeInteger(request.id)) return;

    if (request.type === 'PING') {
      try {
        // A successful handshake means not just injected script present but
        // the background worker itself is responding.
        const pong = await extensionRequest({type: 'SRN_EXTENSION_PING'});
        if (pong?.ok) extensionResponse('READY', request.id, {version: pong.version});
        else extensionResponse('ERROR', request.id, {error: 'Serviço da extensão indisponível'});
      } catch (error) {
        extensionResponse('ERROR', request.id, {error: String(error?.message || error)});
      }
      return;
    }
    if (request.type !== 'OPEN') return;
    try {
      const result = await extensionRequest({
        type: 'SRN_OPEN_WHATSAPP_TAB',
        url: request.url
      });
      extensionResponse('RESULT', request.id, {
        ok: Boolean(result?.ok),
        reused: Boolean(result?.reused),
        error: result?.error || ''
      });
    } catch (error) {
      extensionResponse('RESULT', request.id, {
        ok: false,
        error: String(error?.message || error)
      });
    }
  });
}
