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
 for(const width of [320,390,430,768,1024,1440]){
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
   queueMicrotask(()=>{if(animation.id==='sr-section-reveal')window.heroAudit.sections.push(this.className||this.tagName)});
   return animation;
  };
  document.addEventListener('openingend',e=>{
   window.heroAudit.events.push({time:performance.now(),completed:e.detail.completed,loader:!!document.querySelector('#sr-loader-stage')});
   window.heroAudit.rest=[...document.querySelectorAll('.hero-wordmark,.hero h1,.hero-facade,.hero-room,.hero-detail,.hero .button')].map(e=>({selector:e.className,rect:e.getBoundingClientRect().toJSON(),transform:getComputedStyle(e).transform}));
  });
 });
 await m.goto(base,{waitUntil:'domcontentloaded'});await m.waitForSelector('.snv2-cut-ready');
 check('Nenhuma queda durante o corte',await m.evaluate(()=>!document.getAnimations().some(a=>a.id==='sr-hero-drop')));
 await m.waitForFunction(()=>document.getAnimations().some(a=>a.id==='sr-hero-drop'));
 const physics=await m.evaluate(()=>{
  const drops=document.getAnimations().filter(a=>a.id==='sr-hero-drop');
  const audit=drops.map(a=>{
   a.pause();a.currentTime=a.effect.getTiming().delay;
   const f=a.effect.getKeyframes(),base=new DOMMatrix(f.at(-1).transform==='none'?undefined:f.at(-1).transform).m42;
   return {target:a.effect.target.className,delay:a.effect.getTiming().delay,duration:a.effect.getTiming().duration,y:f.map(k=>new DOMMatrix(k.transform==='none'?undefined:k.transform).m42-base)};
  });
  return {audit,events:window.heroAudit.events,loader:!!document.querySelector('#sr-loader-stage'),logo:document.querySelectorAll('.hero-logo-transparent').length};
 });
 check('Queda só depois da limpeza, com logo única',!physics.loader&&physics.logo===1&&physics.events.at(-1).completed&&physics.audit.length===12,physics);
 check('Todas as quedas têm dois rebotes decrescentes',physics.audit.every(a=>a.y[0]<0&&Math.abs(a.y[1])<.01&&a.y[2]<0&&Math.abs(a.y[3])<.01&&a.y[4]<0&&Math.abs(a.y[4])<Math.abs(a.y[2])&&Math.abs(a.y[5])<.01));
 check('Hierarquia escalonada de cilindros até CTA',physics.audit.map(a=>a.delay).every((n,i,a)=>i===0||n>=a[i-1]));
 await m.screenshot({path:`${dir}/drop-start.png`});
 await m.evaluate(()=>document.getAnimations().filter(a=>a.id==='sr-hero-drop').forEach(a=>{a.currentTime=a.effect.getTiming().delay+a.effect.getTiming().duration*.64}));
 await m.screenshot({path:`${dir}/drop-rebound.png`});
 const rotorBefore=await m.locator('.hero-pole__rotor').first().evaluate(e=>e.getAnimations()[0].currentTime);
 await m.evaluate(()=>document.getAnimations().filter(a=>a.id==='sr-hero-drop').forEach(a=>a.finish()));
 await m.waitForFunction(()=>!document.querySelector('.hero.is-arriving'));
 const final=await m.evaluate(()=>{
  const nodes=[...document.querySelectorAll('.hero-wordmark,.hero h1,.hero-facade,.hero-room,.hero-detail,.hero .button')];
  return nodes.map((e,i)=>{const r=e.getBoundingClientRect(),old=window.heroAudit.rest[i].rect;return Math.max(...['x','y','width','height'].map(k=>Math.abs(r[k]-old[k])))})
 });
 check('Geometria final idêntica ao hero revelado',final.every(n=>n<.1),final);
 // WAAPI currentTime advances only on a rendering tick: a synchronous check
 // immediately after finish() can read the exact same compositor frame.
 await m.waitForTimeout(95);
 check('Rotação interna não reinicia ao pousar',await m.locator('.hero-pole__rotor').first().evaluate(e=>e.getAnimations()[0].currentTime)>rotorBefore);
 await m.locator('#casa').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await m.waitForTimeout(120);
 check('Rotores pausam fora da viewport',await m.locator('.hero-pole__rotor').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationPlayState==='paused')));
 await m.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await m.waitForTimeout(100);
 check('Rotores retomam na viewport',await m.locator('.hero-pole__rotor').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationPlayState==='running')));
 const hidden=await m.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const paused=[...document.querySelectorAll('.hero-pole__rotor')].every(e=>getComputedStyle(e).animationPlayState==='paused');delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));return paused});
 check('Visibilidade simulada pausa os rotores',hidden);
 await m.reload({waitUntil:'domcontentloaded'});await m.waitForFunction(()=>document.getAnimations().some(a=>a.id==='sr-hero-drop'));
 await m.emulateMedia({reducedMotion:'reduce'});
 check('Preferência dinâmica termina quedas e rotores',await m.locator('.hero').evaluate(e=>e.getAnimations({subtree:true}).length===0));
 await m.emulateMedia({reducedMotion:'no-preference'});
 await m.setViewportSize({width:390,height:844});await m.reload({waitUntil:'domcontentloaded'});await m.waitForSelector('.snv2-run');await m.keyboard.press('Escape');await ready(m);
 check('Interrupção do loader não dispara queda',await m.evaluate(()=>!document.getAnimations().some(a=>a.id==='sr-hero-drop')));
 const menu=m.locator('.menu summary');await menu.click();check('Menu abre',await menu.getAttribute('aria-expanded')==='true');await m.keyboard.press('Escape');await m.waitForTimeout(330);check('Menu fecha e devolve foco',await menu.evaluate(e=>document.activeElement===e&&!e.parentElement.open));
 for(const [id,name] of [['casa','house'],['servicos','services'],['equipe','team'],['trabalhos','gallery'],['produtos','products'],['localizacao','location'],['contato','footer']]){
  await m.locator('#'+id).evaluate(e=>e.scrollIntoView({behavior:'instant'}));await m.waitForTimeout(850);check(`${name}: seção sem overflow`,await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await m.screenshot({path:`${dir}/${name}-390.png`});
 }
 check('Entradas de seções são executadas',await m.evaluate(()=>window.heroAudit.sections.length>=5));
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
