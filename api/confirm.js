import {ready,response,payload,getBooking,setBooking,verifyAction,assertOrigin} from '../lib/booking-server.js';

export default async function handler(req,res){
 if(!ready())return response(res,503,{error:'Confirmação ainda não está disponível'});
 if(!['GET','POST'].includes(req.method))return response(res,405,{error:'Método não permitido'});
 if(req.method==='POST'&&!assertOrigin(req))return response(res,403,{error:'Origem não autorizada'});
 try{
  const data=req.method==='GET'?req.query:await payload(req);
  const {ref,acao,exp,sig}=data;
  if(!verifyAction(ref,acao,exp,sig))return response(res,403,{error:'Link expirado ou inválido'});
  const record=await getBooking(ref);
  if(!record)return response(res,404,{error:'Agendamento não encontrado'});
  if(req.method==='GET'){
   return response(res,200,{
    item:{
     service_name:record.service_name,
     professional_name:record.professional_name,
     starts_at:record.starts_at,
     status:record.status,
     responded_at:record.responded_at||null,
     customer_first_name:record.customer_name.split(' ')[0]
    },acao
   });
  }
  // A single token for "escolher" authorizes only one of the two supported decisions.
  // Old action-specific signed links remain bound to their original action.
  const decision=acao==='escolher'?data.decisao:acao;
  if(!['confirmar','cancelar'].includes(decision))
   return response(res,400,{error:'Escolha confirmar ou cancelar'});
  const target=decision==='confirmar'?'confirmed':'cancelled';
  if(record.status===target)
   return response(res,200,{ok:true,status:record.status,already:true});
  // Do not silently flip responses: a cancellation frees the slot and a
  // previous confirmation must not be undone by reopening the signed link.
  if(record.status!=='pending')
   return response(res,409,{error:record.status==='cancelled'
    ?'Este horário já foi cancelado. Fale com a barbearia se precisar de outro.'
    :'Este horário já foi confirmado. Fale com a barbearia para alterá-lo.'});
  record.status=target;
  record.responded_at=new Date().toISOString();
  record.confirmation_channel='site';
  await setBooking(record);
  return response(res,200,{ok:true,status:record.status});
 }catch{
  return response(res,502,{error:'Não foi possível registrar sua resposta'});
 }
}
