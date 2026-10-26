// Compatibility test name retained from previous motion iteration.
// Run: node scripts/test-reflexo-static.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const read = path => readFileSync(path, 'utf8');
const html = read('index.html');
for (const name of ['head','loader','inicio','casa','servicos','equipe','trabalhos',
                    'produtos','avaliacoes','localizacao','footer']) {
  assert.ok(html.includes(read('templates/v17/' + name + '.html').trim()),
    'template sincronizado: ' + name);
}
execFileSync(process.execPath,['scripts/render-site.mjs']);
assert.equal(read('index.html'),html,'geração do HTML idempotente');
assert.equal((html.match(/class="sr-chapter sr-chapter--/g)||[]).length,8);
assert.equal((html.match(/class="service-entry"/g)||[]).length,42);
assert.ok(html.includes('id="sr-opening-skip"'),'atalho de pular');
assert.ok(html.includes('sr-burst__seal')&&html.includes('sr-burst__photo'),'nova abertura');
assert.ok(html.includes('href="agendar.html"')&&html.includes('application/ld+json'));
const css=read('css/ritual.css');
assert.ok(css.includes('first-cut-v23.css'),'capítulos originais restaurados');
assert.ok(css.includes('negative-349-v24.css'),'abertura nova ativa');
assert.ok(!css.includes("reflexo.css"),'CSS do redesign recusado não é carregado');
const tokens=read('css/ritual/tokens.css');
for(const pair of ['--ivory:#f1eae0','--ink:#171615','--tobacco:#302620',
                   '--wood:#80583c','--copper:#bd946e']) {
  assert.ok(tokens.includes(pair),'paleta anterior preservada: '+pair);
}
const head=read('templates/v17/head.html');
assert.ok(!head.includes('sessionStorage'),'a intro não pode ser pulada por sessão');
assert.ok(head.includes('sr-loader-boot'),'boot inicia em todo refresh');
assert.ok(head.includes('sr-burst-reveal'),'reveal sincronizado com hero');
const opening=read('js/ritual/opening.js');
assert.ok(opening.includes('sr-burst-reveal'));
assert.ok(opening.includes('CustomEvent('));
assert.ok(opening.includes("getBoundingClientRect()"),'geometria medida uma única vez');
assert.ok(!opening.includes('sessionStorage'));
const motion=read('js/ritual/motion.js');
assert.ok(!motion.includes("addEventListener('scroll'"),'scroll JS pesado não retornou');
for(const name of ['motion','scene-cuts','opening','app','core','atmosphere',
                   'album','team','gallery','products','services']) {
  execFileSync(process.execPath,['--experimental-default-type=module','--check','js/ritual/'+name+'.js']);
}
console.log('V24 Negativo 349: templates, paleta, reload, 8 capítulos, booking e JS OK.');
