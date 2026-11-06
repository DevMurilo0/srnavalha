/* Sr Navalha — dedicated collection UX and responsiveness regression. */
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const site=(process.env.SITE_URL||'http://127.0.0.1:8047').replace(/\/$/,'');
const dir='docs/the-cut/qa/catalog';mkdirSync(dir,{recursive:true});
const report=[];
const check=(name,pass,detail)=>{report.push({name,pass:!!pass,detail});console.log((pass?'PASS ':'FAIL ')+name+(pass?'':' '+JSON.stringify(detail)))};
async function inspect(width,reducedMotion='no-preference'){
 const context=await browser.newContext({viewport:{width,height:width<=700?844:900},reducedMotion});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(String(error)));
 await page.goto(site+'/#produtos',{waitUntil:'domcontentloaded'});
 check(width+' Eduardo preselected',await page.locator('.team-list button').first().getAttribute('data-person')==='eduardo'&&await page.locator('#team-booking').getAttribute('href')==='agendar.html?profissional=eduardo');
 check(width+' complete collection',await page.locator('.all-products article').count()===18);
 check(width+' chamada de produtos e sacola',
  (await page.locator('.product-catalog__serial').innerText()).includes('18 PRODUTOS')&&
  (await page.locator('.product-catalog__title').innerText()).includes('produtos.')&&
  await page.locator('.product-catalog__bag').count()===1&&
  await page.locator('.product-catalog__preview-img').count()===3);

 const displayFaces=await page.evaluate(()=>{
  const selectors=['.house h2 em','.instrument-copy em','.team h2 em'];
  return selectors.map(selector=>{
   const node=document.querySelector(selector),style=getComputedStyle(node);
   return {selector,family:style.fontFamily,italic:style.fontStyle};
  });
 });
 check(width+' upright editorial display family',displayFaces.every(f=>f.family.includes('Young Serif')&&f.italic==='normal'),displayFaces);
 await page.locator('.product-catalog>summary').click();
 await page.locator('.product-catalog .all-products').waitFor({state:'visible'});
 check(width+' collection design loaded',await page.locator('.product-card__photo').count()===18 &&
  await page.locator('.product-catalog .product-card__price').count()===18);
 await page.screenshot({path:`${dir}/catalog-${width}-${reducedMotion}.png`,fullPage:false});
 if(width>700){
  await page.locator('.product-catalog__view[data-product-view="list"]').click();
  check(width+' modo lista interativo',await page.locator('.all-products').getAttribute('data-view')==='list'&&
    await page.locator('.product-catalog__view[data-product-view="list"]').getAttribute('aria-pressed')==='true');
  await page.locator('.product-catalog__view[data-product-view="grid"]').click();
  check(width+' retorna à grade',await page.locator('.all-products').getAttribute('data-view')==='grid');
  await page.locator('.product-filter[data-category="Barba"]').click();
  check(width+' category chip filters to three',await page.locator('.product-card:not([hidden])').count()===3&&await page.locator('#product-count').innerText()==='3 de 18 produtos');
  check(width+' category aria state',await page.locator('.product-filter[data-category="Barba"]').getAttribute('aria-pressed')==='true');
  const lens=await page.evaluate(()=>{
   const root=document.querySelector('.product-catalog__filters');
   const target=root.querySelector('.product-filter[aria-pressed="true"]');
   const indicator=root.querySelector('.product-filter__lens');
   return {present:!!indicator,targetX:target.offsetLeft,transform:indicator&&getComputedStyle(indicator).transform};
  });
  check(width+' category active lens mounted',lens.present&&lens.transform!=='none',lens);
  await page.locator('.product-filter[data-category="Cabelo"]').click();
  check(width+' category re-filters immediately',await page.locator('.product-card:not([hidden])').count()===6);
  await page.locator('.product-filter[data-category="Barba"]').click();
 }else{
  await page.locator('#product-category').selectOption('Barba');
  check(width+' mobile category dropdown',await page.locator('.product-card:not([hidden])').count()===3);
 }
 await page.locator('#product-sort').selectOption('price-desc');
 const prices=await page.locator('.product-card:not([hidden])').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.price)));
 check(width+' descending product prices',prices.every((n,i)=>!i||prices[i-1]>=n),prices);
 await page.locator('.product-card:not([hidden]) [data-inspect-product]').first().click();
 check(width+' product detail opens',await page.locator('.product-inspect').evaluate(x=>x.open)&&await page.locator('#product-inspect-title').innerText()!=='');
 await page.screenshot({path:`${dir}/detail-${width}.png`});
 await page.locator('.product-inspect__close').click();
 check(width+' details close with focus returned',
   !await page.locator('.product-inspect').evaluate(x=>x.open)&&
   await page.locator('.product-card__open:focus').count()===1);
 await page.locator('#product-search').fill('produto inexistente zyx');
 check(width+' empty results handled',await page.locator('.product-catalog .catalog-empty').isVisible()&&
  await page.locator('.product-card:not([hidden])').count()===0);
 await page.locator('[data-clear-product-filters]').click();
 check(width+' filters reset',await page.locator('.product-card:not([hidden])').count()===18);
 check(width+' no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 check(width+' zero JS exceptions',errors.length===0,errors);
 await context.close();
}
try{
 await inspect(1366);
 await inspect(390);
 await inspect(390,'reduce');
}catch(error){check('collection test execution',false,String(error.stack||error))}
finally{
 await browser.close();
 writeFileSync(dir+'/results.json',JSON.stringify(report,null,2));
}
if(report.some(x=>!x.pass))process.exitCode=1;
