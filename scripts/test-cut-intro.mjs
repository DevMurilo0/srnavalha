/* Cinematic shared-element regression — the very same hero razor opens the site. */
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright-core');
const base=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,'');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const dir='docs/the-cut/qa/loader';mkdirSync(dir,{recursive:true});
const results=[];
function check(name,pass,detail){results.push({name,pass:!!pass,detail});console.log((pass?'PASS ':'FAIL ')+name+(pass?'':' '+JSON.stringify(detail)))}
async function inspect(width){
 const context=await browser.newContext({viewport:{width,height:width<600?820:900}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  window.__bladeFrames=[];
  const sample=()=>{
   const node=document.querySelector('img.razor');
   if(node&&window.__bladeFrames.length<450){
    const r=node.getBoundingClientRect();
    window.__bladeFrames.push({flight:node.classList.contains('razor-flight'),x:r.x,y:r.y,w:r.width,h:r.height,t:performance.now()});
   }
   if(window.__bladeFrames.length<450)requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
 });
 const begin=Date.now();
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 check(width+' abertura armada',await page.locator('#cut-intro').count()===1);
 await page.locator('.razor-flight').waitFor({state:'attached',timeout:1800});
 check(width+' original único em movimento',
  await page.locator('img.razor').count()===1 &&
  await page.locator('.cut-intro .official-logo').count()===1 &&
  await page.locator('.cut-intro__progress-fill').count()===1);
 check(width+' nova frase e cada palavra animada',
  (await page.locator('.cut-intro__tagline').textContent()).replace(/\s+/g,' ').trim()==='Precisão em cada movimento.' &&
  await page.locator('.cut-intro__tagline span').count()===3 &&
  await page.locator('.cut-intro__logo-mask').count()===1);
 const logoDrop=await page.locator('.cut-intro__logo-mask .official-logo').evaluate(logo=>{
  const animation=logo.getAnimations()[0];
  return animation?.effect?.getKeyframes()[0]?.transform||'';
 });
 check(width+' logo entra do alto',logoDrop.includes('translate3d(0,-'),logoDrop);
 const earlyProgress=await page.locator('.cut-intro__progress-fill').evaluate(n=>getComputedStyle(n).transform);
 await page.waitForTimeout(380);
 const laterProgress=await page.locator('.cut-intro__progress-fill').evaluate(n=>getComputedStyle(n).transform);
 check(width+' barra de progresso anima durante a entrada',earlyProgress!==laterProgress,{earlyProgress,laterProgress});
 const entry=await page.evaluate(()=>{
  const frames=window.__bladeFrames.filter(f=>f.flight);
  return {first:frames[0],travel:frames.length>4?frames[frames.length-1].x-frames[0].x:0};
 });
 check(width+' navalha entra deslizando da esquerda',entry.first?.x<0&&entry.travel>15,entry);
 const spinPose=await page.locator('.razor-flight').evaluate(img=>{
  const animations=img.getAnimations();
  const entry=animations.find(animation=>animation.effect?.getKeyframes().length===4);
  const frames=entry?.effect.getKeyframes()||[];
  return {frames:frames.length,first:frames[0]?.transform,last:frames.at(-1)?.transform};
 });
 check(width+' navalha realiza volta completa',spinPose.frames===4&&spinPose.first?.includes('-6deg')&&spinPose.last?.includes('354deg'),spinPose);
 await page.screenshot({path:`${dir}/${width}-opening.png`});
 await page.waitForTimeout(850);
 check(width+' navalha permanece na abertura',await page.locator('.razor-flight').count()===1);
 await page.screenshot({path:`${dir}/${width}-flight.png`});
 await page.locator('#cut-intro').waitFor({state:'detached',timeout:6200});
 check(width+' duração contemplativa',Date.now()-begin>=1750,{elapsed:Date.now()-begin});
 await page.waitForFunction(()=>document.querySelector('#hero-title')?.dataset.reveal==='done',null,{timeout:4000});
 const state=await page.evaluate(()=>{
  const rects=window.__bladeFrames;
  const landing=rects.findIndex((f,i)=>i>0&&rects[i-1].flight&&!f.flight);
  const before=landing>=0?rects[landing-1]:null,after=landing>=0?rects[landing]:null;
  const delta=before&&after?Math.max(...['x','y','w','h'].map(k=>Math.abs(before[k]-after[k]))):null;
  return {landingDelta:delta,flightFrames:rects.filter(f=>f.flight).length,
   razorCount:document.querySelectorAll('img.razor').length,
   razorHome:!!document.querySelector('.razor-stage img.razor'),
   restored:!document.querySelector('.razor-flight,.razor-flight-placeholder'),
   boot:document.documentElement.classList.contains('opening-active'),
   overflow:document.documentElement.scrollWidth-innerWidth};
 });
 check(width+' shared-element landing without snap',state.landingDelta!==null&&state.landingDelta<=3&&state.flightFrames>20,state);
 check(width+' hero intact and responsive',state.razorCount===1&&state.razorHome&&state.restored&&!state.boot&&state.overflow<=2,state);
 check(width+' no script errors',errors.length===0,errors);
 await page.screenshot({path:`${dir}/${width}-hero.png`});
 await context.close();
}
try{
 await inspect(1366);
 await inspect(390);
 for(const [name,opts,path] of [
  ['reduced-motion',{reducedMotion:'reduce'},'/'],
  ['hash navigation',{},'/#servicos']
 ]){
  const context=await browser.newContext(opts),page=await context.newPage();
  await page.goto(base+path,{waitUntil:'domcontentloaded'});
  check(name+' bypass',await page.locator('#cut-intro').evaluate(e=>getComputedStyle(e).display==='none').catch(()=>true));
  check(name+' razor stays in hero',await page.locator('.razor-stage .razor').count()===1);
  await context.close();
 }
 const context=await browser.newContext(),page=await context.newPage();
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.locator('.razor-flight').waitFor({state:'attached',timeout:1800});
 await page.keyboard.press('Escape');
 await page.locator('#cut-intro').waitFor({state:'detached',timeout:1000});
 check('interrupt restores real razor',await page.locator('.razor-stage .razor').count()===1&&await page.locator('.razor-flight').count()===0);
 await context.close();
}catch(error){check('test execution',false,String(error.stack||error))}
finally{await browser.close();writeFileSync(dir+'/results.json',JSON.stringify(results,null,2))}
if(results.some(r=>!r.pass))process.exitCode=1;
