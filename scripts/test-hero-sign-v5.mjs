import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || '/tmp/srnavalha-validation/package.json');
const { chromium } = require('playwright-core');
const { AxeBuilder } = require('@axe-core/playwright');
const browser = await chromium.launch({ headless:true, executablePath:process.env.CHROME_PATH || '/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome' });
const base = process.env.SITE_URL || 'http://127.0.0.1:8047';
const dir = 'docs/hero-sign-v5'; mkdirSync(dir,{recursive:true});
const checks=[],errors=[];
const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});console.log(pass?'PASS':'FAIL',name)};
async function page(options={}) {
  const context=await browser.newContext({viewport:{width:1440,height:900},...options});
  const p=await context.newPage();
  await p.route('https://**/*',r=>r.abort());p.on('pageerror',e=>errors.push(e.message));return p;
}
try {
  const p=await page({reducedMotion:'reduce'});
  for(const width of [320,375,390,430,768,1024,1440]) {
    await p.setViewportSize({width,height:900});await p.goto(base,{waitUntil:'domcontentloaded'});await p.evaluate(()=>document.fonts.ready);
    const geometry=await p.evaluate(()=>{
      const face=document.querySelector('.hero-sign__face'),r=face.getBoundingClientRect();
      const overlaps=[...document.querySelectorAll('.hero-wordmark,.hero h1,.hero-intro,.hero figure,.hero .button')].filter(e=>{
        const b=e.getBoundingClientRect();return b.width&&b.height&&r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;
      }).map(e=>e.className||e.tagName);
      return {overlaps,inside:r.left>=0&&r.right<=innerWidth&&r.top>=document.querySelector('.hero').getBoundingClientRect().top,
        overflow:document.documentElement.scrollWidth>innerWidth,
        textFits:[...face.querySelectorAll('.hero-sign__lettering>*')].every(e=>e.scrollWidth<=e.clientWidth),
        animations:face.getAnimations().length,height:document.querySelector('.hero').getBoundingClientRect().height};
    });
    check(`${width}: objeto sem sobreposição, corte ou overflow`,!geometry.overlaps.length&&geometry.inside&&!geometry.overflow,geometry);
    check(`${width}: inscrições cabem e movimento reduzido estático`,geometry.textFits&&geometry.animations===0);
    check(`${width}: uma placa no hero, sem cartão e sem letreiro no loader`,await p.locator('.hero-sign').count()===1&&await p.locator('.hero-atelier-emblem,.snv2-signature').count()===0);
    await p.screenshot({path:`${dir}/hero-${width}.png`,fullPage:false});
  }
  const axe=await new AxeBuilder({page:p}).include('.hero-sign').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  check('Axe: sem violações no letreiro',!axe.violations.length,axe.violations);
  await p.close();
  const motion=await page();
  await motion.addInitScript(()=>{document.addEventListener('openingend',()=>queueMicrotask(()=>{
    window.signAtOpeningEnd={opacity:getComputedStyle(document.querySelector('.hero-sign__face')).opacity,
      loader:!!document.querySelector('#sr-loader-stage')};
  }))});
  await motion.goto(base,{waitUntil:'domcontentloaded'});await motion.waitForSelector('.snv2-run');
  check('Letreiro invisível durante carregamento',await motion.locator('.hero-sign__face').evaluate(e=>getComputedStyle(e).opacity==='0'));
  await motion.waitForSelector('.snv2-cut-ready');
  check('Letreiro aguarda o término do corte',await motion.locator('.hero-sign__face').evaluate(e=>getComputedStyle(e).opacity==='0'&&e.getAnimations().length===0));
  await motion.waitForFunction(()=>window.signAtOpeningEnd);
  check('Entrada começa depois da remoção do loader',await motion.evaluate(()=>!window.signAtOpeningEnd.loader&&window.signAtOpeningEnd.opacity==='0'));
  const frames=await motion.locator('.hero-sign__face').evaluate(e=>{
    const a=e.getAnimations()[0];if(!a)return null;
    a.pause();a.currentTime=420;
    return {duration:a.effect.getTiming().duration,iterations:a.effect.getTiming().iterations,
      frames:a.effect.getKeyframes().map(({opacity,transform})=>({opacity,transform})),opacity:getComputedStyle(e).opacity};
  });
  check('Uma entrada finita com rotação 3D e opacidade',frames?.duration===1050&&frames?.iterations===1&&Number(frames?.opacity)>0&&Number(frames?.opacity)<1,frames);
  await motion.screenshot({path:`${dir}/entrance.png`});
  await motion.locator('.hero-sign__face').evaluate(async e=>{const a=e.getAnimations()[0];a.play();await a.finished});
  check('Fim estável, sem loop ou efeito retido',await motion.locator('.hero-sign__face').evaluate(e=>e.getAnimations().length===0&&getComputedStyle(e).opacity==='1'));
  await motion.reload({waitUntil:'domcontentloaded'});await motion.waitForSelector('.snv2-run');await motion.keyboard.press('Escape');
  await motion.emulateMedia({reducedMotion:'reduce'});
  check('Preferência reduzida dinâmica cancela a entrada',await motion.locator('.hero-sign__face').evaluate(e=>e.getAnimations().length===0&&getComputedStyle(e).opacity==='1'));
  await motion.emulateMedia({reducedMotion:'no-preference'});await motion.reload({waitUntil:'domcontentloaded'});await motion.waitForSelector('.snv2-run');await motion.keyboard.press('Escape');
  const hidden=await motion.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));
    const face=document.querySelector('.hero-sign__face');const stopped=face.getAnimations().length===0;
    delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));return stopped&&face.getAnimations().length===0;
  });
  check('Ciclo de aba oculta cancela sem reiniciar',hidden);
  await motion.close();
  for(const mode of ['no-js','opening-failure']){
    const fallback=await page({javaScriptEnabled:mode!=='no-js'});
    if(mode==='opening-failure')await fallback.route('**/js/ritual/opening.js',r=>r.abort());
    await fallback.goto(base,{waitUntil:'domcontentloaded'});
    await fallback.waitForFunction(()=>!document.documentElement.classList.contains('sr-loader-boot'));
    check(`${mode}: placa e CTA acessíveis`,await fallback.locator('.hero-sign__face').evaluate(e=>getComputedStyle(e).opacity==='1')&&await fallback.locator('.hero .button').isVisible());await fallback.close();
  }
  check('Sem exceções JavaScript',!errors.length,errors);
} catch(e){check('Execução',false,e.stack)}
finally {writeFileSync(`${dir}/results.json`,JSON.stringify(checks,null,2));await browser.close()}
if(checks.some(c=>!c.pass))process.exitCode=1;
