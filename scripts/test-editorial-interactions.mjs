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
  await page.addInitScript(()=>{
    window.__teamRailEvents=[];
    const original=Element.prototype.animate;
    Element.prototype.animate=function(frames,options){
      if(this.tagName==='IMG'&&this.closest('#equipe .image-stage')){
        window.__teamRailEvents.push({
          first:frames?.[0]?.transform,last:frames?.at(-1)?.transform,
          time:performance.now()
        });
      }
      return original.call(this,frames,options);
    };
  });
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.querySelector('#sr-loader-stage')&&
    !document.querySelector('.hero.is-arriving'),undefined,{timeout:60000});
  check(width+' hero sem link antigo',await page.locator('.hero-bottom a[href="#servicos"]').count()===0);
  const hero=await page.evaluate(()=>{
    const root=document.querySelector('.hero'),
      stage=root.querySelector('.hero-cinema__stage'),
      title=root.querySelector('h1'),
      logo=root.querySelector('.hero-logo-transparent');
    const rect=stage.getBoundingClientRect(),heading=title.getBoundingClientRect();
    return {
      cinema:root.classList.contains('hero--cinema'),
      stage:rect.width>190&&rect.height>310,
      logo:logo.getBoundingClientRect().width>90,
      heading:heading.width>200&&getComputedStyle(title).opacity==='1',
      canBook:root.querySelector('.hero-invitation>.button')?.getAttribute('href')==='agendar.html',
      stageWithin:rect.right<=innerWidth+1,
      localPhoto:root.querySelector('.hero-room img')?.currentSrc.includes('hero-ambiente'),
      intro:root.querySelector('.hero-intro')?.textContent?.includes('Mais que um corte')
    };
  });
  check(width+' novo hero cinematográfico, fotografias locais, CTA e sem overflow',
    hero.cinema&&hero.stage&&hero.logo&&hero.heading&&hero.canBook&&
    hero.stageWithin&&hero.localPhoto&&hero.intro,hero);
  const brand=await page.evaluate(()=>{
    const logo=document.querySelector('.hero-cinema__brand-lockup .hero-wordmark').getBoundingClientRect();
    const left=document.querySelector('.hero-cinema__brand-lockup .hero-pole--left').getBoundingClientRect();
    const right=document.querySelector('.hero-cinema__brand-lockup .hero-pole--right').getBoundingClientRect();
    const h=document.querySelector('.hero h1');
    return {
      centered:Math.abs((logo.left+logo.right)/2-innerWidth/2),
      leftGap:logo.left-left.right,
      rightGap:right.left-logo.right,
      bothInViewport:left.left>=0&&right.right<=innerWidth,
      captionGone:!document.querySelector('.hero-cinema__sequence'),
      h1Overflow:h.scrollWidth-h.clientWidth,
      height:document.querySelector('.hero').getBoundingClientRect().height
    };
  });
  check(width+' logo central e dois postes simétricos sem controles antigos',
    brand.centered<=3&&brand.leftGap>0&&brand.rightGap>0&&
    brand.bothInViewport&&brand.captionGone&&brand.h1Overflow<=2,brand);
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
  // Catalogue is no longer 22 pseudo-buttons pointing to WhatsApp.
  // Each card has native preview and an independent direct consultation link.
  const catalog=page.locator('#produtos .product-catalog');
  await catalog.scrollIntoViewIfNeeded();
  check(width+' 22 produtos e links WhatsApp independentes',
    await catalog.locator('.product-option').count()===22&&
    await catalog.locator('.product-option__preview').count()===22&&
    await catalog.locator('.product-option__consult[href^="https://wa.me/"]').count()===22);
  const search=page.locator('#product-search');
  await search.fill('oleo');
  await page.waitForFunction(()=>[...document.querySelectorAll('#produtos .product-option')]
    .filter(e=>!e.hidden).length===1,undefined,{timeout:3500});
  check(width+' busca ignora acentos e mantém preço real',
    await catalog.locator('.product-option:not([hidden]) strong').textContent()==='Óleo para barba');
  await page.locator('#product-category').selectOption('Barba');
  check(width+' filtro combinado pode produzir estado vazio',
    await page.locator('#product-empty').isHidden());
  await search.fill('não existe este produto');
  await page.waitForFunction(()=>!document.querySelector('#product-empty').hidden,
    undefined,{timeout:3500});
  check(width+' busca sem resultados oferece recuperação',
    await page.locator('#product-reset').isVisible());
  await page.locator('#product-reset').click();
  check(width+' reset restaura 22 itens',
    await catalog.locator('.product-option:not([hidden])').count()===22);
  await page.locator('#product-sort').selectOption('price-desc');
  const first=await catalog.locator('.product-option').first().getAttribute('data-product');
  check(width+' ordenação por preço conserva dados',first==='tonico-de-crescimento',first);
  await page.locator('#product-sort').selectOption('original');
  const balm=catalog.locator('.product-option[data-product="balm-para-barba"] .product-option__preview');
  await balm.click({force:true});
  await page.waitForFunction(()=>document.querySelector('.product-info h3')?.textContent==='Balm para barba',
    undefined,{timeout:4500});
  check(width+' falta de foto tem placeholder e consulta preservada',
    await page.locator('.product-hero__placeholder').count()===1&&
    (await page.locator('.product-info a').getAttribute('href')).includes('wa.me/'));
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
  await page.waitForFunction(()=>{
    const stage=document.querySelector('#equipe .image-stage');
    return document.querySelector('#person-name')?.textContent==='Kauã'&&
      !stage?.hasAttribute('aria-busy')&&stage?.querySelectorAll('img').length===1;
  },undefined,{timeout:6000});
  const choreography=await page.evaluate(()=>{
    const events=window.__teamRailEvents||[];
    const exit=events.findIndex(e=>e.last?.includes('-103%'));
    const rise=events.findIndex(e=>e.first?.includes('105%'));
    return {exit,rise,count:events.length,events:events.slice(-5)};
  });
  check(width+' retrato sai para esquerda e novo sobe, nesta ordem',
    choreography.exit>=0&&choreography.rise>choreography.exit,choreography);
  const positions=await page.locator('#equipe .team-name').evaluateAll(nodes=>
    nodes.map(n=>({top:Math.round(n.offsetTop),
      height:Math.round(n.getBoundingClientRect().height)})));
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
  await page.locator('#equipe .team-name[data-person="4"]').click({force:true});
  await page.locator('#equipe .team-name[data-person="1"]').click({force:true});
  await page.waitForFunction(()=>{
    const stage=document.querySelector('#equipe .image-stage');
    return document.querySelector('#person-name')?.textContent==='Eduardo'&&
      !stage?.hasAttribute('aria-busy')&&stage?.querySelectorAll('img').length===1;
  },undefined,{timeout:6000});
  const afterPositions=await page.locator('#equipe .team-name').evaluateAll(nodes=>
    nodes.map(n=>({top:Math.round(n.offsetTop),
      height:Math.round(n.getBoundingClientRect().height)})));
  check(width+' seleção rápida termina com uma foto e linhas sem pular',
    positions.every((p,i)=>Math.abs(p.height-afterPositions[i].height)<=1&&
      Math.abs(p.top-afterPositions[i].top)<=1),
    {positions,afterPositions});
  check(width+' sem overflow horizontal',
    await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  check(width+' sem erros JS',errors.length===0,errors);
  await context.close();
 }
}finally{await browser.close();}
if(failures.length){console.error('Falhas:',failures);process.exitCode=1}
