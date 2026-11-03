import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const admin=await readFile(new URL('../js/admin.js',import.meta.url),'utf8');
const start=admin.indexOf('function whatsappAppLink(');
const end=admin.indexOf('\nfunction composeMessage(',start);
assert.ok(start>=0&&end>start,'App and Web link builders must exist');
const links={};
runInNewContext(admin.slice(start,end)+'\nthis.links={app:whatsappAppLink,web:whatsappWebLink};',links);

const message='Olá, cliente!\nCorte e barba às 11:00 — Gravatá';
const phone='55 (81) 98903-1588';
const appLink=links.links.app(phone,message);
const webLink=links.links.web(phone,message);
assert.equal(appLink.startsWith('whatsapp://send?phone=5581989031588&text='),true);
assert.equal(new URL(appLink).searchParams.get('phone'),'5581989031588');
assert.equal(new URL(appLink).searchParams.get('text'),message);
assert.equal(new URL(webLink).hostname,'web.whatsapp.com');
assert.equal(new URL(webLink).searchParams.get('text'),message);
assert.throws(()=>links.links.app('123',message),/inválido/);
assert.throws(()=>links.links.web('123',message),/inválido/);
console.log('PASS WhatsApp app/web links: same phone, accents and line breaks');

const handlerEnd=admin.indexOf("\n$('#message-open-link').addEventListener",start);
assert.ok(handlerEnd>end,'Send Message handler must exist');

const booking={
 id:'booking-test-1',customer_phone:'5581989031588',
 customer_name:'Cliente Teste',service_name:'Corte',
 starts_at:'2026-11-06T14:00:00Z',professional_name:'Eduardo'
};
function simulate(mobile){
 const nodes=new Map();
 const node=id=>{
  if(!nodes.has(id))nodes.set(id,{href:'',textContent:'',
   showModal(){this.opened=true}});
  return nodes.get(id);
 };
 const called={web:[],app:[]};
 const env={
  $:node,fmtFull:()=> '06 de novembro',fmtHour:()=> '11:00',
  isMobileWhatsApp:()=>mobile,
  openWhatsAppWeb:link=>{called.web.push(link);return 'helper'},
  openInstalledWhatsApp:link=>{called.app.push(link);return true},
  updateWhatsappHelperHint:()=>{},
  markDemoReminderOpened:()=>{},
  renderDashboard:()=>{},
  feedback:()=>{},
  sharedMode:false,previewBooking:null
 };
 runInNewContext(admin.slice(start,handlerEnd)+'\nthis.clickMessage=sendMessage;',env);
 env.clickMessage(booking);
 return {called,node};
}
const desktop=simulate(false);
assert.equal(desktop.called.web.length,1,'Desktop should keep extension/web route by default');
assert.equal(desktop.called.app.length,0,'Desktop should not force unsupported native protocol');
assert.equal(new URL(desktop.node('#message-app-link').href).protocol,'whatsapp:');
assert.ok(desktop.node('#message-dialog').opened);
console.log('PASS Desktop: browser route available and installed-app link is optional');

const mobile=simulate(true);
assert.equal(mobile.called.web.length,0,'Mobile must not open WhatsApp Web automatically');
assert.equal(mobile.called.app.length,1,'Mobile must try installed app immediately');
assert.equal(new URL(mobile.called.app[0]).searchParams.get('phone'),'5581989031588');
assert.equal(new URL(mobile.called.app[0]).searchParams.get('text'),mobile.node('#message-preview').textContent);
assert.ok(mobile.node('#message-info').textContent.includes('aplicativo'));
assert.ok(mobile.node('#message-dialog').opened);
console.log('PASS Mobile: single native-app attempt, no WhatsApp Web redirect, preview remains available');
