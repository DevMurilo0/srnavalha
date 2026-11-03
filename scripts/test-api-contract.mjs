import assert from 'node:assert/strict';
import health from '../api/health.js';
import sessions from '../api/session.js';
import bookings from '../api/bookings.js';
import confirmations from '../api/confirm.js';
import blocked from '../api/blocked.js';
process.env.UPSTASH_REDIS_REST_URL='https://redis-test.example';
process.env.UPSTASH_REDIS_REST_TOKEN='demo-test-token';
process.env.BOOKING_SESSION_SECRET='test-only-secret-not-for-production';
process.env.BOOKING_ADMIN_EMAIL='staff@example.test';
process.env.BOOKING_ADMIN_PASSWORD='strong-test-value';
process.env.BOOKING_PUBLIC_ORIGIN='https://srnavalha.vercel.app';
const database=new Map(),order=new Map();
globalThis.fetch=async(url,options)=>{
 assert.equal(String(url),'https://redis-test.example');
 const [cmd,...args]=JSON.parse(options.body);
 let val=null;
 switch(cmd){
  case 'GET':val=database.get(args[0])||null;break;
  case 'SET':database.set(args[0],args[1]);val='OK';break;
  case 'ZADD':order.set(args[2],Number(args[1]));val=1;break;
  case 'ZRANGE':val=[...order].sort((a,b)=>a[1]-b[1]).map(x=>x[0]);break;
  case 'MGET':val=args.map(k=>database.get(k)||null);break;
  case 'INCR':{val=Number(database.get(args[0])||'0')+1;database.set(args[0],String(val));break;}
  case 'EXPIRE':val=1;break;
  default:throw Error('Unknown Redis operation '+cmd);
 }
 return {ok:true,json:async()=>({result:val})};
};
const call=async(handler,method='GET',body=null,query={},cookie='')=>{
 const req={method,headers:{host:'srnavalha.vercel.app',origin:'https://srnavalha.vercel.app',cookie},body,query,socket:{remoteAddress:'127.0.0.1'}};
 const out={status:200,headers:null,json:null};
 const res={writeHead(status,headers){out.status=status;out.headers=headers},end(payload){out.json=JSON.parse(payload)}};
 await handler(req,res);return out;
};
const count={passed:0};function check(label,test){assert.ok(test,label);count.passed++;console.log('PASS '+label)}
const healthReply=await call(health);
check('API reports shared mode',healthReply.json.enabled===true);
const future=Array.from({length:7},(_,i)=>{
 const date=new Date(Date.now()+(i+2)*86400000).toISOString().slice(0,10);
 return date;
}).find(day=>new Date(day+'T12:00:00Z').getUTCDay()!==0);
const iso=new Date(future+'T11:00:00-03:00').toISOString();
const input={serviceId:'cortee',professionalId:'eduardo',slotAt:iso,name:'Cliente teste',phone:'5581999999999'};
const created=await call(bookings,'POST',input);
check('public booking accepted',created.status===201&&created.json.item.status==='pending');
const identifier=created.json.item.id;
const invalid=await call(bookings,'POST',input);
check('overlapping reservations blocked',invalid.status===409);
const forbidden=await call(bookings,'GET');
check('unauthenticated listing forbidden',forbidden.status===401);
const login=await call(sessions,'POST',{email:'staff@example.test',password:'strong-test-value'});
check('admin cookie issued',login.status===200&&login.headers['Set-Cookie']?.includes('HttpOnly'));
const cookie=login.headers['Set-Cookie'].split(';')[0];
const listed=await call(bookings,'GET',null,{},cookie);
check('admin sees new booking and HTTPS links',listed.json.items.length===1&&listed.json.items[0].links.yes.startsWith('https://srnavalha.vercel.app/confirmar.html?'));
check('public links contain no localhost',!JSON.stringify(listed.json.items[0].links).includes('127.0.0.1'));
const link=new URL(listed.json.items[0].links.yes);
const query={ref:link.searchParams.get('ref'),acao:link.searchParams.get('acao'),exp:link.searchParams.get('exp'),sig:link.searchParams.get('sig')};
const valid=await call(confirmations,'GET',null,query);
check('signed confirmation returns public details without phone',valid.status===200&&!('customer_phone' in valid.json.item));
const denied=await call(confirmations,'GET',null,{...query,sig:'bad'});
check('tampering denied',denied.status===403);
const marked=await call(bookings,'PATCH',{id:identifier,action:'manual_message_sent'},{},cookie);
check('operator-reported message sent saved without changing attendance',marked.status===200&&Boolean(marked.json.item.whatsapp_manual_sent_at)&&marked.json.item.status==='pending');
const answer=await call(confirmations,'POST',query);
check('customer confirmation persisted',answer.status===200&&answer.json.status==='confirmed');
const busy=await call(blocked,'GET',null,{date:future});
check('confirmed time remains blocked',busy.json.busy.length===1);
const cancelled=await call(bookings,'PATCH',{id:identifier,status:'cancelled'}, {},cookie);
check('admin cancellation persisted',cancelled.status===200&&cancelled.json.item.status==='cancelled');
const free=await call(blocked,'GET',null,{date:future});
check('cancelled time becomes available',free.json.busy.length===0);
console.log('API integration contract:',count.passed,'checks passed');
