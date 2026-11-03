import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const root=new URL('../tools/whatsapp-tab-helper/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
const background=await readFile(new URL('background.js',root),'utf8');
const bridge=await readFile(new URL('bridge.js',root),'utf8');
assert.equal(manifest.version,'3.0.0');
assert.ok(manifest.background.service_worker&&manifest.background.scripts.includes('background.js'));
assert.ok(manifest.content_scripts.every(x=>!x.matches.includes('https://web.whatsapp.com/*')));
assert.ok(!background.includes('SRN_WHATSAPP_FIND_CONTACT'),'Legacy search must never be used');
assert.ok(bridge.includes('SRN_OPEN_WHATSAPP_TAB'));
const check=(label,ok)=>{assert.ok(ok,label);console.log('PASS '+label)};
for(const kind of ['firefox','chrome']){
 let listener=null,tabs=[{id:22,url:'https://web.whatsapp.com/',active:true,windowId:1,lastAccessed:20}],actions=[];
 const api={
  tabs:{
   async query(){return tabs.map(x=>({...x}))},
   async update(id,changes){actions.push({type:'update',id,changes});const tab=tabs.find(x=>x.id===id);Object.assign(tab,changes);return {...tab}},
   async create(options){actions.push({type:'create'});const tab={id:53,windowId:1,...options};tabs.push(tab);return {...tab}}
  },
  windows:{async update(){}},
  runtime:{lastError:null,onMessage:{addListener(fn){listener=fn}}}
 };
 const chromeAPI={tabs:{},windows:{},runtime:api.runtime};
 for(const key of ['tabs','windows'])for(const [method,fn]of Object.entries(api[key])){
  chromeAPI[key][method]=(...args)=>{
   const callback=args.pop();
   fn(...args).then(callback,error=>{
    chromeAPI.runtime.lastError={message:String(error?.message||error)};
    callback(undefined);chromeAPI.runtime.lastError=null;
   });
  };
 }
 runInNewContext(background,kind==='firefox'?{browser:api,URL}:{chrome:chromeAPI,URL});
 const sender={url:'http://127.0.0.1:5500/admin.html',tab:{windowId:1}};
 const request=(url,origin=sender)=>new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Extension response timeout')),2000);
  listener({type:'SRN_OPEN_WHATSAPP_TAB',url},origin,data=>{clearTimeout(timeout);resolve(data)});
 });
 const make=(phone,text)=>'https://web.whatsapp.com/send?phone='+phone+'&text='+encodeURIComponent(text);
 const one=await request(make('5581989031588','Olá, primeiro cliente!'));
 const two=await request(make('5581989657081','Olá, segundo cliente!'));
 check(kind+': two customers open as direct chats in ONE existing tab',
  one.ok&&two.ok&&one.reused&&two.reused&&one.mode==='direct-chat'&&
  two.mode==='direct-chat'&&tabs.length===1&&
  new URL(tabs[0].url).searchParams.get('phone')==='5581989657081'&&
  new URL(tabs[0].url).searchParams.get('text')==='Olá, segundo cliente!'&&
  actions.filter(x=>x.type==='create').length===0);
 check(kind+': no sidebar search script invoked',!actions.some(x=>x.type==='search'));
 const same=await request(tabs[0].url);
 check(kind+': same URL does not force reload',same.ok&&same.mayReload===false);
 const unsafe=await request('https://evil.example/send?phone=5581989031588&text=x');
 check(kind+': unauthorized link is rejected',!unsafe.ok);
 const spoof=await request(make('5581989031588','Teste'),{
  url:'https://evil.vercel.app/admin.html',tab:{windowId:1}
 });
 check(kind+': untrusted admin origin rejected',!spoof.ok);
 tabs=[];
 const fresh=await request(make('5581989031588','Novo'));
 const later=await request(make('5581989657081','Seguinte'));
 check(kind+': at most one new tab if WhatsApp was closed',fresh.ok&&!fresh.reused&&
  later.ok&&later.reused&&tabs.length===1&&
  actions.filter(x=>x.type==='create').length===1);
}
console.log('WhatsApp v3 direct chat regression checks passed');
