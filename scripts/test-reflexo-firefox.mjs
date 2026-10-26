import{Firefox,sleep}from'./lib/firefox-bidi.mjs';import{writeFileSync,mkdirSync}from'node:fs';
const browser=await new Firefox().connect(Number(process.env.FIREFOX_PORT||9241)),checks=[];const dir='docs/reflexo/validation';mkdirSync(dir,{recursive:true});
const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}`)};
const base=process.env.SITE_URL||'http://127.0.0.1:8047/';
const click=async selector=>{await browser.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);await sleep(650);await browser.click(selector);await sleep(650)};
try{
 for(const width of[320,360,375,390,412,430,768,1024,1366,1440]){
  await browser.viewport(width,900);await browser.goto(base);await sleep(1500);
  check(`${width}px: hero e abertura`,await browser.evaluate(()=>!document.querySelector('#sr-loader-stage')&&document.documentElement.scrollWidth<=innerWidth&&!!document.querySelector('.hero-room img')));
  for(const id of['casa','servicos','equipe','trabalhos','produtos','avaliacoes','localizacao','contato']){await browser.evaluate(`document.querySelector('#${id}').scrollIntoView({behavior:'instant'})`);await sleep(60)}
  check(`${width}px: página sem overflow`,await browser.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if([390,1440].includes(width)){await browser.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await browser.screenshot(`${dir}/firefox-${width}.png`)}
 }
 await browser.goto(base+'#servicos');check('Âncora direta',await browser.evaluate(()=>scrollY>100&&!document.querySelector('#sr-loader-stage')));
 await click('[data-ritual="barboterapia"]');check('Espelho Vivo',await browser.evaluate(()=>document.querySelector('#mirror-info h3').textContent==='Barboterapia'));
 await click('[data-person="2"]');check('Painel da equipe',await browser.evaluate(()=>document.querySelector('[data-person="2"]').getAttribute('aria-pressed')==='true'));
 await click('[data-album-mode="wall"]');check('Álbum: parede',await browser.evaluate(()=>document.querySelector('.album-sheets').classList.contains('is-wall')));
 await click('.gallery-shot');check('Lightbox abre',await browser.evaluate(()=>document.querySelector('dialog').open));await browser.key('\uE00C');await sleep(100);check('Lightbox fecha com Escape',await browser.evaluate(()=>!document.querySelector('dialog').open));
 await click('[data-product="oleo-para-barba"]');check('Produtos',await browser.evaluate(()=>document.querySelector('.product-info h3').textContent==='Óleo para barba'));
 await click('#review-pause');check('Pausa depoimentos',await browser.evaluate(()=>document.querySelector('#review-pause').getAttribute('aria-pressed')==='true'));
 await browser.viewport(390,844);await browser.goto(base);await click('.menu summary');check('Menu móvel',await browser.evaluate(()=>document.querySelector('.menu').open));await browser.key('\uE00C');check('Escape menu',await browser.evaluate(()=>!document.querySelector('.menu').open));
 // Firefox's supported fallback: no CSS view timeline required for readable photography.
 check('Fallback fotográfico',await browser.evaluate(()=>getComputedStyle(document.querySelector('.portal-inside')).clipPath==='inset(0px)'||getComputedStyle(document.querySelector('.portal-inside')).clipPath==='none'));
 const errors=browser.events.filter(e=>e.method==='log.entryAdded'&&e.params.type==='javascript'&&e.params.level==='error');check('Sem erros JavaScript',!errors.length,errors);
}catch(error){check('Execução completa',false,error.message)}finally{writeFileSync(`${dir}/firefox.json`,JSON.stringify({date:new Date().toISOString(),checks},null,2));await browser.close();console.log(`RESULTADO ${checks.filter(c=>c.pass).length}/${checks.length}`);if(checks.some(c=>!c.pass))process.exitCode=1}
