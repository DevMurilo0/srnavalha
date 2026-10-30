/* Browser regression: service hover and team portrait previews.
   Requires the same Playwright installation and local web server as CI. */
import {createRequire} from 'node:module';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const base=process.env.SITE_URL||'http://127.0.0.1:8047/';
const failures=[];
const check=(label,ok,detail)=>{console.log((ok?'PASS ':'FAIL ')+label+(ok?'':' '+JSON.stringify(detail)));if(!ok)failures.push(label)};
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.querySelector('#sr-loader-stage')&&
    !document.querySelector('.hero.is-arriving'),undefined,{timeout:60000});
  check(width+' hero sem link antigo',await page.locator('.hero-bottom a[href="#servicos"]').count()===0);
  const hero=await page.evaluate(()=>{
    const root=document.querySelector('.hero'),stage=root.querySelector('.hero-photo-stage');
    const title=root.querySelector('h1'),logo=root.querySelector('.hero-logo-transparent');
    const rect=stage.getBoundingClientRect(),heading=title.getBoundingClientRect();
    return {newHero:root.classList.contains('hero--atelier'),
      stage:!!stage&&rect.width>190&&rect.height>310,
      logo:!!logo&&logo.getBoundingClientRect().width>90,
      title:heading.width>200&&getComputedStyle(title).opacity==='1',
      columns:getComputedStyle(root.querySelector('.hero-stage')).gridTemplateColumns,
      canBook:root.querySelector('.hero-invitation>.button')?.getAttribute('href')==='agendar.html',
      stageWithin:rect.right<=innerWidth+1,
      intro:root.querySelector('.hero-intro')?.textContent?.includes('Mais que um corte')
    };
  });
  check(width+' novo hero editorial montado, legível e sem overflow',
    hero.newHero&&hero.stage&&hero.logo&&hero.title&&hero.canBook&&hero.stageWithin&&hero.intro,hero);
  const service=page.locator('.mirror-choice[data-ritual="barboterapia"]');
  await service.scrollIntoViewIfNeeded();
  await service.hover({force:true});
  await page.waitForTimeout(570);
  const hover=await service.evaluate(node=>({
   opacity:getComputedStyle(node,'::before').opacity,
   color:getComputedStyle(node).color,
   left:getComputedStyle(node.querySelector('span')).transform
  }));
  check(width+' serviço com destaque suave',Number(hover.opacity)>.8,hover);
  await service.click({force:true});
  // Service selection waits for the photographic crossfade to resolve.
  await page.waitForFunction(()=>document.querySelector('.mirror-choice[data-ritual="barboterapia"]')
    ?.getAttribute('aria-pressed')==='true',undefined,{timeout:5000});
  check(width+' serviço selecionável',await service.getAttribute('aria-pressed')==='true');
  const team=page.locator('#equipe');
  await team.scrollIntoViewIfNeeded();
  const shade=await team.evaluate(el=>({
    background:getComputedStyle(el).backgroundImage,
    headingBackground:getComputedStyle(el.querySelector('.section-heading')).backgroundColor,
    titleColor:getComputedStyle(el.querySelector('h2')).color,
    thumbs:el.querySelectorAll('.team-name__thumb img').length,
    extraPhotos:el.querySelectorAll('.team-mood-photo,.portrait-engraving').length,
    names:el.querySelectorAll('.team-name').length,
    photo:!!el.querySelector('.team-portrait .image-stage img')
  }));
  check(width+' seção grafite escuro uniforme e cinco miniaturas disponíveis',
    shade.background.includes('rgb(38, 42, 48)')&&
    shade.titleColor==='rgb(247, 248, 250)'&&
    shade.headingBackground==='rgba(0, 0, 0, 0)'&&
    shade.thumbs===5&&shade.extraPhotos===0&&shade.names===5&&shade.photo,shade);
  const link=page.locator('.team-name[data-person="2"]');
  if(width>600)await link.hover({force:true});else await link.click({force:true});
  await page.waitForTimeout(width>600?670:360);
  check(width+' clique/hover seleciona Kauã',await link.getAttribute('aria-pressed')==='true');
  await page.waitForFunction(()=>document.querySelector('#person-name')?.textContent==='Kauã',
    undefined,{timeout:5000});
  const thumb=await link.locator('.team-name__thumb').evaluate(el=>{
    const box=el.getBoundingClientRect();
    return {opacity:Number(getComputedStyle(el).opacity),
      display:getComputedStyle(el).display,
      width:box.width,height:box.height,
      imageLoaded:el.querySelector('img')?.complete,
      viewport:innerWidth,
      right:box.right};
  });
  check(width+' miniatura aparece com animação no hover/clique',
    thumb.opacity>.9&&thumb.display!=='none'&&thumb.width>30&&
    thumb.height>40&&thumb.right<=thumb.viewport+1,thumb);
  const portrait=await page.locator('.team-portrait .image-stage').evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {width:r.width,height:r.height,right:r.right,viewport:innerWidth};
  });
  check(width+' retrato principal permanece funcional',
    portrait.width>70&&portrait.height>95&&portrait.right<=portrait.viewport+1,portrait);
  check(width+' sem overflow horizontal',
    await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  check(width+' sem erros JS',errors.length===0,errors);
  await context.close();
 }
}finally{await browser.close();}
if(failures.length){console.error('Falhas:',failures);process.exitCode=1}
