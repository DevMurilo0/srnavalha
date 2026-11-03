import {ready,response,listBookings} from '../lib/booking-server.js';
export default async function handler(req,res){
 if(!ready())return response(res,503,{error:'Agenda não configurada'});
 if(req.method!=='GET')return response(res,405,{error:'Método não permitido'});
 const day=String(req.query?.date||'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return response(res,400,{error:'Data inválida'});
 try{
  const items=(await listBookings()).filter(b=>b.status!=='cancelled'&&
   new Intl.DateTimeFormat('en-CA',{timeZone:'America/Recife',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(b.starts_at))===day)
   .map(b=>({professional_id:b.professional_id,starts_at:b.starts_at,ends_at:b.ends_at}));
  response(res,200,{busy:items});
 }catch{return response(res,502,{error:'Não foi possível consultar os horários'})}
}
