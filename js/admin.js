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
let currentFilter='all', currentSearch='', currentPeriod='all', messageFilter='all', previewBooking=null, confirmedSearch='', confirmedPeriod='upcoming', renderCounter=0;
const WHATSAPP_BRIDGE_SCOPE='srnavalha.whatsapp-tabs';
let whatsappBridgeReady=false,bridgeSequence=0;
const whatsappBridgePending=new Set();
window.addEventListener('message',event=>{
 if(event.source!==window||event.origin!==location.origin)return;
 const data=event.data;
 if(data?.scope!==WHATSAPP_BRIDGE_SCOPE||data.sender!=='extension')return;
 if(data.type==='READY'){
  whatsappBridgeReady=true;
  updateWhatsappHelperHint();
  return;
 }
 if(data.type==='RESULT'&&whatsappBridgePending.delete(data.id)){
  const info=$('#message-info');
  if(data.ok){
   if(info)info.textContent=data.reused
    ?'Conversa aberta na aba do WhatsApp que já estava no navegador. Envie a mensagem e registre o envio aqui.'
    :'Uma aba do WhatsApp foi criada. Os próximos contatos reutilizarão essa mesma aba.';
  }else{
   if(info)info.textContent='Não foi possível acessar a aba do WhatsApp: '+(data.error||'verifique o auxiliar')+'. Use a aba já aberta para enviar manualmente.';
  }
 }
});
function updateWhatsappHelperHint(){
 const hint=$('#message-reuse-hint');
 if(hint)hint.textContent=whatsappBridgeReady
  ?'Auxiliar conectado: a aba do WhatsApp já aberta será reutilizada, sem criar outras.'
  :'Sem o auxiliar, o site não consegue localizar outras abas do navegador. Para evitar duplicações, não abre nenhuma automaticamente; copie o texto e envie na aba que já está aberta.';
 const link=$('#message-open-link');
 if(link)link.textContent=whatsappBridgeReady?'Abrir na aba existente do WhatsApp ↗':'Abrir WhatsApp Web (pode criar outra aba) ↗';
}
function askWhatsappBridge(link){
 if(!whatsappBridgeReady)return false;
 const id=++bridgeSequence;
 whatsappBridgePending.add(id);
 window.postMessage({scope:WHATSAPP_BRIDGE_SCOPE,sender:'page',type:'OPEN',id,url:link},location.origin);
 return true;
}
function openWhatsAppWeb(link){
 // A regular page cannot enumerate tabs; doing window.open() repeatedly
 // creates duplicates when WhatsApp isolates itself with COOP.
 // The opt-in browser extension can target an already-open WhatsApp tab.
 return askWhatsappBridge(link);
}
window.postMessage({scope:WHATSAPP_BRIDGE_SCOPE,sender:'page',type:'PING',id:++bridgeSequence},location.origin);
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
 $('#whatsapp-mode-details').textContent='Mensagem abre direto no WhatsApp Web, reaproveitando a mesma aba do primeiro contato. Revise, envie pelo WhatsApp e registre o envio no painel.';
}
function showView(){
 const confirmed=location.hash==='#confirmados';
 $('#overview-view').hidden=confirmed;$('#confirmed-view').hidden=!confirmed;
 $('#current-view-label').textContent=confirmed?'CONFIRMADOS':'AGENDA';
 document.querySelectorAll('[data-admin-nav]').forEach(link=>{
  const active=confirmed?link.dataset.adminNav==='confirmed':(link.closest('.mobile-admin-nav')?link.dataset.adminNav==='overview':link.getAttribute('href')===(location.hash==='#agenda-list'?'#agenda-list':'#main'));
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
 const link=whatsappWebLink(phone,composeMessage(booking));
 $('#message-open-link').href=link;
 $('#message-recipient').textContent=booking.customer_name+' · '+phone.replace(/^55/,'+55 ');
 $('#message-preview').textContent=composeMessage(booking);
 $('#message-copy').textContent='Copiar texto';
 $('#message-info').textContent='Clique em Enviar na conversa e, depois, registre o contato neste painel.';
 updateWhatsappHelperHint();
 if(!openWhatsAppWeb(link))$('#message-info').textContent='O navegador não permite acessar a aba do WhatsApp aberta manualmente. Para não abrir outras abas, copie a mensagem e envie na aba existente, ou ative o auxiliar do Firefox/Floorp.';
 try{if(!sharedMode)markDemoReminderOpened(booking.id)}catch{}
 $('#message-dialog').showModal();
 void renderDashboard();
}
$('#message-open-link').addEventListener('click',event=>{
 if(whatsappBridgeReady){
  event.preventDefault();
  openWhatsAppWeb($('#message-open-link').href);
 }
 // Without the helper this is a user-chosen normal link. The main Mensagem
 // action never creates tabs behind the user's back.
});
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
 const messageSent=Boolean(booking.whatsapp_manual_sent_at);
 state.append(el('span','contact-chip '+(messageSent?'is-sent':'is-pending'),messageSent?'Mensagem enviada':'Aguardando envio'));
 if(messageSent)state.append(el('small','message-indicator','Envio registrado pela equipe'));
 else if(booking.reminder_prepared_at)state.append(el('small','message-indicator','Conversa aberta, ainda não enviado'));
 const actions=el('div','appointment-actions');
 const group=el('div','action-main');
 const msg=actionButton(booking.whatsapp_manual_sent_at?'Reenviar mensagem':'Mensagem','message',()=>sendMessage(booking),status!=='pending');
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
function createUpcomingRow(booking){
 const row=el('article','upcoming-item');
 const day=el('div','upcoming-date');
 day.append(el('strong','',fmtDay(booking.starts_at)),el('span','',fmtHour(booking.starts_at)));
 const customer=el('div','upcoming-customer');
 customer.append(el('strong','',booking.customer_name||'Cliente'),el('span','',booking.service_name+' · '+booking.professional_name));
 const state=el('span','status '+(normalizedStatus(booking)==='confirmed'?'confirmed':''),STATUS[normalizedStatus(booking)]?.[0]||'Aguardando');
 row.append(day,customer,state);
 return row;
}
function createConfirmedRow(booking){
 const row=el('article','confirmed-item');
 row.dataset.id=booking.id;
 const client=el('div','confirmed-client');
 client.append(el('strong','',booking.customer_name||'Cliente'));
 const phone=String(booking.customer_phone||'').replace(/\D/g,'');
 if(/^55\d{10,11}$/.test(phone)){
  const link=el('a','confirmed-phone','+'+phone.replace(/^55/,'55 '));
  link.href='tel:+'+phone;
  link.title='Ligar para '+booking.customer_name;
  client.append(link);
 }else client.append(el('span','confirmed-phone','Telefone não informado'));
 const service=el('div','confirmed-service');
 service.append(el('strong','',booking.service_name||'Serviço'),el('span','',booking.professional_name||'Profissional'));
 const date=el('div','confirmed-date');
 date.append(el('strong','',fmtDay(booking.starts_at)),el('span','',fmtHour(booking.starts_at)));
 const badge=el('span','status confirmed','Confirmado');
 row.append(client,service,date,badge);
 return row;
}
async function renderDashboard(){
 if($('#dashboard').hidden)return;
 const request=++renderCounter;
 let entries;
 if(sharedMode){
  try{
   const res=await fetch('/api/bookings',{credentials:'same-origin',cache:'no-store'});
   if(!res.ok)throw Error('Não foi possível carregar a agenda. Confira seu acesso.');
   entries=(await res.json()).items;
   if(request!==renderCounter)return;
  }catch(e){if(request===renderCounter)feedback(e.message,'error');return}
 }else entries=readDemoBookings().filter(b=>b&&b.id&&b.starts_at);
 const counts={pending:0,confirmed:0,cancelled:0};
 entries.forEach(b=>{const status=normalizedStatus(b);if(status in counts)counts[status]++});
 $('#stat-total').textContent=String(entries.length);
 $('#stat-pending').textContent=String(counts.pending);
 $('#stat-confirmed').textContent=String(counts.confirmed);
 $('#stat-cancelled').textContent=String(counts.cancelled);
 const sentCount=entries.filter(b=>Boolean(b.whatsapp_manual_sent_at)).length;
 $('#msg-total-count').textContent=String(entries.length);
 $('#msg-sent-count').textContent=String(sentCount);
 $('#msg-unsent-count').textContent=String(entries.length-sentCount);
 $('#dash-clock').textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,weekday:'short',day:'2-digit',month:'short'}).format(new Date());
 const now=Date.now(),today=dateKey(new Date()),week=weekEnd(today);
 $('#dash-date').textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,weekday:'long',day:'numeric',month:'long'}).format(new Date());

 // The front of the dashboard only shows the closest future dates.
 const upcoming=entries.filter(b=>normalizedStatus(b)!=='cancelled'&&Date.parse(b.starts_at)>=now)
  .sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at)).slice(0,5);
 $('#upcoming-list').replaceChildren(...upcoming.map(createUpcomingRow));
 $('#upcoming-empty').hidden=upcoming.length>0;
 $('#upcoming-window').textContent=upcoming.length+' '+(upcoming.length===1?'próximo horário':'próximos horários');

 const query=currentSearch.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const matching=entries.filter(b=>{
  if(currentFilter!=='all'&&normalizedStatus(b)!==currentFilter)return false;
  const hasSent=Boolean(b.whatsapp_manual_sent_at);
  if(messageFilter==='sent'&&!hasSent)return false;
  if(messageFilter==='unsent'&&hasSent)return false;
  const day=dateKey(b.starts_at);
  if(currentPeriod==='today'&&day!==today)return false;
  if(currentPeriod==='week'&&(day<today||day>week))return false;
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
  $('#empty-list p').textContent=entries.length?'Nenhum agendamento corresponde aos filtros de contato, situação ou período. Experimente outra opção.':'Os agendamentos realizados aparecerão nesta agenda.';
  $('#empty-list a').hidden=entries.length>0;
 }

 // A dedicated consultation view for customers who have confirmed attendance.
 const confirmed=entries.filter(b=>normalizedStatus(b)==='confirmed')
  .sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at));
 const future=confirmed.filter(b=>Date.parse(b.starts_at)>=now);
 $('#side-confirmed-count').textContent=String(future.length);
 $('#confirmed-count').textContent=String(future.length);
 const normalized=confirmedSearch.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const digits=confirmedSearch.replace(/\D/g,'');
 const visible=confirmed.filter(b=>{
  const isFuture=Date.parse(b.starts_at)>=now;
  if(confirmedPeriod==='upcoming'&&!isFuture)return false;
  if(confirmedPeriod==='past'&&isFuture)return false;
  const name=[b.customer_name,b.customer_phone,b.service_name,b.professional_name,b.reference].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return !normalized||name.includes(normalized)||(digits.length>=2&&String(b.customer_phone).includes(digits));
 });
 $('#confirmed-list').replaceChildren(...visible.map(createConfirmedRow));
 $('#confirmed-empty').hidden=visible.length>0;
 if(!visible.length){
  $('#confirmed-empty-detail').textContent=confirmed.length?'Nenhum confirmado corresponde a essa busca ou período.':'Ainda não há clientes confirmados. Quando uma presença for confirmada, ela aparecerá aqui.';
 }
}
document.querySelectorAll('.filters button').forEach(button=>button.addEventListener('click',()=>{
 currentFilter=button.dataset.status;
 document.querySelectorAll('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 renderDashboard();
}));
document.querySelectorAll('[data-message-filter]').forEach(button=>button.addEventListener('click',()=>{
 messageFilter=button.dataset.messageFilter;
 document.querySelectorAll('[data-message-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 void renderDashboard();
}));
$('#admin-search').addEventListener('input',event=>{currentSearch=event.target.value.trim();renderDashboard()});
$('#confirmed-search').addEventListener('input',event=>{confirmedSearch=event.target.value.trim();void renderDashboard()});
$('#confirmed-period').addEventListener('change',event=>{confirmedPeriod=event.target.value;void renderDashboard()});
$('#confirmed-clear').addEventListener('click',()=>{
 confirmedSearch='';confirmedPeriod='upcoming';
 $('#confirmed-search').value='';$('#confirmed-period').value='upcoming';
 void renderDashboard();
});

$('#admin-period').addEventListener('change',event=>{currentPeriod=event.target.value;void renderDashboard()});
$('#refresh-bookings').addEventListener('click',()=>{renderDashboard();feedback('Agenda atualizada.')});
window.addEventListener('storage',event=>{if(event.key===BOOKING_STORAGE_KEY)renderDashboard()});
window.addEventListener('pageshow',()=>renderDashboard());
window.addEventListener('visibilitychange',()=>{if(!document.hidden)void renderDashboard()});
// Server webhooks persist responses asynchronously; refresh the live panel automatically.
setInterval(()=>{if(sharedMode&&!document.hidden&&!$('#dashboard').hidden)void renderDashboard()},15000);
void presentDashboard();
