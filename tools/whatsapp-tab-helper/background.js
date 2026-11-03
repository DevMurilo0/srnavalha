/* Sr. Navalha · Universal MV3 click-to-chat. Reuses existing WhatsApp tab.
 * Different phones can reload the tab; never searches the sidebar or sends.
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
  if (!allowedAdmin(sender?.url) && !allowedAdmin(sender?.tab?.url))
    return {ok:false,error:'Painel não autorizado'};
  if (!validChat(link))
    return {ok:false,error:'Número ou mensagem inválido'};

  const requested=new URL(link);
  const destination='https://web.whatsapp.com/send?phone='+
    requested.searchParams.get('phone')+'&text='+
    encodeURIComponent(requested.searchParams.get('text'));
  const tabs=await apiCall(API.tabs,'query',{
    url:['https://web.whatsapp.com/*','https://api.whatsapp.com/*']
  });
  const web=tabs.filter(t=>t.url?.startsWith('https://web.whatsapp.com/'));
  const candidates=web.length?web:tabs;
  const same=candidates.filter(t=>t.windowId===sender?.tab?.windowId);
  const pool=same.length?same:candidates;
  const target=[...pool].sort((x,y)=>
    (Number(y.active)-Number(x.active))||
    ((y.lastAccessed||0)-(x.lastAccessed||0))
  )[0];
  if(Number.isInteger(target?.id)){
    // The URL-based click-to-chat feature opens unsaved numbers and prefills
    // the message. It can reload WhatsApp, but ALWAYS uses the same tab.
    const unchanged=target.url===destination;
    await apiCall(API.tabs,'update',target.id,
      unchanged?{active:true}:{url:destination,active:true});
    if(Number.isInteger(target.windowId)){
      try{await apiCall(API.windows,'update',target.windowId,{focused:true})}
      catch{/* Nonessential; target was opened. */}
    }
    return {ok:true,reused:true,mode:'direct-chat',mayReload:!unchanged,tabId:target.id};
  }
  const options={url:destination,active:true};
  if(Number.isInteger(sender?.tab?.windowId))options.windowId=sender.tab.windowId;
  const created=await apiCall(API.tabs,'create',options);
  return {ok:true,reused:false,mode:'direct-chat',mayReload:true,tabId:created?.id};
}

// Use sendResponse + return true in BOTH browser families.
// Returning only a Promise from an MV3 listener is unreliable in Chrome.
API.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'SRN_EXTENSION_PING') {
    sendResponse({ok: true, version: '2.2.0'});
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
