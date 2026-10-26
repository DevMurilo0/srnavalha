> **Documento histórico:** as medições abaixo são da implementação "O Reflexo do Ritual" (commit `9f6920d`) e **não são um benchmark da versão atual Negativo 349**. Em 26/10/2026, fundos, paleta e capítulos da versão original foram restaurados, mantendo as principais otimizações de JavaScript. Novas medições no navegador são necessárias antes de afirmar equivalência de FPS ou de Paint.

# Sr. Navalha · O Reflexo do Ritual

Implementação em `reconstruction/arte-do-ritual`, 26/10/2026. HTML, CSS e JavaScript puros; Live Server permanece suficiente. Nenhuma mudança de backend, schema de agendamento, dependência de runtime ou merge na main.

## Diagnóstico e correções

| Before | After | Why |
| --- | --- | --- |
| `motion.js` lia casa, imagem e rodapé com `getBoundingClientRect()` entre escritas de estilos a cada scroll | Nenhum callback JavaScript de progresso de scroll; timeline CSS com fallback fotográfico | Retira o caminho repetido de layout e a atualização de máscara |
| Polígono grande da casa, parallax e blade atualizados por frame | Dissolução da própria imagem; casa no fluxo natural | Conserva a relação porta/salão sem pintar uma máscara por frame |
| Títulos divididos em palavras, animações do contêiner e imagens aninhadas | Título como uma superfície; um observador de entradas, até 3 entradas mobile / 6 desktop | Menos nós, camadas e trabalho simultâneo; sem fila invisível |
| Filas CSS ocultavam conteúdo antes da inicialização | Estado natural visível; entradas pontuais começam parcialmente visíveis | Falhas e cancelamentos não deixam conteúdo apagado |
| Seis componentes inicializados juntos 48ms depois da abertura ou após timeout | Controles essenciais ligados de imediato; álbum preparado na aproximação/foco/toque | Retira o disparo arbitrário no meio da primeira interação |
| CSS e WAAPI animavam o menu ao mesmo tempo | Uma animação CSS curta do painel | Feedback previsível sem coreografia por link |
| Fotografias gigantes, filtros, máscaras, gradientes e sombras sobrepostos nas superfícies | Campos minerais sólidos, material fotográfico em áreas delimitadas | Menos superfícies grandes de pintura; fotografias e molduras reais continuam |
| FLIP do álbum intercalava leituras com novas animações | Snapshots agrupados antes das escritas animadas; teclado direto | Evita invalidação repetida do layout ao reorganizar as folhas |
| Animações persistentes concluídas saíam do registro central | Permanecem rastreadas até cancelamento; pagehide/movimento reduzido limpam o registro | Não deixa efeitos órfãos durante interrupção ou histórico |
| Preview, retrato e legendas podiam disputar movimento na equipe | Preview finito preservado; trocas curtas; teclado sem animação decorativa | Mantém a interação existente com menor latência |

A inspeção do código confirma o intercalamento de geometria/escritas e os dois proprietários de animação do menu. A instrumentação de runtime confirmou leituras repetidas de geometria e picos de animações. Os traces mediram Layout, UpdateLayoutTree, PrePaint e Paint. A melhoria após simplificar as superfícies confirma o custo do conjunto; não atribuímos uma porcentagem isolada a cada filtro sem um experimento específico.

## Abertura nova

O salão real aparece como uma fotografia pequena sobre mineral escuro. A marca oficial aparece sobre marfim. Os próprios nós DOM de fotografia e marca se deslocam e crescem até seus lugares no hero; o campo escuro perde opacidade e a tipografia entra em sequência curta. Nenhum clone da fotografia, máscara diagonal, porta lateral ou cortina participa do efeito.

As duas geometrias finais são lidas juntas antes das alterações. Depois só transform e opacity participam das animações WAAPI. O destino é o mesmo elemento que permanece na página: não há troca de arquivo ao finalizar. Slots preservam a altura enquanto os elementos viajam.

Imagem essencial e fontes: espera máxima de 450ms, sem contador fictício. Viagem: 940ms + 60ms de preparação. Watchdog independente no head: 1800ms desde o bootstrap. Sessão já vista, movimento reduzido, histórico e âncora profunda entram diretamente; `?intro=1` permite revisar a abertura. Clique, teclado, wheel, toque, scroll, resize, pagehide e aba oculta restauram os nós imediatamente. Nenhum preventDefault de gesto ou scroll lock.

Capturas: [abertura mobile](validation/opening-390.png), [desktop](validation/opening-1440.png), [hero final mobile](validation/hero-390.png), [hero final desktop](validation/hero-1440.png).

