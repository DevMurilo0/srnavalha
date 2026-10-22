// Development verification only. Run the static server and Firefox as described in docs/TESTES_V6.md.
import { Firefox, sleep } from './v6-browser.mjs';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
const base = process.env.SR_V6_URL || 'http://127.0.0.1:8016/';
const integrated = !base.includes('.v6-stage');
const out = integrated ? 'capturas/v6/integrada' : 'capturas/v6/depois';
const reportPath = integrated ? 'docs/V6_TESTES_INTEGRADA.json' : 'docs/V6_TESTES_NAVEGADOR.json';
mkdirSync(out, { recursive: true });
const bookingOnly = process.argv.includes('--booking-only');
const report = bookingOnly ? JSON.parse(readFileSync(reportPath,'utf8')) : { date: new Date().toISOString(), browser: 'Firefox WebDriver BiDi, native HTTP', base, viewports: [], interactions: [], limitations: [] };
if (bookingOnly) { report.testHarnessErrorCorrected = report.fatal; delete report.fatal; }
const browser = await new Firefox().connect();
const check = (name, pass, detail = null) => { report.interactions.push({ name, pass: !!pass, detail }); if (!pass) console.error('FAIL', name, detail); };
try {
  for (const width of bookingOnly ? [] : [320, 375, 390, 768, 1024, 1366, 1440]) {
    await browser.viewport(width);
    await browser.goto(base + 'index.html');
    await browser.evaluate(() => document.fonts.ready.then(() => window.scrollTo({ top: 0, behavior: 'instant' })));
    await sleep(800);
    await browser.screenshot(`${out}/hero-${width}.png`);
    for (const section of ['servicos','espaco','trabalhos','avaliacoes','localizacao','duvidas']) {
      await browser.evaluate(`document.getElementById('${section}').scrollIntoView({behavior:'instant',block:'start'})`);
      await sleep(170);
    }
    await sleep(750);
    report.viewports.push(await browser.evaluate(() => ({ width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, font: document.fonts.check('500 18px Manrope'), broken: [...document.images].filter(img => img.complete && !img.naturalWidth).map(img => img.currentSrc), pendingImages: [...document.images].filter(img => !img.complete).map(img => img.src), photoSizes: [...document.querySelectorAll('.hero-frame img,.room-mat img,.team-record img,.viewer-photo img')].map(img => ({ src: img.currentSrc, natural: img.naturalWidth, rendered: Math.round(img.getBoundingClientRect().width) })) })));
    for (const id of ['barba','acabamento']) {
      await browser.click(`[data-service="${id}"] summary`);
      await sleep(140);
      const state = await browser.evaluate(`(()=>{const e=document.querySelector('[data-service="${id}"]');const i=e.querySelector('img');return {open:e.open,animations:i.getAnimations().map(a=>({state:a.playState,progress:a.effect.getComputedTiming().progress})),clip:getComputedStyle(i).clipPath}})()`);
      check(`${width}px ${id}: máscara em andamento`, state.open && state.animations.some(a => a.progress > 0 && a.progress < 1), state);
      if ([390,1440].includes(width)) await browser.screenshot(`${out}/servico-${id}-movimento-${width}.png`);
      await sleep(650);
      check(`${width}px ${id}: revelação completa`, await browser.evaluate(`(()=>{const i=document.querySelector('[data-service="${id}"] img');return getComputedStyle(i).clipPath==='none'&&i.getAnimations().length===0})()`));
    }
    await browser.click('[data-service="corte"] summary'); await sleep(250);
    await browser.click('[data-service="corte"] summary'); await sleep(120);
    check(`${width}px corte: máscara em andamento`, await browser.evaluate(() => document.querySelector('[data-service="corte"] img').getAnimations().some(a => a.effect.getComputedTiming().progress > 0 && a.effect.getComputedTiming().progress < 1)));
    if ([390,1440].includes(width)) await browser.screenshot(`${out}/servico-corte-movimento-${width}.png`);
    await sleep(700);
    await browser.click('[data-work]:nth-child(2)'); await sleep(340);
    check(`${width}px portfólio seleciona`, await browser.evaluate(() => document.querySelector('.viewer-title').textContent === 'Textura'));
    await browser.click('.viewer-photo'); await sleep(260);
    check(`${width}px lightbox abre`, await browser.evaluate(() => document.querySelector('.lightbox').open));
    await browser.key('\uE014'); // ArrowRight
    check(`${width}px teclado navega no lightbox`, await browser.evaluate(() => document.querySelector('.lightbox-counter').textContent === '3 de 5'));
    await browser.key('\uE00C'); // Escape
    check(`${width}px Escape e foco`, await browser.evaluate(() => !document.querySelector('.lightbox').open && document.activeElement.matches('.viewer-photo') && !document.body.classList.contains('modal-open')));
    if ([390,768,1440].includes(width)) {
      for (const [section,filename] of [['espaco','ambiente'],['trabalhos','portfolio'],['localizacao','mapa'],['duvidas','encerramento']]) {
        await browser.evaluate(`document.getElementById('${section}').scrollIntoView({behavior:'instant',block:'start'})`);
        await sleep(section === 'localizacao' ? 1800 : 750);
        await browser.screenshot(`${out}/${filename}-${width}.png`);
      }
      await browser.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await browser.screenshot(`${out}/home-${width}.png`, true);
    }
    if (width === 390) {
      await browser.click('.mobile-menu summary');
      check('Menu móvel abre', await browser.evaluate(() => document.querySelector('.mobile-menu').open));
      await browser.key('\uE00C');
      check('Menu móvel Escape e foco', await browser.evaluate(() => !document.querySelector('.mobile-menu').open && document.activeElement.matches('.mobile-menu summary')));
    }
  }
  if (!bookingOnly) {
  await browser.viewport(1440);
  await browser.goto(base + 'index.html#avaliacoes');
  await browser.send('input.performActions', {context:browser.context,actions:[{type:'pointer',id:'mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',x:20,y:20}]}]});
  await browser.evaluate(()=>{document.activeElement.blur();document.querySelector('.reviews-viewport').scrollIntoView({block:'center',behavior:'instant'});});
  await sleep(350);
  const scrollStart = await browser.evaluate(() => document.querySelector('.reviews-viewport').scrollLeft);
  await sleep(1400);
  const scrollEnd = await browser.evaluate(() => document.querySelector('.reviews-viewport').scrollLeft);
  const measuredSpeed = (scrollEnd-scrollStart)/1.4;
  check('Esteira: movimento automático direita para esquerda a aproximadamente 30 px/s', measuredSpeed>25&&measuredSpeed<35, { scrollStart, scrollEnd, measuredPxPerSecond: measuredSpeed });
  await browser.click('.marquee-control'); await sleep(900);
  const pausedStart = await browser.evaluate(() => document.querySelector('.reviews-viewport').scrollLeft);
  await sleep(350);
  const pausedEnd = await browser.evaluate(() => document.querySelector('.reviews-viewport').scrollLeft);
  check('Esteira: pausa', Math.abs(pausedEnd-pausedStart)<2);
  check('Esteira: clones inacessíveis e quatro avaliações originais', await browser.evaluate(() => document.querySelector('[data-review-clone]').inert && document.querySelector('[data-review-clone]').getAttribute('aria-hidden') === 'true' && document.querySelector('.reviews-group').children.length===4));
  await browser.click('.marquee-control'); await sleep(550);
  check('Esteira: retoma', await browser.evaluate(`document.querySelector('.reviews-viewport').scrollLeft>${pausedEnd}`));
  }
  for (const width of [320,375,390,768,1024,1366,1440]) {
    await browser.viewport(width);
    await browser.goto(base + 'agendar.html?servico=Barba');
    await browser.evaluate(() => document.fonts.ready);
    const dimensions = await browser.evaluate(() => ({width:innerWidth,overflow:document.documentElement.scrollWidth > document.documentElement.clientWidth,service:document.querySelector('[name=servico]:checked').value}));
    check(`${width}px agendamento responsivo e preferência`, !dimensions.overflow && dimensions.service==='Barba', dimensions);
    await browser.click('.booking-submit');
    check(`${width}px validação e foco`, await browser.evaluate(() => !document.querySelector('#form-error').hidden && document.activeElement.name === 'dia'));
    // Intercept link activation: test message generation without contacting WhatsApp.
    await browser.evaluate(() => {
      document.addEventListener('click', event => { const anchor=event.target.closest('a[href^="https://wa.me/"]'); if(anchor){event.preventDefault();window.__whatsapp=anchor.href;} },true);
      const form=document.querySelector('form');form.elements.nome.value='João & Ana';form.elements.dia.value='2026-12-20';form.elements.horario.value='14:35';
    });
    await browser.click('.booking-submit');
    const result = await browser.evaluate(() => { const url=new URL(window.__whatsapp);return {phone:url.pathname,message:url.searchParams.get('text'),feedback:document.querySelector('#booking-feedback').textContent}; });
    check(`${width}px mensagem WhatsApp codificada`, result.phone==='/5581995722396' && result.message.includes('João & Ana') && result.message.includes('Serviço: Barba') && result.message.includes('20/12/2026') && result.message.includes('14:35') && result.message.includes('confirmar a disponibilidade'),result);
    if ([390,768,1440].includes(width)) {
      await browser.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
      await sleep(100);
      await browser.screenshot(`${out}/agendamento-${width}.png`, true);
    }
  }
  report.console = browser.events.filter(event => event.method==='log.entryAdded').map(event=>event.params).filter(entry=>entry.level==='error');
} catch (error) { report.fatal = error.stack; console.error(error.stack); process.exitCode=1; }
finally { await browser.close(); writeFileSync(reportPath, JSON.stringify(report,null,2)); }
const failures = report.interactions.filter(result=>!result.pass);
console.log(JSON.stringify({viewports:report.viewports.length,checks:report.interactions.length,failures,console:report.console,fatal:report.fatal},null,2));
if (failures.length || report.viewports.some(result=>result.overflow||result.broken.length||!result.font)) process.exitCode=1;
