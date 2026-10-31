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
assert.equal((html.match(/class="hero-pole__mount-plate"/g)||[]).length,2,
  'cada poste tem placa de fixação com parafusos');
assert.equal((html.match(/class="hero-pole__collar hero-pole__collar--/g)||[]).length,4,
  'cada poste tem anéis metálicos superior e inferior');
assert.equal((html.match(/class="hero-pole__glass-reflection"/g)||[]).length,2,
  'cada poste mantém vidro e reflexão estática');
assert.ok(html.includes('Mais que um corte, um estilo de vida.')&&
  html.includes('Tradição no corte. Excelência no resultado.'),
  'duas frases institucionais preservadas');

assert.ok(!html.includes('hero-sign__face'),'sem placa retangular');
const pole=file('css/ritual/hero-sign.css');
assert.ok(pole.includes('#000')&&pole.includes('#fff')&&pole.includes('linear infinite'),'rotor monocromático contínuo');
assert.ok(pole.includes('animation-play-state:paused')&&pole.includes('is-poles-visible'),'pausa fora da viewport');
assert.ok(pole.includes('sr-pole-rotation 4800ms linear infinite')&&
  pole.includes('translate3d(0,31.1125px,0)')&&
  pole.includes('.hero-pole__mount-plate'),
  'faixa gira apenas com transform, estrutura possui suporte físico');

assert.ok(pole.includes('prefers-reduced-motion:reduce'),'preferência reduzida');
assert.ok(pole.includes('Machined-steel barber pole')&&
  pole.includes('.hero-pole__glass::before')&&
  pole.includes('.hero-pole__cap::after'),
  'poste possui reflexos de vidro e anéis de acabamento realista');
const ambience=file('js/ritual/atmosphere.js');
const palette=file('css/ritual/cinematic-motion.css');
assert.ok(ambience.includes("track.classList.toggle('is-moving',!preference.matches)")&&
  ambience.includes("track.classList.toggle('is-paused',paused||!move||!visible.has(viewport))"),
  'carrossel nunca fica desativado apenas por hardware de quatro threads');
assert.ok(!palette.includes('html.sr-lite-motion .review-track{')&&
  palette.includes('.rituals{')&&palette.includes('.portfolio{')&&palette.includes('.visit{'),
  'cinza em três seções e avaliações desbloqueadas em modo leve');
assert.ok(file('js/ritual/text-motion.js').includes('Math.min(order*25,580)')&&
  file('js/ritual/motion.js').includes('const entranceDelay='),
  'títulos têm pequeno atraso inicial e entrada espaçada por letras');
const heroTimeline=file('js/ritual/hero-sign.js');
assert.ok(!heroTimeline.includes("'openingcutmidpoint'")&&heroTimeline.includes("document.addEventListener('openingend'")&&heroTimeline.includes('event.detail?.completed?begin():settle()'),
  'hero só começa após abertura completa; interrupções mostram conteúdo');
assert.ok(heroTimeline.includes("['.hero-wordmark>span'")&&!heroTimeline.includes("['.hero-logo-transparent'"),
  'logo oficial não é alvo da segunda sequência');
assert.ok(heroTimeline.includes("root.classList.remove('sr-hero-queued')")&&heroTimeline.includes('effect.cancel()')&&heroTimeline.includes('controller.abort()'),
  'um controlador libera fila, cancela efeitos e listeners');
const queuedCSS=file('css/ritual/hero-sign.css');
assert.ok(queuedCSS.includes('html.sr-hero-queued .hero .hero-room')&&queuedCSS.includes('html.sr-loader-boot.sr-hero-queued .hero h1'),
  'hero permanece oculto antes do primeiro quadro');
const textMotion=file('js/ritual/text-motion.js'),imageMotion=file('js/ritual/image-motion.js');
const orchestration=file('js/ritual/motion.js');
for(const section of ['casa','servicos','equipe','produtos','avaliacoes','localizacao']){
  assert.ok(orchestration.includes(section+':'),
    'animação de título própria para '+section);
}
assert.ok(orchestration.includes('node.matches(\'h2,.footer-oversize-lead,.footer-oversize-main\')'),
  'títulos dos capítulos são registrados para animação no scroll');

assert.ok(textMotion.includes("fill:'both',persist:true")&&textMotion.includes('wrapper.replaceWith(original)')&&textMotion.includes("setAttribute('aria-hidden','true')"),
  'split acessível restaura nós originais e preserva frames atrasados');
assert.ok(imageMotion.includes('clipPath')&&!imageMotion.includes('node.style.transform'),
  'máscaras fotográficas não substituem inclinação das molduras');
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
const colors=file('css/ritual/cinematic-motion.css');
for(const token of ['--ivory:#f8f8f8','--ink:#101113','--tobacco:#202226','--stone:#e7e8ea'])assert.ok(colors.includes(token),'paleta monocromática '+token);
assert.ok(colors.includes('.sr-chapter{display:none!important}'),'divisores sem placas nem espaço artificial');
assert.ok(file('js/ritual/motion.js').includes('frame=requestAnimationFrame(recover)')&&file('js/ritual/motion.js').includes('pending.size||running.size'),
  'recuperação passiva somente enquanto há efeitos pendentes');
for(const name of [
  'text-motion','image-motion','scroll-motion','motion','scene-cuts','opening','hero-sign','app','core','atmosphere','album','team',
  'gallery','products','services'
]) execFileSync(process.execPath,[
  '--experimental-default-type=module','--check','js/ritual/'+name+'.js'
]);
console.log('Perfect Cut V4: 2 painéis, linha contínua, FLIP, reload, conteúdo e JS OK.');

/* Performance contract: detailed editorial animation must not multiply
   layers on every paragraph or create unlimited work in a single scroll tick. */
const motionRuntime=file('js/ritual/motion.js');
const textRuntime=file('js/ritual/text-motion.js');
const imageRuntime=file('js/ritual/image-motion.js');
assert.ok(motionRuntime.includes("const sections=$$('main section:not(.hero),footer')"),
  'recuperação de scroll usa a lista completa de seções');
assert.ok(motionRuntime.includes('const perFrame=')&&
          motionRuntime.includes('requestAnimationFrame(flushEntrances)'),
  'entradas no scroll distribuídas em lotes com limite por quadro');
assert.ok(motionRuntime.includes("return'micro';")&&
          !motionRuntime.includes("node.closest('#casa,#localizacao')?'fold':'focus'"),
  'textos comuns têm efeito leve; títulos preservam as animações editoriais');
assert.ok(textRuntime.includes("translate:'0 14px'")&&
          textRuntime.includes("matchMedia('(max-width:700px)').matches"),
  'texto simples usa apenas composição e mobile evita animação por caractere');
assert.ok(imageRuntime.includes('if(image&&!lowPower&&featured)'),
  'zoom fotográfico secundário desligado em hardware modesto');


/* Editorial services stay interactive; the team returns to its previous
   clean list + main portrait with one full gray background. */
const editorialStyle=file('css/ritual/editorial-interactions.css');
const teamTemplate=file('templates/v17/equipe.html');
const heroTemplate=file('templates/v17/inicio.html');
const teamRestore=file('css/ritual/team-restored.css');
assert.ok(!html.includes('Explore nossos serviços')&&!heroTemplate.includes('Explore nossos serviços'),
 'link redundante dos serviços permanece removido do hero');
assert.ok(file('css/ritual.css').includes("editorial-interactions.css")&&
 file('css/ritual.css').includes("team-restored.css"),
 'hover de serviços e restauração da equipe carregados');
assert.equal((teamTemplate.match(/class="team-name"/g)||[]).length,5,
 'cinco profissionais preservados na lista');
assert.equal((teamTemplate.match(/class="team-name__thumb"/g)||[]).length,5,
 'miniaturas dos cinco profissionais restauradas no template');
assert.equal((html.match(/class="team-name__thumb"/g)||[]).length,5,
 'HTML final contém cinco miniaturas fotográficas');
assert.ok(!teamTemplate.includes('team-mood-photo')&&
 !teamTemplate.includes('portrait-engraving')&&
 !html.includes('team-mood-photo'),
 'fotos decorativas extras removidas');
assert.ok(editorialStyle.includes('.rituals .mirror-choice::before')&&
 editorialStyle.includes('.rituals .mirror-choice:is(:hover,:focus-visible,[aria-pressed=true])'),
 'hover dos serviços mantido');
assert.ok(teamRestore.includes('#equipe.team')&&
 teamRestore.includes('#262a30')&&
 teamRestore.includes('#equipe .section-heading{')&&
 teamRestore.includes('.team-name__thumb{')&&
 teamRestore.includes('display:block!important')&&
 teamRestore.includes('.team-name:is(:hover,:focus-visible) .team-name__thumb'),
 'fundo grafite escuro em toda seção e miniaturas ativadas no hover/foco');
assert.ok(file('js/ritual/scene-cuts.js').includes('No global pointermove')&&
 !file('js/ritual/scene-cuts.js').includes('requestAnimationFrame('),
 'sem preview que segue o cursor');
console.log('Team graphite: 5 nomes, 5 miniaturas no hover e retrato principal preservado.');
const rail=file('js/ritual/team.js');
const railCss=file('css/ritual/team-restored.css');
assert.ok(rail.includes("translate3d(-103%,0,0)")&&
  rail.includes("translate3d(0,105%,0)")&&
  rail.includes("await Promise.all([photo,name])"),
  'foto anterior sai pela lateral e próxima sobe em sequência');
assert.ok(rail.includes('if(seq!==turn)return')&&
  rail.includes('stopAnimations()')&&
  rail.includes('incoming.decode()'),
  'troca resiste a cliques rápidos e decodifica antes da saída');
assert.ok(railCss.includes('position:absolute;')&&
  railCss.includes('.team-name .team-row-note')&&
  railCss.includes('contain:layout paint')&&
  railCss.includes('team-photo-changing'),
  'linhas preservam altura e palco fotográfico mantém geometria estável');
console.log('Team portrait rail: saída lateral, entrada vertical e contenção sem saltos.');


/* V27: central brand, two functioning barber poles, catalog usability.
   Verify actual public behaviors rather than the removed scene chooser. */
const heroTemplate=file('templates/v17/inicio.html');
const productTemplate=file('templates/v17/produtos.html');
const heroBrand=file('css/ritual/hero-brand-v27.css');
const catalogCSS=file('css/ritual/catalog-atelier.css');
const catalogJS=file('js/ritual/products.js');
const heroMotion=file('js/ritual/hero-sign.js');
const typeEngine=file('js/ritual/text-motion.js');
assert.ok(heroTemplate.includes('class="hero hero--cinema"')&&
 html.includes('class="hero hero--cinema"'),'capa cinematográfica preservada');
assert.equal((heroTemplate.match(/class="hero-pole hero-pole--/g)||[]).length,2,
 'marca central entre dois postes reais');
assert.ok(heroTemplate.indexOf('hero-pole--left')<
 heroTemplate.indexOf('hero-logo-transparent')&&
 heroTemplate.indexOf('hero-logo-transparent')<
 heroTemplate.indexOf('hero-pole--right'),
 'logo centralizada entre postes no mesmo lockup');
assert.ok(heroTemplate.includes('hero-cinema__brand-lockup')&&
 heroBrand.includes('grid-template-columns')&&
 heroBrand.includes('hero-cinema__brand-lockup .hero-pole'),
 'layout central responsivo carregado');
assert.ok(!heroTemplate.includes('OLHAR DE PERTO')&&
 !heroTemplate.includes('data-cinema-shot')&&
 !heroTemplate.includes('hero-facade')&&
 !heroTemplate.includes('hero-detail')&&
 !heroMotion.includes('data-cinema-shot'),
 'seletor de imagens antigas removido de HTML e JS');
assert.equal((html.match(/class="hero-logo-transparent"/g)||[]).length,1,
 'marca oficial única para o FLIP da introdução');
assert.ok(heroMotion.includes('sr-hero-curtain')&&
 heroMotion.includes('sr-hero-light-slit')&&
 heroMotion.includes('openingend'),
 'cortina cinematográfica e novo traço de luz sincronizados à tesoura');
assert.ok(typeEngine.includes("case 'monolith'")&&
 heroTemplate.includes('data-cm-signature="monolith"'),
 'tipografia por letras preservada');
assert.ok(heroBrand.includes('prefers-reduced-motion:reduce')&&
 heroTemplate.includes('hero-ambiente-mobile-960.webp')&&
 heroTemplate.includes('hero-ambiente-1920.webp'),
 'imagem própria responsiva e modo movimento reduzido');
assert.ok(file('css/ritual.css').includes("hero-brand-v27.css")&&
 file('css/ritual.css').includes("catalog-atelier.css"),
 'CSS de nova composição e catálogo ligado à página');
assert.equal((productTemplate.match(/class="product-option"/g)||[]).length,22,
 'todos os 22 produtos preservados');
assert.equal((productTemplate.match(/class="product-option__consult"/g)||[]).length,22,
 '22 links separados de consulta preservados');
assert.equal((productTemplate.match(/class="product-option__preview"/g)||[]).length,22,
 '22 botões reais de visualização de detalhes');
assert.equal((productTemplate.match(/class="no-photo"/g)||[]).length,4,
 'itens sem imagem recebem tratamento gráfico sem fotografia inventada');
for(const id of ['product-search','product-sort','product-category',
 'product-count','product-empty','product-reset','product-clear']){
 assert.ok(productTemplate.includes('id="'+id+'"'),
  'controle funcional do catálogo '+id);
}
assert.ok(catalogJS.includes('applyFilter(')&&
 catalogJS.includes('applySort(')&&
 catalogJS.includes('normalize(')&&
 catalogJS.includes('changePhoto('),
 'pesquisa, acentos, ordenação e prévia ligados ao catálogo');
assert.ok(catalogCSS.includes('.product-option__consult')&&
 catalogCSS.includes('prefers-reduced-motion:reduce')&&
 catalogCSS.includes('.catalog-empty[hidden]'),
 'design do catálogo é acessível e tem fallback de movimento');
console.log('V27 Hero + Catálogo: marca central, cenário limpo, 22 produtos e controles.');