## Oito passagens

As frases originais permanecem, agora em costuras menores com cores iguais às seções adjacentes. Threshold, blade, film, stitch, shelf, stars, route e signature continuam como identificadores canônicos. A repetição está na geometria, com alinhamento inicial, final ou central conforme a sequência. Saem os oito mecanismos decorativos distintos, as placas inclinadas, perfurações, carimbos e números redundantes.

Somente quatro filetes pequenos se constroem uma vez. Texto e fundo ficam estáticos. A entrada de fotografia e título pertence à seção, sem outra coreografia concorrente na passagem. Não há animação contínua JavaScript entre capítulos.

## Mobile

- Conferidas as larguras 320, 360, 375, 390, 412, 430, 768, 1024, 1366 e 1440px em Chromium e Firefox.
- Até três entradas concorrentes; materiais decorativos não recebem outra entrada no celular. Retratos, fotografias e textos principais ainda se movem.
- O vídeo decorativo fica com sua fotografia real e não inicia download no celular. A filmagem original permanece disponível no desktop e pausa fora de vista.
- Sem parallax de grandes áreas, sticky da casa ou cálculos de geometria durante os gestos.
- Mantidos pan-y e pinch-zoom no álbum, tabs horizontais nativas da equipe e controles de toque existentes.
- Corrigidas as quebras dos títulos da casa, localização e convite final, com os textos originais. O número ornamental 349 deixa de disputar largura com o título no celular; o endereço completo continua visível.
- A abertura considera a viewport visual; resize/rotação interrompe o deslocamento em vez de perseguir coordenadas antigas.

## Performance medida

| Métrica / CPU 4× | 390px antes → depois | 1440px antes → depois |
| --- | --- | --- |
| Leituras de geometria durante scroll | 234 → 0 | 156 → 0 |
| Pico de animações em execução | 23 → 7 | 33 → 9 |
| Intervalo mediano entre frames | 16.7ms → 16.7ms | 50.0ms → 16.7ms |
| Intervalo p95 entre frames | 66.7ms → 33.3ms | 133.3ms → 50.0ms |
| Frames do roteiro acima de 33,4ms | 100 → 9 | 151 → 54 |
| Long tasks durante o percurso | 28 → 0 | 93 → 5 |
| Layout: tempo acumulado no trace | 396ms → 119ms | 511ms → 127ms |
| Paint: tempo acumulado no trace | 3505ms → 1915ms | 3640ms → 2841ms |
| Pico de camadas no LayerTree | 48 → 39 | 58 → 41 |
| CLS observado | 0 → 0 | 0 → 0 |

Metodologia: Chromium 153.0.8010.12 headless, viewport de 900px de altura, DPR 1, CPU 4× pelo CDP, percurso de 14s até o rodapé e volta. Baseline do commit `11dfc51`, antes das mudanças. A comparação controlada bloqueia recursos externos para separar o custo variável do iframe Google Maps; o mapa real foi aberto nos testes funcionais e capturas. Assets locais e desktop video seguem o comportamento do site. O álbum é preparado antes do percurso comparado em ambas as versões. O roteiro não é um benchmark de hardware Android/iPhone.

`frameIntervals` são intervalos entre callbacks rAF do roteiro, não um contador universal de FPS do compositor. DevTools, headless, CPU artificial e a instrumentação têm custo. Um trace por largura/versão não oferece distribuição estatística nem garantia de 60 FPS. Recalculate Style não necessariamente cai em contagem: timelines CSS podem ser amostradas mais vezes quando mais frames são entregues; devem ser avaliados duração e custo junto com os intervalos.

Dados completos: [antes](before/metrics.json), [depois](after/metrics.json). Traces `trace-390.json.gz` e `trace-1440.json.gz` nas duas pastas são importáveis no Performance panel; descompacte se sua versão do DevTools exigir.

## Testes executados

