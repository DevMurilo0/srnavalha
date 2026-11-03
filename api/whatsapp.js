import {ready,response,session,assertOrigin,payload,getBooking,setBooking} from '../lib/booking-server.js';
import {whatsappConfigured,sendTemplate} from '../lib/whatsapp-cloud.js';

export default async function handler(req,res){
 if(req.method==='GET'){
  if(!session(req))return response(res,401,{error:'Acesso restrito à equipe'});
  return response(res,200,{available:ready()&&whatsappConfigured()});
 }
 if(req.method!=='POST')return response(res,405,{error:'Método não permitido'});
 if(!ready()||!whatsappConfigured())return response(res,503,{error:'Botões do WhatsApp Business ainda não configurados'});
 if(!session(req))return response(res,401,{error:'Acesso restrito à equipe'});
 if(!assertOrigin(req))return response(res,403,{error:'Origem não autorizada'});
 try{
  const body=await payload(req);
  const booking=await getBooking(body.id);
  if(!booking)return response(res,404,{error:'Agendamento não encontrado'});
  if(booking.status!=='pending')return response(res,409,{error:'Somente pedidos aguardando confirmação podem receber esse lembrete'});
  const elapsed=Date.now()-Date.parse(booking.whatsapp_last_sent_at||0);
  if(booking.whatsapp_last_sent_at&&elapsed<10*60*1000)
   return response(res,429,{error:'Aguarde pelo menos 10 minutos antes de reenviar'});
  const messageId=await sendTemplate(booking);
  booking.whatsapp_last_sent_at=new Date().toISOString();
  booking.whatsapp_message_id=messageId;
  await setBooking(booking);
  return response(res,200,{ok:true,sent:true,buttons:['Confirmar presença','Cancelar horário']});
 }catch(error){
  return response(res,502,{error:String(error?.message||'Não foi possível enviar a mensagem').slice(0,180)});
 }
}
