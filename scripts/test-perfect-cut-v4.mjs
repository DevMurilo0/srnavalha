import {createRequire} from 'node:module';
import {writeFileSync,mkdirSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const base=process.env.SITE_URL||'http://127.0.0.1:8047/';
const dir='docs/perfect-cut-v4';mkdirSync(dir,{recursive:true});
const results=[],errors=[];
function check(name,pass,detail){results.push({name,pass:!!pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}`)}
async function pageAt(width=390,options={}){const p=await browser.newPage({viewport:{width,height:844},...options});p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());return p}
const load=p=>p.goto(base,{waitUntil:'domcontentloaded'});
const done=p=>p.waitForFunction(()=>!document.documentElement.classList.contains('sr-loader-boot'));
try {
for(const width of (process.env.FUNCTIONAL_ONLY?[]:[320,390,430,768,1440])){
 const p=await pageAt(width);await load(p);
 await p.waitForSelector('.snv2-run');
 check(`${width}: duas tesouras no DOM, nenhum skip`,await p.locator('.snv2-scissors').count()===2&&await p.locator('#sr-opening-skip').count()===0);
 await p.waitForTimeout(1100);await p.screenshot({path:`${dir}/loading-${width}.png`});
 await p.waitForSelector('.snv2-cut-ready');
 check(`${width}: progresso conclui 100%`,await p.locator('#sr-loader-percent').textContent()==='100%');
 const sample=await p.waitForFunction(()=>{
  const carrier=document.querySelector('.snv2-cut-flight'),seam=document.querySelector('.snv2-seam'),track=document.querySelector('.snv2-track');
  if(!carrier||!seam||!track)return false;
  const tip=new DOMMatrix(getComputedStyle(carrier).transform).m42;
  if(tip<innerHeight*.2||tip>innerHeight*.9||getComputedStyle(track).opacity!=='0')return false;
  const end=seam.getBoundingClientRect().bottom;
  const polygons=[...document.querySelectorAll('.snv2-panel')].map(e=>getComputedStyle(e).transform);
  const edges=polygons.map(t=>{const m=new DOMMatrix(t);return Math.abs(m.e+m.c*tip)});
  return {tip,end,delta:Math.abs(tip-end),edges,panels:polygons,trackOpacity:getComputedStyle(track).opacity,
   trackX:track.getBoundingClientRect().x,expectedTrackX:(innerWidth-track.offsetWidth)/2,
   overflow:document.documentElement.scrollWidth-innerWidth,heroOpacity:getComputedStyle(document.querySelector('.hero-composition')).opacity};
 });
 const geometry=await sample.jsonValue();
 check(`${width}: lâmina/linha alinhadas e hero aparece durante corte`,geometry.delta<1&&geometry.edges.every(e=>e<.1)&&geometry.tip>0&&geometry.tip<844&&geometry.panels.length===2&&geometry.trackOpacity==='0'&&Math.abs(geometry.trackX-geometry.expectedTrackX)<1&&geometry.heroOpacity>0,geometry);
 await p.screenshot({path:`${dir}/cut-${width}.png`});
 await p.waitForTimeout(520);await p.screenshot({path:`${dir}/opening-${width}.png`});
 await done(p);
 await p.waitForFunction(()=>!document.querySelector('.hero.is-arriving'));
 check(`${width}: limpeza, hero e largura`,await p.evaluate(()=>!document.querySelector('.snv2-logo-flight')&&getComputedStyle(document.querySelector('.hero-logo-transparent')).visibility==='visible'&&document.documentElement.scrollWidth<=innerWidth&&getComputedStyle(document.querySelector('h1')).opacity==='1'));
 await p.screenshot({path:`${dir}/hero-${width}.png`});await p.close();
}
if(!process.env.VISUAL_ONLY){
for(const action of ['click','keyboard','wheel','touch','rotation','reduce']){
 const p=await pageAt(390,{hasTouch:true,isMobile:true});await load(p);await p.waitForSelector('.snv2-cut-ready');
 if(action==='click')await p.mouse.click(12,300);
 if(action==='keyboard')await p.keyboard.press('Tab');
 if(action==='wheel')await p.mouse.wheel(0,550);
 if(action==='touch')await p.touchscreen.tap(15,320);
 if(action==='rotation')await p.setViewportSize({width:844,height:390});
 if(action==='reduce')await p.emulateMedia({reducedMotion:'reduce'});
 await done(p);check(`Interrupção ${action}`,await p.locator('.snv2-cut-flight,.snv2-logo-flight,#sr-loader-stage').count()===0);await p.close();
}
const landing=await pageAt();await load(landing);await landing.waitForSelector('.snv2-logo-flight');
const handoff=await landing.evaluate(()=>{
 const f=document.querySelector('.snv2-logo-flight'),t=document.querySelector('.hero-wordmark .hero-logo-transparent');
 for(const a of f.getAnimations()){a.pause();a.currentTime=a.effect.getComputedTiming().endTime}
 const x=f.getBoundingClientRect(),y=t.getBoundingClientRect();
 const error=Math.max(...['left','top','width','height'].map(k=>Math.abs(x[k]-y[k])));
 window.__finishRitual();return {error,effects:t.getAnimations().length,visible:getComputedStyle(t).visibility};
});
check('Logo: chegada proporcional e cancelamento no handoff',handoff.error<.1&&handoff.effects===0&&handoff.visible==='visible',handoff);await landing.close();
const p=await pageAt();await load(p);await done(p);await p.reload({waitUntil:'domcontentloaded'});check('F5 reinicia',await p.locator('.snv2-loader').count()===1);await p.keyboard.press('Escape');await done(p);
const cdp=await p.context().newCDPSession(p);await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await p.reload({waitUntil:'domcontentloaded'});check('Refresh sem cache reinicia',await p.locator('.snv2-loader').count()===1);await p.keyboard.press('Escape');await done(p);
await p.locator('.hero .button').click();await p.waitForURL('**/agendar.html');check('Agendamento local abre',await p.locator('h1').count()===1);await p.goBack({waitUntil:'domcontentloaded'});await done(p);check('Histórico libera homepage',await p.locator('.hero-logo-transparent').isVisible());await p.close();
for(const hash of ['#servicos','#equipe']){const p=await pageAt();await p.goto(base+hash,{waitUntil:'domcontentloaded'});await done(p);check(`Âncora ${hash}`,await p.locator(hash).count()===1);await p.close()}
for(const fail of ['**/assets/images/v8/logo-640.webp','**/js/ritual/opening.js']){const p=await pageAt();await p.route(fail,r=>r.abort());await load(p);await done(p);check(`Falha ${fail}`,await p.locator('#sr-loader-stage').count()===0&&await p.locator('h1').isVisible());await p.close()}
// Fault injection: an exception in a delayed FLIP callback must NOT freeze
// the full-screen loader until its watchdog fires.
const brokenFlight=await pageAt();
await brokenFlight.addInitScript(()=>{
 window.__openingEvents=[];
 document.addEventListener('openingend',event=>window.__openingEvents.push(event.detail));
 const clone=SVGElement.prototype.cloneNode;
 SVGElement.prototype.cloneNode=function(...args){
  if(this.classList?.contains('hero-logo-transparent')) throw Error('TEST: voo da marca falhou');
  return clone.apply(this,args);
 };
});
await load(brokenFlight);
// The fault occurs in the SAME task as snv2-cut-ready; the class disappears
// before Playwright can observe it. Wait for the durable completion event.
await brokenFlight.waitForFunction(()=>window.__openingEvents?.length>0);
await done(brokenFlight);
check('Falha interna do FLIP libera o hero sem travar',
 await brokenFlight.evaluate(()=>!document.querySelector('#sr-loader-stage')&&
  getComputedStyle(document.querySelector('.hero-logo-transparent')).visibility==='visible'&&
  !document.querySelector('.hero.is-arriving')&&
  window.__openingEvents.length===1&&window.__openingEvents[0].completed===false));
await brokenFlight.close();

// A touch/click during the overlay must never activate the booking CTA
// underneath it in the same gesture.
const covered=await pageAt(390);
await load(covered);
await covered.evaluate(()=>{
 window.__clickedBehindLoader=false;
 document.querySelector('.sr-booking-fixed')?.addEventListener('click',()=>{
   window.__clickedBehindLoader=true;
 });
});
const buttonRect=await covered.locator('.sr-booking-fixed').boundingBox();
if(buttonRect){
 await covered.mouse.click(buttonRect.x+buttonRect.width/2,buttonRect.y+buttonRect.height/2);
 await done(covered);
 check('Clique durante loader não aciona agendamento por trás',
  await covered.evaluate(()=>!window.__clickedBehindLoader&&location.pathname.endsWith('/')||
    !window.__clickedBehindLoader&&location.pathname.endsWith('/index.html')));
}else check('Clique durante loader não aciona agendamento por trás',false,'CTA não localizado');
await covered.close();

const reduced=await pageAt(390,{reducedMotion:'reduce'});await load(reduced);await done(reduced);check('Reduced motion inicial',await reduced.locator('#sr-loader-stage').count()===0);await reduced.close();
}
check('Sem exceções JavaScript',errors.length===0,errors);
} catch(e){check('Execução',false,e.stack)}
writeFileSync(`${dir}/${process.env.FUNCTIONAL_ONLY?'functional':'visual'}-results.json`,JSON.stringify(results,null,2));await browser.close();if(results.some(r=>!r.pass))process.exitCode=1;
