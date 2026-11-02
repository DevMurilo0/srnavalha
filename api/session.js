import {ready,payload,response,assertOrigin,safeEqual,session,sessionCookie,clearCookie} from '../lib/booking-server.js';
export default async function handler(req,res){
 if(!ready())return response(res,503,{error:'A agenda compartilhada ainda não foi configurada'});
 if(req.method==='GET')return response(res,200,{authenticated:session(req)});
 if(!assertOrigin(req))return response(res,403,{error:'Origem inválida'});
 if(req.method==='DELETE')return response(res,200,{ok:true},{'Set-Cookie':clearCookie});
 if(req.method!=='POST')return response(res,405,{error:'Método não permitido'});
 try{
  const v=await payload(req);
  const valid=safeEqual(String(v.email||'').trim().toLowerCase(),process.env.BOOKING_ADMIN_EMAIL.toLowerCase())&&safeEqual(v.password||'',process.env.BOOKING_ADMIN_PASSWORD);
  if(!valid)return response(res,401,{error:'E-mail ou senha incorretos'});
  response(res,200,{ok:true},{'Set-Cookie':sessionCookie()});
 }catch{return response(res,400,{error:'Dados inválidos'})}
}
