import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const dir=new URL('../tools/whatsapp-tab-helper/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));
const source=await readFile(new URL('background.js',dir),'utf8');
const bridge=await readFile(new URL('bridge.js',dir),'utf8');
let listener=null,opened=[
 {id:22,url:'https://web.whatsapp.com/',windowId:1,active:false,lastAccessed:200},
 {id:9,url:'https://api.whatsapp.com/send',windowId:1,active:false,lastAccessed:300}
];
const actions=[];
const browser={
 runtime:{onMessage:{addListener(fn){listener=fn}}},
 tabs:{
  async query(){return opened.map(row=>({...row}))},
  async update(id,data){actions.push({type:'update',id,...data});const target=opened.find(t=>t.id===id);if(!target)throw Error('No such tab');Object.assign(target,data);return {...target}},
  async create(data){actions.push({type:'create',...data});const tab={id:53,...data};opened.push(tab);return tab}
 },
 windows:{async update(id,data){actions.push({type:'focus',id,...data})}}
};
runInNewContext(source,{browser,URL,globalThis:{browser},console});
const sender={tab:{url:'https://srnavalha-5qjw1ik6s-murilo15.vercel.app/admin.html',windowId:1}};
const chat='https://web.whatsapp.com/send?phone=5581999999999&text=Confirmar%20hor%C3%A1rio';
const check=(label,condition)=>{assert.ok(condition,label);console.log('PASS '+label)};
check('Manifest V3 includes Firefox scripts and tab permission',
 manifest.manifest_version===3&&manifest.permissions.includes('tabs')&&
 manifest.background.scripts?.includes('background.js')&&manifest.browser_specific_settings?.gecko);
check('Browser bridge only allows Sr. Navalha admin and validates message origin',
 bridge.includes("location.pathname==='/admin.html'")&&bridge.includes('event.origin!==location.origin'));
const result=await listener({type:'SRN_OPEN_WHATSAPP_TAB',url:chat},sender);
check('Existing WhatsApp Web tab was reused',result.ok&&result.reused&&actions.filter(a=>a.type==='update')[0].id===22);
check('Redirector tab was not selected',opened.find(t=>t.id===9).url==='https://api.whatsapp.com/send');
const next='https://web.whatsapp.com/send?phone=5581999998888&text=Outro%20cliente';
await listener({type:'SRN_OPEN_WHATSAPP_TAB',url:next},sender);
check('Second client reuses identical tab ID without opening new tabs',
 actions.filter(a=>a.type==='update').every(a=>a.id===22)&&
 actions.filter(a=>a.type==='create').length===0);
const before=actions.length;
const forbidden=await listener({type:'SRN_OPEN_WHATSAPP_TAB',url:'https://evil.example/send?phone=5581999999999'},sender);
check('External URLs rejected',!forbidden.ok&&actions.length===before);
const spoof=await listener({type:'SRN_OPEN_WHATSAPP_TAB',url:chat},{tab:{url:'https://evil.vercel.app/admin.html'}});
check('Untrusted Vercel sites cannot control WhatsApp tabs',!spoof.ok&&actions.length===before);
opened=[];
const first=await listener({type:'SRN_OPEN_WHATSAPP_TAB',url:chat},sender);
check('One tab created only if no WhatsApp tab exists',first.ok&&!first.reused&&actions.filter(a=>a.type==='create').length===1);
const second=await listener({type:'SRN_OPEN_WHATSAPP_TAB',url:next},sender);
check('Subsequent request does not create a second tab',second.ok&&second.reused&&actions.filter(a=>a.type==='create').length===1);
console.log('WhatsApp existing-tab helper checks passed.');
