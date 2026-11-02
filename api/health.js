import {ready,publicOrigin,response} from '../lib/booking-server.js';
export default async function handler(req,res){
 if(req.method!=='GET')return response(res,405,{error:'Método não permitido'});
 response(res,200,{enabled:ready()&&Boolean(publicOrigin()),mode:ready()&&publicOrigin()?'shared':'demo'});
}
