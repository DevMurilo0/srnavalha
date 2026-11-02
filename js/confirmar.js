import {readDemoBookings,updateDemoBookingStatus,normalizedStatus} from './booking-local.js';
const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const id = params.get('ref');
const action = params.get('acao');
const booking = readDemoBookings().find(item=>item.id===id);
const isConfirm = action === 'confirmar';
const isCancel = action === 'cancelar';
const day = value => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Recife',day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
function setResult(title,description,symbol) {
 $('#confirmation-title').textContent=title;
 $('#confirmation-description').textContent=description;
 $('#confirmation-icon').textContent=symbol;
 $('#confirmation-actions').hidden=true;
}
if(!booking){
 setResult('Agendamento não encontrado.','Este link faz parte da demonstração local. Para simular a resposta, abra o link no mesmo navegador onde o agendamento foi realizado.','i');
}else{
 $('#confirmation-details').hidden=false;
 $('#confirm-client').textContent=booking.customer_name;
 $('#confirm-service').textContent=booking.service_name;
 $('#confirm-date').textContent=day(booking.starts_at);
 if(!isConfirm&&!isCancel){
  setResult('Escolha uma resposta.','Para demonstrar a confirmação, abra o link correspondente no painel da equipe.','i');
 }else{
  const current=normalizedStatus(booking);
  const next=isConfirm?'confirmed':'cancelled';
  if(current===next){
   setResult(isConfirm?'Presença confirmada.':'Horário cancelado.','Sua resposta já está registrada nesta demonstração.','✓');
  }else{
   $('#confirmation-title').innerHTML=isConfirm?'Sua presença,<br><em>confirmada?</em>':'Deseja <em>cancelar?</em>';
   $('#confirmation-description').textContent=isConfirm?'Confirme se você poderá comparecer no horário informado.':'Ao cancelar, este horário voltará a ficar disponível na agenda de demonstração.';
   const button=$('#confirm-action');
   button.textContent=isConfirm?'Sim, vou comparecer':'Confirmar cancelamento';
   if(!isConfirm)button.style.background='#7e4b40';
   $('#confirmation-actions').hidden=false;
   button.addEventListener('click',()=>{
    try{
     updateDemoBookingStatus(booking.id,next);
     $('#confirmation-label').textContent='RESPOSTA REGISTRADA';
     setResult(isConfirm?'Presença confirmada.':'Horário cancelado.',isConfirm?'Obrigado! Sua confirmação está registrada neste navegador.':'Sua resposta foi registrada neste navegador.','✓');
    }catch{
     $('#confirmation-description').textContent='Não foi possível salvar a resposta neste navegador. Confira se o armazenamento está disponível.';
    }
   });
  }
 }
}
