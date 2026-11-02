import {ready,response,getBooking,setBooking,redis} from '../lib/booking-server.js';
import {whatsappConfigured,parseReplyPayload,verifyWebhookSignature} from '../lib/whatsapp-cloud.js';

// Preserve the exact bytes: Meta signs the raw POST body.
export const config={api:{bodyParser:false}};

async function rawBody(req){
 const chunks=[];let size=0;
 for await(const chunk of req){
  size+=chunk.length;
  if(size>1024*1024)throw Error('Payload too large');
  chunks.push(chunk);
 }
 return Buffer.concat(chunks);
}

export default async function handler(req,res){
 if(!whatsappConfigured()||!ready())return response(res,503,{error:'WhatsApp não configurado'});
 if(req.method==='GET'){
  const q=req.query||{};
  if(q['hub.mode']==='subscribe'&&q['hub.verify_token']===process.env.WHATSAPP_VERIFY_TOKEN){
   res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
   return res.end(String(q['hub.challenge']||''));
  }
  return response(res,403,{error:'Verificação inválida'});
 }
 if(req.method!=='POST')return response(res,405,{error:'Método não permitido'});

 let body,updates;
 try{
  body=await rawBody(req);
  if(!verifyWebhookSignature(body,req.headers['x-hub-signature-256']))
   return response(res,403,{error:'Assinatura Meta inválida'});
  updates=JSON.parse(body.toString('utf8'));
 }catch{return response(res,400,{error:'Mensagem inválida'})}

 try{
  for(const entry of updates?.entry||[]){
   for(const change of entry?.changes||[]){
    for(const message of change?.value?.messages||[]){
     const raw=message?.button?.payload||message?.interactive?.button_reply?.id;
     const data=parseReplyPayload(raw);
     if(!data||!message?.id)continue;
     // Deduplicate Meta redeliveries before modifying the booking.
     const first=await redis('SET','srn:wa:event:'+message.id,'1','EX','604800','NX');
     if(first!=='OK')continue;
     const booking=await getBooking(data.id);
     if(!booking)continue;
     const sender=String(message.from||'').replace(/\D/g,'');
     if(sender!==booking.customer_phone)continue;
     const target=data.action==='confirmar'?'confirmed':'cancelled';
     if(booking.status==='cancelled'&&target==='confirmed')continue;
     if(booking.status===target)continue;
     booking.status=target;
     booking.responded_at=new Date().toISOString();
     booking.confirmation_channel='whatsapp';
     booking.whatsapp_reply_message_id=message.id;
     await setBooking(booking);
    }
   }
  }
  return response(res,200,{ok:true});
 }catch{return response(res,500,{error:'Não foi possível salvar a resposta'})}
}
