import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const admin=await readFile(new URL('../js/admin.js',import.meta.url),'utf8');
const start=admin.indexOf('function whatsappAppLink(');
const end=admin.indexOf("\n$('#message-close').addEventListener",start);
assert.ok(start>=0 && end>start,'App link and message action must exist');

const elements=new Map();
const $=selector=>{
 if(!elements.has(selector))elements.set(selector,{
  href:'',textContent:'',opened:false,
  showModal(){this.opened=true}
 });
 return elements.get(selector);
};
function el(tag,cls,label=''){
 const handlers=new Map();
 return {
  tagName:tag.toUpperCase(),className:cls,textContent:label,
  href:'',title:'',disabled:false,attributes:{},
  setAttribute(k,v){this.attributes[k]=v},
  addEventListener(type,fn){handlers.set(type,fn)},
  click(){handlers.get('click')?.({type:'click',defaultPrevented:false})}
 };
}
const context={
 $,el,
 fmtFull:()=> 'sexta-feira, 06 de novembro',
 fmtDay:()=> '06 nov',
 fmtHour:()=> '11:00',
 confirmationUrls:()=>({reply:'http://127.0.0.1:8047/confirmar.html?ref=booking-1&acao=escolher'}),
 previewBooking:null
};
runInNewContext(admin.slice(start,end)+'\nthis.api={whatsappAppLink,composeMessage,messageAction};',context);

const message='Olá, cliente!\nCorte e barba às 11:00 — Gravatá';
const appLink=context.api.whatsappAppLink('55 (81) 98903-1588',message);
const parsed=new URL(appLink);
assert.equal(parsed.protocol,'whatsapp:');
assert.equal(parsed.hostname,'send');
assert.equal(parsed.searchParams.get('phone'),'5581989031588');
assert.equal(parsed.searchParams.get('text'),message);
assert.throws(()=>context.api.whatsappAppLink('123',message),/inválido/);
console.log('PASS Native WhatsApp deep link: correct phone, line breaks and accents');

const booking={
 id:'booking-1',
 customer_phone:'5581989031588',
 customer_name:'Cliente de teste',
 service_name:'Corte',
 professional_name:'Eduardo',
 starts_at:'2026-11-06T14:00:00Z'
};
const action=context.api.messageAction(booking,'pending');
assert.equal(action.tagName,'A','Message must be a real navigable anchor');
assert.equal(action.href.startsWith('whatsapp://send?phone='),true);
assert.equal(new URL(action.href).searchParams.get('phone'),'5581989031588');
assert.match(new URL(action.href).searchParams.get('text'),/Eduardo/);
assert.match(new URL(action.href).searchParams.get('text'),/Corte/);
assert.match(action.attributes['aria-label'],/Cliente de teste/);
console.log('PASS Each pending booking has a trusted direct WhatsApp app link');
const signed={...booking,links:{reply:'https://srnavalha.vercel.app/confirmar.html?ref=booking-1&acao=escolher&sig=example'}};
const signedAction=context.api.messageAction(signed,'pending');
const signedText=new URL(signedAction.href).searchParams.get('text');
assert.match(signedText,/https:\/\/srnavalha\.vercel\.app\/confirmar\.html/);
assert.match(signedText,/Ficou com alguma dúvida\?/);
assert.ok(!signedText.includes('localhost'));
console.log('PASS Short message contains one public confirmation link and a friendly question invitation');

action.click();
assert.equal($('#message-dialog').opened,true);
assert.equal($('#message-app-link').href,action.href);
assert.equal($('#message-preview').textContent,context.api.composeMessage(booking));
assert.equal(context.previewBooking?.id,booking.id);
assert.match($('#message-info').textContent,/demonstração/i);
assert.equal($('#message-demo-link').hidden,false);
assert.match($('#message-demo-link').href,/acao=escolher/);
console.log('PASS Preview opens for manual sent tracking without changing the destination');

const alreadySent=context.api.messageAction({...booking,whatsapp_manual_sent_at:'2026-11-03T12:00:00Z'},'pending');
assert.equal(alreadySent.tagName,'A');
assert.equal(alreadySent.textContent,'Reenviar mensagem');

const confirmed=context.api.messageAction(booking,'confirmed');
assert.equal(confirmed.tagName,'BUTTON');
assert.equal(confirmed.disabled,true);

const invalid=context.api.messageAction({...booking,customer_phone:'123'},'pending');
assert.equal(invalid.disabled,true);
assert.ok(!admin.includes('web.whatsapp.com'), 'Admin must not automatically navigate to WhatsApp Web');
assert.ok(!admin.includes('window.location.assign('), 'App navigation must use real anchors, not scripted redirects');
assert.ok(!admin.includes('whatsappBridgeReady'), 'No extension is required for mobile');
console.log('PASS Safe disabled states and no extension or WhatsApp Web dependency');
