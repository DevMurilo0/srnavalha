import {Browser,sleep} from '../plugins/taste-frontend-design/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {serve} from './hero-test-server.mjs';
import {writeFileSync} from 'node:fs';
const s=await serve(),b=await Browser.launch(),p=await b.newPage(),results=[];
const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});console.log(name,!!pass)};
const visible=()=>{const h=document.querySelector('.nv11-hero');return !document.querySelector('.nv11-curtain')&&getComputedStyle(h.querySelector('.nv2-actions')).opacity==='1'&&h.querySelectorAll('a[href]').length===2&&h.getAnimations({subtree:true}).length===0};
try {
 for(const width of [1672,390,320]) {
  await p.setViewport({width,height:width===1672?941:844,mobile:width!==1672});
  await p.goto(s.base,{settleMs:0});
  const count=await p.eval(()=>{const root=document.querySelector('.nv11-hero'),curtain=document.querySelector('.nv11-curtain');window.heroCaptureAnimations=document.getAnimations().filter(a=>root.contains(a.effect.target)||curtain?.contains(a.effect.target));window.heroCaptureAnimations.forEach(a=>a.pause());return window.heroCaptureAnimations.length});
  check(`${width}: abertura ativa`,count>=9,count);
  for(const time of [0,600,950]) {
   await p.eval(time=>window.heroCaptureAnimations.forEach(a=>a.currentTime=time),time);
   await p.screenshot({path:`capturas/hero-reference/entrada-${width}-${time}.png`,format:'png'});
  }
  await sleep(1500);
  check(`${width}: estado final sem propriedades presas`,await p.eval(visible));
 }
 // Refresh and a real (unpaused) elapsed transition.
 await p.goto(s.base,{settleMs:0});await sleep(600);
 await p.screenshot({path:'capturas/hero-reference/entrada-tempo-real-600.png',format:'png'});
 await sleep(900);check('Atualização: final da sequência real',await p.eval(visible));
 await p.goto(s.base,{settleMs:0});
 await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 await p.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 check('Tab interrompe abertura e revela controles',await p.eval(visible));
 await p.eval(()=>document.querySelector('.mobile-menu summary').click());
 check('Menu abre por toque/clique',await p.eval(()=>document.querySelector('.mobile-menu').open));
 await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 check('Escape fecha menu e retorna foco',await p.eval(()=>!document.querySelector('.mobile-menu').open&&document.activeElement===document.querySelector('.mobile-menu summary')));
 await p.eval(()=>document.querySelector('.nv2-more').click());await sleep(900);
 check('Link Serviços navega para seção preservada',await p.eval(()=>location.hash==='#servicos'&&document.querySelector('#servicos').getBoundingClientRect().top>=0&&document.querySelector('#servicos').getBoundingClientRect().top<180));
 await p.goto(s.base,{settleMs:0});await p.eval(()=>scrollTo({top:500,behavior:'instant'}));await sleep(60);
 check('Scroll durante abertura libera conteúdo',await p.eval(visible));
 await p.eval(()=>scrollTo({top:0,behavior:'instant'}));await sleep(60);
 check('Retorno de scroll mantém enquadramento estável',await p.eval(()=>getComputedStyle(document.querySelector('.nv2-picture picture')).transform==='none'));
 await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await p.goto(s.base,{settleMs:150});check('Movimento reduzido inicial',await p.eval(visible));
 await p.screenshot({path:'capturas/hero-reference/reduced-320.png',format:'png'});
 await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await p.goto(s.base,{settleMs:150});await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await p.eval(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await sleep(80); // matchMedia change is dispatched on the next rendering update.
 check('Movimento reduzido durante abertura',await p.eval(visible));
 await p.send('Emulation.setScriptExecutionDisabled',{value:true});await p.goto(s.base,{settleMs:100});
 check('Sem JavaScript: conteúdo e links visíveis',await p.eval(visible));
 await p.screenshot({path:'capturas/hero-reference/sem-js-320.png',format:'png'});
 await p.send('Emulation.setScriptExecutionDisabled',{value:false});await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await p.send('Network.enable');await p.send('Network.setBlockedURLs',{urls:['*hero-ref*.webp','*fonts.googleapis.com*','*fonts.gstatic.com*']});await p.goto(s.base,{settleMs:1800});
 check('Falha da fotografia não bloqueia agenda',await p.eval(visible));
 await p.send('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']});await p.goto(s.base,{settleMs:1600});
 check('Fontes locais sem Google Fonts',await p.eval(()=>document.fonts.check('500 50px "Navalha Bodoni"')&&document.fonts.check('italic 500 50px "Navalha Bodoni"')));
 check('CTA usa AppBarber oficial',await p.eval(()=>[...document.querySelectorAll('.nv2-cta,.nv2-book')].every(a=>a.href==='https://sites.appbarber.com.br/srnavala-pqjj')));
 check('Nenhuma exceção JavaScript',p.consoleErrors.length===0,p.consoleErrors);
}catch(error){check('Execução',false,String(error))}
finally{writeFileSync('docs/HERO_REFERENCE_MOTION.json',JSON.stringify(results,null,2));await b.close();s.close();process.exit(results.some(r=>!r.pass)?1:0)}
