import {createHmac,timingSafeEqual} from 'node:crypto';

/**
 * WhatsApp Business Platform Cloud API integration.
 * Native quick reply buttons are part of an approved utility message template.
 * The app must use a WABA-enabled phone number and verified Meta webhooks.
 */
export const whatsappConfigured=()=>Boolean(
  process.env.WHATSAPP_PHONE_NUMBER_ID &&
  process.env.WHATSAPP_ACCESS_TOKEN &&
  process.env.WHATSAPP_TEMPLATE_NAME &&
  process.env.WHATSAPP_APP_SECRET &&
  process.env.WHATSAPP_VERIFY_TOKEN
);

export function replyPayload(id,action){
 if(!/^[a-f0-9-]{36}$/.test(String(id))||!['confirmar','cancelar'].includes(action))
  throw Error('Resposta inválida');
 return 'SRN|'+id+'|'+action;
}

export function parseReplyPayload(value){
 const match=/^SRN\|([a-f0-9-]{36})\|(confirmar|cancelar)$/.exec(String(value||''));
 return match?{id:match[1],action:match[2]}:null;
}

export function verifyWebhookSignature(rawBody,signature){
 const secret=process.env.WHATSAPP_APP_SECRET;
 if(!secret||!Buffer.isBuffer(rawBody)||!/^sha256=[a-f\d]{64}$/i.test(String(signature||'')))return false;
 const expected='sha256='+createHmac('sha256',secret).update(rawBody).digest('hex');
 const a=Buffer.from(expected),b=Buffer.from(signature);
 return a.length===b.length&&timingSafeEqual(a,b);
}

export function templateMessage(booking){
 if(!booking?.id||!/^55\d{10,11}$/.test(String(booking.customer_phone)))throw Error('Telefone inválido');
 const displayDate=new Intl.DateTimeFormat('pt-BR',{
  timeZone:'America/Recife',weekday:'long',day:'2-digit',month:'long',hour:'2-digit',minute:'2-digit'
 }).format(new Date(booking.starts_at));
 return {
  messaging_product:'whatsapp',
  to:booking.customer_phone,
  type:'template',
  template:{
   name:process.env.WHATSAPP_TEMPLATE_NAME,
   language:{code:process.env.WHATSAPP_TEMPLATE_LANGUAGE||'pt_BR'},
   components:[
    {type:'body',parameters:[
     {type:'text',text:booking.customer_name.trim().split(/\s+/)[0].slice(0,50)},
     {type:'text',text:String(booking.service_name).slice(0,120)},
     {type:'text',text:displayDate},
     {type:'text',text:String(booking.professional_name).slice(0,60)}
    ]},
    {type:'button',sub_type:'quick_reply',index:'0',
     parameters:[{type:'payload',payload:replyPayload(booking.id,'confirmar')}]},
    {type:'button',sub_type:'quick_reply',index:'1',
     parameters:[{type:'payload',payload:replyPayload(booking.id,'cancelar')}]}
   ]
  }
 };
}

export async function sendTemplate(booking){
 if(!whatsappConfigured())throw Error('WhatsApp Business não configurado');
 const version=process.env.WHATSAPP_GRAPH_VERSION||'v24.0';
 if(!/^v\d+\.\d+$/.test(version))throw Error('Versão da Graph API inválida');
 const phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID;
 if(!/^\d+$/.test(phoneId))throw Error('Identificador do remetente inválido');
 const api='https://graph.facebook.com/'+version+'/'+phoneId+'/messages';
 const reply=await fetch(api,{
  method:'POST',
  headers:{'Authorization':'Bearer '+process.env.WHATSAPP_ACCESS_TOKEN,'Content-Type':'application/json'},
  body:JSON.stringify(templateMessage(booking)),
  signal:AbortSignal.timeout(12000)
 });
 if(!reply.ok)throw Error('A Meta não aceitou o template. Confira a aprovação, a conta e o número de destino.');
 const result=await reply.json();
 const messageId=result?.messages?.[0]?.id;
 if(!/^wamid\./.test(String(messageId)))throw Error('Envio não confirmado pela API');
 return messageId;
}
