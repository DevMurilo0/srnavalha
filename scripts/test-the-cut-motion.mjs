// Motion 02 — temporal screenshots and interaction regression in real Chromium.
import{createRequire}from'node:module';
import{mkdirSync,writeFileSync}from'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const{chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const url=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,'');
const dir='docs/the-cut/qa/motion';mkdirSync(dir,{recursive:true});
const results=[],errors=[];
function check(name,passed,details){results.push({name,pass:!!passed,details});console.log((passed?'PASS ':'FAIL ')+name+(passed?'':' '+JSON.stringify(details)));}
async function test(width,reducedMotion='no-preference'){
 const context=await browser.newContext({viewport:{width,height:width<600?820:900},reducedMotion});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://**/*',r=>r.abort());
 await page.goto(url+'/',{waitUntil:'domcontentloaded'});
 const reduce=reducedMotion==='reduce';
 check(width+' initial loading state',reduce?await page.locator('#cut-intro').count()===0:
  await page.locator('#cut-intro').count()===1);
 if(!reduce){
  await page.waitForTimeout(320);
  check(width+' minimal loader and original razor asset',
   await page.locator('.cut-intro__veil').count()===1 &&
   await page.locator('.cut-intro__upper,.cut-intro__lower,.cut-intro__spark').count()===0 &&
   await page.locator('.cut-intro .official-logo').count()===1 &&
   await page.locator('img.razor').count()===1 &&
   await page.locator('.cut-intro__monogram,.portrait-monogram').count()===0);
  await page.screenshot({path:dir+'/intro-'+width+'.png',animations:'allow'});
  await page.waitForFunction(()=>!document.getElementById('cut-intro'),null,{timeout:6000});
  check(width+' loader exits automatically',await page.locator('#cut-intro').count()===0);
  check(width+' hero razor completes seamless handoff',
   await page.locator('.razor-stage .razor').evaluate(img=>
    img.complete&&img.naturalWidth>0&&parseFloat(getComputedStyle(img).opacity)>.99));
  await page.waitForFunction(()=>document.querySelector('#hero-title')?.classList.contains('motion-finished'),null,{timeout:6000});
  check(width+' editorial headline finished',await page.locator('#hero-title').isVisible());
 }else{
  check(width+' reduced motion keeps hero',await page.locator('#hero-title').isVisible());
 }
 await page.locator('#casa').scrollIntoViewIfNeeded();
 if(!reduce){
  // On a narrow viewport the photograph is below the title. Bring the
  // actual parallax layer into view rather than sampling an offscreen layer.
  await page.locator('.house-photos [data-depth]').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{
   const node=document.querySelector('.house-photos [data-depth]');
   return node&&node.style.transform.includes('translate3d');
  },null,{timeout:3000});
  check(width+' parallax is composited on actual photography',
    await page.locator('.house-photos [data-depth]').first().evaluate(n=>
      getComputedStyle(n).transform!=='none'));
 }
 if(!reduce){
  await page.waitForFunction(()=>document.querySelector('#house-title')?.classList.contains('motion-finished'),null,{timeout:5000});
  check(width+' section title choreography',await page.locator('#house-title').isVisible());
 }
 await page.locator('#equipe').scrollIntoViewIfNeeded();
 await page.locator('.team-list button[data-person="rafael"]').click();
 await page.waitForFunction(()=>document.querySelector('.portrait-stage img.is-current')?.src.endsWith('/rafael.webp'),null,{timeout:5000});
 check(width+' team change',await page.locator('.team-list button[data-person="rafael"]').getAttribute('aria-pressed')==='true');
 check(width+' portrait retains one current image and horizontal transition',
    await page.locator('.portrait-stage img.is-current').count()===1 &&
    (reduce || await page.locator('.portrait-stage').evaluate(stage=>[...stage.querySelectorAll('img')]
      .every(img=>img.getAnimations().length>0||img.classList.contains('is-current')))));
 await page.locator('.team-list button[data-person="yan"]').click();
 await page.locator('.team-list button[data-person="eduardo"]').click();
 await page.waitForFunction(()=>document.querySelector('#person-name')?.textContent==='Eduardo',null,{timeout:5000});
 check(width+' rapid team switching remains responsive',
  await page.locator('.team-list button[data-person="eduardo"]').getAttribute('aria-pressed')==='true'&&
  await page.locator('.portrait-stage img.is-current').getAttribute('src')==='assets/images/the-cut/team/eduardo.webp');
 await page.locator('.product-still-life').scrollIntoViewIfNeeded();
 if(!reduce){
  await page.waitForFunction(()=>
   [...document.querySelectorAll('.product-object')].some(node=>
    node.dataset.reveal==='playing'&&node.getAnimations().some(animation=>animation.playState==='running')
   ),null,{timeout:4500});
  check(width+' products perform real rolling animation',true);
 }
 // The three objects have separate starts and durations. Wait for the whole
 // physical sequence to settle, not just the first package.
 await page.waitForFunction(()=>document.querySelectorAll('.product-object[data-motion-done="1"]').length===3,null,{timeout:10000});
 check(width+' product roll-in completes',await page.locator('.product-object[data-motion-done="1"]').count()===3);
 await page.locator('.services-catalog>summary').click();
 check(width+' catalogue opens',await page.locator('.services-catalog').evaluate(x=>x.open));
 await page.locator('.services-catalog>summary').click();
 await page.waitForFunction(()=>!document.querySelector('.services-catalog').open,null,{timeout:4000});
 check(width+' catalogue closes smoothly',!await page.locator('.services-catalog').evaluate(x=>x.open));
 await page.locator('[data-open-gallery="0"]').first().click();
 check(width+' gallery opens',await page.locator('.gallery-dialog').evaluate(x=>x.open));
 await page.locator('.gallery-dialog .dialog-close').click();
 await page.waitForFunction(()=>!document.querySelector('.gallery-dialog').open,null,{timeout:4000});
 check(width+' gallery exits smoothly',!await page.locator('.gallery-dialog').evaluate(x=>x.open));
 check(width+' no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 check(width+' no visible decorative hyphens',
  await page.evaluate(()=>![...document.querySelectorAll('main h1, main h2, .footer-legal, .address-row address')]
    .some(n=>/[‐‑–—-]/u.test(n.textContent||''))));
 await context.close();
}
try{
 for(const width of[390,1440])await test(width);
 await test(390,'reduce');
 check('zero uncaught JavaScript errors',errors.length===0,errors);
}catch(error){check('full motion test',false,error.stack||String(error));}
finally{await browser.close();}
writeFileSync(dir+'/results.json',JSON.stringify({checks:results,errors},null,2));
console.log('MOTION RESULT '+results.filter(x=>x.pass).length+'/'+results.length);
if(results.some(x=>!x.pass))process.exitCode=1;