/* Regression: the same artwork must cut the opening screen and land in the
 * hero without a duplicate frame. Screenshots are kept for visual inspection. */
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright-core');
const base=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,'');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const dir='docs/the-cut/qa/loader';mkdirSync(dir,{recursive:true});
const results=[];
function check(label,ok,details=null){results.push({label,pass:Boolean(ok),details});console.log((ok?'PASS ':'FAIL ')+label+(ok?'':' '+JSON.stringify(details)))}
async function test(width){
 const ctx=await browser.newContext({viewport:{width,height:width<600?820:900}});
 const page=await ctx.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(String(error)));
 await page.addInitScript(()=>{
  window.__razorFrames=[];
  requestAnimationFrame(function poll(){
   const node=document.querySelector('.razor');
   if(node){const b=node.getBoundingClientRect();window.__razorFrames.push({flight:node.classList.contains('razor-flight'),x:b.x,y:b.y,w:b.width,h:b.height})}
   if(window.__razorFrames.length<510)requestAnimationFrame(poll);
  });
 });
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 check(width+' loader is armed',await page.locator('#cut-intro').count()===1);
 check(width+' physical razor remains a single element',await page.locator('img.razor').count()===1);
 check(width+' minimal identity and progress appear in loader',await page.locator('.cut-intro__identity .official-logo').count()===1 && await page.locator('.cut-intro__progress-fill').count()===1 && await page.locator('.cut-intro__veil').count()===1 && await page.locator('.cut-intro__spark,.cut-intro__upper,.cut-intro__lower').count()===0);
 await page.waitForTimeout(310);
 await page.screenshot({path:`${dir}/${width}-identity.png`,animations:'allow'});
 await page.waitForTimeout(1020);
 await page.screenshot({path:`${dir}/${width}-transition.png`,animations:'allow'});
 await page.waitForTimeout(780);
 await page.screenshot({path:`${dir}/${width}-reveal.png`,animations:'allow'});
 await page.waitForFunction(()=>!document.querySelector('#cut-intro'),null,{timeout:5800});
 await page.screenshot({path:`${dir}/${width}-hero.png`});
 const state=await page.evaluate(()=>{
  const frames=window.__razorFrames;
  const i=frames.findIndex((f,j)=>j>0&&frames[j-1].flight&&!f.flight);
  const landingDiff=i<0?null:Math.max(...['x','y','w','h'].map(k=>Math.abs(frames[i][k]-frames[i-1][k])));
  const razor=document.querySelector('.razor');
  return {flightFrames:frames.filter(f=>f.flight).length,landingDiff,
   parent:razor.parentElement?.className,opacity:Number(getComputedStyle(razor).opacity),
   overflow:document.documentElement.scrollWidth-innerWidth,
   opening:document.documentElement.classList.contains('opening-active')};
 });
 check(width+' razor glides gently into hero',state.flightFrames>8,state);
 check(width+' same razor lands with no snap',state.landingDiff!==null&&state.landingDiff<3,state);
 check(width+' overlay releases, page remains usable',!state.opening&&state.parent.includes('razor-depth')&&state.opacity>.99&&state.overflow<=2,state);
 await page.waitForFunction(()=>document.querySelector('#hero-title')?.dataset.reveal==='done',null,{timeout:4000});
 check(width+' editorial headline enters after hand-off',await page.locator('#hero-title').isVisible());
 check(width+' zero JavaScript exceptions',errors.length===0,errors);
 await ctx.close();
}
try{
 await test(1366);
 await test(390);
 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const rpage=await reduced.newPage();await rpage.goto(base+'/',{waitUntil:'domcontentloaded'});
 check('reduced motion bypasses cinematic cover',await rpage.locator('#cut-intro').count()===0||await rpage.locator('#cut-intro').evaluate(e=>getComputedStyle(e).display==='none'));
 await reduced.close();
 const anchored=await browser.newContext({viewport:{width:1366,height:900}});const apage=await anchored.newPage();await apage.goto(base+'/#servicos',{waitUntil:'domcontentloaded'});
 await apage.waitForTimeout(500);
 check('hash navigation bypasses cinematic cover',await apage.locator('#cut-intro').count()===0);
 await anchored.close();
}catch(error){check('complete cinematic hand-off',false,error?.stack||String(error))}
finally{await browser.close();writeFileSync(dir+'/results.json',JSON.stringify(results,null,2))}
if(results.some(r=>!r.pass))process.exitCode=1;
