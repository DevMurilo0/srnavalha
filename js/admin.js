import {BOOKING_STORAGE_KEY,readDemoBookings,normalizedStatus,updateDemoBookingStatus,markDemoReminderOpened} from './booking-local.js';
const $ = selector => document.querySelector(selector);
const STATUS = Object.freeze({pending:['Aguardando','pending'],confirmed:['Confirmado','confirmed'],cancelled:['Cancelado','cancelled']});
const TZ = 'America/Recife';
const LOGIN_KEY = 'srnavalha:admin-apresentacao:v1';
const DEMO_EMAIL = 'equipe@srnavalha.demo';
const DEMO_PASSWORD = 'Navalha2026!';
let currentFilter = 'all',currentSearch = '';
const fmtDay = value => new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,day:'2-digit',month:'short'}).format(new Date(value));
const fmtFull = value => new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,weekday:'long',day:'2-digit',month:'long'}).format(new Date(value));
const fmtHour = value => new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}).format(new Date(value));
const el=(tag,cls,content)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(content!==undefined)node.textContent=String(content);
 return node;
};
function presentDashboard() {
 const authorized=sessionStorage.getItem(LOGIN_KEY)==='on';
 $('#login-screen').hidden=authorized;
 $('#dashboard').hidden=!authorized;
 if(authorized){renderDashboard();document.title='Agenda da equipe · Sr. Navalha'}
 else document.title='Entrar na agenda · Sr. Navalha';
}
$('#admin-login').addEventListener('submit',event=>{
 event.preventDefault();
 const email=$('#admin-email').value.trim().toLowerCase();
 const password=$('#admin-password').value;
 if(email!==DEMO_EMAIL||password!==DEMO_PASSWORD){
  $('#admin-login-error').textContent='Confira o e-mail e a senha utilizados na apresentação.';
  return;
 }
 $('#admin-login-error').textContent='';
 sessionStorage.setItem(LOGIN_KEY,'on');
 presentDashboard();
});
$('#fill-demo').addEventListener('click',()=>{
 $('#admin-email').value=DEMO_EMAIL;
 $('#admin-password').value=DEMO_PASSWORD;
 $('#admin-login-error').textContent='';
 $('#admin-login button[type="submit"]').focus();
});
$('#show-password').addEventListener('click',()=>{
 const input=$('#admin-password');
 input.type=input.type==='password'?'text':'password';
 $('#show-password').textContent=input.type==='password'?'Mostrar':'Ocultar';
});
$('#admin-logout').addEventListener('click',()=>{sessionStorage.removeItem(LOGIN_KEY);presentDashboard();$('#admin-email').focus()});
function feedback(message){$('#admin-feedback').textContent=message}
function confirmationUrls(booking){
 // These routes work as interactive demos in the same browser that owns localStorage.
 // Cross-device synchronization requires persistent storage and a server later.
 const base=new URL('confirmar.html',location.href);
 const urlFor=action=>{
  const url=new URL(base);
  url.searchParams.set('ref',booking.id);
  url.searchParams.set('acao',action);
  return url.href;
 };
 return {yes:urlFor('confirmar'),no:urlFor('cancelar')};
}
function prepareWhatsApp(booking){
 const phone=String(booking.customer_phone||'').replace(/\D/g,'');
 const name=String(booking.customer_name||'Cliente').trim().split(/\s+/)[0];
 const message=[
  'Olá, '+name+'! Tudo bem? 👋',
  'Aqui é da Barbearia Sr. Navalha. Estamos entrando em contato para confirmar seu horário:',
  '',
  '✂️ '+booking.service_name,
  '📅 '+fmtFull(booking.starts_at)+' às '+fmtHour(booking.starts_at),
  '💈 Profissional: '+booking.professional_name,
  '',
  'Pode confirmar sua presença respondendo CONFIRMO? Se precisar cancelar, responda CANCELAR.',
  '',
  'Obrigado! Sr. Navalha · Gravatá'
 ].join('\n');
 if(!/^55\d{10,11}$/.test(phone)){feedback('O WhatsApp deste agendamento não está em um formato válido.');return}
 const link='https://wa.me/'+phone+'?text='+encodeURIComponent(message);
 // Open directly in response to the click, not from asynchronous code.
 const tab=window.open(link,'_blank','noopener,noreferrer');
 if(tab===null)feedback('Se o WhatsApp não abriu, permita novas abas para esta página.');
 else feedback('Conversa preparada no WhatsApp. Confira e envie a mensagem manualmente.');
 try{markDemoReminderOpened(booking.id)}catch{ /* WhatsApp can still open even when localStorage is blocked */ }
 renderDashboard();
}
function actionButton(text,kind,fn,disabled=false){
 const button=el('button',kind,text);
 button.type='button';button.disabled=disabled;button.addEventListener('click',fn);
 return button;
}
function changeStatus(booking,next){
 if(normalizedStatus(booking)===next)return;
 const message=next==='cancelled'?'Cancelar o horário de '+booking.customer_name+'? O horário ficará livre nesta demonstração.':'Marcar a presença de '+booking.customer_name+' como confirmada?';
 if(!confirm(message))return;
 try{
  updateDemoBookingStatus(booking.id,next);
  feedback(next==='confirmed'?'Presença registrada como confirmada.':'Agendamento cancelado; horário liberado.');
  renderDashboard();
 }catch{feedback('Não foi possível atualizar este registro no navegador.')}
}
function openResponsePreview(booking){
 const urls=confirmationUrls(booking);
 $('#reply-yes').href=urls.yes;
 $('#reply-no').href=urls.no;
 $('#reply-title').textContent='Respostas de '+booking.customer_name;
 $('#reply-dialog').showModal();
}
$('#close-reply').addEventListener('click',()=>$('#reply-dialog').close());
$('#reply-dialog').addEventListener('click',event=>{if(event.target===$('#reply-dialog'))event.target.close()});
function createRow(booking){
 const status=normalizedStatus(booking);
 const row=el('article','appointment');
 row.dataset.id=booking.id;
 const date=el('div','appointment-date');
 date.append(el('strong','',fmtDay(booking.starts_at)),el('small','',fmtHour(booking.starts_at)+' · '+booking.professional_name));
 const person=el('div','appointment-person');
 person.append(el('strong','',booking.customer_name||'Cliente'),el('span','',booking.customer_phone?.replace(/^55/,'+')||'WhatsApp não informado'));
 const service=el('div','appointment-service');
 service.append(el('strong','',booking.service_name||'Serviço'),el('span','',booking.service_id==='cortee'?'Corte clássico':'Horário solicitado'));
 const state=el('div','appointment-status');
 const pill=el('span','status '+(status==='pending'?'':status),STATUS[status]?.[0]||'Aguardando');
 state.append(pill);
 if(booking.reminder_prepared_at)state.append(el('small','', 'Mensagem preparada'));
 const actions=el('div','appointment-actions');
 const group=el('div','action-main');
 group.append(
  actionButton('Preparar WhatsApp ↗','message',()=>prepareWhatsApp(booking)),
  actionButton('Confirmar presença','',()=>changeStatus(booking,'confirmed'),status==='confirmed'),
  actionButton('Cancelar horário','',()=>changeStatus(booking,'cancelled'),status==='cancelled')
 );
 const more=el('div','action-main');
 more.append(actionButton('Simular resposta ↗','action-secondary',()=>openResponsePreview(booking)));
 actions.append(group,more);
 const serial=el('span','appointment-serial','#'+String(booking.reference||booking.id.slice(0,8)).toUpperCase());
 row.append(date,person,service,state,actions,serial);
 return row;
}
function renderDashboard(){
 if($('#dashboard').hidden)return;
 const entries=readDemoBookings().filter(b=>b && b.id && b.starts_at);
 const counts={pending:0,confirmed:0,cancelled:0};
 entries.forEach(b=>{const s=normalizedStatus(b);if(s in counts)counts[s]++});
 $('#stat-total').textContent=String(entries.length);
 $('#stat-pending').textContent=String(counts.pending);
 $('#stat-confirmed').textContent=String(counts.confirmed);
 $('#stat-cancelled').textContent=String(counts.cancelled);
 $('#dash-clock').textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,weekday:'short',day:'2-digit',month:'short'}).format(new Date());
 const query=currentSearch.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const matching=entries.filter(b=>{
  if(currentFilter!=='all'&&normalizedStatus(b)!==currentFilter)return false;
  const haystack=[b.customer_name,b.service_name,b.professional_name,b.reference,b.customer_phone].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return haystack.includes(query);
 }).sort((a,b)=>String(a.starts_at).localeCompare(String(b.starts_at)));
 $('#appointments-list').replaceChildren(...matching.map(createRow));
 $('#empty-list').hidden=matching.length>0;
 if(!matching.length){
  $('#empty-list p').textContent=entries.length?'Nenhum agendamento corresponde a esse filtro.':'Os agendamentos realizados neste navegador aparecerão nesta agenda.';
  $('#empty-list a').hidden=entries.length>0;
 }
}
document.querySelectorAll('.filters button').forEach(button=>button.addEventListener('click',()=>{
 currentFilter=button.dataset.status;
 document.querySelectorAll('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 renderDashboard();
}));
$('#admin-search').addEventListener('input',event=>{currentSearch=event.target.value.trim();renderDashboard()});
$('#refresh-bookings').addEventListener('click',()=>{renderDashboard();feedback('Agenda atualizada.')});
window.addEventListener('storage',event=>{if(event.key===BOOKING_STORAGE_KEY)renderDashboard()});
window.addEventListener('pageshow',()=>renderDashboard());
window.addEventListener('visibilitychange',()=>{if(!document.hidden)renderDashboard()});
presentDashboard();
