import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const root=new URL('../tools/whatsapp-tab-helper/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
const background=await readFile(new URL('background.js',root),'utf8');
const bridge=await readFile(new URL('bridge.js',root),'utf8');
const page=await readFile(new URL('whatsapp-page.js',root),'utf8');
const check=(message,pass)=>{assert.ok(pass,message);console.log('PASS '+message)};

check('Manifest supports Firefox Floorp Chrome and in-page search',
 manifest.version==='2.2.0'&&manifest.manifest_version===3&&
 manifest.background.service_worker==='background.js'&&
 manifest.background.scripts.includes('background.js')&&
 manifest.permissions.includes('scripting')&&
 manifest.content_scripts.some(row=>row.js.includes('whatsapp-page.js')&&row.matches.includes('https://web.whatsapp.com/*')));

for(const family of ['Firefox/Floorp','Chrome']){
 let tabs=[
  {id:22,url:'https://web.whatsapp.com/',windowId:1,active:true,lastAccessed:200},
  {id:9,url:'https://api.whatsapp.com/send',windowId:1,active:false,lastAccessed:300}
 ];
 let installed=false,listener=null;
 const actions=[];
 const api={
  tabs:{
   async query(){return tabs.map(tab=>({...tab}))},
   async update(id,changes){
    actions.push({type:'update',id,changes:{...changes}});
    const tab=tabs.find(row=>row.id===id);
    assert.ok(tab,'Cannot update nonexistent tab');
    Object.assign(tab,changes);return {...tab};
   },
   async create(options){
    actions.push({type:'create',options:{...options}});
    const tab={id:53,windowId:1,...options};tabs.push(tab);
    return tab;
   },
   async sendMessage(id,message){
    actions.push({type:'sendMessage',id,message});
    if(!installed)throw Error('Receiving end does not exist');
    if(message.type==='SRN_WHATSAPP_FIND_CONTACT')
      return {ok:true,mode:'draft-ready',message:'Chat opened and draft prepared'};
    throw Error('Invalid request');
   }
  },
  scripting:{async executeScript(options){
   actions.push({type:'inject',options});
   installed=true;
   return [{result:true}];
  }},
  windows:{async update(id,changes){
   actions.push({type:'focus',id,changes});
  }},
  runtime:{lastError:null,onMessage:{addListener(fn){listener=fn}}}
 };
 const callbacks={
  ...api,
  tabs:Object.fromEntries(Object.entries(api.tabs).map(([method,fn])=>
   [method,(...args)=>{
    const cb=args.pop();
    fn(...args).then(cb,error=>{
     callbacks.runtime.lastError={message:String(error?.message||error)};
     cb(undefined);
     callbacks.runtime.lastError=null;
    });
   }])),
  scripting:{executeScript:(...args)=>{
   const cb=args.pop();api.scripting.executeScript(...args).then(cb);
  }},
  windows:{update:(...args)=>{
   const cb=args.pop();api.windows.update(...args).then(cb);
  }}
 };
 const isFirefox=family==='Firefox/Floorp';
 runInNewContext(background,isFirefox?{browser:api,URL,console}:{chrome:callbacks,URL,console});
 const sender={url:'http://127.0.0.1:5500/admin.html',tab:{windowId:1}};
 const call=(message,from=sender)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Extension did not respond')),1500);
  listener(message,from,data=>{clearTimeout(timer);resolve(data)});
 });
 const pong=await call({type:'SRN_EXTENSION_PING'});
 check(family+' extension answers readiness check',pong.ok&&pong.version==='2.2.0');
 const one='https://web.whatsapp.com/send?phone=5581999999999&text=Primeiro%20cliente';
 const two='https://web.whatsapp.com/send?phone=5581999998888&text=Segundo%20cliente';
 const first=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:one});
 const second=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:two});
 check(family+' searches each customer without reloading existing tab',
  first.ok&&second.ok&&first.mode==='draft-ready'&&second.mode==='draft-ready'&&
  tabs[0].url==='https://web.whatsapp.com/'&&
  actions.filter(row=>row.type==='update').every(row=>!('url' in row.changes))&&
  actions.filter(row=>row.type==='create').length===0);
 check(family+' injects search script once even when WhatsApp tab predates extension',
  actions.filter(row=>row.type==='inject').length===1&&
  actions.filter(row=>row.type==='sendMessage').length===3);
 check(family+' keeps redirector tab untouched',
  tabs[1].url==='https://api.whatsapp.com/send');
 const malicious=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:'https://evil.example/send'});
 check(family+' rejects untrusted destinations',!malicious.ok);
 const spoof=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:one},{
  url:'https://untrusted.vercel.app/admin.html',tab:{windowId:1}
 });
 check(family+' rejects untrusted websites',!spoof.ok);
 tabs=[];const created=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:one});
 const reused=await call({type:'SRN_OPEN_WHATSAPP_TAB',url:two});
 check(family+' creates only one initial tab',
  created.ok&&created.mode==='first-navigation'&&
  reused.ok&&reused.mode==='draft-ready'&&
  tabs.length===1&&
  actions.filter(row=>row.type==='create').length===1);

 // Bridge forwards the mode: searched, not a page navigation.
 const messages=[];let windowListener=null;
 const fauxWindow={
  addEventListener(type,fn){if(type==='message')windowListener=fn},
  postMessage(data,origin){messages.push({data,origin})}
 };
 const runtime=isFirefox
  ?message=>call(message)
  :(message,callback)=>{call(message).then(callback)};
 const loc={hostname:'127.0.0.1',pathname:'/admin.html',protocol:'http:',
  origin:'http://127.0.0.1:5500'};
 runInNewContext(bridge,isFirefox
  ?{browser:{runtime:{sendMessage:runtime}},window:fauxWindow,location:loc,console}
  :{chrome:{runtime:{sendMessage:runtime,lastError:null}},window:fauxWindow,location:loc,console});
 const event=async(type,extra={})=>windowListener({
  source:fauxWindow,origin:loc.origin,
  data:{scope:'srnavalha.whatsapp-tabs',sender:'page',id:42,type,...extra}
 });
 await event('PING');
 check(family+' bridge verifies background',messages.at(-1)?.data?.version==='2.2.0');
 await event('OPEN',{url:two});
 check(family+' bridge reports search without refresh',
  messages.at(-1)?.data?.ok&&messages.at(-1)?.data?.mode==='draft-ready');

 // The content script must open the exact matched row, fill a draft, and
 // never click the send button or rewrite the WhatsApp tab URL.
 let pageListener=null,active=null,phoneSearch='',composerValue='',clicks=0;
 class FakeInput{
  constructor(){this.tagName='INPUT';this.isConnected=true;}
  getClientRects(){return [{}]}
  closest(){return null}
  focus(){active=this}
  dispatchEvent(){}
  set value(v){phoneSearch=v}
  get value(){return phoneSearch}
 }
 class FakeRow{
  constructor(){this.tagName='DIV';this.isConnected=true;this.textContent='';}
  getClientRects(){return [{}]}
  closest(){return null}
  querySelectorAll(){return []}
  getAttribute(){return null}
  contains(){return false}
  click(){clicks++;composerValue=''}
 }
 class FakeComposer{
  constructor(){this.tagName='DIV';this.isConnected=true;this.textContent='';}
  getClientRects(){return [{}]}
  closest(){return null}
  focus(){active=this}
  dispatchEvent(){}
 }
 const search=new FakeInput(),row=new FakeRow(),composer=new FakeComposer();
 const doc={
  querySelector(selector){
   if(selector==='#side input[type="text"]')return search;
   if(selector==='#main footer div[contenteditable="true"]'&&clicks)return composer;
   return null;
  },
  querySelectorAll(selector){
   if(selector==='#pane-side [data-testid="cell-frame-container"]'&&phoneSearch.startsWith('55')){
    row.textContent=phoneSearch;return [row];
   }
   return [];
  },
  createRange(){return {selectNodeContents(){}}},
  execCommand(_cmd,_show,text){
   if(active===composer){composer.textContent=text;composerValue=text;}
   return true;
  }
 };
 const sandbox={
  browser:{runtime:{onMessage:{addListener(fn){pageListener=fn}}}},
  document:doc,window:{getSelection:()=>({removeAllRanges(){},addRange(){}})},
  console,setTimeout,Event:class{},InputEvent:class{},
  HTMLInputElement:FakeInput,HTMLTextAreaElement:class{}
 };
 runInNewContext(page,sandbox);
 const lookup=(message)=>new Promise(resolve=>pageListener(message,{},resolve));
 const messageText='Olá, cliente!\\nCorte marcado para 11:00.';
 const loaded=await lookup({type:'SRN_WHATSAPP_FIND_CONTACT',phone:'5581999999999',text:messageText});
 check(family+' opens matched number and prepares the draft in composer',
  loaded.ok&&loaded.mode==='draft-ready'&&phoneSearch==='5581999999999'&&
  composerValue===messageText&&clicks===1);
 check(family+' refuses invalid phone before selecting any chat',
  !(await lookup({type:'SRN_WHATSAPP_FIND_CONTACT',phone:'123',text:messageText})).ok&&clicks===1);

}
console.log('WhatsApp tab helper 2.2: no-refresh navigation tests passed.');
