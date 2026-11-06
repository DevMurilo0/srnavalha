/* Immersive works gallery: photos, thumbs, inputs, mobile and reduced motion. */
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const site=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,'');
const dir='docs/the-cut/qa/gallery';mkdirSync(dir,{recursive:true});
const checks=[];
const check=(label,ok,details)=>{checks.push({label,pass:!!ok,details});console.log((ok?'PASS ':'FAIL ')+label+(ok?'':' '+JSON.stringify(details)))};
async function run(width,reducedMotion='no-preference'){
 const context=await browser.newContext({viewport:{width,height:width<700?844:900},reducedMotion});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(site+'/#trabalhos',{waitUntil:'domcontentloaded'});
  await page.locator('#trabalhos .gallery-all').click();
  await page.locator('.gallery-dialog').waitFor({state:'visible'});
  check(width+' gallery opened',await page.locator('.gallery-dialog').evaluate(x=>x.open));
  check(width+' six original works visible as thumbnails',await page.locator('.gallery-room__thumb').count()===6);
  check(width+' dual-layer photo stage',await page.locator('.gallery-room__layer').count()===2);
  await page.screenshot({path:`${dir}/gallery-${width}-${reducedMotion}-initial.png`});
  await page.locator('.gallery-room__thumb').nth(5).click();
  await page.waitForFunction(()=>document.querySelector('.gallery-room__layer.is-active')?.src.endsWith('servico-platinado-960.webp'),null,{timeout:8000});
  check(width+' thumbnail selects platinado',await page.locator('.gallery-room__thumb').nth(5).getAttribute('aria-pressed')==='true');
  check(width+' counter and active photograph agree',await page.locator('.gallery-controls [role="status"]').innerText()==='06 / 06');
  await page.screenshot({path:`${dir}/gallery-${width}-${reducedMotion}-selected.png`});
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('.gallery-room__layer.is-active')?.src.endsWith('servico-comb-cort-barb-simples-960.webp'),null,{timeout:8000});
  check(width+' right arrow wraps to first',await page.locator('.gallery-controls [role="status"]').innerText()==='01 / 06');
  await page.locator('[data-gallery-prev]').click();
  await page.waitForFunction(()=>document.querySelector('.gallery-room__layer.is-active')?.src.endsWith('servico-platinado-960.webp'),null,{timeout:8000});
  check(width+' previous button returns to last',await page.locator('.gallery-controls [role="status"]').innerText()==='06 / 06');
  if(width<=700){
   await page.locator('.gallery-room__photo').dispatchEvent('pointerdown',{pointerType:'touch',clientX:270,clientY:200});
   await page.locator('.gallery-room__photo').dispatchEvent('pointerup',{pointerType:'touch',clientX:90,clientY:209});
   await page.waitForFunction(()=>document.querySelector('.gallery-controls [role="status"]')?.textContent.trim()==='01 / 06',null,{timeout:4000});
   check(width+' touch swipe advances photo',await page.locator('.gallery-controls [role="status"]').innerText()==='01 / 06');
  }
  const geometry=await page.evaluate(()=>{
   const d=document.querySelector('.gallery-dialog'),thumbs=[...d.querySelectorAll('.gallery-room__thumb')];
   return {modalW:d.clientWidth,modalScroll:d.scrollWidth,viewportW:innerWidth,documentScroll:document.documentElement.scrollWidth,
    sixImagesReady:thumbs.length===6&&thumbs.every(t=>!!t.querySelector('img')?.getAttribute('src')),
    controls:[...d.querySelectorAll('.gallery-controls button')].every(b=>b.getBoundingClientRect().width>=38)};
  });
  check(width+' responsive gallery no horizontal overflow',geometry.modalScroll<=geometry.modalW+2&&geometry.documentScroll<=geometry.viewportW+2,geometry);
  check(width+' accessible controls and thumbnails',geometry.sixImagesReady&&geometry.controls);
  check(width+' zero runtime exceptions',errors.length===0,errors);
  await page.locator('.gallery-dialog .dialog-close').click();
  check(width+' closes and returns focus',!await page.locator('.gallery-dialog').evaluate(d=>d.open)&&await page.locator('#trabalhos .gallery-all:focus').count()===1);
 }catch(error){check(width+' test completed',false,String(error.stack||error))}
 finally{await context.close()}
}
try{await run(1366);await run(390);await run(390,'reduce')}
finally{await browser.close();writeFileSync(dir+'/results.json',JSON.stringify(checks,null,2))}
if(checks.some(x=>!x.pass))process.exitCode=1;
