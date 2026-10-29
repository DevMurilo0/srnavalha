// Real Chromium checks. Dev dependencies live outside the shipped site.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core');
const {AxeBuilder}=require('@axe-core/playwright');
const base=process.env.SITE_URL||'http://127.0.0.1:8047/',dir='docs/reflexo/validation';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true});
const results=[],errors=[];
const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}`)};
async function fresh(options={}){
 const context=await browser.newContext({viewport:{width:390,height:844},...options});
 // Map availability is external; its iframe and route remain checked below.
 await context.route('https://**/*',route=>route.abort());
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 return page;
}
const settle=page=>page.waitForFunction(()=>!document.documentElement.classList.contains('sr-loader-boot')&&!document.querySelector('.hero.is-arriving'));
const jump=(page,id)=>page.locator(id).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
try{
 const page=await fresh();
 for(const width of [320,360,375,390,412,430,768,1024,1366,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base);await settle(page);await page.evaluate(()=>document.fonts.ready);
  const initial=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,title:document.querySelector('h1').scrollWidth-document.querySelector('h1').clientWidth,photos:[...document.querySelectorAll('.hero img')].every(i=>i.complete&&i.naturalWidth>0)}));
  check(`${width}px: hero, fontes e largura`,initial.overflow<=0&&initial.title<=1&&initial.photos,initial);
  if([320,390,768,1440].includes(width))await page.screenshot({path:`${dir}/hero-${width}.png`});
  for(const id of ['#casa','#servicos','#equipe','#trabalhos','#produtos','#avaliacoes','#localizacao','#contato']){await jump(page,id);await page.waitForTimeout(80)}
  const full=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,invisible:[...document.querySelectorAll('main h2,footer h2')].filter(e=>getComputedStyle(e).opacity==='0').length}));
  check(`${width}px: todos os capítulos`,full.overflow<=0&&!full.invisible,full);
 }
 // The actual node travels; take coordinated snapshots after essential decode.
 for(const width of [390,1440]){
  const intro=await fresh({viewport:{width,height:900}});
  await intro.addInitScript(()=>{window.introSamples=[];const record=()=>{
   const flight=document.querySelector('.snv2-badge');
   if(flight&&window.introSamples.length<20){const r=flight.getBoundingClientRect();window.introSamples.push({time:performance.now(),x:r.x,y:r.y,width:r.width,images:document.querySelectorAll('img[src*="interior-"]').length})}
   if(document.documentElement.classList.contains('sr-loader-boot'))requestAnimationFrame(record)
  };document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(record),{once:true})});
  await intro.goto(base+'?intro=1',{waitUntil:'domcontentloaded'});
  await intro.waitForSelector('.snv2-badge',{state:'attached'});
  await intro.screenshot({path:`${dir}/opening-${width}.png`});
  await intro.waitForSelector('.snv2-cut-ready',{state:'attached',timeout:6500});
  // Snapshot halfway through the actual cut, not just when the SVG appears.
  await intro.waitForTimeout(420);
  const cut=await intro.evaluate(()=>{
    const seam=document.querySelector('.snv2-seam');
    const panels=[...document.querySelectorAll('.snv2-panel')];
    const scale=seam?new DOMMatrix(getComputedStyle(seam).transform).d:0;
    return {strips:panels.length,tip:!!document.querySelector('.snv2-cut-flight'),
      seam:!!seam,logo:!!document.querySelector('.snv2-cutout-logo'),scale};
  });
  check(`${width}px: corte contínuo (sem degraus)`,
    cut.strips===2&&cut.tip&&cut.seam&&cut.logo&&cut.scale>0&&cut.scale<1,cut);
  check(`${width}px: hero não anima durante o corte`,await intro.evaluate(()=>
    !document.querySelector('.hero').getAnimations({subtree:true}).some(a=>a.id.startsWith('sr-text-')||a.id.startsWith('sr-photo-'))));
  await intro.waitForFunction(()=>!document.querySelector('#sr-loader-stage')&&document.querySelector('.hero.is-arriving'));
  const staged=await intro.evaluate(()=>{
    const selectors=['.hero-pole__object','.hero h1',
      '.hero-intro','.hero-facade','.hero-room','.hero-invitation > .button'];
    return selectors.map(selector=>{
      const element=document.querySelector(selector);
      return {selector,exists:!!element,animations:element?.getAnimations({subtree:true}).filter(a=>a.id.startsWith('sr-text-')||a.id.startsWith('sr-photo-')).length||0};
    });
  });
  check(`${width}px: revelação começa somente depois da saída do loader`,
    staged.every(item=>item.exists&&item.animations>0),staged);
  check(`${width}px: sem reflexo tardio nas fotos`,
    await intro.evaluate(()=>!document.querySelector('.hero.sr-hero-sheen')));
  await intro.screenshot({path:`${dir}/perfect-cut-${width}.png`});
  // Second proof: panel opening shows a smooth vertical seam.
  await intro.waitForTimeout(720);
  await intro.screenshot({path:`${dir}/perfect-cut-opening-${width}.png`});
  await settle(intro);await intro.screenshot({path:`${dir}/opening-end-${width}.png`});
  const samples=await intro.evaluate(()=>({samples:window.introSamples,photo:!!document.querySelector('.hero-room img'),mark:!!document.querySelector('.hero-wordmark svg'),flights:document.querySelectorAll('.snv2-badge,.snv2-cut-flight,.snv2-logo-flight').length,logoVisible:getComputedStyle(document.querySelector('.hero-logo-transparent')).visibility!=='hidden'}));
  check(`${width}px: The Perfect Cut: tesoura, divisões e hero real`,samples.samples.length>1&&samples.photo&&samples.mark&&!samples.flights&&samples.logoVisible,samples);
  await intro.context().close();
 }
 for(const input of ['click','keyboard','wheel','touch','resize','hidden']){
  const p=await fresh({hasTouch:true,isMobile:true});await p.goto(base+'?intro=1',{waitUntil:'domcontentloaded'});await p.waitForSelector('.snv2-badge',{state:'attached'});
  if(input==='click')await p.mouse.click(12,300);
  if(input==='keyboard')await p.keyboard.press('Tab');
  if(input==='wheel')await p.mouse.wheel(0,200);
  if(input==='touch')await p.dispatchEvent('body','touchstart');
  if(input==='resize')await p.setViewportSize({width:844,height:390});
  if(input==='hidden')await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
  await settle(p);check(`Abertura interrompida: ${input}`,await p.evaluate(()=>!!document.querySelector('.hero-room img')&&!!document.querySelector('.hero-wordmark svg')&&!document.querySelector('#sr-loader-stage')));await p.context().close();
 }
 await page.goto(base);await settle(page);await page.evaluate(()=>scrollTo(0,0));await page.reload({waitUntil:'domcontentloaded'});check('F5 sempre repete a abertura',await page.locator('#sr-loader-stage').count()===1&&await page.evaluate(()=>document.documentElement.classList.contains('sr-loader-boot')));await settle(page);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await page.reload();check('Hard refresh preserva conteúdo',await page.locator('.hero-room img').count()===1);await cdp.send('Network.setCacheDisabled',{cacheDisabled:false});
 for(const hash of ['#servicos','#equipe']){
  await page.goto(base+hash);
  // Fragment navigation may finish after load, especially after an uncached reload.
  await page.waitForFunction(()=>scrollY>200&&Math.abs(document.querySelector(location.hash).getBoundingClientRect().top)<160);
  const anchor=await page.evaluate(()=>({loader:!!document.querySelector('#sr-loader-stage'),scroll:scrollY,top:document.querySelector(location.hash).getBoundingClientRect().top}));
  check(`Link direto ${hash}`,!anchor.loader&&anchor.scroll>200&&Math.abs(anchor.top)<160,anchor);
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base);await settle(page);await page.keyboard.press('Tab');check('Teclado: foco visível',await page.evaluate(()=>document.activeElement.classList.contains('skip')));
 await page.locator('.menu summary').click();
 await page.waitForFunction(()=>document.querySelector('.menu').classList.contains('is-active'));
 check('Menu móvel abre suavemente',await page.locator('.menu').evaluate(e=>
   e.open&&e.classList.contains('is-active')&&e.querySelector('nav').inert===false));
 await page.keyboard.press('Escape');
 check('Menu inicia fechamento suave',await page.locator('.menu').evaluate(e=>
   e.open&&e.classList.contains('is-closing')&&e.querySelector('nav').inert===true));
 await page.waitForFunction(()=>!document.querySelector('.menu').open);
 check('Menu: Escape fecha e devolve foco',await page.locator('.menu').evaluate(e=>
   !e.open&&document.activeElement===e.querySelector('summary')));
 const pole=await page.evaluate(()=>({
   count:document.querySelectorAll('.hero-pole__glass').length,
   animated:getComputedStyle(document.querySelector('.hero-pole__rotor')).animationName,
   fixture:!!document.querySelector('.hero-pole__cap--top'),
   bookingCalendar:!!document.querySelector('.sr-booking-fixed__calendar')
 }));
 check('Dois barber poles e agenda fixa',pole.count===2&&pole.fixture&&
   pole.animated.includes('sr-pole-rotation')&&pole.bookingCalendar,pole);
 await jump(page,'#servicos');const choice=page.locator('.mirror-choice').nth(1);await choice.click();await page.waitForTimeout(500);check('Espelho troca serviço',await choice.getAttribute('aria-pressed')==='true');
 await page.locator('[data-filter]').nth(1).click();check('Filtro de catálogo',await page.locator('.service-entry[hidden]').count()>0);await page.locator('[data-filter]').first().click();
 await jump(page,'#equipe');await page.locator('[data-person]').nth(1).focus();await page.keyboard.press('ArrowDown');await page.waitForTimeout(450);check('Equipe: teclado seleciona e atualiza',await page.locator('[data-person]').nth(2).getAttribute('aria-pressed')==='true');
 await jump(page,'#trabalhos');await page.locator('[data-album-mode="wall"]').click();check('Álbum muda para parede',await page.locator('.album-sheets.is-wall').count()===1);await page.waitForTimeout(850);
 await page.locator('.gallery-shot').first().click();check('Lightbox abre',await page.locator('dialog').evaluate(e=>e.open));await page.keyboard.press('ArrowRight');await page.keyboard.press('Escape');check('Lightbox fecha e devolve foco',await page.locator('dialog').evaluate(e=>!e.open));
 await page.locator('[data-album-mode="folio"]').click();await page.locator('[data-album-photo="1"]').click();check('Álbum seleciona fotografia',await page.locator('[data-sheet="1"]').evaluate(e=>e.classList.contains('is-selected')));
 await jump(page,'#produtos');await page.locator('[data-product]').nth(1).click();await page.waitForTimeout(400);check('Produto interativo',await page.locator('[data-product]').nth(1).getAttribute('aria-pressed')==='true');
 await page.locator('#product-category').selectOption({index:1});check('Filtro produtos',await page.locator('[data-product][hidden]').count()>0);
 await jump(page,'#avaliacoes');await page.locator('#review-pause').click();check('Pausa depoimentos',await page.locator('#review-pause').getAttribute('aria-pressed')==='true');
 await jump(page,'#localizacao');check('Mapa e rota preservados',await page.locator('.map-frame iframe').count()===1&&await page.locator('a[href*="google.com/maps"]').count()>0);
 await jump(page,'#inicio');await page.locator('.hero .button').click();await page.waitForURL('**/agendar.html');check('Navegação agendamento local',await page.locator('h1').count()===1);await page.goBack();await settle(page);check('Histórico restaura hero',await page.locator('.hero-room img').count()===1);
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'?intro=1');check('Movimento reduzido: sem abertura',await page.locator('#sr-loader-stage').count()===0);await jump(page,'#trabalhos');await page.locator('[data-album-mode="wall"]').click();check('Movimento reduzido: controles funcionam',await page.locator('.album-sheets.is-wall').count()===1);await page.waitForTimeout(150);check('Movimento reduzido: sem animações ativas',await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity).length===0));
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();writeFileSync(`${dir}/axe.json`,JSON.stringify(axe.violations,null,2));check('Axe WCAG A/AA',axe.violations.length===0,axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
 const nojs=await fresh({javaScriptEnabled:false});await nojs.goto(base);check('Sem JS: conteúdo e agendamento',await nojs.evaluate(()=>document.querySelectorAll('.service-entry').length===42&&document.querySelectorAll('[data-product]').length===22&&document.querySelectorAll('.gallery-shot').length===6&&getComputedStyle(document.querySelector('#sr-loader-stage')).display==='none'&&document.querySelector('.hero .button').getAttribute('href')==='agendar.html'));await nojs.context().close();
 for(const resource of ['**/js/ritual/app.js','**/assets/images/hero-redesign/interior-*.webp']){
  const fallback=await fresh();await fallback.route(resource,r=>r.abort());await fallback.goto(base+'?intro=1');await settle(fallback);check(`Falha: ${resource}`,await fallback.evaluate(()=>getComputedStyle(document.querySelector('h1')).opacity==='1'&&!document.querySelector('#sr-loader-stage')));await fallback.context().close();
 }
 check('Console sem erros JavaScript',!errors.length,errors);
}catch(error){check('Execução completa',false,{message:error.message,stack:error.stack})}
finally{writeFileSync(`${dir}/checks.json`,JSON.stringify({date:new Date().toISOString(),browser:browser.version(),results,errors},null,2));await browser.close();console.log(`RESULTADO ${results.filter(r=>r.pass).length}/${results.length}`);if(results.some(r=>!r.pass))process.exitCode=1}
