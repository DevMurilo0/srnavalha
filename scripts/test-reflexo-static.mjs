// Loader v2 regression checks. Kept under original filename for compatibility.
// Run: node scripts/test-reflexo-static.mjs
import assert from 'node:assert/strict';
import { readFileSync as read } from 'node:fs';
import { execFileSync } from 'node:child_process';
const file = path => read(path,'utf8');
const html = file('index.html');
const templates = ['head','loader','inicio','casa','servicos','equipe','trabalhos',
                   'produtos','avaliacoes','localizacao','footer'];
for (const name of templates) {
  assert.ok(html.includes(file('templates/v17/' + name + '.html').trim()),
    name + ': HTML sincronizado');
}
execFileSync(process.execPath,['scripts/render-site.mjs']);
assert.equal(file('index.html'),html,'build idempotente');
assert.equal((html.match(/class="sr-chapter sr-chapter--/g)||[]).length,8,'8 passagens preservadas');
assert.equal((html.match(/class="service-entry"/g)||[]).length,42,'42 serviços preservados');
assert.ok(html.includes('id="sr-loader-stage"') &&
          html.includes('id="sr-loader-shock"'),'círculo/iris integrados');
for (const item of ['snv2-rail','snv2-ring','snv2-plate','snv2-name',
                    'snv2-scissors','snv2-count','sr-loader-percent','sr-opening-skip']) {
  assert.ok(html.includes(item),item + ' no loader');
}
assert.ok(html.includes('href="agendar.html"'),'agendamento preservado');
assert.ok(html.includes('application/ld+json'),'dados estruturados preservados');

const css = file('css/ritual.css');
assert.ok(css.includes('loader-v2.css') && css.includes('first-cut-v23.css'));
assert.ok(!css.includes('negative-349-v24.css') && !css.includes('reflexo.css'));
const design = file('css/ritual/loader-v2.css');
assert.ok(design.includes('@property --snv2-r'),'iris radial registrada');
assert.ok(design.includes('mask-image:radial-gradient'),'máscara radial');
assert.ok(design.includes('prefers-reduced-motion:reduce'),'movimento reduzido');

const colors=file('css/ritual/tokens.css');
for(const token of ['--ivory:#f1eae0','--ink:#171615','--tobacco:#302620',
                    '--wood:#80583c','--copper:#bd946e'])
  assert.ok(colors.includes(token),'identidade original: '+token);

const boot=file('templates/v17/head.html');
assert.ok(boot.includes('sr-loader-boot'),'abertura pré-pintura');
assert.ok(boot.includes('sr-iris-reveal'),'hero revela pelo iris');
assert.ok(!boot.includes('sessionStorage'),'repetir a cada F5');
const open=file('js/ritual/opening.js');
assert.ok(open.includes('sr-iris-reveal') && open.includes('openingend'));
assert.ok(open.includes('requestAnimationFrame') && open.includes('cancelAnimationFrame'));
assert.ok(open.includes('window.__finishRitual'),'fallback de interrupção');
assert.ok(!open.includes('sessionStorage'));
assert.ok(!file('js/ritual/motion.js').includes("addEventListener('scroll'"),
    'otimização de scroll preservada');
for (const module of ['motion','scene-cuts','opening','app','core','atmosphere',
                      'album','team','gallery','products','services'])
  execFileSync(process.execPath,
    ['--experimental-default-type=module','--check','js/ritual/'+module+'.js']);
console.log('Loader v2: build, paleta, iris, ring, skip, reload, serviços e JS OK.');
