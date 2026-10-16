# Motion design — Sr. Navalha

## Escopo e execução

Evolução do movimento da implementação estática, preservando fotografias, logo, textos, cores, tipografia, composição, links e crédito de Murilo Gabriel. Abra `index.html` com **Open with Live Server**. Não há npm, build, React, servidor Node ou CDN necessários. O agendamento continua demonstrativo, sem reserva ou envio de dados.

## Bibliotecas e referências

GSAP, ScrollTrigger e SplitText **3.15.0**, distribuições UMD oficiais, locais em `assets/vendor/gsap-3.15.0/`. `ORIGIN.json` registra pacote, integridade e hashes; `LICENSE-NOTICE.txt` registra procedência e licença. Os arquivos distribuíveis conservam os avisos originais. Licença GSAP Standard “No Charge”, não MIT: [termos oficiais](https://gsap.com/community/standard-license/). O uso neste site comercial comum é permitido; existem restrições para produtos concorrentes de criação visual de animações.

Referências consultadas, sem copiar componentes ou código:

- [GSAP](https://gsap.com/), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/), especialmente `autoSplit`, `onSplit` e máscaras.
- ReactBits: [Split Text](https://reactbits.dev/text-animations/split-text), [Blur Text](https://reactbits.dev/text-animations/blur-text), [Scroll Reveal](https://reactbits.dev/text-animations/scroll-reveal), [Scroll Float](https://reactbits.dev/text-animations/scroll-float), [Scroll Expand](https://reactbits.dev/animations/scroll-expand), [Animated Content](https://reactbits.dev/animations/animated-content), [Magnet](https://reactbits.dev/animations/magnet), [Glare Hover](https://reactbits.dev/animations/glare-hover).
- Codrops: [grid com máscaras](https://tympanus.net/codrops/2025/05/27/animated-product-grid-preview-with-gsap-clip-path/), [slider arrastável](https://tympanus.net/codrops/2020/12/01/crafting-a-scrollable-and-draggable-parallax-slider/), [galeria GSAP](https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/), [transições SVG](https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/).
- [Lenis](https://github.com/darkroomengineering/lenis) avaliado e não incluído: a rolagem vertical permanece nativa, sem proxy, interceptação ou loop de suavização.

## Arquitetura e substituição dos efeitos anteriores

- `motion-core.js`: registro de módulos, espera pelas fontes, `gsap.matchMedia()`, escopos de recursos, recuperação e diagnóstico `SrMotion.debug()`.
- `motion-text.js`: divisão acessível, máscaras responsivas, títulos, parágrafos e timeline do hero.
- `motion-scenes.js`: coordenação das seções, fotografias, profundidade e entrada das etapas do agendamento.
- `animations.js`: inicialização única.
- `interactions.js`: magnetismo seletivo, reflexo dos cards e FAQ com altura animada.
- `gallery.js`: posição nativa única, tween interrompível, gestos e indicadores.
- `main.js`: preserva menu/foco/inert e adiciona indicador móvel da seção ativa ao processamento de scroll existente.
- `animations.css`: suporte às máscaras, câmeras, indicadores, foco e contingência. Carrega depois dos refinamentos para não disputar regras.

Foram removidos os antigos atributos de reveal/parallax, observers genéricos, entradas CSS do hero e entradas duplicadas do agendamento. A imagem mantém seu zoom de hover; um wrapper separado controla a revelação e outro controla a profundidade. Assim, efeitos diferentes não escrevem no mesmo `transform`. Listeners de interação usam AbortController; escopos revertem SplitText, timelines, estilos e wrappers nas mudanças de breakpoint/preferência. O agendamento observa apenas a troca do conteúdo atual e reverte a entrada anterior.

## Coreografia

| Elemento | Movimento e configuração |
| --- | --- |
| Hero | Timeline independente do scroll, cerca de 1,9 s: header, localização, três linhas mascaradas, câmera, parágrafo, CTAs, indicadores e frase lateral. Linhas partem de aproximadamente 104%, stagger 0,11 s, `power3.out`. Câmera 1,04 → 1 em 1,85 s. O enquadramento base da fotografia é preservado. CTAs continuam acionáveis desde o início. |
| Títulos | Linhas com máscaras; durações individuais aproximadamente 0,82–1,03 s, stagger 0,07–0,12 s, `power3.out`. Não há um timing único aplicado a todas as seções. |
| Parágrafos selecionados | Deslocamento de 5 px e clareza progressiva; blur de 3 px somente em pequenos trechos no desktop, aproximadamente 0,72–0,78 s. Estilos temporários removidos ao terminar. |
| Serviços | Máscara vertical das fotografias e zoom 1,08 → 1; escalonamento desktop de 0 / 0,13 / 0,26 s. Texto entra depois da imagem. Hover/foco com zoom e seta direcional; reflexo discreto acompanha o mouse. |
| Ambiente — transição especial 1 | Moldura inset 9% / 7% → 0, câmera 1,065 → 1 e título coordenados. Scrub 0,45, aproximadamente da entrada em 91% até 43% da viewport. Não muda a altura da seção. Selo entra depois e flutua apenas 7 px. |
| Galeria | Scroll horizontal real; setas/teclado interpolam `scrollLeft` em 0,68 s, `power3.out`. Imagem interna deriva até 6 px no desktop / 3 px no mobile, retornando em 0,42 s. Contador entra em 0,3 s; progresso acompanha a posição real. |
| Equipe — transição especial 2 | Máscara horizontal da imagem, aproximadamente 1,12 s; título em linhas; frase posterior com atraso de 0,7 s. Profundidade interna de apenas ±9 px. Frase flutua ±6 px. Preserva o gradiente de integração existente. |
| Prova social | Título, parágrafo e convite em sequência editorial; nenhum número, depoimento ou avaliação foi inventado. Não há contador sem dado verificado. |
| Localização | Título mascarado, pin 0,76 → 1, desenho de linha fina; sem pulso contínuo. |
| FAQ | Expansão/retração da altura em 0,34 s `power2.inOut`, ícone em 0,32 s; conteúdo em 0,26 s. Interrupções rápidas partem da altura corrente. |
| Header | Entrada no hero, estado de scroll existente e indicador deslizante x/largura em 0,45 s `power3.out`; seção ativa calculada em ordem real do documento. Menu mobile conserva controle de foco, Escape e fundo inert. |
| CTAs e links | Magnetismo apenas nos CTAs preenchidos em desktop com ponteiro fino, retorno em 0,38 s; foco, resposta tátil, seta e sublinhado. Sem cursor global personalizado. |
| Agendamento | Título da etapa atual com máscara em aproximadamente 0,62 s. Trocar, voltar, concluir e reiniciar revertem a divisão anterior; lógica de validação e dados original preservada. |

Somente ambiente e equipe recebem transições especiais entre seções. Somente selo e frase da equipe recebem float. A profundidade do hero após entrada limita-se a poucos pixels e apenas desktop.

## Galeria: propriedade e interrupção

`scrollLeft` é a única fonte de verdade. Um novo comando cancela o tween anterior; comandos repetidos acumulam o destino. Pointer/touch/wheel interrompem o tween e devolvem imediatamente o controle ao gesto nativo. Durante tween e gesto, o snap é temporariamente suspenso, evitando o salto identificado nos testes. Depois da estabilização, o snap nativo volta. Arraste usa a posição real; não existe segundo loop tentando deslocar o trilho. Teclas Home/End, setas, botões, swipe e estados disabled são mantidos.

## Responsividade, desempenho e acessibilidade

`gsap.matchMedia()` diferencia desktop a partir de 761 px, mobile até 760 px, ponteiro fino e movimento reduzido. Mobile usa entradas mais simples, sem parallax/magnetismo e sem blur de parágrafos. Fontes locais são aguardadas antes da divisão; `autoSplit` e `onSplit` recalculam as linhas e sincronizam as animações em mudanças de largura. Não há divisões aninhadas após redimensionar.

As máscaras são enhancement: o HTML e CSS base não escondem conteúdo. Ausência de JavaScript, GSAP, ScrollTrigger ou SplitText mantém os textos e imagens presentes; FAQ retorna ao `details` nativo. Falha de inicialização reverte recursos e aplica contingência. Títulos mantêm semântica e rótulo acessível, com fragmentos decorativos ocultos ao leitor de tela.

Movimento reduzido, inclusive alterado durante a sessão, reverte cenas e remove ScrollTriggers; FAQ fica nativo, galeria usa resposta imediata e conteúdo permanece visível. Foco visível e controles de teclado continuam disponíveis. Sem scroll hijacking, filtros grandes, cursores customizados, `will-change` indiscriminado, animação de altura das seções ou loops decorativos permanentes. Atualizações de indicadores são agrupadas em requestAnimationFrame; efeitos de interação são descartados nas mudanças de escopo.

## Verificação e evidências

Servidor HTTP estático local em `127.0.0.1:4173`, equivalente ao Live Server. Chromium real via Playwright já disponível no ambiente, sem instalar dependências no projeto. Capturas anteriores e posteriores em `capturas/motion/before/` e `capturas/motion/after/`.

A comparação geométrica de Home e agendamento em **320, 375, 768 e 1440 px** não encontrou alterações nos retângulos, tipografia ou cores dos elementos comparados. Alturas finais da Home: 7251 / 7306 / 4934 / 4643 px; agendamento: 1552 / 1528 / 1772 / 1564 px. Capturas integrais registram o estado final das animações; somente no contexto da captura o header fixo foi colocado no fluxo e fotografias lazy foram decodificadas para documentar toda a página.

Os testes funcionais observam a página normal, com timings intermediários, não apenas funções escritas: máscaras do hero e serviços, expansão ligada ao scroll, galeria interpolada e interrompível, FAQ em quadros intermediários, ida/volta de scroll, salto rápido sem conteúdo preso, menu/Escape/foco/inert e fluxo completo de agendamento com validação, revisão, voltar, conclusão explicitamente demonstrativa e reset. São conferidos console, imagens/fontes, crédito e overflow.

Os relatórios JSON anexos registram os resultados efetivamente obtidos. O teste de FAQ coleta quadros intermediários: uma pausa do processo headless pode saltar um instante escolhido por relógio, sem indicar ausência da interpolação. A interrupção da galeria foi medida no próprio pointerdown e após 100 ms mantendo o botão pressionado: deslocamento involuntário **0 px**.

Limitações: emulação de toque e viewports em Chromium, não ensaio em aparelhos físicos ou Safari/Firefox. Não se declara garantia de 60 fps em equipamentos não medidos. O ambiente headless apresentou pausas de agendamento; não se usa esse comportamento para prometer uma taxa de quadros. As decisões de simplificação mobile e ausência de suavização global priorizam estabilidade e controles nativos.

### Resultado final

- **4/4 larguras aprovadas** nos testes funcionais de Home e agendamento; sem overflow horizontal, erros de console ou falhas HTTP locais observados.
- **8/8 cenários adicionais aprovados**: sem JavaScript, indisponibilidade individual de cada uma das três bibliotecas, reduced motion inicial, troca de preferência em execução, redimensionamento repetido e recuperação explícita de falha.
- **8/8 comparações geométricas aprovadas**: duas páginas em quatro larguras.
- Evidência estruturada: `MOTION_TESTS_FUNCTIONAL.json`, `MOTION_TESTS_ACCESSIBILITY.json`, `MOTION_TESTS_LAYOUT.json`.

## Arquivos alterados nesta rodada

Existentes: `README.md`, `index.html`, `agendar.html`, `css/style.css`, `css/booking.css`, `css/animations.css`, `css/refinements.css`, `js/animations.js`, `js/interactions.js`, `js/gallery.js`, `js/main.js`.

Novos: `js/motion-core.js`, `js/motion-text.js`, `js/motion-scenes.js`; `assets/vendor/gsap-3.15.0/{gsap.min.js,ScrollTrigger.min.js,SplitText.min.js,ORIGIN.json,LICENSE-NOTICE.txt}`; este documento; os três relatórios JSON; imagens PNG em `capturas/motion/before/` e `capturas/motion/after/`.

`css/responsive.css`, `js/booking.js`, fotografias, fontes e logotipo não foram alterados. Nenhum commit ou push foi realizado. O ZIP da rodada anterior não foi sobrescrito e permanece identificado como histórico no README.
