/* The Cut: verify the generated design in real Chromium at meaningful widths.
   Screenshot artifacts are independent evidence, not a synthetic mockup. */
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core');
const {AxeBuilder}=require('@axe-core/playwright');
const site=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,'');
const output='docs/the-cut/qa';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const checks=[],errors=[];
function check(label,ok,detail){checks.push({label,pass:!!ok,detail});console.log((ok?'PASS ':'FAIL ')+label+(ok?'':' '+JSON.stringify(detail)));}
const widths=[320,390,768,900,1366,1440];
try {
 for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:width===900?550:width<=390?844:900},deviceScaleFactor:1});
  await context.route(/https:\/\/.*/,route=>route.abort());
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push({width,error:e.message}));
  const missing=[];
  page.on('response',r=>{if(r.url().startsWith(site)&&r.status()>=400)missing.push({url:r.url(),status:r.status()})});
  await page.goto(site+'/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.hero h1').waitFor();
  check(width+' The Cut stylesheet and razor',await page.locator('link[href="css/the-cut.css"]').count()===1&&
   await page.locator('.hero .razor[src$="razor.webp"]').count()===1);
  check(width+' five original transparent portraits',
   await page.locator('.team-list button[data-person]').count()===5&&
   await page.locator('.portrait-stage img[src*="/the-cut/team/"]').count()===1);
  check(width+' catalogues preserve data',await page.locator('.all-services article').count()===42&&
   await page.locator('.all-products article').count()===18);
  check(width+' 3 editorial service panels',await page.locator('.service-panel').count()===3);
  check(width+' content inside viewport',await page.evaluate(()=>{
   return document.documentElement.scrollWidth<=innerWidth+2;
  }),await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth})));
  check(width+' main CTA goes to booking',await page.locator('.hero-actions .button').getAttribute('href')==='agendar.html');
  check(width+' assets load',missing.length===0,missing);
  if(width===390||width===1440){
   // Full-page capture alone does not trigger native lazy-loaded photos.
   // Visit each photographic chapter first, then return to the top for a
   // representative editorial comparison against the approved print.
   for(const id of ['casa','equipe','trabalhos','produtos','localizacao']){
    await page.locator('#'+id).scrollIntoViewIfNeeded();
    await page.waitForTimeout(160);
   }
   const photoAudit=await page.evaluate(async()=>{
    const watched=[...document.querySelectorAll('.work-print img,.product-object img,.product-selection img,.facade img')];
    await Promise.all(watched.map(img=>{
     if(img.complete)return Promise.resolve();
     return new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,3500)});
    }));
    return watched.map(img=>({src:img.getAttribute('src'),ok:img.complete&&img.naturalWidth>0}));
   });
   check(width+' real photographs load after scroll',photoAudit.every(v=>v.ok),photoAudit.filter(v=>!v.ok));
   await page.evaluate(()=>scrollTo(0,0));
   await page.waitForTimeout(250);
   await page.screenshot({path:output+'/desktop-'+width+'.png',fullPage:true,animations:'disabled'});
  }
  if(width===390||width===1440){
   await page.locator('.team-list button[data-person="eduardo"]').click();
   await page.waitForFunction(()=>document.querySelector('.portrait-stage img.is-current')?.getAttribute('src')?.endsWith('/eduardo.webp'),null,{timeout:3500});
   check(width+' team portrait selection',await page.locator('.team-list button[data-person="eduardo"]').getAttribute('aria-pressed')==='true'&&
    await page.locator('#person-name').textContent()==='Eduardo');
   await page.locator('.services-catalog>summary').click();
   await page.locator('#service-search').fill('barboterapia');
   check(width+' service filter',await page.locator('.all-services article:visible').count()>0&&
    await page.locator('.all-services article[hidden]').count()>0);
   await page.locator('.product-catalog>summary').click();
   await page.locator('#product-search').fill('pomada');
   check(width+' product filter',await page.locator('.all-products article:visible').count()>0&&
    await page.locator('.all-products article[hidden]').count()>0);
   await page.locator('[data-open-gallery="0"]').first().click();
   check(width+' gallery modal opens',await page.locator('.gallery-dialog').evaluate(d=>d.open));
   await page.locator('[data-gallery-next]').click();
   check(width+' gallery moves',await page.locator('.gallery-controls [role="status"]').textContent()==='2 de 6');
   await page.locator('.gallery-dialog .dialog-close').click();
   check(width+' gallery closes',await page.locator('.gallery-dialog').evaluate(d=>!d.open));
   const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   check(width+' serious a11y violations',a11y.violations.filter(v=>['critical','serious'].includes(v.impact)).length===0,
    a11y.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})));
  }
  await context.close();
 }
 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const reducedPage=await reduced.newPage();
 await reduced.route(/https:\/\/.*/,route=>route.abort());
 await reducedPage.goto(site+'/',{waitUntil:'domcontentloaded'});
 check('reduced motion keeps content visible',await reducedPage.locator('.hero h1').isVisible()&&
  await reducedPage.locator('.team-list button').count()===5);
 await reduced.close();
} catch(e){errors.push({fatal:e.stack||e.message});}
finally{await browser.close();}
check('no uncaught JS errors',errors.length===0,errors);
writeFileSync(output+'/results.json',JSON.stringify({date:new Date().toISOString(),checks,errors},null,2));
console.log('RESULT '+checks.filter(c=>c.pass).length+'/'+checks.length);
if(checks.some(c=>!c.pass)||errors.length)process.exitCode=1;
