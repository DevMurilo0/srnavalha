// Teste estrutural da reconstrução V23. Executar na raiz:
// node scripts/test-motion-v23.mjs
import assert from 'node:assert/strict';
import { readFileSync as read } from 'node:fs';
import { execFileSync } from 'node:child_process';
const load = path => read(path, 'utf8');
const html = load('index.html');
const css = load('css/ritual.css');
const transitions = load('css/ritual/first-cut-v23.css');
const head = load('templates/v17/head.html').trim();
const loader = load('templates/v17/loader.html').trim();
const chapters = ['threshold', 'blade', 'film', 'stitch', 'shelf', 'stars', 'route', 'signature'];
const templates = ['inicio', 'casa', 'servicos', 'equipe', 'trabalhos', 'produtos', 'avaliacoes', 'localizacao'];
assert.ok(html.includes(head), 'head canônico sincronizado');
assert.ok(html.includes(loader), 'loader canônico sincronizado');
assert.equal((html.match(/class="sr-chapter sr-chapter--/g)||[]).length, 8);
assert.ok(!html.includes('class="sr-interlude'), 'interlúdios antigos removidos');
assert.ok(html.includes('id="sr-opening-skip"'), 'skip acessível');
assert.ok(css.includes('first-cut-v23.css'), 'CSS da nova direção');
assert.ok(!css.includes('loader-harmony-v22.css') && !css.includes('interludes-v20.css'), 'CSS antigo inativo');
assert.ok(transitions.includes('prefers-reduced-motion:reduce'), 'reduced motion');
assert.ok(transitions.includes('sr-chapter--queued'), 'entrada dos capítulos');
for(let i=0;i<chapters.length;i++){
  const type = 'class="sr-chapter sr-chapter--'+chapters[i]+'"';
  assert.ok(html.includes(type), 'capítulo '+chapters[i]);
  assert.ok(load('templates/v17/'+templates[i]+'.html').includes(type), 'template '+templates[i]);
}
for(const file of ['js/ritual/opening.js','js/ritual/scene-cuts.js','js/ritual/motion.js','js/ritual/app.js']){
  execFileSync(process.execPath,['--experimental-default-type=module','--check',file],{stdio:'pipe'});
}
assert.ok(html.includes('href="agendar.html"'), 'agendamento local preservado');
assert.ok(load('js/ritual/opening.js').includes("CustomEvent('openingend')"), 'fim da intro dispara sinal');
assert.ok(load('js/ritual/scene-cuts.js').includes('IntersectionObserver'), 'observer nativo');
console.log('V23: head, loader, 8 capítulos, JS, CSS, acessibilidade e agendamento OK.');
