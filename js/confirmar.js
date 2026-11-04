import {readDemoBookings,updateDemoBookingStatus,normalizedStatus} from './booking-local.js';

const $=selector=>document.querySelector(selector);
const params=new URLSearchParams(location.search);
const ref=params.get('ref');
const action=params.get('acao');
const exp=params.get('exp');
const sig=params.get('sig');
const isChoice=['escolher','confirmar','cancelar'].includes(action);
const TZ='America/Recife';
let shared=false,booking=null,busy=false,chosen=null;

const fmt=value=>new Intl.DateTimeFormat('pt-BR',{
 timeZone:TZ,weekday:'long',day:'2-digit',month:'long',
 hour:'2-digit',minute:'2-digit'
}).format(new Date(value));

function result(title,description,{success=false}={}){
 $('#confirmation-title').textContent=title;
 $('#confirmation-description').textContent=description;
 $('#confirmation-icon').textContent=success?'✓':'!';
 $('#confirmation-icon').classList.toggle('is-success',success);
 $('#confirmation-actions').hidden=true;
 $('#confirmation-footnote').hidden=true;
}
function renderBooking(item){
 $('#confirmation-details').hidden=false;
 $('#confirm-client').textContent=item.customer_first_name||String(item.customer_name||'Cliente').split(' ')[0];
 $('#confirm-service').textContent=item.service_name||'Atendimento';
 $('#confirm-professional').textContent=item.professional_name||'Equipe Sr. Navalha';
 $('#confirm-date').textContent=fmt(item.starts_at);
}
function renderChoice(item){
 const status=normalizedStatus(item);
 if(status==='confirmed'){
  result('Presença confirmada!','Sua presença já está registrada. Esperamos você!',{success:true});
  return;
 }
 if(status==='cancelled'){
  result('Horário cancelado.','Seu cancelamento já foi registrado. Se precisar, entre em contato com a barbearia.',{success:true});
  return;
 }
 if(!isChoice){
  result('Link inválido.','Peça à barbearia uma nova mensagem de confirmação.');
  return;
 }
 $('#confirmation-title').textContent='Podemos contar com você?';
 $('#confirmation-description').textContent='Confira seu horário e escolha como deseja responder.';
 // Older action-specific signed links can only execute their original action.
 $('#confirm-action').hidden=action==='cancelar';
 $('#cancel-action').hidden=action==='confirmar';
 $('#confirmation-actions').hidden=false;
}
function startDecision(decision){
 if(busy||!booking||!['confirmar','cancelar'].includes(decision))return;
 chosen=decision;
 const cancel=decision==='cancelar';
 $('#decision-title').textContent=cancel?'Deseja cancelar este horário?':'Confirmar sua presença?';
 $('#decision-description').textContent=cancel
  ?'Se cancelar, seu horário será liberado. Tem certeza?'
  :'Confirma que poderá comparecer no dia e horário informados?';
 $('#decision-apply').textContent=cancel?'Sim, cancelar horário':'Sim, confirmar presença';
 $('#decision-apply').classList.toggle('is-cancel',cancel);
 $('#decision-error').hidden=true;
 $('#decision-error').textContent='';
 $('#decision-dialog').showModal();
}
async function applyDecision(){
 if(busy||!chosen||!booking)return;
 busy=true;
 const button=$('#decision-apply');
 button.disabled=true;$('#decision-back').disabled=true;
 $('#decision-error').hidden=true;
 try{
  if(shared){
   const reply=await fetch('/api/confirm',{
    method:'POST',headers:{'Content-Type':'application/json'},
    credentials:'same-origin',
    body:JSON.stringify({ref,acao:action,exp,sig,decisao:chosen})
   });
   const data=await reply.json();
   if(!reply.ok)throw Error(data.error||'Não foi possível registrar sua resposta.');
  }else{
   const updated=readDemoBookings().find(item=>item.id===ref);
   if(!updated)throw Error('Agendamento de demonstração não encontrado neste navegador.');
   if(normalizedStatus(updated)!=='pending'&&normalizedStatus(updated)!==(chosen==='confirmar'?'confirmed':'cancelled'))
    throw Error('Essa resposta já foi registrada. Fale com a barbearia para alterá-la.');
   if(normalizedStatus(updated)==='pending')updateDemoBookingStatus(ref,chosen==='confirmar'?'confirmed':'cancelled','site');
  }
  $('#decision-dialog').close();
  booking.status=chosen==='confirmar'?'confirmed':'cancelled';
  result(chosen==='confirmar'?'Presença confirmada!':'Horário cancelado.',
   chosen==='confirmar'
    ?'Obrigado! Sua confirmação foi registrada na agenda da Sr. Navalha.'
    :'Tudo certo. A barbearia recebeu o cancelamento.',{success:true});
 }catch(error){
  $('#decision-error').textContent=String(error.message||'Não foi possível salvar. Tente novamente.');
  $('#decision-error').hidden=false;
 }finally{busy=false;button.disabled=false;$('#decision-back').disabled=false;}
}
$('#confirm-action').addEventListener('click',()=>startDecision('confirmar'));
$('#cancel-action').addEventListener('click',()=>startDecision('cancelar'));
$('#decision-back').addEventListener('click',()=>{if(!busy)$('#decision-dialog').close()});
$('#decision-apply').addEventListener('click',applyDecision);
$('#decision-dialog').addEventListener('cancel',event=>{if(busy)event.preventDefault()});

async function run(){
 if(!ref||!isChoice){
  result('Link incompleto.','Solicite uma nova mensagem de confirmação à barbearia.');
  return;
 }
 try{
  const info=await fetch('/api/health',{cache:'no-store'});
  shared=info.ok&&(await info.json()).enabled===true;
 }catch{}
 if(shared){
  if(!exp||!sig){
   result('Link incompleto.','Solicite uma nova mensagem de confirmação à barbearia.');
   return;
  }
  try{
   const query=new URLSearchParams({ref,acao:action,exp,sig});
   const response=await fetch('/api/confirm?'+query,{cache:'no-store'});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Não foi possível consultar este horário.');
   booking=data.item;renderBooking(booking);renderChoice(booking);
   $('#confirmation-footnote').textContent='Sua resposta será registrada na agenda da barbearia.';
  }catch(error){result('Não foi possível abrir o link.',error.message);}
  return;
 }
 // Local demos work only in the same browser in which the reservation was created.
 const local=readDemoBookings().find(item=>item.id===ref);
 if(!local){
  result('Agendamento não encontrado.','Este link só funciona com a agenda compartilhada ativada. Na demonstração, use o mesmo navegador em que criou a reserva.');
  return;
 }
 booking=local;renderBooking(booking);renderChoice(booking);
 $('#confirmation-footnote').textContent='Demonstração: a resposta ficará registrada somente neste navegador.';
}
void run();
