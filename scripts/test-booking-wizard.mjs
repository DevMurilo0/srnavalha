import {createRequire} from 'node:module';import {writeFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');const {chromium}=require('playwright-core');
const {AxeBuilder}=require('@axe-core/playwright');
const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const base=process.env.SITE_URL||'http://127.0.0.1:8047';const results=[],errors=[];
const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}`)};
const context=await b.newContext();await context.route('https://**/*',r=>r.abort());const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
const current=()=>p.locator('.bk-step:not([hidden])').getAttribute('id');
async function next(){await p.locator('#bk-next').click()}
try{
for(const width of [320,360,390,430,768,1440]){
 await p.setViewportSize({width,height:800});await p.goto(base+'/agendar.html',{waitUntil:'domcontentloaded'});await p.waitForSelector('.bk-wizard');
 check(`${width}: próximo dentro da viewport`,await p.locator('#bk-next').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));
 check(`${width}: etapa única e largura`,await p.locator('.bk-step:visible').count()===1&&await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.screenshot({path:`docs/booking-v5/service-${width}.png`});
 await next();check(`${width}: exige serviço`,await current()==='bk-step-0'&&await p.locator('#bk-step-error').textContent()!=='');
 await p.locator('.bk-service').first().click();await next();
 check(`${width}: profissional e foco`,await current()==='bk-step-1'&&await p.evaluate(()=>document.activeElement.id==='bk-prof-title'));
 await p.screenshot({path:`docs/booking-v5/team-${width}.png`});
 await next();check(`${width}: sem preferência válido`,await current()==='bk-step-2');await next();check(`${width}: exige horário`,await current()==='bk-step-2');
 await p.locator('#bk-date').fill('2000-01-01');await p.locator('#bk-date').dispatchEvent('change');await next();check(`${width}: data inválida rejeitada`,await current()==='bk-step-2'&&await p.locator('.bk-slot').count()===0);
 const date=await p.locator('#bk-date').getAttribute('min');const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);if(d.getUTCDay()===0)d.setUTCDate(d.getUTCDate()+1);
 await p.locator('#bk-date').fill(d.toISOString().slice(0,10));await p.locator('#bk-date').dispatchEvent('change');await p.locator('.bk-slot').first().click();const chosen=await p.locator('#bk-recap-date').textContent();await next();
 check(`${width}: dados e resumo`,await current()==='bk-step-3'&&await p.locator('.bk-summary:visible').count()===1);
 await p.screenshot({path:`docs/booking-v5/data-${width}.png`});
 await p.locator('#bk-back').click();check(`${width}: volta preserva horário`,await p.locator('.bk-slot[aria-pressed=true]').count()===1);await next();check(`${width}: avanço preserva resumo`,await p.locator('#bk-recap-date').textContent()===chosen);
 await p.locator('#bk-submit').click();check(`${width}: valida nome e foco`,await p.locator('#bk-name').getAttribute('aria-invalid')==='true'&&await p.evaluate(()=>document.activeElement.id==='bk-name'));
 await p.locator('#bk-name').fill('Teste local');await p.locator('#bk-phone').fill('123');await p.locator('#bk-submit').click();check(`${width}: valida telefone`,await p.locator('#bk-phone').getAttribute('aria-invalid')==='true');
 await p.locator('#bk-phone').fill('81999999999');await p.locator('#bk-consent').check();await p.locator('#bk-submit').click();await p.waitForSelector('#bk-success:visible');
 check(`${width}: gravação local`,await p.locator('.bk-saved-row').count()===1);await p.locator('.bk-saved-row button').click();check(`${width}: exclusão local`,await p.locator('.bk-saved-row').count()===0);
}
await p.setViewportSize({width:390,height:800});await p.goto(base+'/agendar.html?servico=cortee&profissional=damiao',{waitUntil:'domcontentloaded'});await p.waitForSelector('.bk-wizard');check('Pré-seleção de profissional',await p.locator('.bk-prof[aria-pressed=true]').textContent()==='Damião');check('Pré-seleção do serviço',await p.locator('.bk-service[data-id=cortee]').getAttribute('aria-pressed')==='true');
await p.emulateMedia({reducedMotion:'reduce'});await next();check('Movimento reduzido',await p.locator('.bk-step:visible').evaluate(e=>e.getAnimations().length===0));
const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check('Axe agendamento',!axe.violations.length,axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
await p.emulateMedia({reducedMotion:'no-preference'});
for(const width of [320,390,1440]){
 await p.setViewportSize({width,height:800});await p.goto(base+'/',{waitUntil:'domcontentloaded'});await p.waitForSelector('.snv2-run');
 check(`${width}: botão sob loader e placa única`,!await p.locator('.sr-booking-fixed').isVisible()&&await p.locator('.snv5-sign').count()===1);
 await p.waitForTimeout(1300);await p.screenshot({path:`docs/booking-v5/sign-${width}.png`});await p.waitForFunction(()=>!document.querySelector('#sr-loader-stage'));
 await p.locator('#casa').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await p.waitForTimeout(250);check(`${width}: CTA fixo único`,await p.locator('.sr-booking-fixed:visible').count()===1);await p.screenshot({path:`docs/booking-v5/cta-${width}.png`});
 await p.locator('footer').evaluate(e=>e.scrollIntoView());await p.waitForTimeout(200);check(`${width}: CTA libera rodapé`,!await p.locator('.sr-booking-fixed').isVisible());
 await p.locator('#casa').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await p.waitForTimeout(250);await p.locator('.sr-booking-fixed').click();await p.waitForURL('**/agendar.html');check(`${width}: CTA abre agenda sem flutuante`,await p.locator('.sr-booking-fixed,.bk-mobile-direct').count()===0);
}
check('Sem exceções',!errors.length,errors);
}catch(e){check('Execução completa',false,e.stack)}finally{writeFileSync('docs/booking-v5/results.json',JSON.stringify(results,null,2));await b.close()}
if(results.some(r=>!r.pass))process.exitCode=1;
