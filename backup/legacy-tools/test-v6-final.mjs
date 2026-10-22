import {Firefox,sleep} from './v6-browser.mjs';
import {writeFileSync} from 'node:fs';
const b=await new Firefox().connect();const checks=[];
const check=(name,pass,detail=null)=>checks.push({name,pass:!!pass,detail});
try{
  await b.viewport(1440);await b.goto('http://127.0.0.1:8016/index.html#avaliacoes');
  await b.send('input.performActions',{context:b.context,actions:[{type:'pointer',id:'mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',x:10,y:20}]}]});
  await b.evaluate(()=>{document.activeElement.blur();document.querySelector('.reviews-viewport').scrollIntoView({block:'center',behavior:'instant'});});await sleep(300);
  const cycle=await b.evaluate(()=>{const v=document.querySelector('.reviews-viewport'),g=document.querySelector('.reviews-group');v.scrollLeft=g.getBoundingClientRect().width-8;return g.getBoundingClientRect().width;});
  await sleep(650);
  const seam=await b.evaluate(()=>({left:document.querySelector('.reviews-viewport').scrollLeft,gap:document.querySelector('[data-review-clone] .review').getBoundingClientRect().left-document.querySelector('.reviews-group .review:last-child').getBoundingClientRect().right}));
  check('Esteira cruza emenda sem espaço adicional',seam.left<60&&Math.abs(seam.gap-16)<1,{cycle,...seam});
  const point=await b.evaluate(()=>{const r=document.querySelector('.reviews-viewport').getBoundingClientRect();return{x:Math.round(r.width/2),y:Math.round(r.y+r.height/2)}});
  await b.send('input.performActions',{context:b.context,actions:[{type:'pointer',id:'mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',...point}]}]});await sleep(1000);
  const paused=await b.evaluate(()=>document.querySelector('.reviews-viewport').scrollLeft);await sleep(350);
  check('Hover desacelera e pausa sem saltar',Math.abs(await b.evaluate(()=>document.querySelector('.reviews-viewport').scrollLeft)-paused)<1);
  for(const width of [390,768,1440]){
    await b.viewport(width);await b.goto('http://127.0.0.1:8016/index.html');
    await b.evaluate(()=>document.querySelector('.invitation').scrollIntoView({block:'start',behavior:'instant'}));await sleep(700);
    await b.screenshot(`capturas/v6/integrada/encerramento-${width}.png`);
    check(`${width}px CTA corrigido`,await b.evaluate(()=>document.querySelector('.invite-action>.button').textContent.trim()==='Solicitar meu horário'&&!!document.querySelector('.invite-action>span')));
    await b.goto('http://127.0.0.1:8016/agendar.html');await b.evaluate(()=>{window.scrollTo({top:0,behavior:'instant'});document.activeElement.blur();});await sleep(100);
    check(`${width}px skip link fora da captura inicial`,await b.evaluate(()=>document.querySelector('.skip-link').getBoundingClientRect().bottom<0));
    await b.screenshot(`capturas/v6/integrada/agendamento-${width}.png`,true);
  }
  await b.viewport(390,900,2);await b.goto('http://127.0.0.1:8016/index.html');
  check('DPR2 sem imagem maior falsa e sem overflow',await b.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth&&[...document.querySelectorAll('.hero-frame img')].every(img=>img.naturalWidth<=266)));
  await b.viewport(1440);await b.goto('http://127.0.0.1:8016/index.html#localizacao');await sleep(3500);
  await b.screenshot('capturas/v6/integrada/mapa-final.png');
  const trees=await b.send('browsingContext.getTree');
  check('Google Maps carregado em contexto real',JSON.stringify(trees).includes('google.com/maps/embed'));
  // Block the provider through BiDi to exercise the existing text/link fallback.
  await b.send('session.subscribe',{events:['network.beforeRequestSent']});
  const {intercept}=await b.send('network.addIntercept',{phases:['beforeRequestSent'],urlPatterns:[{type:'pattern',hostname:'www.google.com'}]});
  const handled=new Set();let blocked=0;
  const timer=setInterval(()=>{for(const event of b.events){const p=event.params;if(event.method==='network.beforeRequestSent'&&p.isBlocked&&!handled.has(p.request.request)){handled.add(p.request.request);blocked++;b.send('network.failRequest',{request:p.request.request}).catch(()=>{});}}},20);
  try{
    await b.goto('http://127.0.0.1:8016/index.html?map-failure=1#localizacao');await sleep(800);
    check('Falha do provedor mantém endereço/link e layout',blocked>0&&await b.evaluate(()=>!!document.querySelector('.map-fallback a[href*="google.com/maps"]')&&document.querySelector('address').textContent.includes('349')&&document.documentElement.scrollWidth<=document.documentElement.clientWidth),{blockedRequests:blocked});
    await b.screenshot('capturas/v6/integrada/mapa-indisponivel.png');
  }finally{clearInterval(timer);await b.send('network.removeIntercept',{intercept});}
  check('Dependências externas de bibliotecas: nenhuma',await b.evaluate(()=>[...document.scripts].every(s=>!s.src||new URL(s.src).origin===location.origin)));
  const support=await b.evaluate(()=>PerformanceObserver.supportedEntryTypes.includes('layout-shift'));
  checks.push({name:'Métrica CLS disponível neste Firefox',informational:true,pass:true,detail:support?'Disponível':'Indisponível: layout conferido por dimensões reservadas e capturas, sem número CLS inventado.'});
}catch(error){checks.push({name:'fatal',pass:false,detail:error.stack});console.error(error.stack);process.exitCode=1;}
finally{await b.close();writeFileSync('docs/V6_TESTES_FINAIS.json',JSON.stringify(checks,null,2));}
console.log(JSON.stringify(checks,null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
