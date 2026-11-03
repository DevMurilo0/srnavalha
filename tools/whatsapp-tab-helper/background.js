/* Sr. Navalha: navigate an existing WhatsApp Web tab, never send messages. */
const EXT=globalThis.browser??globalThis.chrome;

function allowedAdmin(urlString){
 try{
  const u=new URL(urlString);
  const host=u.hostname;
  const allowed=host==='srnavalha.vercel.app'
   || /^srnavalha-[a-z0-9]+-murilo15\.vercel\.app$/.test(host)
   || host==='srnavalha.com.br'
   || ((host==='localhost'||host==='127.0.0.1')&&u.protocol==='http:');
  return allowed&&u.pathname==='/admin.html';
 }catch{return false}
}
function validChat(urlString){
 try{
  const u=new URL(urlString);
  const phone=u.searchParams.get('phone')||'';
  const message=u.searchParams.get('text')||'';
  return u.protocol==='https:'&&u.hostname==='web.whatsapp.com'&&u.pathname==='/send'
   && /^55\d{10,11}$/.test(phone)&&message.length>0&&message.length<=6000;
 }catch{return false}
}
async function openExistingWhatsappTab(url,sender){
 if(!allowedAdmin(sender?.tab?.url)||!validChat(url))return {ok:false,error:'Origem ou link não autorizado'};
 const opened=await EXT.tabs.query({url:['https://web.whatsapp.com/*','https://api.whatsapp.com/*']});
 // Prefer a WhatsApp Web tab. Redirector tabs are only reused when no Web tab exists.
 const web=opened.filter(tab=>tab.url?.startsWith('https://web.whatsapp.com/'));
 const candidates=web.length?web:opened;
 const target=candidates.find(tab=>tab.active)||candidates.sort((a,b)=>(b.lastAccessed||0)-(a.lastAccessed||0))[0];
 if(target?.id!==undefined){
  await EXT.tabs.update(target.id,{url,active:true});
  if(target.windowId!==undefined)await EXT.windows.update(target.windowId,{focused:true});
  return {ok:true,reused:true};
 }
 const created=await EXT.tabs.create({url,active:true,windowId:sender.tab?.windowId});
 return {ok:true,reused:false,tabId:created.id};
}
EXT.runtime.onMessage.addListener((message,sender)=>{
 if(message?.type!=='SRN_OPEN_WHATSAPP_TAB')return;
 return openExistingWhatsappTab(message.url,sender).catch(error=>({ok:false,error:String(error?.message||error)}));
});
