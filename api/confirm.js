import {ready,response,payload,getBooking,setBooking,verifyAction,assertOrigin} from '../lib/booking-server.js';
export default async function handler(req,res){
 if(!ready())return response(res,503,{error:'Confirmação ainda não está disponível'});
 if(!['GET','POST'].includes(req.method))return response(res,405,{error:'Método não permitido'});
 if(req.method==='POST'&&!assertOrigin(req))return response(res,403,{error:'Origem não autorizada'});
 try{
  const v=req.method==='GET'?req.query:await payload(req);
  const {ref,acao,exp,sig}=v;
  if(!verifyAction(ref,acao,exp,sig))return response(res,403,{error:'Link expirado ou inválido'});
  const record=await getBooking(ref);
  if(!record)return response(res,404,{error:'Agendamento não encontrado'});
  if(req.method==='GET'){
   return response(res,200,{item:{service_name:record.service_name,starts_at:record.starts_at,status:record.status,customer_first_name:record.customer_name.split(' ')[0]},acao});
  }
  // A cancelled booking cannot be automatically reactivated after its slot was freed.
  if(record.status==='cancelled'&&acao==='confirmar')return response(res,409,{error:'Esse horário foi cancelado. Contate a barbearia para solicitar outro.'});
  record.status=acao==='confirmar'?'confirmed':'cancelled';record.responded_at=new Date().toISOString();
  await setBooking(record);
  return response(res,200,{ok:true,status:record.status});
 }catch{return response(res,502,{error:'Não foi possível atualizar a confirmação'})}
}
