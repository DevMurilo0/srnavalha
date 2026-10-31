# Sr. Navalha — experiência cinematográfica V31

Implementação na branch `reconstruction/arte-do-ritual`, comparada com `c3a1e68513463b9bf158cf50443f1b0780bdcaa8`. Sem dependências novas, backend, alteração de dados comerciais ou publicação manual em produção.

## Composição e movimento

| Antes | Depois | Motivo |
| --- | --- | --- |
| Conversão abaixo de uma composição alta | CTA e texto de apoio em uma pequena composição editorial, próxima do título; empilhamento próprio no celular | Agendamento integralmente acessível nos oito formatos, inclusive 900×550 |
| Superfície clara simples | Peça metálica clara, tipografia hierárquica, seta circular com passagem mecânica, perspectiva apenas na superfície interna | Materialidade e feedback sem deslocar o layout; foco visível e destino `agendar.html` preservados |
| Revelação muito breve | Planos sobrepostos: cortina 1040ms, câmera 1550ms, título 1350ms e convite 920ms | Movimento apreciável com opacidade antecipada e conteúdo disponível durante a estabilização |
| Clone da logo fora do contexto CSS do hero | Mesma máscara alfa nos extremos, filtro de tinta explicitamente interpolado e troca atômica | Remove perda de branco, duplicação, alteração de contorno e queda de opacidade no encaixe |
| Profundidade fotográfica pontual | Planos independentes em 12 fotografias selecionadas; parallax reversível e limitado | Continuidade com rolagem nativa, sem disputar transforms de entrada, hover ou troca de profissional |
| Título de Trabalhos vinculado ao progresso do scroll | Assinatura original de letras com duração própria | Saltos por âncora deixavam a antiga animação imediatamente concluída |
| Leituras de geometria intercaladas com inserções de letras | Medição em lote antes da criação dos fragmentos | Reduz layouts síncronos sem substituir as oito assinaturas tipográficas |

Os letreiros mantêm leitura horizontal, grupos pequenos e movimentos opostos discretos. O CTA flutuante continua condicionado à saída do hero. A navegação editorial por capítulos aparece apenas no desktop, usa âncoras nativas e reaproveita o observador existente. Galerias, filtros, mapa, equipe, navegação e agendamento permanecem funcionais.

A transferência da logo mede origem/destino uma vez e usa FLIP com WAAPI. O coordenador existente do hero mantém interrupção por entrada do usuário, resize, histórico e movimento reduzido. Entrada e microinteração do CTA possuem superfícies diferentes. Não há biblioteca concorrente nem arquivo de sobrescritas versionadas.

O parallax usa uma `ScrollTimeline` da raiz com intervalos de cada fotografia. Uma `ViewTimeline` no interior de wrappers com overflow não acompanha a raiz; por isso essa alternativa foi descartada durante a validação. O fallback compartilha o leitor de scroll existente, com posições em cache. IntersectionObserver suspende planos distantes. Há no máximo dois planos promovidos em hardwareConcurrency ≤4, seis nos demais; `will-change` só existe enquanto o plano está ativo. Movimento reduzido, pagehide e saída da viewport removem animações, transform e promoção. Não há scroll-jacking ou loop JS permanente.

## Histórico tipográfico verificado

`8a2a1c8` introduziu as assinaturas individuais atuais. `040dba8` atribuiu shards a Trabalhos mantendo o modo de progresso manual; a chegada por âncora podia consumi-lo integralmente. `3c31c14` acrescentou atraso de 190ms aos títulos. O baseline ainda continha as 25 letras animadas de “O próximo encontro / é no Prado.”: não houve remoção total desse mecanismo. A V31 preserva mirrorfold e as demais assinaturas, prioriza títulos na fila e restaura uma apresentação perceptível após navegação por âncora. Os fragmentos são removidos e o texto natural, selecionável e acessível é restaurado.

## Pesquisa aplicada

