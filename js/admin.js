import {BOOKING_STORAGE_KEY,readDemoBookings,normalizedStatus,updateDemoBookingStatus,markDemoReminderOpened,markDemoMessageSent} from './booking-local.js';
const $ = selector => document.querySelector(selector);
const STATUS = Object.freeze({pending:['Aguardando','pending'],confirmed:['Confirmado','confirmed'],cancelled:['Cancelado','cancelled']});
const TZ = 'America/Recife';
const LOGIN_KEY = 'srnavalha:admin-apresentacao:v1';
let sharedMode=false;
try{const r=await fetch('/api/health',{cache:'no-store'});if(r.ok)sharedMode=(await r.json()).enabled===true}catch{}
if(sharedMode)document.querySelector('.demo-credentials').hidden=true;
const DEMO_EMAIL = 'equipe@srnavalha.demo';
const DEMO_PASSWORD = 'Navalha2026!';
let currentFilter='all', currentSearch='', currentPeriod='all', previewBooking=null, confirmedSearch='', confirmedPeriod='upcoming', renderCounter=0;
const dateKey = value => {
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:TZ,day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date(value));
 const p=key=>parts.find(part=>part.type===key)?.value||'';
 return [p('year'),p('month'),p('day')].join('-');
};
const weekEnd = day => {
 const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+6);
 return date.toISOString().slice(0,10);
};
const fmtDay = value => new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,day:'2-digit',month:'short'}).format(new Date(value));
const fmtFull = value => new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,weekday:'long',day:'2-digit',month:'long'}).format(new Date(value));
const fmtHour = value => new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}).format(new Date(value));
const el=(tag,cls,content)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(content!==undefined)node.textContent=String(content);
 return node;
};
async function presentDashboard() {
 let authorized=sessionStorage.getItem(LOGIN_KEY)==='on';
 if(sharedMode){
  try{const r=await fetch('/api/session',{credentials:'same-origin',cache:'no-store'});authorized=r.ok&&(await r.json()).authenticated===true}
  catch{authorized=false}
 }
 $('#login-screen').hidden=authorized;$('#dashboard').hidden=!authorized;
 if(authorized){updateWhatsAppMode();showView();void renderDashboard();}
 else document.title='Entrar na agenda · Sr. Navalha';
}
$('#admin-login').addEventListener('submit',async event=>{
 event.preventDefault();
 const email=$('#admin-email').value.trim().toLowerCase();
 const password=$('#admin-password').value;
 if(sharedMode){
  try{const r=await fetch('/api/session',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});if(!r.ok)throw Error('E-mail ou senha incorretos.')}
  catch(e){$('#admin-login-error').textContent=e.message;return}
 }else if(email!==DEMO_EMAIL||password!==DEMO_PASSWORD){
  $('#admin-login-error').textContent='Confira o e-mail e a senha utilizados na apresentação.';return;
 }
 $('#admin-login-error').textContent='';
 if(!sharedMode)sessionStorage.setItem(LOGIN_KEY,'on');
 await presentDashboard();
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
$('#admin-logout').addEventListener('click',async()=>{
 if(sharedMode)await fetch('/api/session',{method:'DELETE',credentials:'same-origin'}).catch(()=>{});
 else sessionStorage.removeItem(LOGIN_KEY);
 await presentDashboard();$('#admin-email').focus();
});
function feedback(message,tone='success'){
 const node=$('#admin-feedback');
 node.textContent=message;
 node.dataset.tone=tone;
 node.hidden=!message;
}
function updateWhatsAppMode(){
 const badge=$('#delivery-mode');
 badge.textContent='WhatsApp manual';badge.dataset.mode='manual';
 $('#whatsapp-mode-details').textContent='O botão Mensagem abre a conversa com o texto pronto. O envio é feito no WhatsApp, e a equipe registra depois no painel. Nenhuma automação não oficial é utilizada.';
}
function showView(){
 const confirmed=location.hash==='#confirmados';
 $('#overview-view').hidden=confirmed;$('#confirmed-view').hidden=!confirmed;
 $('#current-view-label').textContent=confirmed?'CONFIRMADOS':'AGENDA';
 document.querySelectorAll('[data-admin-nav]').forEach(link=>{
  const active=confirmed?link.dataset.adminNav==='confirmed':link.getAttribute('href')===(location.hash==='#agenda-list'?'#agenda-list':'#main');
  link.classList.toggle('active',active);
  if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
 });
 document.title=(confirmed?'Confirmados':'Agenda da equipe')+' · Sr. Navalha';
 if(location.hash==='#agenda-list')requestAnimationFrame(()=>$('#agenda-list').scrollIntoView({block:'start'}));
}
window.addEventListener('hashchange',()=>{if(!$('#dashboard').hidden)showView()});
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
function composeMessage(booking){
 const name=String(booking.customer_name||'Cliente').trim().split(/\s+/)[0];
 const links=booking.links||null;
 const message=[
  'Olá, '+name+'! Tudo bem?',
  'Aqui é da Barbearia Sr. Navalha. Gostaríamos de confirmar seu horário:',
  '',
  'Serviço: '+booking.service_name,
  'Data: '+fmtFull(booking.starts_at)+' às '+fmtHour(booking.starts_at),
  'Profissional: '+booking.professional_name,
  '',
  'Você poderá comparecer?',
  ...(links?[
   '',
   'Confirme ou cancele pelo nosso site:',
   'Confirmar: '+links.yes,
   'Cancelar: '+links.no
  ]:['Responda CONFIRMO ou CANCELAR nesta conversa.']),
  '',
  'Obrigado! Sr. Navalha · Gravatá'
 ];
 return message.join('\n');
}
function sendMessage(booking){
 const phone=String(booking.customer_phone||'').replace(/\D/g,'');
 if(!/^55\d{10,11}$/.test(phone)){
  feedback('O número de WhatsApp deste cliente está inválido. Confira o cadastro.','error');return;
 }
 previewBooking=booking;
 const link='https://wa.me/'+phone+'?text='+encodeURIComponent(composeMessage(booking));
 $('#message-open-link').href=link;
 $('#message-recipient').textContent=booking.customer_name+' · '+phone.replace(/^55/,'+55 ');
 $('#message-preview').textContent=composeMessage(booking);
 $('#message-copy').textContent='Copiar texto';
 $('#message-info').textContent='A conversa abrirá com o texto preenchido. Toque em Enviar no WhatsApp e, quando terminar, registre o envio aqui.';
 const tab=window.open(link,'_blank');
 if(tab)tab.opener=null;
 else $('#message-info').textContent='O navegador bloqueou a nova aba. Use o link “Abrir conversa no WhatsApp” abaixo; depois do envio, registre o contato.';
 try{if(!sharedMode)markDemoReminderOpened(booking.id)}catch{}
 $('#message-dialog').showModal();
 void renderDashboard();
}
$('#message-close').addEventListener('click',()=>$('#message-dialog').close());
$('#message-dismiss').addEventListener('click',()=>$('#message-dialog').close());
$('#message-dialog').addEventListener('click',event=>{if(event.target===$('#message-dialog'))event.target.close()});
$('#message-copy').addEventListener('click',async()=>{
 if(!previewBooking)return;
 const body=composeMessage(previewBooking);
 try{
  if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(body);
  else{
   const textarea=document.createElement('textarea');textarea.value=body;
   document.body.append(textarea);textarea.select();
   if(!document.execCommand('copy'))throw Error('Cópia indisponível');
   textarea.remove();
  }
  $('#message-copy').textContent='Texto copiado';
 }catch{$('#message-info').textContent='Não foi possível copiar. Selecione o texto e copie manualmente.'}
});
$('#message-confirm-sent').addEventListener('click',async()=>{
 if(!previewBooking)return;
 const button=$('#message-confirm-sent');button.disabled=true;
 try{
  if(sharedMode){
   const reply=await fetch('/api/bookings',{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:previewBooking.id,action:'manual_message_sent'})});
   if(!reply.ok)throw Error('Não foi possível registrar o envio. Tente novamente.');
  }else markDemoMessageSent(previewBooking.id);
  $('#message-dialog').close();
  feedback('Envio registrado pela equipe. O agendamento continua aguardando a resposta do cliente.');
  previewBooking=null;
  await renderDashboard();
 }catch(error){feedback(error.message||'Não foi possível registrar o envio.','error')}
 finally{button.disabled=false}
});
function actionButton(text,kind,fn,disabled=false){
 const button=el('button',kind,text);
 button.type='button';button.disabled=disabled;button.addEventListener('click',fn);
 return button;
}
function askStatusChange(message,next){
 const dialog=$('#status-dialog');
 const confirmButton=$('#status-apply');
 const cancelButton=$('#status-cancel');
 const destructive=next==='cancelled';
 $('#status-title').textContent=destructive?'Cancelar este horário?':'Confirmar a presença?';
 $('#status-description').textContent=message;
 confirmButton.textContent=destructive?'Sim, cancelar horário':'Sim, confirmar presença';
 confirmButton.classList.toggle('danger',destructive);
 dialog.showModal();
 return new Promise(resolve=>{
  const clear=()=>{
   confirmButton.removeEventListener('click',yes);
   cancelButton.removeEventListener('click',no);
   dialog.removeEventListener('cancel',escape);
  };
  const done=result=>{clear();dialog.close();resolve(result)};
  const yes=()=>done(true);
  const no=()=>done(false);
  const escape=e=>{e.preventDefault();done(false)};
  confirmButton.addEventListener('click',yes);
  cancelButton.addEventListener('click',no);
  dialog.addEventListener('cancel',escape);
  cancelButton.focus();
 });
}
async function changeStatus(booking,next){
 if(normalizedStatus(booking)===next)return;
 const message=next==='cancelled'?'Cancelar o horário de '+booking.customer_name+'? O horário ficará disponível novamente.':'Marcar a presença de '+booking.customer_name+' como confirmada?';
 if(!await askStatusChange(message,next))return;
 try{
  if(sharedMode){
   const reply=await fetch('/api/bookings',{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:booking.id,status:next})});
   if(!reply.ok)throw Error('Não foi possível salvar na agenda compartilhada');
  }else updateDemoBookingStatus(booking.id,next);
  feedback(next==='confirmed'?'Presença registrada como confirmada.':'Agendamento cancelado; horário liberado.');
  document.querySelectorAll('.appointment-manage[open]').forEach(menu=>{menu.open=false});
  await renderDashboard();
 }catch{feedback('Não foi possível atualizar este registro no navegador.')}
}
function openResponsePreview(booking){
 const urls=booking.links||confirmationUrls(booking);
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
 person.append(el('strong','',booking.customer_name||'Cliente'),el('span','',booking.customer_phone?.replace(/^55/,'+55 ')||'WhatsApp não informado'));
 const service=el('div','appointment-service');
 service.append(el('strong','',booking.service_name||'Serviço'),el('span','',booking.professional_name));
 const state=el('div','appointment-status');
 const pill=el('span','status '+(status==='pending'?'':status),STATUS[status]?.[0]||'Aguardando');
 state.append(pill);
 if(booking.whatsapp_manual_sent_at)state.append(el('small','message-indicator','Envio registrado pela equipe'));
 else if(booking.whatsapp_last_sent_at)state.append(el('small','message-indicator','Solicitado à API'));
 else if(booking.reminder_prepared_at)state.append(el('small','message-indicator','WhatsApp aberto'));
 const actions=el('div','appointment-actions');
 const group=el('div','action-main');
 const msg=actionButton('Mensagem','message',()=>sendMessage(booking),status!=='pending');
 if(status!=='pending')msg.title='A mensagem de confirmação é destinada aos pedidos aguardando resposta';
 group.append(msg);
 const menu=el('details','appointment-manage');
 const toggle=el('summary','', 'Gerenciar');toggle.setAttribute('aria-label','Gerenciar agendamento de '+booking.customer_name);
 const options=el('div','manage-actions');
 options.append(
  actionButton('Confirmar presença','',()=>changeStatus(booking,'confirmed'),status==='confirmed'),
  actionButton('Cancelar horário','action-danger',()=>changeStatus(booking,'cancelled'),status==='cancelled'),
  actionButton('Simular resposta','action-secondary',()=>openResponsePreview(booking))
 );
 menu.append(toggle,options);
 actions.append(group,menu);
 const serial=el('span','appointment-serial','REF. '+String(booking.reference||booking.id.slice(0,8)).toUpperCase());
 row.append(date,person,service,state,actions,serial);
 return row;
}
async function renderDashboard(){
 if($('#dashboard').hidden)return;
 let entries;
 if(sharedMode){
  try{
   const res=await fetch('/api/bookings',{credentials:'same-origin',cache:'no-store'});
   if(!res.ok)throw Error('Sua sessão terminou. Entre novamente no painel.');
   entries=(await res.json()).items;
  }catch(e){feedback(e.message);return}
 }else entries=readDemoBookings().filter(b=>b && b.id && b.starts_at);
 const counts={pending:0,confirmed:0,cancelled:0};
 entries.forEach(b=>{const s=normalizedStatus(b);if(s in counts)counts[s]++});
 $('#stat-total').textContent=String(entries.length);
 $('#stat-pending').textContent=String(counts.pending);
 $('#stat-confirmed').textContent=String(counts.confirmed);
 $('#stat-cancelled').textContent=String(counts.cancelled);
 $('#dash-clock').textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,weekday:'short',day:'2-digit',month:'short'}).format(new Date());
 const today=dateKey(new Date());
 const end=weekEnd(today);
 $('#dash-date').textContent=new Intl.DateTimeFormat('pt-BR',{
  timeZone:TZ,weekday:'long',day:'numeric',month:'long'
 }).format(new Date());
 const query=currentSearch.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const matching=entries.filter(b=>{
  if(currentFilter!=='all'&&normalizedStatus(b)!==currentFilter)return false;
  const day=dateKey(b.starts_at);
  if(currentPeriod==='today'&&day!==today)return false;
  if(currentPeriod==='week'&&(day<today||day>end))return false;
  const haystack=[b.customer_name,b.service_name,b.professional_name,b.reference,b.customer_phone].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return haystack.includes(query);
 }).sort((a,b)=>String(a.starts_at).localeCompare(String(b.starts_at)));
 const expandedIds=new Set([...document.querySelectorAll('.appointment-manage[open]')].map(node=>node.closest('.appointment')?.dataset.id));
 const rows=matching.map(createRow);
 rows.forEach(row=>{const menu=row.querySelector('.appointment-manage');if(menu&&expandedIds.has(row.dataset.id))menu.open=true});
 $('#appointments-list').replaceChildren(...rows);
 $('#result-count').textContent=matching.length+(matching.length===1?' agendamento encontrado':' agendamentos encontrados');
 $('#empty-list').hidden=matching.length>0;
 if(!matching.length){
  $('#empty-list p').textContent=entries.length
   ?'Nenhum agendamento corresponde aos filtros escolhidos. Limpe a busca ou selecione outro período.'
   : sharedMode?'Os próximos agendamentos aparecerão aqui assim que forem realizados.':'Os agendamentos de demonstração realizados neste navegador aparecerão aqui.';
  $('#empty-list a').hidden=entries.length>0;
 }
}
document.querySelectorAll('.filters button').forEach(button=>button.addEventListener('click',()=>{
 currentFilter=button.dataset.status;
 document.querySelectorAll('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 renderDashboard();
}));
$('#admin-search').addEventListener('input',event=>{currentSearch=event.target.value.trim();renderDashboard()});
$('#admin-period').addEventListener('change',event=>{currentPeriod=event.target.value;void renderDashboard()});
$('#refresh-bookings').addEventListener('click',()=>{renderDashboard();feedback('Agenda atualizada.')});
window.addEventListener('storage',event=>{if(event.key===BOOKING_STORAGE_KEY)renderDashboard()});
window.addEventListener('pageshow',()=>renderDashboard());
window.addEventListener('visibilitychange',()=>{if(!document.hidden)void renderDashboard()});
// Server webhooks persist responses asynchronously; refresh the live panel automatically.
setInterval(()=>{if(sharedMode&&!document.hidden&&!$('#dashboard').hidden)void renderDashboard()},15000);
void presentDashboard();
