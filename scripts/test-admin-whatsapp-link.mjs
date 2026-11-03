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
