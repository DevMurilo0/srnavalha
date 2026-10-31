import{createRequire}from'node:module';import{mkdirSync,writeFileSync}from'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json'),{chromium}=require('playwright-core');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true});
const dir='docs/reflexo/validation',checks=[],samples=[];mkdirSync(dir,{recursive:true});const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}`)};
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),cdp=await page.context().newCDPSession(page),errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.SITE_URL||'http://127.0.0.1:8047/';
try{
 // Keep third-party map work out of the memory/listener comparison.
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto(base);await page.waitForTimeout(1900);
 await page.evaluate(()=>document.querySelector('#trabalhos').dispatchEvent(new Event('focusin',{bubbles:true})));
 await page.evaluate(async()=>{for(const img of document.querySelectorAll('img'))if(img.loading==='lazy')img.loading='eager';await Promise.allSettled([...document.images].map(img=>img.decode()))});
 // Native touch scroll with momentum, then portrait -> landscape -> portrait.
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:650}]});
 for(let i=1;i<=15;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:650-i*32}]});await page.waitForTimeout(20)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);check('Gesto nativo com impulso move a página',await page.evaluate(()=>scrollY>200),{scrollY:await page.evaluate(()=>scrollY)});
 await page.setViewportSize({width:844,height:390});await page.setViewportSize({width:390,height:844});check('Rotação sem overflow',await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
 await page.evaluate(()=>document.querySelector('#trabalhos').scrollIntoView({behavior:'instant',block:'center'}));
 await page.locator('.album-sheets').evaluate(el=>{el.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',clientX:280,clientY:200}));el.dispatchEvent(new PointerEvent('pointerup',{pointerType:'touch',clientX:80,clientY:205}))});check('Swipe seleciona folha',await page.locator('[data-sheet="1"]').evaluate(e=>e.classList.contains('is-selected')));
 await cdp.send('Performance.enable');const begin=Date.now();
 async function sample(round){
  await cdp.send('HeapProfiler.collectGarbage');const counters=await cdp.send('Memory.getDOMCounters'),metrics=(await cdp.send('Performance.getMetrics')).metrics;
  samples.push({round,elapsedMs:Date.now()-begin,...counters,heap:metrics.find(m=>m.name==='JSHeapUsedSize').value,images:await page.locator('.team-portrait .image-stage img').count(),animations:await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)});
 }
 for(let round=0;round<30;round++){
  await page.evaluate(async round=>{
   const click=el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));
   for(const id of ['equipe','trabalhos','avaliacoes','contato','inicio']){
    document.getElementById(id).scrollIntoView({behavior:'instant',block:'center'});await new Promise(r=>setTimeout(r,60));
   }
   for(const link of document.querySelectorAll('[data-person]'))click(link);
   for(const button of document.querySelectorAll('.mirror-choice'))click(button);
   click(document.querySelector(`[data-album-mode="${round%2?'folio':'wall'}"]`));
  },round);
  await page.waitForTimeout(4600);
  if(round%5===0||round===29){await sample(round);console.log('SOAK',JSON.stringify(samples.at(-1)))}
 }
 const stable=samples.slice(1);check('Mais de dois minutos de navegação',Date.now()-begin>=120000,{durationMs:Date.now()-begin});
 check('Listeners sem crescimento após aquecimento',new Set(stable.map(s=>s.jsEventListeners)).size===1,stable.map(s=>s.jsEventListeners));
 check('DOM estável após aquecimento',Math.max(...stable.map(s=>s.nodes))-Math.min(...stable.map(s=>s.nodes))<=5,stable.map(s=>s.nodes));
 check('Última seleção mantém somente um retrato',await page.locator('.team-portrait .image-stage img').count()===1);
 await page.emulateMedia({reducedMotion:'reduce'});
 // emulateMedia can resolve before MediaQueryList dispatches change. Wait for
 // the controller's acknowledgement; still require every running effect to end.
 await page.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('motion-on'));
 check('Preferência dinâmica cancela movimento',await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length===0));await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);check('Mídia fora da tela pausada',await page.evaluate(()=>(!document.querySelector('.detail-film')||document.querySelector('.detail-film').paused)&&getComputedStyle(document.querySelector('.review-track')).animationPlayState==='paused'&&getComputedStyle(document.querySelector('.footer-rail-track')).animationPlayState==='paused'));
 // Essential photo deliberately slow: opening releases content within its bound.
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:120,downloadThroughput:100*1024,uploadThroughput:50*1024});await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});const slowStart=Date.now();await page.goto(base+'?intro=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.documentElement.classList.contains('sr-loader-boot'));check('Rede móvel: abertura não bloqueia conteúdo',await page.locator('.hero .button').isVisible(),{elapsedMs:Date.now()-slowStart});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 check('Sem erros JavaScript após repetições',!errors.length,errors);
}catch(error){check('Execução completa',false,error.message)}finally{writeFileSync(`${dir}/resilience.json`,JSON.stringify({date:new Date().toISOString(),checks,samples,errors},null,2));await browser.close();console.log(`RESULTADO ${checks.filter(c=>c.pass).length}/${checks.length}`);if(checks.some(c=>!c.pass))process.exitCode=1}
