# The Perfect Cut V4

Implementado na branch `reconstruction/arte-do-ritual`, sobre V3.1 (`702b8fd`). Escopo: loader e encerramento; arquitetura HTML/CSS/JS, paleta, hero, capítulos e agendamento preservados.

## Revisão aplicada

| Before | After | Why |
| --- | --- | --- |
| Tesoura clonada na posição da barra e transportada ao centro | Dois SVGs independentes desde o HTML; primeira tesoura permanece na barra | Separar claramente progresso e corte |
| Painéis só abriam após o corte completo | Duas superfícies se afastam acima da lâmina durante a descida | Causa e efeito contínuos, sem revelar área não cortada |
| Saída da barra sobrescrevia sua centralização | Saída apenas por opacidade | Eliminar salto horizontal |
| Logo calculada pela caixa quadrada do SVG | Cálculo da área real da arte, viewBox do hero e escala uniforme | Evitar deformação e troca de recorte na chegada |
| Visibilidade da logo dependia de timer | Opacidade WAAPI com preenchimento anterior, sem timer na chegada | Evitar lacuna quando a thread atrasa |
| Efeitos com fill removidos do registro ao terminar | Efeitos mantidos no registro até cleanup | Cancelar também animações finalizadas, inclusive no hero |
| Íris, shockwave, skip e transições antigas concorrentes | CSS obsoleto removido; sem botão no DOM | Reduzir estados e regras sobrepostas |

## Coreografia

A introdução original mantém seus 2250 ms de progresso e curva sincronizada. Ao chegar a 100%, a barra e sua tesoura desaparecem em 240 ms, sem mudança de posição. A tesoura independente já está vertical acima da viewport, desce em 1350 ms no mobile / 1500 ms no desktop e abre/fecha as lâminas.

Linha, lâmina e superfícies têm `Animation.startTime` comum. Para cada superfície, a borda obedece a `x = centro ± inclinação × (y − pontaY)`. Acima da ponta há separação; abaixo há sobreposição opaca. O efeito usa duas superfícies com matrizes de transformação, sem clip-path animado, sem faixas e sem leituras de layout por frame. Depois da descida, o afastamento termina em 680 ms. O hero aparece durante o corte, sem zoom global.

A logo voa com escala proporcional entre áreas equivalentes da arte oficial. Crossfades inversos evitam duas cópias opacas; seu destino permanece estável. O letreiro centralizado no topo usa posicionamento absoluto, entrada curta e saída por opacidade. Não desloca anel, marca, frase ou barra. A frase foi substituída somente no loader.

Interação, rotação, redução de movimento e ocultação da aba continuam cancelando a sequência. Falta de WAAPI, imagens ou módulo não prende o visitante; os watchdogs permanecem. Nenhum bloqueio de wheel/touchmove foi acrescentado.

## Validação

- Chromium headless: 320, 390, 430, 768 e 1440 px, altura 844 px. 21 verificações visuais/geométricas passaram: duas tesouras, ausência de skip, 100%, junção das superfícies na ponta, linha sincronizada, hero visível durante corte, cleanup e ausência de overflow.
- Testes funcionais: interrupções por clique, Tab, wheel, toque, rotação e mudança dinâmica de reduced motion; F5; refresh com cache desativado; links diretos; navegação ao agendamento e histórico; falha da logo e do módulo; reduced motion inicial; cancelamento durante handoff.
- Checagem da chegada da logo: diferenças abaixo de 0,1 px entre voo e destino; nenhum efeito WAAPI restante no destino após cancelamento.
- Firefox headless: 390/1440 px, duas tesouras, duas superfícies, cleanup e logo visível. Diferença ponta/linha: 0,0064 / 0,0022 px no máximo nas amostras registradas.
- `node scripts/test-reflexo-static.mjs`: templates sincronizados, geração idempotente, oito capítulos, 42 serviços, 51 links de agendamento, SEO, paleta e sintaxe preservados.
- `node scripts/validate-content.mjs`: 69 verificações, nenhuma falha.
- `node --experimental-default-type=module scripts/test-booking-local.mjs`: 10 verificações concluídas.
- `git diff --check`: sem erros.

As capturas de carregamento, corte, abertura e hero estão nesta pasta, com a largura no nome. `before-390.png` registra a versão anterior. Os JSONs contêm resultados brutos. As capturas são quadros de execução real, não montagens; seus instantes variam com o custo da captura.

## Medição de desempenho

Uma amostra por versão/largura em Chromium headless, desktop Linux compartilhado. CPU limitada a 4× a partir de 1 segundo após início do loader, isolando principalmente o encerramento. Sem captura de screenshot durante a medição; hosts externos bloqueados igualmente. Baseline servida do commit V3.1 e versão atual com os mesmos assets. Intervalos medidos via rAF, tarefas via PerformanceObserver. Não são medições de GPU/FPS em telefone físico.

| Viewport | Duração do encerramento antes → depois | p95 intervalo de frames | Frames >34 ms | Long tasks |
| --- | --- | --- | --- | --- |
| 390 × 844 | 3171 → 2276 ms | 33,3 → 16,8 ms | 2 → 2 | 0 → 0 |
| 1440 × 844 | 3406 → 2430 ms | 66,6 → 66,7 ms | 20 → 15 | 6 → 5 |

A redução de contagens no desktop acompanha também uma sequência mais curta; não comprova melhoria de taxa de frames. O p95 desktop permaneceu praticamente igual. Não garantir 60 FPS em todo hardware. Zero `getBoundingClientRect()` durante o corte em ambas as versões; as leituras pontuais de preparação ocorrem antes desse intervalo. Dados completos: `performance.json`.

## Reprodução e limites

Servidor: `PORT=8047 node scripts/serve.mjs`. Testes usam `playwright-core` instalado fora do site; configure `PLAYWRIGHT_PACKAGE` e `CHROME_PATH` se necessário.

- `VISUAL_ONLY=1 node scripts/test-perfect-cut-v4.mjs`
- `FUNCTIONAL_ONLY=1 node scripts/test-perfect-cut-v4.mjs`
- `node scripts/profile-perfect-cut-v4.mjs` (baseline fixada em V3.1; porta 8048 livre)
- `node scripts/test-perfect-cut-v4-firefox.mjs` (Firefox headless/BiDi previamente iniciado na porta 9244)

Não houve teste em Android/iPhone físicos nem Safari. A rotação usa mudança de viewport e o toque usa emulação Chromium; isso não substitui hardware móvel. O perfil é uma amostra local do encerramento, não um benchmark estatístico de todo o site. A suíte ampla antiga de interações foi ajustada aos seletores V4, mas não foi reexecutada integralmente nesta tarefa restrita ao loader.

Referências consultadas: [web.dev — animações de alto desempenho](https://web.dev/articles/animations-guide) e [MDN — sincronização por Animation.startTime](https://developer.mozilla.org/en-US/docs/Web/API/Animation/startTime). Taste, Impeccable e Emil foram lidos nos plugins locais e aplicados à composição existente, estados de falha e continuidade espacial; não foi sorteada uma nova direção visual nem redesenhado o restante do site.
