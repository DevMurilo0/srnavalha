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
assert.equal((html.match(/class="hero-pole hero-pole--/g)||[]).length,2,'dois cilindros no hero');
assert.ok(!html.includes('hero-sign__face'),'sem placa retangular');
const pole=file('css/ritual/hero-sign.css');
assert.ok(pole.includes('#000')&&pole.includes('#fff')&&pole.includes('linear infinite'),'rotor monocromático contínuo');
assert.ok(pole.includes('animation-play-state:paused')&&pole.includes('is-poles-visible'),'pausa fora da viewport');
assert.ok(pole.includes('prefers-reduced-motion:reduce'),'preferência reduzida');
const heroTimeline=file('js/ritual/hero-sign.js');
assert.ok(heroTimeline.includes("'openingend'")&&heroTimeline.includes('event.detail?.completed'),'entrada após término real');
assert.ok(heroTimeline.includes('getComputedStyle(node).transform'),'preserva geometria original');
const queuedCSS=file('css/ritual/hero-sign.css');
assert.ok(queuedCSS.includes('html.sr-hero-queued .hero .hero-room')&&
          queuedCSS.includes('html.sr-hero-queued .hero .hero-facade')&&
          queuedCSS.includes('html.sr-loader-boot.sr-hero-queued .hero h1'),
  'foto e título estão invisíveis antes do primeiro quadro da queda');
assert.ok(heroTimeline.includes("root.classList.remove('sr-hero-queued')")&&
          heroTimeline.includes('allEffects.add(animation)')&&
          heroTimeline.includes("fill:'both',persist:true"),
  'frames finais permanecem até todos pousarem e são limpos juntos');
assert.ok(heroTimeline.includes("'.hero-wordmark > span'"),
  'a inscrição entra isolada da logo oficial do handoff');
assert.ok(!file('js/ritual/opening.js').includes('scheduleHeroEntrance'),'loader não possui animações do hero');
assert.ok(file('js/ritual/app.js').includes('initHeroExperience()'),'controlador próprio inicializado');
assert.equal((html.match(/class="sr-booking-fixed"/g)||[]).length,1,
  'um único CTA fixo');
assert.ok(html.includes('sr-booking-fixed__calendar')&&html.includes('href="agendar.html"'),
  'CTA de agendamento contém ícone de agenda');
const menuScript=file('js/ritual/app.js');
assert.ok(menuScript.includes("$$('.menu nav a').forEach"),
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
assert.ok(code.includes("import { $, $$, canMove, cancelWithin } from './core.js';"),
  'o loader importa $ e $$ corretamente');
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
assert.ok(code.includes("finish('complete')"),'sinal de conclusão natural do corte');

assert.ok(code.includes("try { callback(); }")&&code.includes("finish('interrupted');"),
  'falhas em callbacks assíncronos liberam o loader imediatamente');
assert.ok(code.includes("target.querySelector('filter') && target.querySelector('image')"),
  'FLIP incompleto usa fallback sem lançar exceções');
assert.ok(code.includes("stage.addEventListener('pointerdown'")&&
          code.includes("event.preventDefault()"),
  'pointerdown do loader não ativa botões atrás da camada');
assert.ok(file('css/ritual/loader-v2.css').includes('pointer-events:auto;background:var(--snv2-bg)'),
  'camada de carregamento bloqueia clique direto no hero');
assert.ok(file('templates/v17/head.html').includes("completed:false,reason:'watchdog'")&&
          file('templates/v17/head.html').includes("if(!root.classList.contains('sr-loader-boot'))return"),
  'watchdog ignora estados concluídos e informa abertura interrompida');

assert.ok(!code.includes('sessionStorage'),'intro repete a cada F5');
const head=file('templates/v17/head.html');
assert.ok(!head.includes('sessionStorage')&&head.includes('sr-loader-boot'));
assert.ok(head.includes("'sr-hero-queued'")&&
          head.includes("root.classList.remove('sr-loader-boot','sr-cut-reveal','sr-hero-queued')"),
  'classe de fila começa no head e libera em falha de carregamento');
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
