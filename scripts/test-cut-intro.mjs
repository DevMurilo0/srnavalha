/* Visual/functional regression: minimal opening and clean hero handoff. */
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright-core');
const base=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,'');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const dir='docs/the-cut/qa/loader';mkdirSync(dir,{recursive:true});
const checks=[];
const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});console.log((pass?'PASS ':'FAIL ')+name)};
async function inspect(width){
 const context=await browser.newContext({viewport:{width,height:width<600?820:900}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 check(width+' marca e traço sem artefatos',await page.locator('.cut-intro .official-logo').count()===1&&await page.locator('.cut-intro__progress-fill').count()===1&&await page.locator('.cut-intro__caption,.cut-intro__spark,.cut-intro__scissors').count()===0);
 await page.screenshot({path:`${dir}/${width}-opening.png`});
 await page.locator('#cut-intro').waitFor({state:'detached',timeout:3600});
 await page.waitForFunction(()=>document.querySelector('#hero-title')?.dataset.reveal==='done',null,{timeout:4000});
 const ready=await page.evaluate(()=>{
  const razor=document.querySelector('.hero .razor');
  return {razorHome:!!razor?.closest('.razor-stage'),noFlight:!document.querySelector('.razor-flight'),noCover:!document.documentElement.classList.contains('opening-active'),overflow:document.documentElement.scrollWidth-innerWidth,heroVisible:!!document.querySelector('#hero-title')?.getClientRects().length};
 });
 check(width+' hero liberado e navalha sem salto',ready.razorHome&&ready.noFlight&&ready.noCover&&ready.overflow<=2&&ready.heroVisible,ready);
 check(width+' sem erros de script',errors.length===0,errors);
 await page.screenshot({path:`${dir}/${width}-hero.png`});
 await context.close();
}
try{
 await inspect(1366);await inspect(390);
 for(const [name,opts,url] of [
  ['movimento reduzido',{reducedMotion:'reduce'},'/'],
  ['âncora interna',{},'/#servicos']
 ]){
  const context=await browser.newContext(opts),page=await context.newPage();
  await page.goto(base+url,{waitUntil:'domcontentloaded'});
  check(name+' ignora abertura',await page.locator('#cut-intro').evaluate(e=>getComputedStyle(e).display==='none').catch(()=>true));
  await context.close();
 }
 const context=await browser.newContext(),page=await context.newPage();
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.keyboard.press('Escape');
 await page.locator('#cut-intro').waitFor({state:'detached',timeout:3600});
 check('interrupção não bloqueia navegação',await page.locator('.hero a[href="agendar.html"]').count()>0);
 await context.close();
}catch(error){check('execução',false,String(error?.stack||error))}
finally{await browser.close();writeFileSync(dir+'/results.json',JSON.stringify(checks,null,2))}
if(checks.some(c=>!c.pass))process.exitCode=1;
