import { Marionette } from './v6-marionette.mjs';
import { sleep } from './v6-browser.mjs';
import { writeFileSync } from 'node:fs';
const b=await new Marionette().connect();const checks=[];
const base=process.env.SR_V6_URL||'http://127.0.0.1:8016/';
const check=(name,pass,detail=null)=>{checks.push({name,pass:!!pass,detail});if(!pass)console.error('FAIL',name,detail);};
const snap=async path=>writeFileSync(path,Buffer.from((await b.send('WebDriver:TakeScreenshot',{full:false})).value,'base64'));
try{
  await b.send('WebDriver:SetWindowRect',{width:1440,height:1000});
  await b.preference('javascript.enabled',true);await b.preference('ui.prefersReducedMotion',0);
  await b.send('WebDriver:Navigate',{url:base+'index.html'});await sleep(500);
  check('Movimento normal inicial',await b.execute('return !matchMedia("(prefers-reduced-motion:reduce)").matches&&document.querySelectorAll("[data-review-clone]").length===1;'));
  await b.execute('document.querySelector("[data-service=barba] summary").click();');
  await sleep(100);await b.preference('ui.prefersReducedMotion',1);await sleep(300);
  const live=await b.execute('return {reduce:matchMedia("(prefers-reduced-motion:reduce)").matches,clones:document.querySelectorAll("[data-review-clone]").length,control:document.querySelector(".marquee-control").hidden,clip:getComputedStyle(document.querySelector("[data-service=barba] img")).clipPath,animations:document.getAnimations().filter(a=>a.playState==="running").length};');
  check('Preferência alterada ao vivo: conteúdo visível e movimento cancelado',live.reduce&&live.clones===0&&live.control&&live.clip==='none'&&live.animations===0,live);
  await b.send('WebDriver:Navigate',{url:base+'index.html#servicos'});await sleep(350);
  check('Reduced motion ao carregar',await b.execute('return matchMedia("(prefers-reduced-motion:reduce)").matches&&document.querySelectorAll("[data-review-clone]").length===0&&document.getAnimations().length===0;'));
  await snap('capturas/v6/depois/reduced-motion-1440.png');
  await b.preference('ui.prefersReducedMotion',0);await sleep(300);
  check('Retorno ao movimento normal sem recarregar',await b.execute('return !matchMedia("(prefers-reduced-motion:reduce)").matches&&document.querySelectorAll("[data-review-clone]").length===1&&!document.querySelector(".marquee-control").hidden;'));
  await b.preference('javascript.enabled',false);
  await b.send('WebDriver:Navigate',{url:base+'index.html'});await sleep(400);
  const nojs=await b.execute('return {enhanced:!!window.SrNavalha,photos:document.querySelectorAll("[data-work]").length,viewerHidden:document.querySelector(".portfolio-viewer").hidden,reviews:document.querySelectorAll(".review").length,services:document.querySelectorAll(".service-entry summary").length,bodyVisible:getComputedStyle(document.querySelector("h1")).opacity,menu:document.querySelector(".mobile-menu").tagName};');
  check('Sem JavaScript: conteúdo e links fotográficos essenciais',!nojs.enhanced&&nojs.photos===5&&nojs.viewerHidden&&nojs.reviews===4&&nojs.services===3&&nojs.bodyVisible==='1',nojs);
  await b.execute('document.querySelector("#trabalhos").scrollIntoView({behavior:"instant"});');await sleep(300);await snap('capturas/v6/depois/sem-javascript-1440.png');
  await b.send('WebDriver:Navigate',{url:base+'agendar.html'});await sleep(200);
  check('Sem JavaScript: agendamento oferece WhatsApp direto',await b.execute('return getComputedStyle(document.querySelector("#booking-form")).display==="none"&&document.querySelector("noscript a").href==="https://wa.me/5581995722396";'));
  await b.preference('javascript.enabled',true);await b.preference('ui.prefersReducedMotion',0);
}catch(error){checks.push({name:'fatal',pass:false,detail:error.stack});console.error(error.stack);process.exitCode=1;}
finally{await b.preference('javascript.enabled',true).catch(()=>{});await b.preference('ui.prefersReducedMotion',0).catch(()=>{});await b.close();writeFileSync(base.includes('.v6-stage')?'docs/V6_TESTES_ACESSIBILIDADE.json':'docs/V6_TESTES_ACESSIBILIDADE_INTEGRADA.json',JSON.stringify(checks,null,2));}
console.log(JSON.stringify(checks,null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
