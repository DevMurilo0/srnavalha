/* The redesigned Sr. Navalha portfolio: live inline selector + native full-screen gallery. */
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright-core');
const {AxeBuilder}=require('@axe-core/playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const site=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,'');
const dir='docs/the-cut/qa/gallery';mkdirSync(dir,{recursive:true});
const checks=[];
const check=(label,pass,detail)=>{checks.push({label,pass:!!pass,detail});console.log((pass?'PASS ':'FAIL ')+label+(pass?'':' '+JSON.stringify(detail)))};
async function run(width,reducedMotion='no-preference'){
 const context=await browser.newContext({viewport:{width,height:width<=700?844:900},reducedMotion});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(site+'/#trabalhos',{waitUntil:'domcontentloaded'});
  await page.locator('.workroom-studio').scrollIntoViewIfNeeded();
  check(width+' completely new contact-sheet experience',await page.locator('.workroom-feature__stage').count()===1&&await page.locator('.folio-grid,.folio-card').count()===0);
  check(width+' all six choices visible',await page.locator('.workroom-choice:visible').count()===6);
  check(width+' single selected initial photograph',await page.locator('.workroom-choice[aria-pressed="true"]').count()===1&&await page.locator('[data-work-title]').textContent()==='Corte e barba');
  const geometry=await page.evaluate(()=>{
   const rows=[...document.querySelectorAll('.workroom-choice')].map(n=>n.getBoundingClientRect());
   const stage=document.querySelector('.workroom-feature__stage');
   return {rows:rows.map(r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom})),stage:{width:stage.clientWidth,height:stage.clientHeight},overflow:document.documentElement.scrollWidth-innerWidth,
    allPhotosHaveSources:[...document.querySelectorAll('.workroom-choice img')].every(i=>i.getAttribute('src')?.endsWith('-320.webp'))};
  });
  const cardsDoNotOverlap=geometry.rows.every((a,i)=>geometry.rows.slice(i+1).every(b=>a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1));
  check(width+' never overlapped / no crop / no horizontal overflow',cardsDoNotOverlap&&geometry.overflow<=2&&geometry.allPhotosHaveSources&&geometry.stage.width>230,geometry);
  check(width+' main photo has contain (never cropped)',await page.locator('.workroom-feature__photo.is-active').evaluate(n=>getComputedStyle(n).objectFit==='contain'));
  await page.screenshot({path:`${dir}/portfolio-${width}-${reducedMotion}-initial.png`});
  await page.locator('.workroom-choice').nth(5).click();
  await page.waitForFunction(()=>document.querySelector('.workroom-feature__photo.is-active')?.getAttribute('src')?.endsWith('servico-platinado-960.webp'),null,{timeout:5000});
  check(width+' selecting 06 updates large image and heading',await page.locator('[data-work-title]').textContent()==='Platinado'&&await page.locator('.workroom-choice[aria-pressed="true"]').count()===1&&await page.locator('.workroom-feature__number').innerText()==='06 / 06');
  check(width+' enlarge control follows current photograph',await page.locator('.workroom-feature__zoom').getAttribute('data-open-gallery')==='5');
  await page.screenshot({path:`${dir}/portfolio-${width}-${reducedMotion}-selected.png`});
  await page.locator('.workroom-feature__zoom').click();
  check(width+' full-screen gallery opens at selected image',await page.locator('.gallery-dialog').evaluate(n=>n.open)&&await page.locator('.gallery-controls [role="status"]').innerText()==='06 / 06');
  check(width+' authentic barbershop logo + highlighted photo title',await page.locator('.gallery-room__seal img[src$="logo-640.webp"]').count()===1&&await page.locator('.gallery-room__feature-title').textContent()==='Platinado');
  check(width+' all six modal thumbnails accessible',await page.locator('.gallery-room__thumb').count()===6);
  await page.screenshot({path:`${dir}/lightbox-${width}-${reducedMotion}.png`});
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('.gallery-room__layer.is-active')?.alt==='Corte e barba',null,{timeout:5000});
  check(width+' keyboard wraps after last photograph',await page.locator('.gallery-controls [role="status"]').innerText()==='01 / 06');
  await page.locator('.gallery-room__thumb').nth(2).click();
  await page.waitForFunction(()=>document.querySelector('.gallery-room__layer.is-active')?.alt==='Corte e textura',null,{timeout:5000});
  check(width+' clicking thumbnail updates photo and title',await page.locator('.gallery-room__feature-title').textContent()==='Corte e textura');
  if(width<=700){
   await page.locator('.gallery-room__photo').dispatchEvent('pointerdown',{pointerType:'touch',clientX:255,clientY:190});
   await page.locator('.gallery-room__photo').dispatchEvent('pointerup',{pointerType:'touch',clientX:90,clientY:199});
   await page.waitForFunction(()=>document.querySelector('.gallery-controls [role="status"]')?.textContent.trim()==='04 / 06',null,{timeout:5000});
   check(width+' finger swipe works',await page.locator('.gallery-room__feature-title').textContent()==='Barboterapia');
  }
  check(width+' modal photos also use contain',await page.locator('.gallery-room__layer.is-active').evaluate(n=>getComputedStyle(n).objectFit==='contain'));
  const g=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth-innerWidth,modal:document.querySelector('.gallery-dialog').scrollWidth-document.querySelector('.gallery-dialog').clientWidth}));
  check(width+' modal and page never overflow horizontally',g.scroll<=2&&g.modal<=2,g);
  if(reducedMotion==='reduce')check(width+' reduced motion disables modal transitions',await page.locator('.gallery-dialog').evaluate(n=>getComputedStyle(n).animationName==='none'));
  const audit=await new AxeBuilder({page}).include('.gallery-dialog').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  check(width+' gallery WCAG A/AA',audit.violations.length===0,audit.violations.map(x=>({id:x.id,target:x.nodes.map(n=>n.target)})));
  await page.locator('.gallery-room__close').click();
  await page.waitForFunction(()=>!document.querySelector('.gallery-dialog').open,null,{timeout:3000});
  check(width+' closes cleanly and restores focus',await page.locator('.workroom-feature__zoom:focus').count()===1);
  check(width+' no uncaught JavaScript errors',errors.length===0,errors);
 }catch(e){check(width+' browser test completed',false,String(e.stack||e))}
 finally{await context.close()}
}
try{for(const width of [1440,768,390,320])await run(width);await run(390,'reduce')}
finally{await browser.close();writeFileSync(dir+'/results.json',JSON.stringify(checks,null,2))}
if(checks.some(x=>!x.pass))process.exitCode=1;