- Chromium: **56/56**. Dez larguras; conteúdo/imagens; abertura natural e restaurada; interrupções; F5 e cache desabilitado; âncoras; menu/Escape/foco; espelho/filtros; equipe/teclado; álbum/modos; lightbox/setas/Escape; produtos; depoimentos; agendamento/retorno; movimento reduzido; sem JS; módulo e imagem bloqueados; console. [Registro](validation/checks.json).
- Firefox 158.0.1 Linux: **32/32**. Dez larguras e os componentes principais; fallback sem view timeline, links profundos, menu e console. [Registro](validation/firefox.json).
- Axe: nenhuma violação WCAG 2 A/AA e 2.1 AA na execução automatizada. [Dados](validation/axe.json). Isso não equivale a uma certificação completa.
- Agendamento local: **10 verificações** de armazenamento e compatibilidade, sem alteração no código do agendamento.
- Conteúdo: **69 comparações**, nenhuma divergência; 42 serviços, 22 produtos, equipe, fotos, mapa e contatos preservados.
- Verificação estática: módulos válidos, oito capítulos, templates sincronizados e geração idempotente. `node scripts/render-site.mjs` não desfaz a implementação.
- Títulos ajustados: duas linhas nas dez larguras. [Medição específica após ajuste final](validation/title-lines.json).
- Resiliência: **11/11**, 30 ciclos durante aproximadamente 150s, incluindo toque nativo com deslocamento/impulso, rotação, swipe, seleções rápidas, preferência dinâmica, mídia fora de vista e rede limitada a 100KiB/s com latência de 120ms. [Dados e memória por amostra](validation/resilience.json). Após aquecimento, listeners constantes em 170; DOM oscila por apenas dois nós durante as trocas. Esse ensaio não prova ausência de todo vazamento possível.

A primeira tentativa de gesto via `Input.synthesizeScrollGesture` não moveu a página neste ambiente; o ensaio foi corrigido para `Input.dispatchTouchEvent` e repetido integralmente. Não foi tratada uma limitação da ferramenta como defeito de scroll do site.

## Referências aplicadas e revisão visual

Foram lidos AGENTS.md, DESIGN.md, README.md, PRODUCT.md e os arquivos originais dos três plugins locais. Taste: continuidade da direção fotográfica existente `uneven-photographs`, seed `1139092228`, sem novo sorteio de um site completo. A direção explícita “O Reflexo do Ritual” e a preservação dos conteúdos governam esta intervenção. Impeccable: optimize, animate, craft-floor e new-work; redução de superfícies custosas e dois passes visuais em lote. O launcher de contexto não executou por permissão de arquivo; o contexto foi lido diretamente. Emil: decisão por frequência, cancelamento, feedback curto e teclado direto.

Inventário próprio usado na ideia: salão com espelhos e iluminação linear, fachada e letreiro, número 349, Prado/Gravatá, logo oficial, instrumentos na bancada, retratos reais da equipe, seis fotografias do álbum, embalagens do catálogo e materiais de moldura existentes. Nesta página, **a fotografia do próprio salão vira o quadro que conduz a abertura ao hero**. As interações que sustentam a experiência continuam sendo o espelho de serviços, o painel da equipe e o álbum reorganizável. Nenhum conteúdo de amostra ou imagem gerada foi introduzido.

Fontes técnicas consultadas em 26/10/2026:

