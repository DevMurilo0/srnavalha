import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const dir=new URL('../tools/whatsapp-tab-helper/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));
const background=await readFile(new URL('background.js',dir),'utf8');
const bridge=await readFile(new URL('bridge.js',dir),'utf8');
const check=(label,pass)=>{assert.ok(pass,label);console.log('PASS '+label)};

check('Single universal Manifest V3 for Firefox Floorp and Chrome',
 manifest.manifest_version===3 &&
 manifest.background.service_worker==='background.js' &&
 manifest.background.scripts.includes('background.js') &&
 manifest.version==='2.0.0');

for(const family of ['Firefox/Floorp','Chrome']){
 let tabs=[
  {id:22,url:'https://web.whatsapp.com/',windowId:1,active:true,lastAccessed:200},
  {id:9,url:'https://api.whatsapp.com/send',windowId:1,active:false,lastAccessed:300}
 ];
 const actions=[];
 let listener=null;
 const promises={
  tabs:{
   async query(){return tabs.map(x=>({...x}))},
   async update(id,options){
    actions.push({type:'update',id});
    const tab=tabs.find(x=>x.id===id);Object.assign(tab,options);return tab;
   },
   async create(options){
    actions.push({type:'create'});
    const tab={id:53,...options};tabs.push(tab);return tab;
   }
  },
  windows:{async update(id){actions.push({type:'focus',id})}},
  runtime:{lastError:null,onMessage:{addListener(fn){listener=fn}}}
 };
 const callbacks={
  tabs:Object.fromEntries(Object.entries(promises.tabs).map(([key,fn])=>
   [key,(...args)=>{const callback=args.pop();fn(...args).then(callback)}])),
  windows:{update:(...args)=>{const callback=args.pop();promises.windows.update(...args).then(callback)}},
  runtime:promises.runtime
 };
 const isFirefox=family==='Firefox/Floorp';
 runInNewContext(background,isFirefox?{browser:promises,URL,console}:{chrome:callbacks,URL,console});
 const sender={url:'http://127.0.0.1:5500/admin.html',tab:{windowId:1}};
 const call=(message,from=sender)=>new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('No background response')),1000);
  listener(message,from,value=>{clearTimeout(timeout);resolve(value)});
 });
 const pong=await call({type:'SRN_EXTENSION_PING'});
 check(family+' actual background heartbeat',pong?.ok&&pong?.version==='2.0.0');
 const url1='https://web.whatsapp.com/send?phone=5581999999999&text=Cliente%20um';
 const url2='https://web.whatsapp.com/send?phone=5581999998888&text=Cliente%20dois';
 const first=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:url1});
 const second=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:url2});
 check(family+' two clients use the SAME WhatsApp tab',
  first.ok&&first.reused&&second.ok&&second.reused&&
  tabs[0].url===url2&&tabs.length===2&&
  actions.filter(x=>x.type==='update'&&x.id===22).length===2&&
  actions.filter(x=>x.type==='create').length===0);
 check(family+' redirector tab remains unchanged',tabs[1].url==='https://api.whatsapp.com/send');
 const malicious=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:'https://evil.example/send'});
 check(family+' untrusted destination rejected',!malicious.ok);
 const spoof=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:url1},{
  url:'https://untrusted.vercel.app/admin.html',tab:{windowId:1}
 });
 check(family+' untrusted sender rejected',!spoof.ok);
 tabs=[];
 const created=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:url1});
 const reused=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:url2});
 check(family+' creates only one tab when none exists',created.ok&&!created.reused&&
  reused.ok&&reused.reused&&tabs.length===1&&tabs[0].url===url2);

 // Integration of the isolated content script and the corresponding
 // callback/Promise messaging protocol; no browser-specific source files.
 const responseEvents=[];
 let windowHandler=null;
 const simulatedWindow={
  addEventListener(name,fn){if(name==='message')windowHandler=fn},
  postMessage(data,origin){responseEvents.push({data,origin})}
 };
 const runtimeSend=isFirefox
  ?message=>call(message)
  :(message,callback)=>{call(message).then(callback)};
 const simulatedLocation={
  hostname:'127.0.0.1',pathname:'/admin.html',
  protocol:'http:',origin:'http://127.0.0.1:5500'
 };
 const globals=isFirefox
  ?{browser:{runtime:{sendMessage:runtimeSend}},window:simulatedWindow,location:simulatedLocation,console}
  :{chrome:{runtime:{sendMessage:runtimeSend,lastError:null}},window:simulatedWindow,location:simulatedLocation,console};
 runInNewContext(bridge,globals);
 const message=async(type,extra={})=>windowHandler({
  source:simulatedWindow,origin:simulatedLocation.origin,
  data:{scope:'srnavalha.whatsapp-tabs',sender:'page',id:42,type,...extra}
 });
 await message('PING');
 check(family+' bridge READY only after background responds',
  responseEvents.at(-1)?.data?.type==='READY'&&responseEvents.at(-1).data.version==='2.0.0');
 await message('OPEN',{url:url1});
 check(family+' bridge routes next WhatsApp contact',
  responseEvents.at(-1)?.data?.type==='RESULT'&&responseEvents.at(-1).data.ok);
}
console.log('Universal WhatsApp helper: all cross-browser protocol tests passed');
