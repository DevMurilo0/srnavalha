// Real-browser acceptance of the height-aware hero and interrupted choreography.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core'),{AxeBuilder}=require('@axe-core/playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const base=process.env.SITE_URL||'http://127.0.0.1:8047',dir=process.env.HERO_EVIDENCE||'/tmp/srnavalha-hero/final';mkdirSync(dir,{recursive:true});
const checks=[],errors=[];const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});console.log(pass?'PASS':'FAIL',name,pass?'':JSON.stringify(detail))};
async function page(options={}){const context=await browser.newContext({viewport:{width:900,height:550},...options});const p=await context.newPage();await p.route('https://**/*',r=>r.abort());p.on('pageerror',e=>errors.push(e.message));return p}
const ready=p=>p.waitForFunction(()=>!document.querySelector('#sr-loader-stage')&&!document.querySelector('.hero.is-arriving')&&!document.documentElement.classList.contains('sr-hero-queued'));
try{
 for(const [width,height] of [[320,568],[390,844],[430,932],[768,1024],[900,550],[1024,600],[1366,768],[1440,900]]){
  const p=await page({viewport:{width,height}});await p.goto(base,{waitUntil:'domcontentloaded'});await ready(p);await p.evaluate(()=>document.fonts.ready);
  const geometry=await p.evaluate(()=>{
   const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();
   const lines=[...document.querySelectorAll('h1 .title-mask>span')].map(n=>{const r=document.createRange();r.selectNodeContents(n);return r.getBoundingClientRect().toJSON()});
   const rotor=document.querySelector('.hero-pole__rotor').getAnimations()[0];
   return {logo:box('.hero-logo-transparent'),poles:[...document.querySelectorAll('.hero-pole')].map(n=>n.getBoundingClientRect().toJSON()),cta:box('.hero-cta'),label:box('.hero-wordmark>span'),writing:getComputedStyle(document.querySelector('.hero-wordmark>span')).writingMode,lines,overflow:document.documentElement.scrollWidth-innerWidth,fixed:document.querySelector('.sr-booking-fixed').hidden,rotor:rotor?.playState};
  });
  check(`${width}×${height}: logo e postes simétricos`,Math.abs(geometry.logo.x+geometry.logo.width/2-width/2)<1&&Math.abs(geometry.poles[0].x+geometry.poles[1].right-width)<1,geometry);
  check(`${width}×${height}: título e CTA dentro da primeira tela`,geometry.cta.bottom<=height&&geometry.lines.every(r=>r.left>=19&&r.right<=width-19&&r.top>geometry.label.bottom)&&geometry.overflow===0,geometry);
  check(`${width}×${height}: local horizontal, rotor ativo e flutuante oculto`,geometry.writing==='horizontal-tb'&&geometry.label.height<20&&geometry.rotor==='running'&&geometry.fixed,geometry);
  await p.screenshot({path:`${dir}/hero-${width}x${height}.png`});
  await p.locator('#casa').evaluate(n=>n.scrollIntoView({behavior:'instant'}));await p.waitForTimeout(300);
  check(`${width}: flutuante aparece após o hero`,await p.locator('.sr-booking-fixed').isVisible());
  await p.locator('#inicio').evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(100);
  check(`${width}: retorno oculta flutuante e retira do teclado`,await p.locator('.sr-booking-fixed').evaluate(n=>n.hidden));
  const effect=await p.evaluate(async()=>{const{revealText}=await import('/js/ritual/text-motion.js');const h=document.querySelector('h1'),text=h.innerHTML,r=h.getBoundingClientRect();const e=revealText(h,'lightcut',{manual:true});const during=h.getBoundingClientRect();const groups=h.querySelectorAll('[aria-hidden=true]').length;e.cancel();return{same:text===h.innerHTML,groups,delta:Math.abs(r.height-during.height)+Math.abs(r.width-during.width)}});
  check(`${width}: máscaras preservam texto e geometria`,effect.same&&effect.groups===6&&effect.delta<.1,effect);
  if(width===900){
   const axe=await new AxeBuilder({page:p}).include('#inicio').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check('Axe hero',axe.violations.length===0,axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
   await p.locator('.hero-cta').focus();check('Foco por teclado visível',await p.locator('.hero-cta').evaluate(n=>getComputedStyle(n).outlineStyle==='solid'));
   await p.keyboard.press('Enter');await p.waitForURL('**/agendar.html');check('CTA abre agendamento',await p.locator('.bk-wizard').isVisible());
   await p.goBack({waitUntil:'domcontentloaded'});await ready(p);check('Histórico retorna ao estado íntegro',await p.locator('h1').isVisible());
  }
  await p.context().close();
 }
 for(const action of ['wheel','keyboard','resize-height','resize-width','reduce','pagehide']){
  const p=await page();await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.querySelector('.hero.is-arriving'));
  if(action==='wheel')await p.mouse.wheel(0,80);
  if(action==='keyboard')await p.keyboard.press('Tab');
  if(action==='resize-height')await p.setViewportSize({width:900,height:600});
  if(action==='resize-width')await p.setViewportSize({width:1024,height:600});
  if(action==='reduce')await p.emulateMedia({reducedMotion:'reduce'});
  if(action==='pagehide')await p.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  await ready(p);check(`Interrupção ${action}: sem máscaras ou estados pendentes`,await p.evaluate(()=>!document.querySelector('.cm-cut-window')&&!document.querySelector('.hero.is-arriving')&&getComputedStyle(document.querySelector('h1')).opacity==='1'));await p.context().close();
 }
 for(const mode of ['reduce','no-js']){
  const p=await page(mode==='reduce'?{reducedMotion:'reduce'}:{javaScriptEnabled:false});await p.goto(base,{waitUntil:'domcontentloaded'});
  check(`${mode}: leitura e CTA disponíveis`,await p.locator('h1').isVisible()&&await p.locator('.hero-cta').isVisible()&&await p.locator('.hero-cta').getAttribute('href')==='agendar.html');
  if(mode==='reduce')check('Movimento reduzido: sem animações do hero',await p.locator('.hero').evaluate(n=>n.getAnimations({subtree:true}).length===0));await p.context().close();
 }
 check('Nenhum erro JavaScript',errors.length===0,errors);
}finally{writeFileSync(`${dir}/results.json`,JSON.stringify({checks,errors},null,2));await browser.close()}
if(checks.some(c=>!c.pass))process.exitCode=1;
