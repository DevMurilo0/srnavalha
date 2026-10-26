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
assert.equal((html.match(/href="agendar.html/g)||[]).length,51,'agendamento preservado');
assert.ok(html.includes('application/ld+json'),'SEO preservado');

for(const id of ['id="sr-loader-stage"','id="snv2-panels"','id="sr-loader-plate"',
                 'id="sr-loader-percent"','id="sr-opening-skip"']) {
  assert.ok(html.includes(id),'loader: '+id);
}
for(const cls of ['snv2-rail','snv2-ring','snv2-plate','snv2-name',
                  'snv2-scissors','snv2-count','snv2-cutout-logo']) {
  assert.ok(html.includes(cls),'elemento do protótipo preservado: '+cls);
}
assert.ok(html.includes('snv2-logo-matte'),'logo em alfa transparente');
assert.ok(html.includes('hero-logo-transparent'),'hero oficial intacto');
const imports=file('css/ritual.css');
assert.ok(imports.includes('loader-v2.css')&&imports.includes('perfect-cut-v3.css'));
assert.ok(imports.includes('first-cut-v23.css'),'capítulos mantidos');
assert.ok(imports.indexOf('loader-v2.css')<imports.indexOf('perfect-cut-v3.css'),
  'customização da transição vem por último');
assert.ok(!imports.includes('negative-349-v24.css'));
const perfect=file('css/ritual/perfect-cut-v3.css');
for(const snippet of ['snv2-panel-slice','snv2-cut-flight','snv2-logo-flight',
                      'snv2-seam','sr-cut-reveal','prefers-reduced-motion:reduce'])
  assert.ok(perfect.includes(snippet),'estilo do corte: '+snippet);
assert.ok(perfect.includes('mask-image:none'),'revela o hero por cortes, não pela íris antiga');

const code=file('js/ritual/opening.js');
for(const snippet of ['snv2-panels','snv2-panel-slice','snv2-cut-flight',
                      'snv2-logo-flight','sr-cut-reveal','getBoundingClientRect',
                      'translate3d','scale(','CustomEvent','window.__finishRitual'])
  assert.ok(code.includes(snippet),'coreografia: '+snippet);
assert.ok(!code.includes('const N = mobile'),'não usar faixas móveis fragmentadas');
assert.ok(code.includes("['left','right']"),'exatamente duas superfícies inteiras');
assert.ok(code.includes('tOpen = tEnd + 90'),'abertura somente após o corte completo');
assert.ok(code.includes("duration:CUT,delay:tCut,easing:'cubic-bezier(.42,0,.58,1)'"),'tesoura e linha sincronizadas');
assert.ok(!code.includes('stripHeight')&&!code.includes('pendingStrips'),'sem degraus e retângulos por linha');
assert.ok(code.includes("stage.classList.add('snv2-run')"),'contador e barra iniciam juntos');
assert.ok(code.includes('sample(t,.65,.35)'),'curva da porcentagem é a mesma do CSS');
assert.ok(code.includes('sourceBox.width*scale*.5')&&code.includes('sourceBox.height*scale*.5'),'marca escala sem distorcer nem ultrapassar o centro');
assert.ok(!file('templates/v17/loader.html').includes('snv2-loader snv2-run'),'CSS não pode iniciar antes do JS');
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
  'motion','scene-cuts','opening','app','core','atmosphere','album','team',
  'gallery','products','services'
]) execFileSync(process.execPath,[
  '--experimental-default-type=module','--check','js/ritual/'+name+'.js'
]);
console.log('Perfect Cut V3.1: 2 painéis, linha contínua, FLIP, reload, conteúdo e JS OK.');
