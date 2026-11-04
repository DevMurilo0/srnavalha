import {ready,response,payload,session,assertOrigin,listBookings,setBooking,normalizeBooking,collision,getBooking,nextResponseLink,redis} from '../lib/booking-server.js';
export default async function handler(req,res){
 if(!ready())return response(res,503,{error:'Agenda compartilhada indisponível'});
 if(req.method==='GET'){
  if(!session(req))return response(res,401,{error:'Acesso restrito à equipe'});
  try{
   const items=(await listBookings()).map(b=>({...b,links:{reply:nextResponseLink(b,'escolher'),yes:nextResponseLink(b,'confirmar'),no:nextResponseLink(b,'cancelar')}}));
   return response(res,200,{items});
  }catch{return response(res,502,{error:'Não foi possível consultar a agenda'})}
 }
 if(!['POST','PATCH'].includes(req.method))return response(res,405,{error:'Método não permitido'});
 if(!assertOrigin(req))return response(res,403,{error:'Origem não autorizada'});
 if(req.method==='PATCH'&&!session(req))return response(res,401,{error:'Acesso restrito à equipe'});
 try{
  const body=await payload(req);
  if(req.method==='PATCH'){
   const item=await getBooking(body.id);
   if(!item)return response(res,404,{error:'Agendamento não encontrado'});
   if(body.action==='manual_message_sent'){
    item.whatsapp_manual_sent_at=new Date().toISOString();
    await setBooking(item);
    return response(res,200,{item});
   }
   if(!['pending','confirmed','cancelled'].includes(body.status))return response(res,400,{error:'Status inválido'});
   if(item.status===body.status)return response(res,200,{item});
   item.status=body.status;
   item.responded_at=new Date().toISOString();
   item.confirmation_channel='staff';
   await setBooking(item);return response(res,200,{item});
  }
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'visitor').split(',')[0].trim();
  const bucket='srn:rate:'+Buffer.from(ip).toString('base64url')+':'+Math.floor(Date.now()/60000);
  const calls=Number(await redis('INCR',bucket));
  if(calls===1)await redis('EXPIRE',bucket,'90');
  if(calls>6)return response(res,429,{error:'Muitas tentativas. Tente novamente em instantes'});
  const record=normalizeBooking(body);
  const existing=await listBookings();
  if(existing.some(x=>collision(record,x)))return response(res,409,{error:'O horário acabou de ser ocupado. Escolha outro.'});
  await setBooking(record);
  return response(res,201,{item:{id:record.id,reference:record.reference,service_name:record.service_name,professional_name:record.professional_name,starts_at:record.starts_at,status:record.status}});
 }catch(err){return response(res,400,{error:err.message==='Revise os dados do agendamento'||err.message==='Horário inválido'||err.message==='Data fora do período disponível'||err.message==='Horário indisponível'?err.message:'Não foi possível registrar este horário'})}
}
