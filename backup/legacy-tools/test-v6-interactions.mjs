// Focused interaction checks on the integrated root. Firefox-native; no npm.
import { Marionette } from './v6-marionette.mjs';
import { sleep } from './v6-browser.mjs';
import { writeFileSync } from 'node:fs';
const b=await new Marionette().connect();const checks=[];
const base=process.env.SR_V6_URL||'http://127.0.0.1:8016/';
const check=(name,pass,detail=null)=>{checks.push({name,pass:!!pass,detail});if(!pass)console.error('FAIL',name,detail);};
const key=async value=>b.send('WebDriver:PerformActions',{actions:[{type:'key',id:'keyboard',actions:[{type:'keyDown',value},{type:'keyUp',value}]}]});
try{
  await b.send('WebDriver:SetWindowRect',{width:390,height:900});
  await b.send('WebDriver:Navigate',{url:base+'index.html?validation=interactions'});await sleep(800);
  check('Skip link oculto em repouso',await b.execute('return document.querySelector(".skip-link").getBoundingClientRect().bottom<0;'));
  await b.execute('document.querySelector(".skip-link").focus();');
  check('Skip link visível ao focar',await b.execute('return document.querySelector(".skip-link").getBoundingClientRect().top===12;'));
  await b.execute('document.querySelector(".viewer-photo").scrollIntoView({behavior:"instant",block:"center"});document.querySelector(".viewer-photo").click();');await sleep(250);
  await key('\uE008');await key('\uE004'); // Shift down/up alone does not persist. Explicit wrap below.
  await b.execute('document.querySelector(".lightbox-close").focus();');
  await b.send('WebDriver:PerformActions',{actions:[{type:'key',id:'keyboard',actions:[{type:'keyDown',value:'\uE008'},{type:'keyDown',value:'\uE004'},{type:'keyUp',value:'\uE004'},{type:'keyUp',value:'\uE008'}]}]});
  check('Lightbox contém foco: Shift+Tab',await b.execute('return document.activeElement===document.querySelector(".lightbox .photo-nav:not(.prev)");'));
  await key('\uE004');check('Lightbox contém foco: Tab',await b.execute('return document.activeElement===document.querySelector(".lightbox-close");'));
  const rect=await b.execute('const r=document.querySelector(".lightbox-image-wrap").getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};');
  await b.send('WebDriver:PerformActions',{actions:[{type:'pointer',id:'touch',parameters:{pointerType:'touch'},actions:[{type:'pointerMove',x:rect.x+45,y:rect.y},{type:'pointerDown',button:0},{type:'pointerMove',duration:180,x:rect.x-45,y:rect.y},{type:'pointerUp',button:0}]}]});await sleep(350);
  check('Swipe por toque no lightbox',await b.execute('return document.querySelector(".lightbox-counter").textContent==="2 de 5";'));
  await b.send('WebDriver:PerformActions',{actions:[{type:'pointer',id:'mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',x:5,y:120},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});
  check('Clique fora fecha e devolve foco/rolagem',await b.execute('return !document.querySelector(".lightbox").open&&document.activeElement.matches(".viewer-photo")&&!document.body.classList.contains("modal-open");'));
  await b.execute('document.querySelector(".viewer-photo-area").scrollIntoView({block:"center",behavior:"instant"});');
  const vr=await b.execute('const r=document.querySelector(".viewer-photo").getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};');
  await b.send('WebDriver:PerformActions',{actions:[{type:'pointer',id:'mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',x:vr.x+45,y:vr.y},{type:'pointerDown',button:0},{type:'pointerMove',duration:180,x:vr.x-45,y:vr.y},{type:'pointerUp',button:0}]}]});await sleep(350);
  check('Arraste no portfólio muda imagem sem abrir modal',await b.execute('return document.querySelector(".viewer-counter").textContent==="2 de 5"&&!document.querySelector(".lightbox").open;'));
  await b.execute('document.querySelector(".reviews-viewport").scrollIntoView({behavior:"instant",block:"center"});');await sleep(150);
  const rr=await b.execute('const r=document.querySelector(".reviews-viewport").getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};');
  await b.send('WebDriver:PerformActions',{actions:[{type:'pointer',id:'touch',parameters:{pointerType:'touch'},actions:[{type:'pointerMove',x:rr.x+40,y:rr.y},{type:'pointerDown',button:0},{type:'pointerMove',duration:180,x:rr.x-40,y:rr.y},{type:'pointerUp',button:0}]}]});
  check('Toque pausa esteira para leitura manual',await b.execute('return document.querySelector(".marquee-control").getAttribute("aria-pressed")==="true";'));
  await b.execute('for(let y=0;y<document.body.scrollHeight;y+=900)window.scrollTo({top:y,behavior:"instant"});window.scrollTo({top:0,behavior:"instant"});');await sleep(700);
  check('Rolagem rápida e retorno mantêm conteúdo visível',await b.execute('return getComputedStyle(document.querySelector("h1")).opacity==="1"&&document.querySelectorAll(".service-entry").length===3&&document.querySelectorAll("[data-work]").length===5;'));
  await b.send('WebDriver:Navigate',{url:base+'index.html#trabalhos'});await b.send('WebDriver:Refresh');await sleep(500);
  check('Atualização posicionada no portfólio',await b.execute('return location.hash==="#trabalhos"&&!document.querySelector(".portfolio-viewer").hidden&&document.querySelector(".viewer-photo img").naturalWidth>0;'));
  await b.execute('document.querySelector(".map-toggle").click();');
  check('Mapa ativa interação por escolha explícita',await b.execute('return !document.querySelector(".map-surface").classList.contains("is-guarded")&&document.querySelector("iframe").tabIndex===0;'));
  await b.execute('document.querySelector(".map-toggle").click();');
  check('Mapa desativa interação sem capturar rolagem',await b.execute('return document.querySelector(".map-surface").classList.contains("is-guarded")&&document.querySelector("iframe").tabIndex===-1;'));
  check('Nenhuma biblioteca externa de JavaScript',await b.execute('return [...document.scripts].every(s=>!s.src||new URL(s.src).origin===location.origin);'));
  await b.send('WebDriver:Navigate',{url:base+'agendar.html?servico=Sobrancelha%20e%20acabamento'});await sleep(300);
  const service=await b.execute('return document.querySelector("[name=servico]:checked").value;');check('Link de serviço preenche acabamento',service==='Sobrancelha e acabamento');
  await b.execute('document.querySelector("form").elements.dia.value="2000-01-01";document.querySelector("form").elements.horario.value="10:00";document.querySelector(".booking-submit").click();');
  check('Data passada recusada',await b.execute('return document.querySelector("[name=dia]").getAttribute("aria-invalid")==="true";'));
}catch(error){checks.push({name:'fatal',pass:false,detail:error.stack});console.error(error.stack);process.exitCode=1;}
finally{await b.send('WebDriver:ReleaseActions').catch(()=>{});await b.close();writeFileSync('docs/V6_TESTES_INTERACOES.json',JSON.stringify(checks,null,2));}
console.log(JSON.stringify(checks,null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
