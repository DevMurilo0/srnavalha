import {readDemoBookings,updateDemoBookingStatus,normalizedStatus} from './booking-local.js';
const $=selector=>document.querySelector(selector);
const params=new URLSearchParams(location.search);
const id=params.get('ref'),action=params.get('acao'),exp=params.get('exp'),sig=params.get('sig');
const confirm=action==='confirmar',cancel=action==='cancelar';
let shared=false,booking=null;
const fmt=value=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Recife',day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
function result(title,description,symbol){
 $('#confirmation-title').textContent=title;
 $('#confirmation-description').textContent=description;
 $('#confirmation-icon').textContent=symbol;
 $('#confirmation-actions').hidden=true;
}
function renderRecord(item){
 $('#confirmation-details').hidden=false;
 $('#confirm-client').textContent=item.customer_first_name||item.customer_name?.split(' ')[0]||'Cliente';
 $('#confirm-service').textContent=item.service_name;
 $('#confirm-date').textContent=fmt(item.starts_at);
}
function renderDecision(item){
 const current=normalizedStatus(item);
 if(!confirm&&!cancel)return result('Resposta indisponível.','Escolha um link válido de confirmação ou cancelamento.','i');
 if(current===(confirm?'confirmed':'cancelled')){
  result(confirm?'Presença confirmada.':'Horário cancelado.','Sua resposta já foi registrada na agenda.','✓');return;
 }
 if(current==='cancelled'&&confirm)return result('Horário cancelado.','Contate a barbearia para solicitar um novo horário.','i');
 $('#confirmation-title').textContent=confirm?'Confirmar presença?':'Cancelar horário?';
 $('#confirmation-description').textContent=confirm?'Confirme que poderá comparecer no horário informado.':'Ao cancelar, este horário volta a ficar disponível na agenda.';
 $('#confirmation-actions').hidden=false;
 $('#confirm-action').textContent=confirm?'Sim, vou comparecer':'Confirmar cancelamento';
 if(cancel)$('#confirm-action').style.background='#7e4b40';
}
async function run(){
 try{
  const info=await fetch('/api/health',{cache:'no-store'});
  shared=info.ok&&(await info.json()).enabled===true;
 }catch{}
 if(shared){
  if(!id||!sig||!exp||!action)return result('Link incompleto.','Solicite uma nova mensagem à barbearia.','i');
  const query=new URLSearchParams({ref:id,acao:action,exp,sig});
  const endpoint='/api/confirm?'+query;
  try{
   const response=await fetch(endpoint,{cache:'no-store'});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Não foi possível consultar a confirmação');
   booking=data.item;renderRecord(booking);renderDecision(booking);
   $('#confirmation-footnote').textContent='O resultado será registrado na agenda da barbearia.';
  }catch(err){result('Link não disponível.',err.message,'i');return}
  $('#confirm-action').addEventListener('click',async()=>{
   const button=$('#confirm-action');button.disabled=true;
   try{
    const response=await fetch('/api/confirm',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({ref:id,acao:action,exp,sig})});
    const data=await response.json();
    if(!response.ok)throw Error(data.error||'Não foi possível registrar');
    result(confirm?'Presença confirmada.':'Horário cancelado.',confirm?'Obrigado! Sua presença foi registrada na agenda da Sr. Navalha.':'A barbearia recebeu seu cancelamento.','✓');
   }catch(err){$('#confirmation-description').textContent=err.message;button.disabled=false}
  });
  return;
 }
 const local=readDemoBookings().find(x=>x.id===id);
 if(!local)return result('Agendamento não encontrado.','Este é um link de demonstração. A resposta só pode ser simulada no mesmo navegador em que o agendamento foi criado.','i');
 booking=local;renderRecord(booking);renderDecision(booking);
 $('#confirm-action').addEventListener('click',()=>{
  try{
   updateDemoBookingStatus(local.id,confirm?'confirmed':'cancelled');
   result(confirm?'Presença confirmada.':'Horário cancelado.','Resposta registrada apenas neste navegador de demonstração.','✓');
  }catch{result('Não foi possível salvar.','Tente novamente neste navegador.','i')}
 });
}
void run();
