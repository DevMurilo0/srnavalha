import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core'),{AxeBuilder}=require('@axe-core/playwright');
const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const base=process.env.SITE_URL||'http://127.0.0.1:8047',dir='docs/experience-v6';mkdirSync(dir,{recursive:true});
const results=[],errors=[];const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});console.log(pass?'PASS':'FAIL',name)};
async function page(options={}){const c=await b.newContext({viewport:{width:1440,height:900},...options});await c.route('https://**/*',r=>r.abort());const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));return p}
const ready=p=>p.waitForFunction(()=>!document.querySelector('#sr-loader-stage'));
try{
 const p=await page({reducedMotion:'reduce'});
 for(const width of [320,360,390,430,768,1024,1440]){
  await p.setViewportSize({width,height:900});await p.goto(base,{waitUntil:'domcontentloaded'});await ready(p);await p.evaluate(()=>document.fonts.ready);
  const fit=await p.evaluate(()=>{
   const poles=[...document.querySelectorAll('.hero-pole')].map(e=>e.getBoundingClientRect());
   const obstacles=[...document.querySelectorAll('.hero-wordmark,.hero h1,.hero-intro,.hero figure,.hero .button')].map(e=>e.getBoundingClientRect());
   return {count:poles.length,overflow:document.documentElement.scrollWidth-innerWidth,
    fits:poles.every(r=>r.left>=0&&r.right<=innerWidth&&obstacles.every(o=>!o.width||!o.height||r.right<=o.left||r.left>=o.right||r.bottom<=o.top||r.top>=o.bottom)),
    animations:document.querySelector('.hero').getAnimations({subtree:true}).length};
  });
  check(`${width}: dois cilindros sem colisão e sem overflow`,fit.count===2&&fit.fits&&fit.overflow===0,fit);
  check(`${width}: movimento reduzido estático`,fit.animations===0);
  await p.screenshot({path:`${dir}/hero-${width}.png`});
 }
 await p.close();
 const m=await page();
 await m.addInitScript(()=>{
  window.heroAudit={events:[],drops:[],sections:[]};
  const original=Element.prototype.animate;
  Element.prototype.animate=function(frames,options){
   if(this.closest('.hero')&&!this.closest('#sr-loader-stage'))window.heroAudit.drops.push({target:this.className,loader:!!document.querySelector('#sr-loader-stage'),time:performance.now(),frames});
   const animation=original.call(this,frames,options);
   if(this.closest('main,footer')&&!this.closest('.hero') &&
     this.classList.contains('sr-scroll-pending'))
     window.heroAudit.sections.push(this.className||this.tagName);
   queueMicrotask(()=>{if(animation.id==='sr-scroll-text'||animation.id==='sr-scroll-photo')window.heroAudit.sections.push(this.className||this.tagName)});
   return animation;
  };
  document.addEventListener('openingcutmidpoint',e=>{
   const carrier=document.querySelector('.snv2-cut-flight');
   const tip=carrier?new DOMMatrix(getComputedStyle(carrier).transform).m42:null;
   window.heroAudit.midpoint={time:performance.now(),loader:!!document.querySelector('#sr-loader-stage'),
     tip,height:innerHeight,progress:e.detail.progress};
   // Capture the final static geometry BEFORE the hero's WAAPI effects.
   window.heroAudit.rest=[...document.querySelectorAll('.hero-wordmark,.hero h1,.hero-facade,.hero-room,.hero-detail,.hero .button')].map(e=>({selector:e.className,rect:e.getBoundingClientRect().toJSON(),transform:getComputedStyle(e).transform}));
  });
  document.addEventListener('openingend',e=>{
   window.heroAudit.events.push({time:performance.now(),completed:e.detail.completed,loader:!!document.querySelector('#sr-loader-stage')});
  });
 });
 await m.goto(base,{waitUntil:'domcontentloaded'});
 // Regression: the hero was visible for one frame before delayed WAAPI drops.
 // Its items must already be parked in the head, before the cut begins.
 await m.waitForSelector('.snv2-run');
 const armed=await m.evaluate(()=>({
  queued:document.documentElement.classList.contains('sr-hero-queued'),
  h1:getComputedStyle(document.querySelector('.hero h1')).opacity,
  facade:getComputedStyle(document.querySelector('.hero-facade')).opacity,
  room:getComputedStyle(document.querySelector('.hero-room')).opacity,
  cta:getComputedStyle(document.querySelector('.hero-invitation > .button')).opacity,
  logo:getComputedStyle(document.querySelector('.hero-logo-transparent')).visibility,
  facadeClip:getComputedStyle(document.querySelector('.hero-facade')).clipPath,
  roomClip:getComputedStyle(document.querySelector('.hero-room')).clipPath
 }));
 check('Antes do corte, hero oculto sem esconder logo FLIP',
  armed.queued&&armed.h1==='0'&&armed.facade==='0'&&
  armed.room==='0'&&armed.cta==='0'&&armed.logo==='visible'&&
  armed.facadeClip.includes('100%')&&armed.roomClip.includes('100%'),armed);
 await m.waitForSelector('.snv2-cut-ready');
 check('Antes do meio da tesoura ainda não há revelação',await m.evaluate(()=>
  !document.getAnimations().some(a=>a.id==='sr-hero-reveal')));
 await m.waitForFunction(()=>window.heroAudit.midpoint);
 const midpoint=await m.evaluate(()=>window.heroAudit.midpoint);
 check('Tesoura passa pelo meio antes da aparição do hero',
  midpoint.loader&&midpoint.progress===.5&&
  Math.abs(midpoint.tip-midpoint.height/2)<midpoint.height*.12&&
  await m.evaluate(()=>!document.getAnimations().some(a=>a.id==='sr-hero-reveal')),midpoint);
 await ready(m);
 await m.waitForFunction(()=>document.getAnimations().some(a=>a.id==='sr-hero-reveal'));
 // The loader's layout rules are gone now. Capture the actual final-page
 // geometry instead of comparing it with a midpoint under different styles.
 await m.evaluate(()=>{
   window.heroAudit.rest=[...document.querySelectorAll(
     '.hero-wordmark,.hero h1,.hero-facade,.hero-room,.hero-detail,.hero .button'
   )].map(e=>({selector:e.className,rect:e.getBoundingClientRect().toJSON(),
     transform:getComputedStyle(e).transform}));
 });
 check('Revelação começa com loader removido e conteúdo ainda oculto',
  await m.evaluate(()=>!document.querySelector('#sr-loader-stage')&&
    document.documentElement.classList.contains('sr-hero-queued')));
 // The first delayed frames must not paint the original resting photographs.
 const firstFrame=await m.evaluate(()=>{
  const photo=document.querySelector('.hero-room');
  const anim=photo.getAnimations().find(a=>a.id==='sr-hero-reveal');
  if(!anim)return {hasAnimation:false};
  anim.pause();anim.currentTime=0;
  return {hasAnimation:true,queued:document.documentElement.classList.contains('sr-hero-queued'),
    opacity:getComputedStyle(photo).opacity,clip:getComputedStyle(photo).clipPath,
    fill:anim.effect.getTiming().fill};
 });
 check('Antes da revelação, foto não aparece antecipadamente',
  firstFrame.hasAnimation&&firstFrame.queued&&firstFrame.opacity==='0'&&
  firstFrame.clip.includes('100%')&&firstFrame.fill==='both',firstFrame);
 const reveal=await m.evaluate(()=>{
  const effects=document.getAnimations().filter(a=>a.id==='sr-hero-reveal');
  const audit=effects.map(a=>{
   a.pause();a.currentTime=a.effect.getTiming().delay;
   const frames=a.effect.getKeyframes();
   return {target:a.effect.target.className,delay:a.effect.getTiming().delay,
     duration:a.effect.getTiming().duration,
     transforms:frames.filter(frame=>'transform' in frame).length,
     photo:frames.some(frame=>'clipPath' in frame),
     lifts:frames.some(frame=>'translate' in frame),
     firstTranslate:frames[0].translate,lastTranslate:frames.at(-1).translate,
     firstOpacity:frames[0].opacity,lastOpacity:frames.at(-1).opacity,
     firstClip:frames[0].clipPath,lastClip:frames.at(-1).clipPath};
  });
  return {audit,midpoint:window.heroAudit.midpoint,
    loader:!!document.querySelector('#sr-loader-stage'),
    logo:document.querySelectorAll('.hero .hero-logo-transparent').length,
    flightLogo:document.querySelectorAll('#sr-loader-stage .hero-logo-transparent').length};
 });
 check('Aparição visível após o corte, sem duplicar a logo oficial',
   !reveal.loader&&reveal.midpoint?.loader&&
   reveal.logo===1&&reveal.flightLogo===0&&reveal.audit.length===12,reveal);
 check('Zoom editorial independente das fotos, sem mexer nas figuras',
   await m.evaluate(()=>document.getAnimations().filter(a=>
     a.id==='sr-hero-photo-depth').length===3));
 check('Nenhum elemento muda de posição, escala ou rotação na revelação',
   reveal.audit.every(a=>a.transforms===0&&
     Number(a.firstOpacity)===0&&Number(a.lastOpacity)===1));
 check('Fotografias surgem de cima para baixo em suas posições originais',
   reveal.audit.filter(a=>a.photo).length===3&&
   reveal.audit.filter(a=>a.photo).every(a=>
     a.firstClip==='inset(0px 0px 100%)'&&
     a.lastClip==='inset(0px 0px 0%)'&&!a.lifts));
 check('Textos e botões sobem de forma marcante e retornam ao repouso',
   reveal.audit.filter(a=>!a.photo).length===9&&
   reveal.audit.filter(a=>!a.photo).every(a=>
     a.lifts&&a.firstTranslate!==a.lastTranslate&&
     ['0px','0px 0px'].includes(a.lastTranslate))&&
   reveal.audit.some(a=>a.firstTranslate==='0px 72px'));
 check('Fotos reveladas com duração perceptível depois do corte',
   reveal.audit.filter(a=>a.photo).every(a=>a.duration>=900&&a.delay>=300));
 check('Hierarquia escalonada do topo até CTA',reveal.audit.map(a=>a.delay).every((n,i,a)=>i===0||n>=a[i-1]));
 await m.screenshot({path:`${dir}/drop-start.png`});
 await m.evaluate(()=>document.getAnimations().filter(a=>a.id==='sr-hero-reveal').forEach(a=>{a.currentTime=a.effect.getTiming().delay+a.effect.getTiming().duration*.64}));
 await m.screenshot({path:`${dir}/reveal-midpoint.png`});
 // Parent figure clip-path and opacity cannot change bounding boxes.
 const inProgressGeometry=await m.evaluate(()=>{
  const nodes=[...document.querySelectorAll('.hero-facade,.hero-room,.hero-detail')];
  const rest=window.heroAudit.rest.slice(2,5);
  return nodes.map((node,i)=>{
   const box=node.getBoundingClientRect();const old=rest[i]?.rect;
   return old?Math.max(...['x','y','width','height'].map(k=>Math.abs(box[k]-old[k]))):Infinity;
  });
 });
 check('Fotografias nunca saem do lugar durante a revelação',
  inProgressGeometry.every(delta=>delta<.2),inProgressGeometry);
 const rotorBefore=await m.locator('.hero-pole__rotor').first().evaluate(e=>e.getAnimations()[0].currentTime);
 await m.evaluate(()=>document.getAnimations().filter(a=>
   a.id==='sr-hero-reveal'||a.id==='sr-hero-photo-depth').forEach(a=>a.finish()));
 await m.waitForFunction(()=>!document.querySelector('.hero.is-arriving'));
 await ready(m);
 check('The Perfect Cut termina normalmente antes da aparição do hero',
  await m.evaluate(()=>window.heroAudit.events.at(-1)?.completed===true));
 // Before the loader is removed, its root layout may differ slightly
 // from the final page (e.g. font readiness, viewport calculations). Do
 // not compare a mid-cut baseline with a finished-page rect. Verify that
 // removing the WAAPI fills causes NO final snap on a settled page.
 const final=await m.evaluate(async()=>{
  const nodes=[...document.querySelectorAll('.hero-wordmark,.hero h1,.hero-facade,.hero-room,.hero-detail,.hero .button')];
  const measure=()=>nodes.map(e=>e.getBoundingClientRect().toJSON());
  const before=measure();
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const after=measure();
  return before.map((r,i)=>Math.max(...['x','y','width','height'].map(k=>Math.abs(r[k]-after[i][k]))));
 });
 check('Geometria permanece estável após a revelação',final.every(n=>n<.1),final);
 const settledOpacity=await m.evaluate(()=>({
  queued:document.documentElement.classList.contains('sr-hero-queued'),
  photos:[...document.querySelectorAll('.hero-facade,.hero-room')].map(x=>getComputedStyle(x).opacity),
  heading:getComputedStyle(document.querySelector('.hero h1')).opacity,
  cta:getComputedStyle(document.querySelector('.hero-invitation > .button')).opacity,
  remainingDrops:document.getAnimations().filter(a=>a.id==='sr-hero-reveal').length,
  photoClip:getComputedStyle(document.querySelector('.hero-room')).clipPath
 }));
 check('Depois da revelação, itens visíveis e sem fills presos',
  !settledOpacity.queued&&settledOpacity.photos.every(x=>x==='1')&&
  settledOpacity.heading==='1'&&settledOpacity.cta==='1'&&
  settledOpacity.remainingDrops===0&&settledOpacity.photoClip==='none',settledOpacity);
 // WAAPI currentTime advances only on a rendering tick: a synchronous check
 // immediately after finish() can read the exact same compositor frame.
 await m.waitForTimeout(95);
 check('Rotação interna não reinicia após a revelação',await m.locator('.hero-pole__rotor').first().evaluate(e=>e.getAnimations()[0].currentTime)>rotorBefore);
 await m.locator('#casa').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await m.waitForTimeout(120);
 check('Rotores pausam fora da viewport',await m.locator('.hero-pole__rotor').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationPlayState==='paused')));
 await m.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await m.waitForTimeout(100);
 check('Rotores retomam na viewport',await m.locator('.hero-pole__rotor').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationPlayState==='running')));
 const hidden=await m.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const paused=[...document.querySelectorAll('.hero-pole__rotor')].every(e=>getComputedStyle(e).animationPlayState==='paused');delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));return paused});
 check('Visibilidade simulada pausa os rotores',hidden);
 await m.reload({waitUntil:'domcontentloaded'});await m.waitForFunction(()=>document.getAnimations().some(a=>a.id==='sr-hero-reveal'));
 await m.emulateMedia({reducedMotion:'reduce'});
 check('Preferência dinâmica termina quedas e rotores',await m.locator('.hero').evaluate(e=>e.getAnimations({subtree:true}).length===0));
 await m.emulateMedia({reducedMotion:'no-preference'});
 await m.setViewportSize({width:390,height:844});await m.reload({waitUntil:'domcontentloaded'});await m.waitForSelector('.snv2-run');await m.keyboard.press('Escape');await ready(m);
 check('Interrupção do loader não dispara queda',await m.evaluate(()=>!document.getAnimations().some(a=>a.id==='sr-hero-reveal')));
 const menu=m.locator('.menu summary');await menu.click();check('Menu abre',await menu.getAttribute('aria-expanded')==='true');await m.keyboard.press('Escape');await m.waitForTimeout(330);check('Menu fecha e devolve foco',await menu.evaluate(e=>document.activeElement===e&&!e.parentElement.open));
 for(const [id,name] of [['casa','house'],['servicos','services'],['equipe','team'],['trabalhos','gallery'],['produtos','products'],['localizacao','location'],['contato','footer']]){
  await m.locator('#'+id).evaluate(e=>e.scrollIntoView({behavior:'instant'}));await m.waitForTimeout(850);check(`${name}: seção sem overflow`,await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await m.screenshot({path:`${dir}/${name}-390.png`});
 }
 check('Entradas no scroll executadas para imagens e textos',
  await m.evaluate(()=>window.heroAudit.sections.length>=5));
 const scrollHealth=await m.evaluate(()=>{
   const all=[...document.querySelectorAll('.sr-scroll-pending')];
   return {pending:all.length,aboveViewport:all.filter(x=>x.getBoundingClientRect().top<innerHeight*.45).length,
     mediaCount:document.querySelectorAll('.sr-scroll-done.sr-scroll-image').length,
     dark:getComputedStyle(document.querySelector('.team')).backgroundImage,
     dividers:[...document.querySelectorAll('.sr-chapter')].every(x=>
       getComputedStyle(x).height==='50px'||parseFloat(getComputedStyle(x).height)<=50)};
 });
 check('Scroll não deixa textos ocultos acima da tela',scrollHealth.aboveViewport===0,scrollHealth);
 check('Divisores antigos substituídos por transições finas',scrollHealth.dividers,scrollHealth);
 await m.locator('#catalogo').evaluate(e=>e.scrollIntoView({behavior:'instant'}));
 await m.getByRole('button',{name:'Tratamentos',exact:true}).click();
 check('Filtro mantém categoria e foco',await m.locator('.service-entry:visible').evaluateAll(es=>es.length>0&&es.every(e=>e.dataset.category==='Tratamentos')));
 await m.locator('#product-category').selectOption('Barba');
 const products=await m.locator('.product-option:visible').count();
 check('Contagem acompanha filtro de produtos',(await m.locator('#product-count').textContent()).startsWith(products+' produtos · Barba'));
 await m.locator('[data-person="3"]').click();await m.waitForFunction(()=>document.querySelector('#person-name').textContent==='Rafael');check('Equipe preserva seleção',true);
 await m.locator('[data-album-mode="wall"]').click();await m.locator('.gallery-shot').first().click();check('Galeria abre diálogo',await m.locator('dialog').evaluate(e=>e.open));await m.keyboard.press('Escape');
 await m.locator('.visit-address-copy').evaluate(e=>e.scrollIntoView({behavior:'instant'}));
 await m.context().grantPermissions(['clipboard-read','clipboard-write']);await m.locator('.visit-address-copy').click();
 await m.waitForFunction(()=>document.querySelector('.visit-copy-status').textContent==='Endereço copiado.');
 check('Copiar endereço escreve conteúdo real',await m.evaluate(async()=> (await navigator.clipboard.readText()).includes('349')));
 await m.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('blocked'))}})});await m.locator('.visit-address-copy').click();
 await m.waitForFunction(()=>document.querySelector('.visit-copy-status').textContent.includes('selecionado'));
 check('Clipboard bloqueado oferece seleção do endereço',await m.evaluate(()=>getSelection().toString().includes('349')));
 const axe=await new AxeBuilder({page:m}).include('.hero').include('.visit-address-copy').include('#product-count').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check('Axe nas superfícies alteradas',!axe.violations.length,axe.violations);
 await m.close();
 for(const mode of ['no-js','opening-failure','drop-failure']){
  const f=await page({javaScriptEnabled:mode!=='no-js'});if(mode==='opening-failure')await f.route('**/js/ritual/opening.js',r=>r.abort());
  if(mode==='drop-failure')await f.addInitScript(()=>{const original=Element.prototype.animate;Element.prototype.animate=function(...args){if(this.matches('.hero h1'))throw new Error('animation unavailable');return original.apply(this,args)}});
  await f.goto(base,{waitUntil:'domcontentloaded'});await f.waitForFunction(()=>!document.documentElement.classList.contains('sr-loader-boot')&&!document.querySelector('.hero.is-arriving'));
  check(`${mode}: conteúdo e CTA visíveis`,await f.locator('.hero .button').isVisible()&&await f.locator('.hero h1').evaluate(e=>getComputedStyle(e).opacity==='1'));await f.close();
 }
 check('Sem exceções JavaScript',!errors.length,errors);
}catch(e){check('Execução',false,e.stack)}finally{writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));await b.close()}
if(results.some(r=>!r.pass))process.exitCode=1;
