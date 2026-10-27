// Regression tests: "The Perfect Cut" integrated with the real Sr. Navalha.
// Run: node scripts/test-reflexo-static.mjs
import assert from 'node:assert/strict';
import { readFileSync as read } from 'node:fs';
import { execFileSync } from 'node:child_process';
const file = path => read(path,'utf8');
const html = file('index.html');
for (const name of [
  'head','loader','inicio','casa','servicos','equipe','trabalhos',
  'produtos','avaliacoes','localizacao','footer'
]) assert.ok(html.includes(file('templates/v17/'+name+'.html').trim()),
  name+': template sincronizado');

execFileSync(process.execPath,['scripts/render-site.mjs']);
assert.equal(file('index.html'),html,'render do HTML idempotente');
assert.equal((html.match(/class="sr-chapter sr-chapter--/g)||[]).length,8,'oito divisores mantidos');
assert.equal((html.match(/class="service-entry"/g)||[]).length,42,'serviços mantidos');
assert.equal((html.match(/href="agendar.html/g)||[]).length,52,'agendamento preservado e CTA fixo único');
assert.ok(html.includes('application/ld+json'),'SEO preservado');

for(const id of ['id="sr-loader-stage"','id="snv2-panels"','id="sr-loader-plate"',
                 'id="sr-loader-percent"']) {
  assert.ok(html.includes(id),'loader: '+id);
}
for(const cls of ['snv2-rail','snv2-ring','snv2-plate','snv2-name',
                  'snv2-scissors','snv2-count','snv2-cutout-logo']) {
  assert.ok(html.includes(cls),'elemento do protótipo preservado: '+cls);
}
assert.ok(html.includes('snv2-logo-matte'),'logo em alfa transparente');
assert.ok(html.includes('hero-logo-transparent'),'hero oficial intacto');
assert.equal((html.match(/class="hero-sign hero-pole"/g)||[]).length,1,
  'um único barber pole independente no hero');
assert.ok(!html.includes('hero-sign__face'),'placa retangular removida');
assert.ok(html.includes('hero-pole__rotor')&&html.includes('hero-pole__glass'),
  'corpo cilíndrico e rotor preto e branco');
const pole=file('css/ritual/hero-sign.css');
assert.ok(pole.includes('sr-pole-rotation')&&pole.includes('linear infinite'),
  'rotação contínua das faixas');
assert.ok(pole.includes('#000 0 12px')&&pole.includes('#fff 12px 24px')&&
          pole.includes('#000 24px 36px'),'faixas em preto puro e branco');
assert.ok(!pole.includes('#a83933')&&!pole.includes('#244f78'),
  'nenhuma faixa vermelha ou azul antiga');
assert.ok(!pole.includes('sr-pole-neon-breathe')&&!pole.includes('sr-hero-light-pass')&&
          !pole.includes('sr-hero-sheen'),'remover halo animado e reflexos nas fotos');
assert.ok(!pole.includes('.hero-pole::before'),'barber pole minimalista sem halo decorativo');
assert.ok(pole.includes('filter:drop-shadow(0 2px 1px #0002)'),
  'sombras mínimas no cilindro');
assert.ok(pole.includes('prefers-reduced-motion:reduce'),
  'movimento reduzido interrompe a rotação');
const heroTimeline=file('js/ritual/hero-sign.js');
assert.ok(heroTimeline.includes('scheduleHeroEntrance')&&
          heroTimeline.includes('.hero .title-mask > span')&&
          heroTimeline.includes('.hero-facade')&&heroTimeline.includes('.hero-room')&&
          heroTimeline.includes('.hero-invitation > .button'),
  'entrada de cima para baixo para título, fotos e CTA');
assert.ok(heroTimeline.includes('getComputedStyle(node).transform')&&
          heroTimeline.includes("duration: mobile ? Math.round(duration*.83) : duration"),
  'preserva inclinação das fotos e suaviza durações no mobile');
assert.ok(!heroTimeline.includes("'openingend'")&&
          !file('js/ritual/app.js').includes('initHeroSign()'),
  'não criar uma segunda animação após terminar o loader');
assert.equal((html.match(/class="sr-booking-fixed"/g)||[]).length,1,
  'um único CTA fixo');
assert.ok(html.includes('sr-booking-fixed__calendar')&&html.includes('href="agendar.html"'),
  'CTA de agendamento contém ícone de agenda');
const menuScript=file('js/ritual/app.js');
assert.ok(menuScript.includes("$('.menu nav a').forEach"),
  'menu percorre todos os links com querySelectorAll, sem TypeError');

for(const token of ['is-active','is-closing','aria-expanded',
                    'panel.inert=true','menu.open=false','Escape']){
  assert.ok(menuScript.includes(token),'navegação animada: '+token);
}
const menuStyle=file('css/ritual/header.css');
assert.ok(menuStyle.includes('.enhanced .menu.is-active nav')&&
          menuStyle.includes('animation:none!important'),
  'menu tem entrada e saída sem conflito com keyframes legados');

const imports=file('css/ritual.css');
assert.ok(imports.includes('loader-v2.css')&&imports.includes('perfect-cut-v3.css'));
assert.ok(imports.includes('first-cut-v23.css'),'capítulos mantidos');
assert.ok(imports.indexOf('loader-v2.css')<imports.indexOf('perfect-cut-v3.css'),
  'customização da transição vem por último');
assert.ok(!imports.includes('negative-349-v24.css'));
const perfect=file('css/ritual/perfect-cut-v3.css');
for(const snippet of ['snv2-panel','snv2-cut-flight','snv2-logo-flight',
                      'snv2-seam','sr-cut-reveal','prefers-reduced-motion:reduce'])
  assert.ok(perfect.includes(snippet),'estilo do corte: '+snippet);
assert.ok(!file('css/ritual/loader-v2.css').includes('snv2-iris'),'íris obsoleta removida');
assert.ok(perfect.includes('transition:none!important')&&
          !perfect.includes('transition-delay:220ms'),
  'remoção de fades CSS conflitantes no hero');
assert.ok(!file('css/ritual/hero-sign.css').includes('.hero .photo-window::after'),
  'fotografias entram, não recebem reflexo sobreposto');
assert.ok(!html.includes('id="sr-opening-skip"'),'skip removido do DOM');
assert.equal((file('templates/v17/loader.html').match(/class="snv2-scissors"/g)||[]).length,2,'duas tesouras independentes');

const code=file('js/ritual/opening.js');
assert.ok(code.includes("import { $, $, canMove, cancelWithin } from './core.js';"),
  'a importação do loader deve declarar $ e $ uma única vez');
assert.ok(!code.includes("import { $, $, canMove"),
  'regressão: importação duplicada derrubava The Perfect Cut');

for(const snippet of ['snv2-panels','snv2-panel','snv2-cut-flight',
                      'snv2-logo-flight','sr-cut-reveal','getBoundingClientRect',
                      'translate3d','scale(','CustomEvent','window.__finishRitual'])
  assert.ok(code.includes(snippet),'coreografia: '+snippet);
assert.ok(!code.includes('const N = mobile'),'não usar faixas móveis fragmentadas');
assert.ok(code.includes("['left','right']"),'exatamente duas superfícies inteiras');
assert.ok(!code.includes('stripHeight')&&!code.includes('pendingStrips'),'sem degraus e retângulos por linha');
assert.ok(code.includes("stage.classList.add('snv2-run')"),'contador e barra iniciam juntos');
assert.ok(code.includes('sample(t,.65,.35)'),'curva da porcentagem é a mesma do CSS');
assert.ok(!file('templates/v17/loader.html').includes('snv2-loader snv2-run'),'CSS não pode iniciar antes do JS');
assert.ok(code.includes('scheduleHeroEntrance(play, { tCut, CUT, mobile })')&&
          code.indexOf('scheduleHeroEntrance(play, { tCut, CUT, mobile })')<
          code.indexOf("root.classList.add('sr-cut-reveal')"),
  'hero e lâmina compartilham um único relógio, antes da revelação');
assert.ok(!code.includes('sessionStorage'),'intro repete a cada F5');
const head=file('templates/v17/head.html');
assert.ok(!head.includes('sessionStorage')&&head.includes('sr-loader-boot'));
assert.ok(head.includes('sr-cut-reveal'),'watchdog libera estado');
const colors=file('css/ritual/tokens.css');
for(const token of ['--ivory:#f1eae0','--ink:#171615','--tobacco:#302620',
                    '--wood:#80583c','--copper:#bd946e'])
  assert.ok(colors.includes(token),'identidade original '+token);
assert.ok(!file('js/ritual/motion.js').includes("addEventListener('scroll'"));
for(const name of [
  'motion','scene-cuts','opening','hero-sign','app','core','atmosphere','album','team',
  'gallery','products','services'
]) execFileSync(process.execPath,[
  '--experimental-default-type=module','--check','js/ritual/'+name+'.js'
]);
console.log('Perfect Cut V4: 2 painéis, linha contínua, FLIP, reload, conteúdo e JS OK.');
