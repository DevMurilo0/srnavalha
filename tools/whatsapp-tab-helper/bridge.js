/* Minimal, origin-restricted bridge between admin.html and the browser Tabs API. */
const EXT=globalThis.browser??globalThis.chrome;
const host=location.hostname;
const allowed=location.pathname==='/admin.html'&&(
 host==='srnavalha.vercel.app'
 || /^srnavalha-[a-z0-9]+-murilo15\.vercel\.app$/.test(host)
 || host==='srnavalha.com.br'
 || ((host==='localhost'||host==='127.0.0.1')&&location.protocol==='http:')
);
if(allowed){
 window.addEventListener('message',async event=>{
  if(event.source!==window||event.origin!==location.origin)return;
  const request=event.data;
  if(request?.scope!=='srnavalha.whatsapp-tabs'||request.sender!=='page')return;
  if(!Number.isSafeInteger(request.id))return;
  const respond=(type,result={})=>window.postMessage({
   scope:'srnavalha.whatsapp-tabs',sender:'extension',type,id:request.id,...result
  },location.origin);
  if(request.type==='PING'){respond('READY');return}
  if(request.type!=='OPEN')return;
  try{
   const value=await EXT.runtime.sendMessage({type:'SRN_OPEN_WHATSAPP_TAB',url:request.url});
   respond('RESULT',{ok:!!value?.ok,reused:!!value?.reused,error:value?.error||''});
  }catch(error){respond('RESULT',{ok:false,error:String(error?.message||error)})}
 });
}
