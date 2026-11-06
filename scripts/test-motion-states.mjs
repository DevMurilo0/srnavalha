// Temporal contract: inspect every painted frame, not only final visibility.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright-core');
const {AxeBuilder}=require('@axe-core/playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const base=process.env.SITE_URL||'http://127.0.0.1:8047',dir='docs/motion-states';mkdirSync(dir,{recursive:true});
const results=[];const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});console.log(pass?'PASS':'FAIL',name,pass?'':JSON.stringify(detail))};
async function page(options={}){
 const context=await browser.newContext({viewport:{width:1440,height:900},...options});
 await context.route('https://**/*',r=>r.abort());
 const p=await context.newPage();
 await p.addInitScript(()=>{
  window.audit={frames:0,flashes:[],errors:[],rects:[],delays:0,cls:0};
  addEventListener('error',e=>audit.errors.push(e.message));new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)audit.cls+=e.value}).observe({type:'layout-shift',buffered:true});
  function frame(){
   audit.frames++;
   if(document.documentElement.classList.contains('motion-enabled'))for(const n of document.querySelectorAll('[data-reveal="pending"]')){
    if(Number(getComputedStyle(n).opacity)!==0)audit.flashes.push(n.outerHTML.slice(0,150));
   }
   for(const a of document.getAnimations()){
    const n=a.effect?.target,t=a.effect?.getComputedTiming();
    if(n&&(n.matches('.motion-glyph')||n.dataset.reveal==='playing')&&t.localTime!==null&&t.localTime<t.delay){audit.delays++;if(Number(getComputedStyle(n).opacity)!==0)audit.flashes.push('delay:'+n.className)}
   }
   const razor=document.querySelector('.razor');if(razor){const r=razor.getBoundingClientRect();audit.rects.push({flight:razor.classList.contains('razor-flight'),x:r.x,y:r.y,w:r.width,h:r.height,opacity:getComputedStyle(razor).opacity})}
   requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
 });
 return p;
}
const go=async(p,selector)=>{await p.locator(selector).first().evaluate(n=>n.scrollIntoView({behavior:'instant',block:'center'}))};
try{
 for(const width of (process.env.RECOVERY_ONLY?[]:[320,390,768,1366,1440])){
  const p=await page({viewport:{width,height:900}});
  await p.goto(base,{waitUntil:'domcontentloaded'});
  if(width===1440||width===390){for(let i=0;i<8;i++){await p.screenshot({path:`${dir}/intro-${width}-${i}.png`});await p.waitForTimeout(180)}}
  await p.waitForFunction(()=>!document.querySelector('#cut-intro'));
  await p.waitForTimeout(1200);
  const continuity=await p.evaluate(()=>{const a=audit.rects;const i=a.findIndex((r,i)=>i&&a[i-1].flight&&!r.flight);return i<0?null:Math.max(...['x','y','w','h'].map(k=>Math.abs(a[i][k]-a[i-1][k])))});
  check(width+' same razor landing (<2px)',continuity!==null&&continuity<2,continuity);
  for(const sel of ['#house-title','.house-main','.house-detail','.service-panel','#team-title','.portrait-stage','#work-title','.workroom-feature__stage','#products-title','.product-object','.instrument-copy',' #booking-title','#location-title','.facade','.footer-signature']){
   if(!await p.locator(sel).count())continue;
   await go(p,sel);await p.waitForTimeout(1400);
  }
  await go(p,'#equipe');await p.waitForTimeout(200);
  await p.locator('[data-person="rafael"]').click();await p.waitForTimeout(1200);
  check(width+' team selection',await p.locator('#person-name').textContent()==='Rafael');
  const health=await p.evaluate(()=>({pending:[...document.querySelectorAll('[data-reveal="pending"]')].map(n=>n.outerHTML.slice(0,100)),overflow:document.documentElement.scrollWidth-innerWidth,flashes:audit.flashes,frames:audit.frames,delays:audit.delays,errors:audit.errors,cls:audit.cls}));
  check(width+' no premature frame / delay',!health.flashes.length&&health.delays>0,health);
  check(width+' all marked elements observed',!health.pending.length,health.pending);
  check(width+' no horizontal overflow',health.overflow===0,health.overflow);
  check(width+' layout shift below .01',health.cls<.01,health.cls);
  check(width+' no browser errors',!health.errors.length,health.errors);
  if(width===1440){
   const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa']).analyze();check('WCAG A/AA',axe.violations.length===0,axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
   await p.screenshot({path:dir+'/team-final.png'});
  }
  await p.context().close();
 }
 // Hold the module response: the pending state must exist before JS initializes.
 const delayed=await page();await delayed.route('**/js/the-cut/app.js',async r=>{await new Promise(resolve=>setTimeout(resolve,900));await r.continue()});
 await delayed.goto(base,{waitUntil:'commit'});await delayed.waitForTimeout(400);
 check('Before module execution, HTML already pending',await delayed.locator('#team-title').evaluate(n=>getComputedStyle(n).opacity==='0'));
 await delayed.context().close();
 for(const scenario of ['no-js','reduced','module-failed','no-waapi','no-observer','observer-silent','image-failed','slow-images','slow-fonts','resize','tab','dynamic-reduce','anchor','fast-scroll','reload']){
  const p=await page(scenario==='no-js'?{javaScriptEnabled:false}:scenario==='reduced'?{reducedMotion:'reduce'}:{});
  if(scenario==='module-failed')await p.route('**/js/the-cut/motion.js',r=>r.abort());
  if(scenario==='no-waapi')await p.addInitScript(()=>Element.prototype.animate=undefined);
  if(scenario==='no-observer')await p.addInitScript(()=>delete window.IntersectionObserver);
  if(scenario==='observer-silent')await p.addInitScript(()=>window.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}});
  if(scenario==='image-failed')await p.route('**/assets/images/**',r=>r.abort());
  if(scenario==='slow-images')await p.route('**/assets/images/**',async r=>{await new Promise(resolve=>setTimeout(resolve,1800));await r.continue()});
  if(scenario==='slow-fonts')await p.route('**/assets/fonts/**',async r=>{await new Promise(resolve=>setTimeout(resolve,2200));await r.continue()});
  await p.goto(base+(scenario==='anchor'?'#equipe':''),{waitUntil:'domcontentloaded'});
  if(scenario==='resize')await p.setViewportSize({width:390,height:844});
  if(scenario==='tab')await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
  if(scenario==='dynamic-reduce')await p.emulateMedia({reducedMotion:'reduce'});
  if(scenario==='reload'){await p.reload({waitUntil:'domcontentloaded'});const cdp=await p.context().newCDPSession(p);await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await p.reload({waitUntil:'domcontentloaded'})}
  if(scenario==='fast-scroll')for(const selector of ['.footer','#casa','#produtos','#inicio','#equipe'])await go(p,selector);
  await p.waitForTimeout(scenario==='module-failed'?5300:3300);
  await go(p,'#equipe');await p.waitForTimeout(1800);
  check(scenario+' visible title, usable page',await p.locator('#team-title').evaluate(n=>Number(getComputedStyle(n).opacity)===1&&!n.querySelector('.motion-overlay')));
  check(scenario+' intro released',await p.locator('#cut-intro').count()===0||await p.locator('#cut-intro').evaluate(n=>getComputedStyle(n).display==='none'));
  await p.context().close();
 }
}finally{await browser.close();writeFileSync(dir+(process.env.RECOVERY_ONLY?'/recovery-results.json':'/results.json'),JSON.stringify(results,null,2))}
if(results.some(r=>!r.pass))process.exitCode=1;