- [web.dev — High-performance animations](https://web.dev/articles/animations-guide): priorizar propriedades de composição e inspecionar paint; aplicado à retirada das máscaras animadas.
- [Chrome DevTools — Performance](https://developer.chrome.com/docs/devtools/performance): CPU throttling e leitura do trace; aplicado ao roteiro CDP reproduzível.
- [Chromium — Investigating scroll/animation jank](https://chromium.googlesource.com/chromium/src/+/lkgr/docs/speed/debug-janks.md): investigar tarefas e frames do pipeline, sem supor que RAF resolve jank.
- [MDN — Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API): observação assíncrona, entradas pontuais e pausa de mídia.
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): fallback inicial e mudança dinâmica.
- [MDN — addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener): listeners passivos e remoção por AbortSignal na abertura.

Referências criativas consultadas, sem copiar layouts ou código proprietário:

- [Codrops — Preview to Full Content Page Transition](https://tympanus.net/codrops/2021/04/07/preview-to-full-content-page-transition/): continuidade visual do mesmo assunto em dois estados. Adaptação original em WAAPI, sem trazer GSAP. O demo teve bloqueio Cloudflare; o artigo foi acessado.
- [Codrops — On-Scroll Expanding Image within Typography](https://tympanus.net/codrops/2024/04/02/on-scroll-expanding-image-animation-within-typography/): relação entre fotografia e composição. A própria referência discute dificuldade responsiva; aqui a viagem é curta, pontual e cancelável, sem ampliar uma foto continuamente com o scroll.
- [Rich Stapleton](https://www.richstapleton.com/) e sua seleção em [SiteInspire](https://www.siteinspire.com/websites/category/photography): observado no navegador com fotografias carregadas. Uma imagem enquadrada conduz a atenção; tipografia e navegação não competem com ela. Esse princípio informa a abertura, sem reaproveitar sua identidade ou navegação.
- [Studio Alphonse — Awwwards](https://www.awwwards.com/sites/studio-alphonse): página de seleção consultada no navegador; referência de conteúdo/portfólio editorial, sem afirmar auditoria do runtime do site original.
- [Godly](https://godly.website/) redirecionou para [Recent](https://recent.design/), consultado como galeria atual. Não foi usado como referência de implementação.

O inspector Taste foi executado em 1440/768/390px e as capturas foram abertas. O segundo passe registrou 14 flags estilísticas e 6 warnings; **não apresentamos esse resultado como aprovação automática**. A quebra restante da localização foi corrigida depois e verificada nas dez larguras. Os demais sinais refletem principalmente o sistema existente que o briefing manda preservar: molduras e filetes, numeradores funcionais de equipe/álbum, rótulos decorativos, sombra de folhas e dados de catálogo em 13–14px. “Covered text” aponta links do menu nativo fechado; o menu aberto e o foco foram testados. “Icon cards” aponta depoimentos reais. Paleta marfim é explícita no briefing; tabs horizontais são deliberadas e continuam operáveis. Esses sinais não foram escondidos com allowances no detector.

Autoavaliação interna após as capturas (não uma nota Awwwards): design 8/10, usabilidade 8/10, criatividade 8/10, conteúdo 9/10; ponderação Taste 8,1/10. O sistema herdado ainda tem muitas escalas de legenda e tratamentos fotográficos variados; a intervenção preserva esse acervo e concentra originalidade na abertura e consistência no motion. Não há declaração de prêmio ou revisão externa.

## Limites restantes

Não houve teste físico em Android ou iPhone nem Safari/iOS real. Chromium com toque e rotação emulada não substitui esses aparelhos. Firefox foi real no Linux, em modo headless. Bfcache real depende do ambiente/heurísticas do navegador; foram testados retorno pelo histórico e os handlers pagehide/pageshow, sem afirmar que todo retorno usou bfcache. F5 e cache desabilitado foram automatizados, sem executar atalhos físicos em cada sistema operacional.

O mapa e links externos mantêm disponibilidade dependente dos provedores. Os timings do iframe foram isolados na comparação de renderização. Não medimos consumo de bateria ou memória de GPU em telefone real. Camadas reportadas são contagens do LayerTree, não megabytes de VRAM.

## Arquivos e reprodução

- Runtime: `js/ritual/app.js`, `core.js`, `motion.js`, `opening.js`, `scene-cuts.js`, `atmosphere.js`, `album.js`, `team.js`, `services.js`, `products.js` e `gallery.js`.
- Estilos: `css/ritual.css`; tokens, hero, motion, atmosphere-v18, scene-craft-v19, sections, responsive-v21, footer-atelier; novos `reflexo.css` e `member-preview.css`.
- Removidos do runtime e do disco: `first-cut-v23.css` e `reveal-fix-v20.css`. Retiradas regras obsoletas de aberturas e interlúdios das folhas ainda usadas.
- HTML: `index.html`, head/loader e oito templates de capítulo em `templates/v17/`.
- Ferramentas: `profile-ritual.mjs`, `test-reflexo*.mjs`; `test-motion-v23.mjs` torna-se entrada de compatibilidade para a verificação estática atual.
- Contexto: `DESIGN.md`, `README.md`, `.impeccable/surfaces/index.md`; evidências e este relatório em `docs/reflexo/`.

Ferramentas opcionais instaladas em `/tmp/srnavalha-validation`, fora do repositório: `playwright-core` e `@axe-core/playwright`. Os scripts aceitam `PLAYWRIGHT_PACKAGE`, `CHROME_PATH`, `SITE_URL` e, no teste Firefox, `FIREFOX_PORT`.

```sh
PORT=8047 node scripts/serve.mjs
node scripts/test-reflexo-static.mjs
node --experimental-default-type=module scripts/test-booking-local.mjs
node scripts/validate-content.mjs
node scripts/test-reflexo.mjs
node scripts/test-reflexo-firefox.mjs
node scripts/test-reflexo-resilience.mjs
node scripts/profile-ritual.mjs after
```

## GitHub

Implementação: [1834afe](https://github.com/DevMurilo0/srnavalha/commit/1834afe).

O commit seguinte reúne este relatório, traces comprimidos, capturas e resultados automatizados. Ambos pertencem exclusivamente a `reconstruction/arte-do-ritual`; nenhum merge na main. A lista pode ser vista no [histórico da branch](https://github.com/DevMurilo0/srnavalha/commits/reconstruction/arte-do-ritual/).
