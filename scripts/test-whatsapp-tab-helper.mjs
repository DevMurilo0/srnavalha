import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const root=new URL('../tools/whatsapp-tab-helper/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
const background=await readFile(new URL('background.js',root),'utf8');
const page=await readFile(new URL('whatsapp-page.js',root),'utf8');
assert.equal(manifest.version,'4.0.0');
assert.ok(manifest.permissions.includes('scripting'));
assert.ok(manifest.content_scripts.some(c=>c.js.includes('whatsapp-page.js')));
assert.ok(!background.includes("tabs,'update',target.id,{url"),'Existing tabs must never receive a URL update');
const check=(label,pass)=>{assert.ok(pass,label);console.log('PASS '+label)};
for (const family of ['Firefox/Floorp','Chrome']){
 let listener=null,tabs=[{id:22,url:'https://web.whatsapp.com/',windowId:1,active:true,lastAccessed:40}],actions=[];
 const methods={
  tabs:{
   async query(){return tabs.map(t=>({...t}))},
   async update(id,changes){actions.push({type:'update',id,changes});Object.assign(tabs.find(t=>t.id===id),changes);return tabs.find(t=>t.id===id)},
   async create(opt){actions.push({type:'create'});const t={id:53,windowId:1,...opt};tabs.push(t);return t},
   async sendMessage(id,data){actions.push({type:'message',id,data});return {ok:true,mode:'draft-ready',reloaded:false}}
  },
  scripting:{async executeScript(){actions.push({type:'inject'})}},
  windows:{async update(){}},
  runtime:{lastError:null,onMessage:{addListener(fn){listener=fn}}}
 };
 const chrome={tabs:{},scripting:{},windows:{},runtime:methods.runtime};
 for(const domain of ['tabs','scripting','windows'])for(const [name,fn] of Object.entries(methods[domain])){
  chrome[domain][name]=(...args)=>{const callback=args.pop();fn(...args).then(callback,error=>{
   chrome.runtime.lastError={message:String(error?.message||error)};
   callback(undefined);chrome.runtime.lastError=null;
  })};
 }
 runInNewContext(background,family==='Chrome'?{chrome,URL,setTimeout}:{browser:methods,URL,setTimeout});
 const sender={url:'http://127.0.0.1:5500/admin.html',tab:{windowId:1}};
 const request=(url,origin=sender)=>new Promise(resolve=>listener({type:'SRN_OPEN_WHATSAPP_TAB',url},origin,resolve));
 const link=(phone,msg)=>'https://web.whatsapp.com/send?phone='+phone+'&text='+encodeURIComponent(msg);
 const a=await request(link('5581999999999','Primeiro cliente'));
 const b=await request(link('5581988888888','Segundo cliente'));
 check(family+': two customers use same tab without navigation',
   a.ok&&b.ok&&a.reloaded===false&&b.reloaded===false&&
   tabs.length===1&&tabs[0].url==='https://web.whatsapp.com/'&&
   actions.filter(x=>x.type==='update').every(x=>!('url' in x.changes))&&
   actions.filter(x=>x.type==='create').length===0);
 check(family+': exact phone and text delivered to in-page script',
   actions.filter(x=>x.type==='message')[1]?.data?.phone==='5581988888888'&&
   actions.filter(x=>x.type==='message')[1]?.data?.text==='Segundo cliente');
 const invalid=await request('https://evil.example/send?phone=5581999999999&text=x');
 check(family+': rejects invalid destination',!invalid.ok);
 const spoofed=await request(link('5581999999999','x'),{url:'https://evil.vercel.app/admin.html',tab:{windowId:1}});
 check(family+': rejects untrusted site',!spoofed.ok);
 tabs=[];
 const c=await request(link('5581999999999','first visit'));
 check(family+': initial WhatsApp tab created only when absent',c.ok&&
   actions.filter(x=>x.type==='create').length===1&&tabs[0].url==='https://web.whatsapp.com/');
}
check('Page script uses New Chat and protects unsent draft',
 page.includes("find(selectors.newChat)")&&page.includes("mode:'draft-conflict'")&&
 page.includes("mode:'draft-ready'")&&page.includes("SRN_WHATSAPP_OPEN_CHAT_IN_APP"));
check('Page script never presses WhatsApp send button',!page.includes("querySelector('[data-icon=\"send\"]')"));
console.log('WhatsApp helper 4.0: no-reload regression checks passed.');
