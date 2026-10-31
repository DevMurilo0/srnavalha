// V31: actual title choreography, isolated reversible depth, mechanical CTA,
// native-scroll fallback and exclusive FLIP ownership in a real browser.
import{createRequire}from'node:module';import{mkdirSync,writeFileSync}from'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const{chromium}=require('playwright-core'),{AxeBuilder}=require('@axe-core/playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const base=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,''),dir=process.env.V31_EVIDENCE||'/tmp/srnavalha-v31/final';mkdirSync(dir,{recursive:true});
const results=[],errors=[];const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});console.log(pass?'PASS':'FAIL',name,pass?'':JSON.stringify(detail))};
async function fresh(options={},fallback=false){const context=await browser.newContext({viewport:{width:1440,height:900},...options});await context.route('https://**/*',r=>r.abort());const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));if(fallback)await p.addInitScript(()=>{window.ViewTimeline=undefined;window.ScrollTimeline=undefined});return p}
const ready=p=>p.waitForFunction(()=>!document.querySelector('#sr-loader-stage')&&!document.querySelector('.hero.is-arriving'));
try{
 // Preserve and appreciate the gesture, while the invitation appears early.
 const intro=await fresh();await intro.addInitScript(()=>{
  window.__intro={};document.addEventListener('openingcutmidpoint',()=>{__intro.mid=performance.now()});document.addEventListener('openingend',()=>{__intro.end=performance.now();for(const a of document.querySelector('.hero').getAnimations({subtree:true}))if(a.id==='sr-text-lightcut')a.pause()});
 });await intro.goto(base,{waitUntil:'domcontentloaded'});await intro.waitForFunction(()=>document.querySelector('.hero.is-arriving'));
 const timeline=await intro.evaluate(()=>({durations:document.querySelector('.hero').getAnimations({subtree:true}).filter(a=>a.id.startsWith('sr-hero')||a.id==='sr-text-lightcut').map(a=>({id:a.id,duration:a.effect.getTiming().duration,delay:a.effect.getTiming().delay})),groups:document.querySelectorAll('.cm-cut-window').length}));
 check('Coreografia mais longa, com CTA sobreposto e seis grupos',timeline.groups===6&&timeline.durations.some(a=>a.id==='sr-hero-curtain'&&a.duration>=1000)&&timeline.durations.some(a=>a.id==='sr-hero-booking-arrival'&&a.delay<=800&&a.duration>=900),timeline);
 await intro.screenshot({path:`${dir}/opening-midpoint.png`});
 await intro.waitForFunction(()=>!document.querySelector('#sr-loader-stage'));
 await intro.evaluate(()=>{for(const a of document.querySelector('.hero').getAnimations({subtree:true}))if(a.id==='sr-text-lightcut')a.pause()});
 const liveType=await intro.locator('.cm-cut-window').count()>0;
 await intro.screenshot({path:`${dir}/type-${liveType?'midpoint':'settled'}.png`});
 await intro.evaluate(()=>{for(const a of document.querySelector('.hero').getAnimations({subtree:true}))if(a.id==='sr-text-lightcut')a.play()});
 await ready(intro);
 check('Final remove máscaras e mantém logo única',await intro.evaluate(()=>document.querySelectorAll('.hero-logo-transparent').length===1&&!document.querySelector('.snv2-logo-flight,.cm-cut-window')&&getComputedStyle(document.querySelector('h1')).opacity==='1'));
 await intro.locator('.hero-cta').hover();await intro.waitForTimeout(280);
 check('CTA responde na superfície própria e mantém link real',await intro.locator('.hero-cta').evaluate(n=>getComputedStyle(n.querySelector('.hero-cta__surface')).transform!=='none'&&n.getAttribute('href')==='agendar.html'));
 await intro.locator('.hero-cta').focus();check('CTA teclado tem foco visível',await intro.locator('.hero-cta').evaluate(n=>getComputedStyle(n).outlineStyle==='solid'));
 await intro.context().close();
 // The artwork must hand off on ONE paint, with matching bounds.
 const flip=await fresh();await flip.goto(base,{waitUntil:'domcontentloaded'});await flip.waitForSelector('.snv2-logo-flight');
 const handoff=await flip.evaluate(()=>{
  const flight=document.querySelector('.snv2-logo-flight'),target=document.querySelector('.hero .hero-logo-transparent'),plate=document.querySelector('#sr-loader-plate');
  const all=[...flight.getAnimations({subtree:true}),...target.getAnimations(),...plate.getAnimations()];all.forEach(a=>a.pause());
  const move=flight.getAnimations().find(a=>a.effect.getKeyframes().some(f=>f.transform)),end=move.effect.getComputedTiming().endTime;
  const matte=n=>n.querySelector('feColorMatrix').getAttribute('values').trim().split(/\s+/).map(Number);
  const canonical=JSON.stringify(matte(plate))===JSON.stringify(matte(target));
  const readings=[];
  for(const time of [end-2,end+2]){all.forEach(a=>a.currentTime=time);const a=flight.getBoundingClientRect(),b=target.getBoundingClientRect();readings.push({canonical,flight:+getComputedStyle(flight).opacity,target:+getComputedStyle(target).opacity,sameInk:getComputedStyle(flight.querySelector('svg')).filter===getComputedStyle(target).filter,error:Math.max(...['x','y','width','height'].map(k=>Math.abs(a[k]-b[k])))})}
  window.__finishRitual?.();return readings;
 });
 check('FLIP sem sobreposição de logos e com destino exato',handoff[0].flight===1&&handoff[0].target===0&&handoff[1].flight===0&&handoff[1].target===1&&handoff.every(r=>r.error<.15&&r.sameInk&&r.canonical),handoff);await flip.context().close();
 for(const width of [390,1440]){
  const p=await fresh({viewport:{width,height:900}});await p.goto(base,{waitUntil:'domcontentloaded'});await ready(p);
  for(const id of ['casa','servicos','equipe','trabalhos','produtos','avaliacoes','localizacao','contato']){
   const heading=p.locator('#'+id+' h2').first();const before=await heading.textContent();
   await heading.evaluate(n=>scrollTo({top:scrollY+n.getBoundingClientRect().top-innerHeight*.72,behavior:'instant'}));
   await p.waitForFunction(id=>document.querySelector('#'+id+' h2').querySelectorAll('.cm-letter').length>0,id);
   const live=await heading.evaluate(n=>({signature:n.dataset.cmSignature,letters:n.querySelectorAll('.cm-letter').length,accessible:[...n.querySelectorAll('.cm-source')].map(t=>t.textContent).join(''),visual:[...n.querySelectorAll('.cm-run>span:last-child')].every(t=>t.getAttribute('aria-hidden')==='true'),frames:[...n.querySelectorAll('.cm-letter')].slice(0,2).map(t=>t.getAnimations()[0]?.effect.getKeyframes()[0].transform)}));
   check(`${width} / ${id}: assinatura original por letras presente`,live.letters>10&&live.visual&&live.accessible.replace(/\s/g,'')===before.replace(/\s/g,'')&&live.frames.every(Boolean),live);
   await p.waitForTimeout(550);if(id==='localizacao')await p.screenshot({path:`${dir}/prado-midpoint-${width}.png`});
   await p.waitForFunction(id=>!document.querySelector('#'+id+' h2 .cm-run'),id);
   check(`${width} / ${id}: texto natural restaurado`,await heading.textContent()===before);
  }
  await p.context().close();
 }
 for(const fallback of [false,true]){
  const p=await fresh({},fallback);await p.goto(base,{waitUntil:'domcontentloaded'});await ready(p);
  check(`${fallback?'fallback':'nativo'}: molduras próprias nas seis áreas`,await p.evaluate(()=>['hero','room','portrait','print','scene','detail','facade'].every(type=>document.querySelector(`[data-depth=${type}]>.depth-plane`))));
  const photo=p.locator('[data-depth=room]');await photo.evaluate(n=>scrollTo({top:scrollY+n.getBoundingClientRect().top-innerHeight*.7,behavior:'instant'}));await p.waitForTimeout(1800);
  const sample=()=>photo.evaluate(n=>{const plane=n.querySelector('.depth-plane'),a=n.getBoundingClientRect(),b=plane.getBoundingClientRect();return {y:new DOMMatrix(getComputedStyle(plane).transform).m42,covered:b.top<=a.top+1&&b.bottom>=a.bottom-1,state:n.dataset.depthState,offset:scrollY,native:plane.getAnimations().some(a=>a.id==='sr-depth-room')}});
  const a=await sample();await p.evaluate(()=>scrollBy({top:150,behavior:'instant'}));await p.waitForTimeout(100);const b=await sample();await p.evaluate(position=>scrollTo({top:position,behavior:'instant'}),a.offset);await p.waitForTimeout(100);const c=await sample();
  check(`${fallback?'fallback':'nativo'}: profundidade reversível, sem lacunas`,Math.abs(a.y-b.y)>.3&&Math.abs(a.y-c.y)<.2&&a.covered&&b.covered&&c.covered&&a.native===!fallback,{a,b,c});
  await p.locator('#equipe').evaluate(n=>n.scrollIntoView({behavior:'instant'}));await p.waitForTimeout(1800);await p.locator('[data-person="1"]').click();await p.waitForTimeout(900);
  check(`${fallback?'fallback':'nativo'}: troca do profissional preserva o plano`,await p.locator('.portrait-depth>.depth-plane>.image-stage img').count()===1&&await p.locator('#person-name').textContent()==='Eduardo');
  await p.locator('#contato').evaluate(n=>n.scrollIntoView({behavior:'instant'}));await p.waitForTimeout(200);
  check(`${fallback?'fallback':'nativo'}: planos fora da tela suspensos`,await photo.evaluate(n=>n.dataset.depthState==='idle'&&n.querySelector('.depth-plane').getAnimations().length===0));
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.documentElement.classList.contains('motion-on'));
  check(`${fallback?'fallback':'nativo'}: movimento reduzido remove profundidade`,await p.evaluate(()=>document.querySelectorAll('[data-depth-state=active]').length===0&&[...document.querySelectorAll('.depth-plane')].every(n=>getComputedStyle(n).transform==='none')));
  await p.context().close();
 }
 const nav=await fresh();await nav.goto(base,{waitUntil:'domcontentloaded'});await ready(nav);await nav.locator('#casa').evaluate(n=>n.scrollIntoView({behavior:'instant'}));await nav.waitForTimeout(1800);
 check('Orientação editorial reflete a seção',await nav.locator('.chapter-compass').isVisible()&&await nav.locator('.chapter-compass__current span').textContent()==='A CASA');
 await nav.locator('.chapter-compass__next').focus();await nav.keyboard.press('Enter');await nav.waitForTimeout(1500);check('Próximo capítulo funciona pelo teclado',new URL(nav.url()).hash==='#servicos');
 const axe=await new AxeBuilder({page:nav}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check('Axe WCAG A/AA página completa',!axe.violations.length,axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));await nav.context().close();
 check('Nenhuma exceção JavaScript',!errors.length,errors);
}finally{writeFileSync(`${dir}/v31-results.json`,JSON.stringify({results,errors},null,2));await browser.close()}
if(results.some(r=>!r.pass))process.exitCode=1;
