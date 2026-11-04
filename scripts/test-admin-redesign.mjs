import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const [html,js,css,doc,customer,customerJs]=await Promise.all([
 read('admin.html'),read('js/admin.js'),read('css/admin.css'),read('docs/TESTE_WHATSAPP_DESKTOP.md'),read('confirmar.html'),read('js/confirmar.js')
]);

const check=(message,ok)=>{assert.ok(ok,message);console.log('PASS '+message)};
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
check('IDs in admin markup are unique',new Set(ids).size===ids.length);
for(const name of [
 'dashboard','admin-login','overview-view','confirmed-view','agenda-list',
 'stat-contact-waiting','stat-pending','stat-confirmed','stat-cancelled','stat-total',
 'upcoming-list','contact-queue-list','open-pending-contacts','contact-queue-empty',
 'msg-total-count','msg-unsent-count','msg-sent-count','appointments-list',
 'admin-search','admin-period','agenda-advanced','confirmed-search',
 'message-dialog','message-app-link','message-confirm-sent','status-dialog',
 'responses-view','responses-list','responses-search','responses-period','responses-count',
 'today-list','today-all','today-confirmed','today-cancelled',
 'recent-replies-list','stat-site-responses','side-response-count','reply-choice','message-demo-link'
]) check('Element '+name,ids.includes(name));

check('Task-first overview has upcoming appointments and contact queue',
 html.includes('class="operations-grid"')&&
 html.indexOf('id="upcoming-section"')<html.indexOf('id="agenda-list"')&&
 html.indexOf('id="contact-queue"')<html.indexOf('id="agenda-list"'));
check('Advanced filters stay behind accessible details',
 html.includes('<details class="agenda-advanced"')&&
 html.includes('data-status="pending"')&&
 html.includes('data-status="confirmed"')&&
 html.includes('data-message-filter="unsent"'));
check('Queue prioritizes future uncontacted pending bookings',
 js.includes("normalizedStatus(b)==='pending'&&!b.whatsapp_manual_sent_at")&&
 js.includes("Date.parse(b.starts_at)>=now")&&
 js.includes('contactQueue.slice(0,3).map(createContactQueueRow)'));
check('Queue shortcut updates message filter',
 js.includes("messageFilter='unsent'")&&
 js.includes("location.hash='#agenda-list'"));
check('Confirmations remain separate and searchable',
 js.includes("normalizedStatus(b)==='confirmed'")&&
 html.includes('id="confirmed-search"')&&
 html.includes('id="confirmed-period"'));
check('Message link remains native and does not auto-send',
 js.includes("const link=el('a','message',label)")&&
 js.includes("return 'whatsapp://send?phone='")&&
 !js.includes('window.location.assign(')&&
 !js.includes('web.whatsapp.com'));
check('Staff must explicitly register contact after sending',
 js.includes("action:'manual_message_sent'")&&
 js.includes('markDemoMessageSent(previewBooking.id)'));
check('Compact dashboard responsive at desktop and phone widths',
 css.includes('.operations-grid{display:grid')&&
 css.includes('.appointment{grid-template-columns:110px')&&
 css.includes('@media(max-width:600px)')&&
 css.includes('.mobile-admin-nav'));
check('Operating guide documents Windows and Linux tests without promising protocol support',
 doc.includes('WhatsApp Desktop')&&doc.includes('flatpak install flathub com.rtosta.zapzap')&&
 doc.includes('xdg-mime query default x-scheme-handler/whatsapp'));
check('Daily bookings and site responses have separate areas',
 html.includes('id="today-list"')&&html.includes('id="recent-replies-list"')&&
 html.includes('id="responses-view"')&&html.includes('data-admin-nav="responses"'));
check('Only customer site choices populate the reply registry',
 js.includes("b.confirmation_channel==='site'")&&
 js.includes("normalizedStatus(b)==='confirmed'")&&
 js.includes("normalizedStatus(b)==='cancelled'")&&
 js.includes("$('#responses-list').replaceChildren"));
check('The customer page contains two deliberate choices and a second confirmation',
 customer.includes('id="confirm-action"')&&
 customer.includes('id="cancel-action"')&&
 customer.includes('id="decision-dialog"')&&
 customer.includes('id="decision-apply"')&&
 customerJs.includes("$('#decision-dialog').showModal()")&&
 customerJs.includes('decisao:chosen'));
check('Customer is not required to have a WhatsApp API account to use site links',
 js.includes('booking.links?.reply')&&
 !js.includes('WHATSAPP_ACCESS_TOKEN'));
console.log('Sr. Navalha admin redesign checks passed.');