- [Awwwards](https://www.awwwards.com/websites/), [Godly](https://www.godly.website/) e [SiteInspire](https://www.siteinspire.com/): composição editorial, hierarquia e espaço negativo orientaram a conversão compacta e os letreiros.
- [Codrops — parallax e FLIP](https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/): separação entre enquadramento, plano e transição; aplicamos profundidade limitada, sem galeria infinita ou cópia da implementação.
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): ciclo de geometria, atualização e suspensão dos efeitos; resolvido com infraestrutura nativa existente.
- [Motion scroll](https://motion.dev/docs/scroll): ligação do progresso visual à rolagem nativa e separação da apresentação temporal.
- [web.dev — animações](https://web.dev/articles/animations-guide): transform/opacity, limites de promoção e medição de custos; motivou a medição em lote e o orçamento de planos.
- [Codrops](https://tympanus.net/codrops/) e [React Bits](https://reactbits.dev/): referência de ritmo e variação tipográfica; nenhuma dependência React ou efeito copiado.
- [MDN — Element.animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate): intervalos da timeline e feature detection para o fallback.

Fontes externas foram consultadas; nenhum código, fotografia ou asset de terceiros foi importado. Licenças OFL das fontes existentes permanecem em `assets/fonts`. Foram lidas as skills instaladas Taste Frontend, Impeccable UI e Emil Design Engineering; revisão visual de acabamento: **Ship**, sem bloqueadores.

## Validação real

**451/451 asserções**, em Chromium headless local. Resultados brutos e contagens em [verification.json](verification.json) e [evidence](evidence). Hero inspecionado em 320×568, 390×844, 430×932, 768×1024, 900×550, 1024×600, 1366×768 e 1440×900. [Capturas](screenshots) incluem antes/depois, animação após o corte e letras intermediárias do Prado.

| Suíte | Resultado |
| --- | ---: |
| Hero / geometria responsiva | 62/62 |
| V31 / FLIP, CTA, títulos, parallax nativo e fallback, teclado e Axe | 51/51 |
| Cinematic motion | 109/109 |
| Perfect Cut | 39/39 |
| Navegação | 66/66 |
| Resiliência | 11/11 |
| Agendamento por etapas | 101/101 |
| Estado do agendamento | 12/12 |

Também passaram consistência estática/build, dez verificações locais do agendamento, comparação de 69 conteúdos e interações editoriais em 390/1280. O teste específico de orçamento confirmou dois planos ativos/promovidos e limpeza integral em movimento reduzido, nos modos nativo e fallback. Testes cobrem interrupções, reload/histórico, âncoras, ausência de overflow/erros JS, restauração de texto natural, troca de profissionais e foco. Os testes de reload agora registram o início real da introdução, evitando uma asserção efêmera do estágio após DOMContentLoaded. A navegação do CTA subscreve o evento antes do clique.

Comandos principais: `node scripts/render-site.mjs`, `node scripts/test-reflexo-static.mjs`, `node scripts/test-hero-lightcut.mjs`, `node scripts/test-v31.mjs`, `node scripts/test-cinematic-motion.mjs`, `node scripts/test-perfect-cut-v4.mjs`, `node scripts/test-reflexo.mjs`, `node scripts/test-reflexo-resilience.mjs`, `node scripts/test-booking-wizard.mjs`, `node scripts/test-booking-wizard-state.mjs`, `node scripts/profile-v31.mjs`. Navegador e dependências de QA ficam fora da aplicação. O workflow existente passa a executar também V31 e seu perfil, publicando JSONs como artifacts.

### Perfil e limites

Comparação controlada com o baseline exportado em diretório temporário: Linux, Chromium headless, 1366×768, hardwareConcurrency=4, roteiro de scroll nativo. Percentis são intervalos de requestAnimationFrame, **não FPS físico**.

| Medida | Baseline | V31 |
| --- | ---: | ---: |
| Fixture Prado, 25 letras: layouts / recálculos de estilo | 32 / 32 | 2 / 2 |
| Primeira passagem, p95 de intervalo (ms) | 183,3 | 150,1 |
| Primeira passagem, long tasks | 29 | 31 |
| Passagem estabilizada, CPU 4×, p95 (ms) | 33,4 | 33,5 |
| Passagem estabilizada, CPU 4×, maior intervalo (ms) | 50,1 | 200 |
| Passagem estabilizada, CPU 4×, long tasks | 3 | 5 |
| Layout shift acumulado observado | 0 | 0,00002874 |

Os resultados são mistos: a medição tipográfica melhorou e o p95 estabilizado ficou semelhante, mas ainda há long tasks e picos no percurso. Não se afirma ganho geral de fluidez nem equivalência a dispositivos físicos. Não houve teste em Safari/iPhone ou medição física de GPU/FPS. Resultados completos em `performance-before.json` e `performance-after.json`.

## Arquivos centrais

Templates em `templates/v17` e `index.html` regenerado; `hero-cinema.css` e `cinematic-motion.css`; coordenadores existentes `hero-sign.js`, `opening.js`, `text-motion.js`, `motion.js`, `scroll-motion.js` e remoção do parallax antigo em `image-motion.js`. QA em `scripts/test-v31.mjs`, `scripts/profile-v31.mjs`, ajustes de contratos nas três suítes existentes e workflow. Não há arquivo hero-fix adicional.
