import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const admin=await readFile(new URL('../js/admin.js',import.meta.url),'utf8');
const start=admin.indexOf('function whatsappWebLink(');
const end=admin.indexOf('\nfunction composeMessage(',start);
assert.ok(start>=0&&end>start,'WhatsApp URL builder must be defined before composeMessage');

const sandbox={};
runInNewContext(admin.slice(start,end)+'\nthis.createLink=whatsappWebLink;',sandbox);
assert.equal(typeof sandbox.createLink,'function','WhatsApp URL builder must be executable');

const text='Olá, cliente!\nCorte e barba às 11:00 — Gravatá';
const uri=sandbox.createLink('55 (81) 98903-1588',text);
const parsed=new URL(uri);
assert.equal(parsed.origin,'https://web.whatsapp.com');
assert.equal(parsed.pathname,'/send');
assert.equal(parsed.searchParams.get('phone'),'5581989031588');
assert.equal(parsed.searchParams.get('text'),text);
assert.throws(()=>sandbox.createLink('123','inválido'),/inválido/);
assert.ok(admin.includes('const link=whatsappWebLink(phone,composeMessage(booking));'),
 'Message button must call the defined builder');
assert.ok(admin.indexOf('function whatsappWebLink(')<admin.indexOf('const link=whatsappWebLink('),
 'URL builder must be defined before the Message button handler');

console.log('PASS WhatsApp URL builder: valid phone, Unicode, lines, and runtime definition');

// Exercise the same sendMessage function the button invokes, with an isolated
// browser environment. This catches undefined functions before deployment.
const handlerEnd=admin.indexOf("\n$('#message-open-link').addEventListener",start);
assert.ok(handlerEnd>end,'Message button handler must exist');
const elements=new Map();
const node=id=>{
 if(!elements.has(id))elements.set(id,{href:'',textContent:'',showModal(){this.opened=true}});
 return elements.get(id);
};
let routed='';
const simulated={
 $:node,fmtFull:()=> '06 de novembro',fmtHour:()=> '11:00',
 openWhatsAppWeb:link=>{routed=link;return 'helper'},
 updateWhatsappHelperHint:()=>{},
 markDemoReminderOpened:()=>{},
 renderDashboard:()=>{},
 feedback:()=>{},
 sharedMode:false,previewBooking:null
};
runInNewContext(admin.slice(start,handlerEnd)+'\nthis.clickMessage=sendMessage;',simulated);
simulated.clickMessage({
 id:'booking-test-1',customer_phone:'5581989031588',
 customer_name:'Cliente Teste',service_name:'Corte',
 starts_at:'2026-11-06T14:00:00Z',professional_name:'Eduardo'
});
assert.equal(new URL(routed).hostname,'web.whatsapp.com');
assert.equal(new URL(routed).searchParams.get('phone'),'5581989031588');
assert.match(new URL(routed).searchParams.get('text'),/Corte/);
assert.ok(node('#message-dialog').opened,'Message dialog should open without runtime exceptions');
console.log('PASS Message button handler: full click opens correct URL and preview without ReferenceError');

