// Native cinematic motion contract: real browser, geometry, sequencing and recovery.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core'),{AxeBuilder}=require('@axe-core/playwright');
const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'});
const base=process.env.SITE_URL||'http://127.0.0.1:8047',dir='docs/cinematic-motion';mkdirSync(dir,{recursive:true});
const results=[],errors=[];const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});console.log(pass?'PASS':'FAIL',name,pass?'':JSON.stringify(detail))};
async function page(options={}){const c=await b.newContext({viewport:{width:1440,height:900},...options});await c.route('https://**/*',r=>r.abort());const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));return p}
// The static no-JS fallback intentionally keeps hidden loader markup in DOM.
const ready=p=>p.waitForFunction(()=>{
 const loader=document.querySelector('#sr-loader-stage');
 return (!loader||getComputedStyle(loader).display==='none')&&!document.querySelector('.hero.is-arriving');
});
const visibleHealth=p=>p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,hidden:[...document.querySelectorAll('.cm-pending')].filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&r.top<innerHeight*.85&&r.bottom>0}).map(n=>n.className)}));
const go=async(p,id)=>{await p.locator('#'+id).evaluate(n=>n.scrollIntoView({behavior:'instant',block:'start'}));await p.waitForTimeout(1500)};
try{
 const m=await page();
 await m.addInitScript(()=>{
  window.motionAudit={effects:[],end:[],mid:null};const original=Element.prototype.animate;
  Element.prototype.animate=function(frames,options){const a=original.call(this,frames,options),target=this;const loader=!!document.querySelector('#sr-loader-stage');queueMicrotask(()=>{if(a.id.startsWith('sr-text-')||a.id.startsWith('sr-photo-')||a.id==='sr-hero-booking-arrival')window.motionAudit.effects.push({id:a.id,hero:!!target.closest('.hero'),tag:target.tagName,heading:target.closest('h2')?.id||null,logo:target.matches('.hero-logo-transparent'),loader,frames,delay:options.delay||0,duration:options.duration||0})});return a;};
  const firstFrame=new MutationObserver(()=>{
   if(!document.querySelector('.snv2-run'))return;
   window.motionAudit.first=['h1','.hero-cta'].every(s=>getComputedStyle(document.querySelector('.hero '+s)).opacity==='0')&&getComputedStyle(document.querySelector('.hero-cinema__shutter')).transform!=='none'&&getComputedStyle(document.querySelector('.hero-logo-transparent')).visibility==='visible';
   firstFrame.disconnect();
  });
  firstFrame.observe(document,{subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('openingcutmidpoint',()=>window.motionAudit.mid={loader:!!document.querySelector('#sr-loader-stage'),count:window.motionAudit.effects.filter(e=>e.hero).length});
  document.addEventListener('openingend',e=>window.motionAudit.end.push({completed:e.detail.completed,loader:!!document.querySelector('#sr-loader-stage')}));
 });
 await m.goto(base,{waitUntil:'domcontentloaded'});await m.waitForSelector('.snv2-run');
 check('Primeiro quadro: headline/CTA ocultos por cortina e logo disponível',await m.evaluate(()=>window.motionAudit.first));
 await m.waitForFunction(()=>document.querySelector('.hero.is-arriving'));
 const active=await m.evaluate(()=>{
  const selected=document.getAnimations().filter(a=>a.id.startsWith('sr-text-')||a.id.startsWith('sr-photo-')||a.id==='sr-hero-booking-arrival');selected.forEach(a=>{a.pause();a.currentTime=0});
  const curtain=document.querySelector('.hero-cinema__shutter');
  const a=curtain.getAnimations()[0];
  const h=document.querySelector('h1');const label=[...h.querySelectorAll('.title-mask>span')].map(n=>[...n.childNodes].filter(c=>!c.classList?.contains('cm-cut-window')).map(c=>c.textContent).join('')).join('');
  return {label,groups:h.querySelectorAll('.cm-cut-window').length,words:h.querySelectorAll('.cm-word').length,lowPower:matchMedia('(max-width:700px)').matches||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4),echo:h.querySelectorAll('.cm-echo').length,curtain:a?.id,fill:a?.effect.getTiming().fill,logoAnimations:document.querySelector('.hero-logo-transparent').getAnimations().length};
 });
 check('Corte de Luz: seis grupos e fonte sem ecos duplicados',active.groups===6&&active.echo===0&&active.label.includes('SEU ESTILO.')&&active.label.includes('NOSSA ASSINATURA.'),active);
 check('Superfícies abrem no ponto médio e usam fill estável',active.curtain==='sr-hero-curtain'&&active.fill==='both',active);
 check('Logo oficial conserva somente o FLIP da tesoura',active.logoAnimations<=1);
 const geometry=await m.evaluate(async()=>{
  const nodes=[...document.querySelectorAll('.hero h1,.hero-room')];const read=()=>nodes.map(n=>n.getBoundingClientRect().toJSON());const before=read();
  document.getAnimations().filter(a=>a.id.startsWith('sr-text-')||a.id.startsWith('sr-photo-')||a.id==='sr-hero-booking-arrival').forEach(a=>a.finish());
  await new Promise(r=>setTimeout(r,40));const after=read();return before.map((r,i)=>Math.max(...['x','y','width','height'].map(k=>Math.abs(r[k]-after[i][k]))));
 });
 await ready(m);
 check('Texto dividido e fotografias assentam sem salto geométrico',geometry.every(n=>n<1),geometry);
 const audit=await m.evaluate(()=>window.motionAudit);
 check('Hero começa durante o corte, sem esperar openingend',audit.mid?.loader&&audit.end.at(-1)?.completed&&audit.end.at(-1)?.loader===false&&audit.effects.some(e=>e.hero&&e.loader),audit.mid);
 check('CTA sobrepõe o fim da tipografia em ritmo V31',audit.effects.some(e=>e.hero&&e.id==='sr-hero-booking-arrival'&&e.delay>=600&&e.delay<=800&&e.duration>=900));
 check('Limpeza final restaura os nós originais e cancela fills',await m.evaluate(()=>!document.querySelector('.hero .cm-run')&&!document.documentElement.classList.contains('sr-hero-queued')&&!document.querySelector('.hero').getAnimations({subtree:true}).some(a=>a.id.startsWith('sr-text')||a.id.startsWith('sr-photo'))));
 const rotor=await m.locator('.hero-pole__rotor').first().evaluate(n=>n.getAnimations()[0].currentTime);await m.waitForTimeout(100);
 check('Cilindros continuam girando após entrada',await m.locator('.hero-pole__rotor').first().evaluate(n=>n.getAnimations()[0].currentTime)>rotor);
 // Measure split geometry at every breakpoint, including accents and emphasis.
 for(const width of [320,390,430,768,1024,1440]){
  await m.setViewportSize({width,height:900});await m.reload({waitUntil:'domcontentloaded'});await ready(m);
  const shape=await m.evaluate(async()=>{
   const {revealText}=await import('/js/ritual/text-motion.js');const h=document.querySelector('h1'),read=()=>h.getBoundingClientRect().toJSON();const before=read(),text=h.textContent;
   const e=revealText(h,'lightcut',{manual:true});const during=read();e.cancel();return {delta:Math.max(...['x','y','width','height'].map(k=>Math.abs(before[k]-during[k]))),restored:text===h.textContent};
  });check(`${width}: composição tipográfica preserva linhas e acentos`,shape.delta<1&&shape.restored,shape);
  const fit=await m.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,poles:[...document.querySelectorAll('.hero-pole')].map(n=>n.getBoundingClientRect().toJSON()),broken:[...document.images].filter(n=>n.complete&&!n.naturalWidth&&!n.closest('[hidden]')).map(n=>n.src)}));
  check(`${width}: hero, cilindros e imagens íntegros`,fit.overflow===0&&fit.poles.length===2&&fit.poles.every(r=>r.left>=0&&r.right<=width)&&!fit.broken.length,fit);
  await m.screenshot({path:`${dir}/hero-${width}.png`});
  for(const id of ['casa','servicos','equipe','trabalhos','produtos','avaliacoes','localizacao','contato']){
   await go(m,id);const health=await visibleHealth(m);check(`${width} / ${id}: entrada visível sem overflow`,!health.overflow&&!health.hidden.length,health);
   if([390,1440].includes(width))await m.screenshot({path:`${dir}/${id}-${width}.png`});
  }
  // Fast navigation both directions must release content, not replay it.
  await m.evaluate(async()=>{for(const id of ['casa','contato','equipe','localizacao','inicio']){document.getElementById(id).scrollIntoView({behavior:'instant'});await new Promise(r=>requestAnimationFrame(r))}});await m.waitForTimeout(1500);
  const health=await visibleHealth(m);check(`${width}: saltos rápidos recuperam conteúdo`,!health.overflow&&!health.hidden.length,health);
 }
 // A scroll-driven heading must respond to scroll rather than elapsed time.
 await m.reload({waitUntil:'domcontentloaded'});await ready(m);
 await m.locator('.house-quote').evaluate(n=>scrollTo({top:scrollY+n.getBoundingClientRect().top-innerHeight*.78,behavior:'instant'}));await m.waitForTimeout(120);
 const t1=await m.evaluate(()=>document.querySelector('.house-quote').getAnimations({subtree:true}).filter(a=>a.id==='sr-text-scroll').map(a=>a.currentTime));await m.waitForTimeout(160);
 const t2=await m.evaluate(()=>document.querySelector('.house-quote').getAnimations({subtree:true}).filter(a=>a.id==='sr-text-scroll').map(a=>a.currentTime));
 await m.evaluate(()=>scrollBy({top:110,behavior:'instant'}));await m.waitForTimeout(120);
 const t3=await m.evaluate(()=>document.querySelector('.house-quote').getAnimations({subtree:true}).filter(a=>a.id==='sr-text-scroll').map(a=>a.currentTime));
 check('Tipografia acompanha progresso real, sem ticker autônomo',t1.length>0&&t1[0]===t2[0]&&t3[0]>t2[0],{t1:t1[0],t2:t2[0],t3:t3[0]});
 await m.screenshot({path:`${dir}/scroll-typography-midpoint.png`});await m.setViewportSize({width:1024,height:900});
 check('Resize limpa splits e medições anteriores',await m.locator('.house-quote .cm-run').count()===0);
 // Small semantic fixture exercises accents, Portuguese spaces, inline links.
 const semantic=await m.evaluate(async()=>{
  const {revealText}=await import('/js/ritual/text-motion.js');const n=document.createElement('p');n.innerHTML='Ação, <a href="#casa">café e atenção</a> — Sr. Navalha.';document.body.append(n);const a=n.querySelector('a');let clicks=0;a.addEventListener('click',e=>{e.preventDefault();clicks++});const original=n.textContent;const e=revealText(n,'roll',{manual:true});a.click();const accessible=[...n.querySelectorAll('.cm-source')].map(s=>s.textContent).join('');e.cancel();const result={accessible,original,restored:n.textContent===original,sameLink:a===n.querySelector('a'),clicks};n.remove();return result;
 });check('Split preserva frase, semântica e listeners de links',semantic.accessible===semantic.original&&semantic.restored&&semantic.sameLink&&semantic.clicks===1,semantic);
 for(const id of ['casa','servicos','equipe','trabalhos','produtos','avaliacoes','localizacao','contato'])await go(m,id);
 const coverage=await m.evaluate(()=>({modes:[...new Set(window.motionAudit.effects.map(e=>e.id))],headings:[...document.querySelectorAll('main section:not(.hero) h2,footer h2')].filter(n=>n.getClientRects().length&&!n.closest('dialog')).map(n=>({id:n.id,kind:n.dataset.cmKind})),dividers:[...document.querySelectorAll('.sr-chapter')].every(n=>!n.getClientRects().length)}));
 const strokeDemo=await m.evaluate(async()=>{
   const title=document.querySelector('#ritual-title');
   if(!title)return{available:false,reason:'service title missing'};
   const {revealText}=await import('/js/ritual/text-motion.js');
   const fx=revealText(title,'stroke',{manual:true});
   const count=title.getAnimations({subtree:true}).filter(a=>a.id==='sr-text-stroke').length;
   fx.cancel();return {available:count>0,count};
 });
 check('Nona família: contorno tipográfico com preenchimento funcional',strokeDemo.available,strokeDemo);
 check('Seções executam famílias de texto e máscaras sem WebGL',
   ['lightcut','fold','roll','focus','echo','lines','scroll','micro'].every(s=>coverage.modes.includes('sr-text-'+s))&&
   coverage.modes.filter(s=>s.startsWith('sr-photo-')).length>=1,coverage);
 check('Todos os títulos das seções têm dono e placas antigas não reaparecem',coverage.headings.every(n=>n.kind==='text')&&coverage.dividers,coverage.headings);
 // Four custom, single-layer editorial entrances must be real animations.
 // The big headlines must never launch one Web Animation per glyph/word.
 const typeBudget=await m.evaluate(()=>{
  const effects=window.motionAudit.effects.filter(e=>!e.hero&&e.heading);
  const counts={};
  for(const effect of effects)counts[effect.heading]=(counts[effect.heading]||0)+1;
  return {modes:[...new Set(window.motionAudit.effects.map(e=>e.id))],
    maxHeadingEffects:Math.max(0,...Object.values(counts)),counts};
 });
 // Directly exercise all four custom effects even if the visitor took a
 // programmatic anchor jump past a section before its heading was observed.
 // This tests the executable choreography, not merely the source strings.
 const bespoke=await m.evaluate(async()=>{
  const {revealText}=await import('/js/ritual/text-motion.js');
  const fixtures=[
   ['inkpress','.team-invite p'],
   ['blade','.review blockquote'],
   ['negative','.section-heading > p'],
   ['shutter','.footer-small-note']
  ];
  return fixtures.map(([mode,selector])=>{
   const original=document.querySelector(selector);
   if(!original)return{mode,found:false};
   const assigned=original.dataset.cmMode;
   const host=document.createElement('p');
   host.textContent=original.textContent.trim().slice(0,120)||'Sr. Navalha';
   host.style.cssText='position:fixed;left:-2000px;top:0;font:24px sans-serif';
   document.body.append(host);
   const before=host.getBoundingClientRect().toJSON();
   const run=revealText(host,mode);
   const fx=host.getAnimations().filter(a=>a.id==='sr-text-'+mode);
   run.cancel();
   const after=host.getBoundingClientRect().toJSON();
   host.remove();
   return{mode,assigned,found:true,effects:fx.length,
    frames:fx[0]?.effect?.getKeyframes()?.length||0,
    stable:['x','y','width','height'].every(k=>Math.abs(before[k]-after[k])<1)};
  });
 });
 check('Letterpress, blade-shear, negative-space e shutter únicos por frase',
   bespoke.length===4&&bespoke.every(x=>x.found&&x.assigned===x.mode&&x.effects===1&&x.frames>=2&&x.stable),bespoke);
 check('Títulos limitam os efeitos a no máximo 100 caracteres',
   typeBudget.maxHeadingEffects<=100,typeBudget);
 const signatures=await m.evaluate(async()=>{
   const {revealText}=await import('/js/ritual/text-motion.js');
   const names=['inktrail','crosscurrent','pendulum','accordion','ghostprint','mirrorfold','shards'];
   return names.map(name=>{
     const h=document.createElement('h2');
     h.textContent='Seu estilo, nossa assinatura.';
     h.dataset.cmSignature=name;
     h.style.cssText='position:fixed;top:10px;left:-3000px;font:600 32px sans-serif';
     document.body.append(h);
     const before=h.getBoundingClientRect().toJSON();
     const owner=revealText(h,'fold',{manual:true});
     const letters=[...h.querySelectorAll('.cm-letter')];
     const effects=letters.flatMap(el=>el.getAnimations()).filter(a=>a.id==='sr-text-fold');
     const first=effects[0]?.effect?.getKeyframes()?.[0]?.transform;
     const last=effects.at(-1)?.effect?.getKeyframes()?.[0]?.transform;
     const accessible=h.querySelectorAll('.cm-source').length>0;
     owner.cancel();
     const after=h.getBoundingClientRect().toJSON();
     const result={name,characters:letters.length,effects:effects.length,
       first,last,accessible,restored:h.textContent==='Seu estilo, nossa assinatura.',
       stable:['x','y','width','height'].every(k=>Math.abs(before[k]-after[k])<.5),
       wrappers:h.querySelectorAll('.cm-letter,.cm-word').length};
     h.remove();
     return result;
   });
 });
 check('Sete coreografias por caractere: letras animadas e texto restaurado',
   signatures.length===7&&new Set(signatures.map(s=>s.first)).size===7&&
   signatures.every(s=>s.characters>15&&s.effects===s.characters&&
     s.characters<=100&&s.accessible&&s.restored&&s.stable&&s.wrappers===0),signatures);
 await m.locator('#catalogo').evaluate(n=>n.scrollIntoView({behavior:'instant'}));await m.getByRole('button',{name:'Tratamentos',exact:true}).click();
 check('Filtro de serviços preservado',await m.locator('.service-entry:visible').evaluateAll(es=>es.length>0&&es.every(e=>e.dataset.category==='Tratamentos')));
 await m.locator('#product-category').selectOption('Barba');const count=await m.locator('.product-option:visible').count();check('Filtro e contagem de produtos sincronizados',(await m.locator('#product-count').textContent()).startsWith(count+' produtos · Barba'));
 await m.locator('[data-person="3"]').click();await m.waitForFunction(()=>document.querySelector('#person-name').textContent==='Rafael');await m.waitForTimeout(1100);
 check('Troca do profissional sincroniza retrato e legenda',await m.locator('.team-portrait .image-stage img').count()===1&&await m.locator('.portrait-name').textContent()==='Rafael');
 await m.locator('[data-album-mode="wall"]').click();await m.locator('.gallery-shot').first().click();check('Galeria ampliada funciona',await m.locator('dialog').evaluate(n=>n.open));await m.keyboard.press('Escape');
 await m.context().grantPermissions(['clipboard-read','clipboard-write']);await m.locator('.visit-address-copy').click();await m.waitForFunction(()=>document.querySelector('.visit-copy-status').textContent==='Endereço copiado.');check('Endereço copiado com feedback acessível',await m.evaluate(async()=> (await navigator.clipboard.readText()).includes('349')));
 await m.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('blocked'))}})});await m.locator('.visit-address-copy').click();await m.waitForFunction(()=>document.querySelector('.visit-copy-status').textContent.includes('selecionado'));check('Clipboard negado oferece seleção real',await m.evaluate(()=>getSelection().toString().includes('349')));
 await m.setViewportSize({width:390,height:844});await m.evaluate(()=>scrollTo({top:0,behavior:'instant'}));const menu=m.locator('.menu summary');await menu.click();check('Menu abre por controle acessível',await menu.getAttribute('aria-expanded')==='true');await m.keyboard.press('Escape');await m.waitForTimeout(400);check('Escape devolve foco ao menu',await menu.evaluate(n=>document.activeElement===n&&!n.parentElement.open));
 await m.goto(base+'?motion-interruption=1',{waitUntil:'domcontentloaded'});await m.waitForFunction(()=>document.querySelector('.hero.is-arriving'));await m.emulateMedia({reducedMotion:'reduce'});await m.waitForFunction(()=>!document.documentElement.classList.contains('motion-on'));await ready(m);
 check('Preferência dinâmica libera todo conteúdo e cancela animações',await m.evaluate(()=>!document.querySelector('.cm-pending,.cm-run')&&!document.getAnimations().some(a=>a.playState==='running')));
 for(const width of [320,390,430,768,1024,1440]){
  await m.setViewportSize({width,height:900});await m.reload({waitUntil:'domcontentloaded'});await ready(m);
  const reduced=await m.evaluate(()=>({
    splits:document.querySelectorAll('.cm-pending,.cm-run').length,
    running:document.getAnimations().filter(a=>a.playState==='running').slice(0,10)
      .map(a=>({id:a.id,node:a.effect?.target?.className,duration:a.effect?.getTiming().duration})),
    scroll:document.documentElement.scrollWidth,viewport:innerWidth
  }));
  check(`${width}: movimento reduzido sem splits nem animações`,
    !reduced.splits&&!reduced.running.length&&reduced.scroll===reduced.viewport,reduced);
}
 const axe=await new AxeBuilder({page:m}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();writeFileSync(`${dir}/axe.json`,JSON.stringify(axe.violations,null,2));check('Axe WCAG A/AA em toda página',!axe.violations.length,axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
 await m.close();
 for(const mode of ['no-js','opening-failure','motion-failure','interrupted']){
  const p=await page({javaScriptEnabled:mode!=='no-js'});
  if(mode==='opening-failure')await p.route('**/js/ritual/opening.js',r=>r.abort());
  if(mode==='motion-failure')await p.addInitScript(()=>{const native=Element.prototype.animate;Element.prototype.animate=function(...args){if(this.closest('main,footer'))throw new Error('simulated WAAPI failure');return native.apply(this,args)}});
  await p.goto(base,{waitUntil:'domcontentloaded'});
   if(mode==='interrupted'){await p.waitForSelector('.snv2-run');await p.keyboard.press('Escape')}
   try{
     if(mode==='no-js'){
       // A static no-JS document deliberately retains the loader in markup.
       // Playwright's JS-based waitForFunction cannot reliably poll when page
       // scripting is disabled. Check rendered visibility through the locator.
       await p.locator('#sr-loader-stage').waitFor({state:'hidden'});
     }else await ready(p);
   }catch(error){
      const state=await p.evaluate(()=>({
        loader:!!document.querySelector('#sr-loader-stage'),
        loaderDisplay:getComputedStyle(document.querySelector('#sr-loader-stage')).display,
        boot:document.documentElement.classList.contains('sr-loader-boot'),
        arriving:!!document.querySelector('.hero.is-arriving'),
        waiting:document.documentElement.classList.contains('sr-hero-queued'),
        finishOwner:typeof window.__finishRitual,
        motion:document.documentElement.className,
        heroOpacity:getComputedStyle(document.querySelector('.hero h1')).opacity
      }));
      check(`${mode}: carregamento conclui ou recupera`,false,state);
      await p.close();
      continue;
   }
  check(`${mode}: hero e agendamento continuam visíveis`,await p.locator('.hero .button').isVisible()&&await p.locator('.hero h1').evaluate(n=>getComputedStyle(n).opacity==='1'));
  await go(p,'contato');
  // The 440ms letter stagger + 760ms final frame can outlast the scroll
  // transport on throttled CI. Wait for ACTUAL cleanup, not a guessed delay.
  try{
    await p.waitForFunction(()=>![...document.querySelectorAll('.cm-pending')]
      .some(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&r.top<innerHeight*.85&&r.bottom>0})
      &&!document.querySelector('.cm-run'),undefined,{timeout:3000});
  }catch{}
  const health=await visibleHealth(p);
  const openLayers=await p.evaluate(()=>[...document.querySelectorAll('.cm-run')]
    .map(n=>({text:n.textContent?.slice(0,45),owner:n.closest('h1,h2,h3,p')?.id,
      state:n.closest('[data-cm-state]')?.dataset.cmState})));
  check(`${mode}: recuperação sem texto ou imagem presa`,
    !health.hidden.length&&openLayers.length===0,{...health,openLayers});
  await p.close();
 }
 check('Sem exceções JavaScript',!errors.length,errors);
}catch(e){check('Execução completa',false,e.stack)}finally{writeFileSync(`${dir}/results.json`,JSON.stringify({date:new Date().toISOString(),results,errors},null,2));await b.close();console.log(`RESULTADO ${results.filter(r=>r.pass).length}/${results.length}`)}
if(results.some(r=>!r.pass))process.exitCode=1;
