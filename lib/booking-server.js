import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
import services from '../js/data/services.js';
import professionals from '../js/data/professionals.js';

export const ready=()=>Boolean(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN&&process.env.BOOKING_SESSION_SECRET&&process.env.BOOKING_ADMIN_EMAIL&&process.env.BOOKING_ADMIN_PASSWORD&&process.env.BOOKING_PUBLIC_ORIGIN);
export const publicOrigin=()=>{
 try{const v=new URL(process.env.BOOKING_PUBLIC_ORIGIN||'');return v.protocol==='https:'&&v.pathname==='/'?v.origin:null}catch{return null}
};
export function response(res,code,data,extra={}){
 res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra});
 res.end(JSON.stringify(data));
}
export const deny=(res,code,message)=>response(res,code,{error:message});
export async function payload(req){
 if(req.body&&typeof req.body==='object')return req.body;
 const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>4096)throw Error('Corpo da requisição muito grande');chunks.push(chunk)}
 return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
}
export function assertOrigin(req){
 const origin=req.headers.origin;
 if(!origin)return false;
 try{const u=new URL(origin);return u.protocol==='https:'&&u.host===req.headers.host||u.hostname==='localhost'&&u.host===req.headers.host}catch{return false}
}
export const sign=value=>createHmac('sha256',process.env.BOOKING_SESSION_SECRET||'missing-secret').update(value).digest('base64url');
export function safeEqual(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)}
export function getCookie(req,name){
 const raw=req.headers.cookie||'';
 const match=raw.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='));
 return match?match.slice(name.length+1):'';
}
export function session(req){
 if(!ready())return false;
 const token=getCookie(req,'srn_team');
 const [body,hash]=token.split('.');
 if(!body||!hash||!safeEqual(sign(body),hash))return false;
 try{const data=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));return data.role==='team'&&Number(data.exp)>Date.now()}catch{return false}
}
export function sessionCookie(){
 const content=Buffer.from(JSON.stringify({role:'team',exp:Date.now()+8*60*60*1000})).toString('base64url');
 return 'srn_team='+content+'.'+sign(content)+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800';
}
export const clearCookie='srn_team=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
export async function redis(...command){
 const base=(process.env.UPSTASH_REDIS_REST_URL||'').replace(/\/$/,'');
 if(!base)throw Error('Data store indisponível');
 const r=await fetch(base,{method:'POST',headers:{Authorization:'Bearer '+process.env.UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(7000)});
 if(!r.ok)throw Error('Banco de dados indisponível');
 const result=await r.json();if(result.error)throw Error('Falha ao acessar o banco');return result.result;
}
export async function getBooking(id){
 if(!/^[a-f0-9-]{36}$/.test(String(id)))return null;
 const value=await redis('GET','srn:booking:'+id);
 if(!value)return null;try{return JSON.parse(value)}catch{return null}
}
export async function listBookings(){
 const ids=await redis('ZRANGE','srn:bookings','0','-1');
 if(!ids?.length)return [];
 const raw=await redis('MGET',...ids.map(id=>'srn:booking:'+id));
 return raw.filter(Boolean).map(v=>{try{return JSON.parse(v)}catch{return null}}).filter(Boolean);
}
export async function setBooking(record){
 await redis('SET','srn:booking:'+record.id,JSON.stringify(record));
 await redis('ZADD','srn:bookings',String(Date.parse(record.created_at)),record.id);
}
const dateLocal=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Recife',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
const timeLocal=value=>new Intl.DateTimeFormat('en-GB',{timeZone:'America/Recife',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
export function normalizeBooking(input){
 const svc=services.find(s=>s.id===input?.serviceId&&s.category!=='Assinantes');
 const pro=professionals.find(p=>p.id===input?.professionalId);
 const name=String(input?.name||'').trim().replace(/\s+/g,' ');
 const phone=String(input?.phone||'').replace(/\D/g,'');
 const slot=String(input?.slotAt||'');
 if(!svc||!pro||name.length<2||name.length>70||!/^55\d{10,11}$/.test(phone))throw Error('Revise os dados do agendamento');
 const date=new Date(slot);if(!Number.isFinite(date.getTime()))throw Error('Horário inválido');
 const minutes=Number.parseInt(svc.duration,10);
 if(!Number.isInteger(minutes)||minutes<5||minutes>360)throw Error('Duração inválida');
 const localDay=dateLocal(slot),time=timeLocal(slot);
 const day=new Date(localDay+'T12:00:00Z'),weekday=day.getUTCDay();
 if(weekday===0||date.getTime()<Date.now()+25*60*1000||date.getTime()>Date.now()+31*86400e3)throw Error('Data fora do período disponível');
 const start=Number(time.slice(0,2))*60+Number(time.slice(3,5));
 if(!((start>=540&&start+minutes<=720)||(start>=840&&start+minutes<=1140))||start%30!==0)throw Error('Horário indisponível');
 return {id:randomUUID(),reference:randomUUID().slice(0,8).toUpperCase(),service_id:svc.id,service_name:svc.name,professional_id:pro.id,professional_name:pro.name,customer_name:name,customer_phone:phone,starts_at:date.toISOString(),ends_at:new Date(date.getTime()+minutes*60000).toISOString(),status:'pending',created_at:new Date().toISOString()};
}
export const collision=(a,b)=>a.professional_id===b.professional_id&&a.status!=='cancelled'&&b.status!=='cancelled'&&Date.parse(a.starts_at)<Date.parse(b.ends_at)&&Date.parse(a.ends_at)>Date.parse(b.starts_at);
export const nextResponseLink=(booking,action)=>{
 const expires=Math.floor(Date.parse(booking.starts_at)/1000)+86400;
 const signed=sign(booking.id+'|'+action+'|'+expires);
 const url=new URL('/confirmar.html',publicOrigin());
 url.searchParams.set('ref',booking.id);url.searchParams.set('acao',action);url.searchParams.set('exp',String(expires));url.searchParams.set('sig',signed);
 return url.href;
};
export function verifyAction(id,action,exp,sig){
 const expiry=Number(exp);
 return (action==='confirmar'||action==='cancelar')&&Number.isSafeInteger(expiry)&&expiry>Math.floor(Date.now()/1000)&&expiry<Math.floor(Date.now()/1000)+365*86400&&safeEqual(sign(id+'|'+action+'|'+exp),sig);
}
