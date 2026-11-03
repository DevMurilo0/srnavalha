import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import whatsapp from '../api/whatsapp.js';
import webhook from '../api/whatsapp-webhook.js';
import {getBooking,setBooking,sessionCookie} from '../lib/booking-server.js';
import {replyPayload,parseReplyPayload,templateMessage} from '../lib/whatsapp-cloud.js';

Object.assign(process.env,{
 UPSTASH_REDIS_REST_URL:'https://example-upstash.test',
 UPSTASH_REDIS_REST_TOKEN:'token-test',
 BOOKING_SESSION_SECRET:'local-test-secret-32-characters-long',
 BOOKING_ADMIN_EMAIL:'equipe@example.test',
 BOOKING_ADMIN_PASSWORD:'local-only-test',
 BOOKING_PUBLIC_ORIGIN:'https://srnavalha.vercel.app',
 WHATSAPP_PHONE_NUMBER_ID:'1234567890',
 WHATSAPP_ACCESS_TOKEN:'never-real-token',
 WHATSAPP_TEMPLATE_NAME:'confirmacao_sr_navalha',
 WHATSAPP_VERIFY_TOKEN:'never-real-verify-token',
 WHATSAPP_APP_SECRET:'test-only-meta-signing-secret',
 WHATSAPP_GRAPH_VERSION:'v24.0'
});
const db=new Map(),ordered=new Map(),metaMessages=[];
globalThis.fetch=async(url,opts)=>{
 if(String(url).startsWith('https://graph.facebook.com/')){
  const msg=JSON.parse(opts.body);metaMessages.push(msg);
  return {ok:true,json:async()=>({messages:[{id:'wamid.mock-delivered'}]})};
 }
 assert.equal(url,'https://example-upstash.test');
 const [action,...args]=JSON.parse(opts.body);let result;
 if(action==='GET')result=db.get(args[0])||null;
 else if(action==='SET'){db.set(args[0],args[1]);result='OK'}
 else if(action==='ZADD'){ordered.set(args[2],Number(args[1]));result=1}
 else if(action==='ZRANGE')result=[...ordered.keys()];
 else if(action==='MGET')result=args.map(key=>db.get(key)||null);
 else throw Error('Unexpected Redis operation: '+action);
 return {ok:true,json:async()=>({result})};
};
const booking={
 id:'19a15a64-5911-4a4c-a7a5-dd0824e36663',
 reference:'PREV1234',service_id:'cortee',service_name:'Corte',
 professional_id:'eduardo',professional_name:'Eduardo',customer_name:'Cliente Exemplo',
 customer_phone:'5581999999999',starts_at:'2026-11-08T14:00:00.000Z',
 ends_at:'2026-11-08T14:30:00.000Z',status:'pending',
 created_at:'2026-11-02T23:00:00.000Z'
};
const cookie=sessionCookie().split(';')[0];
async function call(handler,{method='GET',body=null,headers={},query={},raw=null}={}){
 const req={
  method,headers:{host:'srnavalha.vercel.app',origin:'https://srnavalha.vercel.app',cookie,...headers},
  body,query,
  async *[Symbol.asyncIterator](){if(raw)yield raw}
 };
 const out={status:0,headers:{},payload:null,text:''};
 const res={
  writeHead(status,headers){out.status=status;out.headers=headers},
  end(data){out.text=String(data||'');try{out.payload=JSON.parse(out.text)}catch{}}
 };
 await handler(req,res);return out;
}
const check=(name,result)=>{assert.ok(result,name);console.log('PASS '+name)};
await setBooking(booking);
check('Quick reply payload contains the correct booking',parseReplyPayload(replyPayload(booking.id,'confirmar')).id===booking.id);
const message=templateMessage(booking);
check('Meta approved template contains 2 native reply buttons',
 message.type==='template'&&message.template.components.filter(c=>c.type==='button'&&c.sub_type==='quick_reply').length===2);
const unauthorized=await call(whatsapp,{method:'POST',body:{id:booking.id}});
check('Sending buttons requires staff session',unauthorized.status===401);
const capability=await call(whatsapp,{headers:{cookie}});
check('Configured Meta account enables native buttons',capability.status===200&&capability.payload.available===true);
const sent=await call(whatsapp,{method:'POST',body:{id:booking.id},headers:{cookie}});
check('WhatsApp template dispatched to Cloud API',sent.status===200&&sent.payload.sent&&metaMessages.length===1);
check('Template uses customer phone and distinct confirmation actions',
 metaMessages[0].to===booking.customer_phone&&
 metaMessages[0].template.components[1].parameters[0].payload.endsWith('|confirmar')&&
 metaMessages[0].template.components[2].parameters[0].payload.endsWith('|cancelar'));
const rejectedDouble=await call(whatsapp,{method:'POST',body:{id:booking.id},headers:{cookie}});
check('Repeated send protected by cooldown',rejectedDouble.status===429);

const verify=await call(webhook,{query:{'hub.mode':'subscribe','hub.verify_token':'never-real-verify-token','hub.challenge':'verified-secret'}});
check('Meta webhook subscription challenge accepted',verify.status===200&&verify.text==='verified-secret');
const buildEvent=(id,action,from='5581999999999')=>Buffer.from(JSON.stringify({
 object:'whatsapp_business_account',entry:[{changes:[{value:{
  messages:[{id,from,type:'button',button:{payload:replyPayload(booking.id,action)}}]
 }}]}]
}));
const sendEvent=async(raw,valid=true)=>call(webhook,{
 method:'POST',raw,
 headers:{'x-hub-signature-256':'sha256='+(valid?createHmac('sha256',process.env.WHATSAPP_APP_SECRET).update(raw).digest('hex'):'0'.repeat(64))}
});
const spoof=await sendEvent(buildEvent('wamid.spoof','confirmar'),false);
check('Unverified webhook cannot change bookings',spoof.status===403&&(await getBooking(booking.id)).status==='pending');
const badSender=await sendEvent(buildEvent('wamid.bad-sender','confirmar','5511111111111'));
check('Button from a different phone cannot change booking',badSender.status===200&&(await getBooking(booking.id)).status==='pending');
const yes=await sendEvent(buildEvent('wamid.client-yes','confirmar'));
check('Confirm button updates shared booking to confirmed',yes.status===200&&(await getBooking(booking.id)).status==='confirmed');
const duplicate=await sendEvent(buildEvent('wamid.client-yes','confirmar'));
check('Repeated Meta webhook is idempotent',duplicate.status===200&&(await getBooking(booking.id)).status==='confirmed');
const no=await sendEvent(buildEvent('wamid.client-no','cancelar'));
check('Cancel button updates shared booking to cancelled',no.status===200&&(await getBooking(booking.id)).status==='cancelled');
const forbiddenReconfirm=await sendEvent(buildEvent('wamid.client-yes-late','confirmar'));
check('Cancelled booking is not reactivated by a stale click',forbiddenReconfirm.status===200&&(await getBooking(booking.id)).status==='cancelled');
console.log('WhatsApp native button integration: all tests passed');
