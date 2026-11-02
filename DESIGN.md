## Identidade ativa — The Cut (novo conceito)

A referência aprovada é `print/Site editorial da Sr. Navalha.png`. O frontend canônico agora está em `templates/the-cut`, `css/the-cut.css`, `js/the-cut/app.js` e `scripts/render-site.mjs`. A paleta ativa combina carvão `#141412`, marfim `#e9e3d8`, nogueira `#493126` e cobre `#a3654b`; a tipografia usa Manrope e Bodoni itálica. A navalha da composição é um asset derivado do mockup e os cinco retratos foram segmentados com transparência. As instruções V17 abaixo são históricas e não substituem a nova referência.

---

---
name: Sr. Navalha — A arte do ritual
description: Fotografia documental, gravura e enquadramentos em marfim, carvão quente e cobre
colors:
  ivory: "#f1eae0"
  ink: "#171615"
  tobacco: "#302620"
  wood: "#80583c"
  copper: "#bd946e"
  stone: "#dfd6ca"
  muted: "#65574d"
  light-muted: "#c7b9ab"
typography:
  display:
    fontFamily: "Sora, Manrope, Arial, sans-serif"
    fontSize: "clamp(42px,4.85vw,77px)"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.063em"
  headline:
    fontFamily: "Sora, Manrope, Arial, sans-serif"
    fontSize: "clamp(42px,5.6vw,80px)"
    fontWeight: 500
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Sora, Manrope, Arial, sans-serif"
    fontSize: "clamp(28px,3.3vw,44px)"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "13px"
rounded:
  square: "0"
spacing:
  gutter: "clamp(20px,5vw,80px)"
  section: "clamp(78px,9vw,140px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.square}"
    padding: "17px 24px"
  button-primary-hover:
    backgroundColor: "{colors.wood}"
    textColor: "{colors.ivory}"
  button-footer:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    height: "80px"
  button-footer-hover:
    backgroundColor: "{colors.copper}"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "9px 14px"
  filter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory}"
  album-mode:
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "10px 17px"
  review:
    backgroundColor: "{colors.tobacco}"
    textColor: "{colors.ivory}"
    padding: "32px"
    width: "clamp(270px,30vw,365px)"
---

# Design System: Sr. Navalha — A arte do ritual

## Overview

**Creative North Star: "A arte do ritual"**

Uma oficina de enquadramentos: gravura, fotografia e nomes participam da composição, do primeiro traço à assinatura final. Os espelhos, o acabamento de madeira e os instrumentos da Sr. Navalha dão origem a esquadrias, filetes, lombadas e estudos vetoriais próprios. Fotografias documentais em tamanhos desiguais apresentam o estabelecimento e seus trabalhos.

Sora dá presença aos títulos e Manrope sustenta a consulta. Superfícies minerais claras alternam com carvão e tabaco; cobre e madeira completam a materialidade. Movimento acrescenta reenquadramento, construção de traços e continuidade espacial ao conteúdo que permanece acessível em seu estado natural.

**Key Characteristics:**

- Fotografias oficiais, marca original e enquadramentos de proporções desiguais.
- Marfim e carvão quente como superfícies; madeira e cobre como acabamento contextual.
- Sora e Manrope locais, com composição tipográfica compacta e títulos expressivos.
- Gravuras originais integradas a molduras, lombada e sinalização.
- Rolagem nativa, transições canceláveis e melhoria progressiva.

Extraído do código ativo V17 em `css/ritual/`, `js/ritual/` e `index.html`; amostragem de estilos computados em Chromium a 1440px. A direção de superfície está em `.impeccable/surfaces/index.md`. A fonte canônica do HTML é `templates/v17/`, montada opcionalmente por `scripts/render-site.mjs`. O HTML entregue funciona diretamente em Live Server. Resultados de testes e vereditos pertencem aos relatórios em `docs/v17/`, sem herdar a aprovação de versões anteriores.

## Colors

A paleta preserva os tons quentes observados no acervo real. Os valores normativos estão no frontmatter e em `css/ritual/tokens.css`.

### Primary

- **Madeira — wood:** ênfase de títulos sobre superfícies claras, foco e resposta das ações.
- **Cobre — copper:** gravuras, filetes, indicadores e ênfase em superfícies escuras.

### Neutral

- **Marfim — ivory:** fundo principal e texto em capítulos escuros.
- **Carvão quente — ink:** texto, ações principais, casa, reputação e visualizador.
- **Tabaco — tobacco:** equipe, rodapé, moldura do espelho e depoimentos.
- **Pedra — stone:** capítulo de produtos e fundo de imagens durante carregamento.
- **Texto suave — muted:** informação secundária em superfícies claras.
- **Texto claro suave — light-muted:** informação secundária em superfícies escuras.

**The Surface Contrast Rule.** Texto principal usa carvão sobre marfim ou marfim sobre carvão/tabaco; madeira e cobre acompanham o contexto da superfície.

## Typography

**Display Font:** Sora local variável (100–800), seguida de Manrope, Arial e sans-serif. A versão anterior da documentação citava Bodoni; essa família não participa do CSS ativo V17.

**Body Font:** Manrope local variável (200–800), seguida de Arial e sans-serif. Ambas mantêm suas licenças OFL em `assets/fonts/`.

A hierarquia combina títulos geométricos de espaçamento compacto com textos funcionais regulares. Ênfase no hero e no rodapé usa variação de peso da Sora. A marca original continua como imagem própria.

### Hierarchy

- **Display:** título central do hero na escala do frontmatter. Até 1000px usa `clamp(38px,5.6vw,61px)`; até 700px, `clamp(35px,9.65vw,55px)`, entrelinha 1.12; até 350px, 34px.
- **Headline:** títulos gerais na escala do frontmatter. A casa usa `clamp(50px,6vw,86px)`; o convite do rodapé usa `clamp(48px,5.8vw,92px)`, peso 600 e entrelinha 1.03. As composições têm ajustes próprios no celular.
- **Title:** títulos de catálogo e FAQ na escala do frontmatter; serviços e produtos têm escalas específicas conforme a extensão dos nomes.
- **Body:** parágrafos na escala do frontmatter. Descrições e textos auxiliares usam variações de 13–18px conforme função.
- **Label:** navegação, legendas e fontes usam a escala do frontmatter. Preços e durações usam algarismos tabulares quando declarado.

Títulos animados preservam nome acessível; as palavras visuais ficam ocultas às tecnologias assistivas. As variantes de entrada alternam recorte, deslocamento lateral e perspectiva conforme o capítulo.

## Layout

O contêiner comum tem largura máxima de 1400px e desconta duas calhas; cabeçalho chega a 1560px e hero a 1320px. Calha e espaçamento de seção são fluidos. Até 700px, seções comuns usam 78px entre capítulos e os cabeçalhos passam ao fluxo vertical.

O hero tem centro tipográfico e três fotografias desiguais: fachada, ambiente e detalhe. No telefone, fachada e salão precedem o convite com detalhe lateral. Espelho Vivo combina seleção, fotografia e informação. O Painel de Profissionais usa nomes, retrato e convite em três colunas; abaixo de 1100px o convite ocupa outra linha. Produtos usam imagem e informação, seguidas de catálogo em linhas; a lista passa a uma coluna até 800px.

O Álbum de Estilos alterna uma superfície de folhas sobrepostas com a parede editorial de 12 colunas (seis no celular). Mudanças de composição usam FLIP; o estado sem JavaScript preserva a parede com links nativos. Fotografias pequenas mantêm limites particulares de tamanho. A casa tem cena sticky apenas no desktop com movimento permitido; o fluxo móvel permanece natural.

A navegação móvel aparece até 1000px. O cabeçalho usa 106px no desktop e 84px até 700px. Outros pontos de adaptação observados são 1600, 1200, 1100, 900, 800, 700, 600, 500, 375 e 350px, conforme o componente.

## Elevation & Depth

A profundidade vem de planos cromáticos, recortes, sobreposições e filetes. Fotografias do hero têm elevação difusa no hover; folhas do álbum usam sombra suave que reforça sua sobreposição física. Depoimentos permanecem superfícies planas. Não há sombra dura deslocada.

### Shadow Vocabulary

- **Menu móvel** (`0 15px 40px #17161526`): separa o painel da página.
- **Folha fotográfica** (`0 12px 25px -18px #30262066`): distingue as folhas sobrepostas.
- **Fotografia em hover** (`0 24px 50px -33px #171615b0`): resposta localizada no hero.

Movimento usa easing de entrada `cubic-bezier(.22,1,.36,1)` e espacial `cubic-bezier(.76,0,.24,1)`. O núcleo WAAPI registra animações e cancela efeitos de componentes ao interromper estados. Trocas fotográficas aguardam decodificação; a imagem anterior permanece sob a máscara e o último pedido vence. Um agendador de quadro coordena scroll e ponteiro, acionado por eventos.

**The Natural State Rule.** O CSS natural mantém conteúdo visível. Cancelamento, movimento reduzido e falhas de dependência preservam leitura e destinos reais; a apresentação não depende de uma classe de entrada oculta.

## Shapes

Ações, filtros, imagens e superfícies são predominantemente retangulares. Cantos chanfrados, filetes duplos e estudos de ferramentas são vetores originais em `assets/decor/v17/`. A exceção circular pertence aos controles anterior/próximo do álbum e à geometria dos instrumentos. Molduras e bordas são parte da direção pedida pelo proprietário; não aplicar proibições genéricas que eliminem essa materialidade.

Gravuras não interceptam ponteiro nem escondem conteúdo essencial. Traços mantêm espessura consistente ao escalar. A construção animada de parte dos caminhos usa `pathLength`, sem exigir que a animação aconteça para revelar o desenho.

**The Real Photograph Rule.** Usar o acervo oficial correspondente ao conteúdo, respeitando sua resolução. Ausência ou falha de imagem recebe informação explícita; ornamentos vetoriais não substituem logo, ambiente, profissionais ou embalagens.

## Components

### Buttons

Ação retangular, texto Manrope (14px, peso 600), seta SVG e distribuição entre extremidades. O botão comum tem altura mínima de 56px; até 700px, 54px. Ação principal usa carvão/marfim e resposta madeira. Fundo direcional e magnetismo moderado complementam o hover em ponteiro fino; foco recebe resposta equivalente. O CTA especial do rodapé usa superfície clara, altura mínima de 80px no desktop e seta em área própria.

Foco global usa contorno de madeira (2px), afastado 6px; contextos escuros usam cobre. Pressão tem escala curta. Movimento reduzido retira o deslocamento. O agendamento permanece um link externo oficial.

### Chips

Filtros e seletores de modo são retangulares com filete contextual. Seleção usa carvão/marfim e `aria-pressed`. O grupo quebra linhas conforme espaço disponível. O catálogo informa o resultado em texto. O modo do álbum altera a composição completa.

### Cards / Containers

Depoimentos são superfícies tabaco com citação Sora e fonte individual. O módulo ativo usa largura do frontmatter e citação `clamp(17px,1.65vw,22px)`; no telefone, 18px. A esteira desliza da direita para a esquerda em ciclo linear de 44s e pausa por botão, foco, hover, saída da viewport ou aba oculta. Sem JavaScript ou com movimento reduzido, os depoimentos ficam estáticos; o clone é inerte e oculto à tecnologia assistiva.

### Inputs / Fields

Categoria de produtos usa `select` nativo transparente, borda inferior, rótulo persistente e largura máxima de 220px. Não há formulário local de reserva nem checkout.

### Navigation

Cabeçalho claro, marca original e links com linha revelada. O menu móvel usa `details` nativo e painel tabaco com Sora. Fecha ao escolher destino, clicar fora ou pressionar Escape; nesse último caso, devolve foco ao acionador. O rodapé reúne navegação, contatos, endereço e convite fotográfico; não repete o bloco de horários removido anteriormente.

### Espelho Vivo e Painel de Profissionais

O espelho coordena seleção, fotografia e dados reais do serviço. O painel da equipe coordena nome selecionado, índice, marcador vertical, retrato, moldura e destino de agenda. Hover em ponteiro fino, foco, clique e toque têm equivalentes funcionais; setas, Home e End percorrem profissionais. A legenda confirma a imagem carregada. Nenhuma biografia é inferida.

### Álbum de Estilos e visualizador

Folhas sobrepostas e parede são dois estados do mesmo conjunto de fotografias. Seis miniaturas, anterior/próximo e ampliação permitem exploração; a navegação por teclado e swipe tem suporte. No modo de folhas, o primeiro toque seleciona a fotografia e a selecionada abre o visualizador. Este usa diálogo nativo com setas, Escape, swipe e devolução do foco. Sem JavaScript, os links abrem o arquivo real.

### Abertura e encerramento

Uma matriz escura gravada abre uma janela sobre a fotografia do salão e se expande para revelar o hero. Abertura é breve, sem porcentagem falsa nem espera de recurso; executa uma vez por sessão, possui timeout e aborta com interação, preferência reduzida ou aba oculta. Âncoras profundas entram diretamente no destino. O rodapé combina fotografia, chamada e grande assinatura tipográfica com resposta ao progresso da rolagem. Movimentos ambientais pausam fora de vista.

### Localização

Mapa externo real, endereço e rota em texto, com gravura de placa fora do iframe. Assistência nativa “Não consigo ver o mapa” oferece alternativa também diante de bloqueio silencioso. A decoração não intercepta a interação do mapa.

## Do's and Don'ts

### Do:

- Do preservar a marca original, o acervo oficial e os limites das imagens pequenas.
- Do integrar gravuras à moldura, lombada ou sinalização do componente.
- Do manter texto, preços, durações, fontes e destinos essenciais no HTML estático.
- Do conservar foco perceptível, seleção acessível e equivalentes de teclado e toque.
- Do respeitar movimento reduzido inicial e dinâmico e a pausa específica dos depoimentos.
- Do distinguir catálogo datado de disponibilidade no AppBarber ou no atendimento.

### Don't:

- Don't fabricar fotografias, profissionais, biografias ou resultados de tratamentos.
- Don't substituir o logo original pela assinatura tipográfica complementar.
- Don't depender de uma animação concluída para tornar o conteúdo legível.
- Don't repetir o mesmo movimento em todos os capítulos nem acumular loops de quadros independentes.
- Don't transformar mapa, estoque ou catálogo em promessa de carregamento ou disponibilidade garantida.

Inscrições ornamentais pequenas e eventual linguagem auxiliar redundante não constituem uma nova escala normativa. Este registro não canoniza defeitos de legibilidade ou de revisão e não atribui à V17 os resultados de testes da versão anterior.


## Adendo V23 · Movimento “O Primeiro Traço” (24/10/2026)

**World preserved:** carvão, cobre e marfim; Sora/Manrope e fotografias reais. **Motion language changed:** uma incisura vertical de cobre divide duas folhas opacas como uma navalha; em seguida, textos e fotografias reais surgem em curtos deslocamentos e opacidade. A direção é editorial e material, não uma tela genérica de loading.

Oito passagens próprias (threshold, blade, film, stitch, shelf, stars, route, signature) articulam os capítulos sem esconder conteúdo funcional. Elas repetem a precisão do filete de cobre mas variam alinhamento, composição, ritmo e emblemas. Os detalhes de marca pertencem ao espaço existente da barbearia; nenhuma foto ou depoimento fictício foi criado. Animações dependem de `transform`/`opacity` e respeito a `prefers-reduced-motion`. O ritmo deixa de depender de rolagem artificial ou máscaras grandes.


## Motion V24 — Negativo 349 (26/10/2026)

A paleta global histórica (marfim, carvão quente, tabaco, madeira e cobre) e as superfícies originais foram restauradas. A única identidade cinematográfica nova está confinada ao prólogo `css/ritual/negative-349-v24.css`: fotografia real do salão, selo da marca, linhas irradiantes e aproximação ao hero. Todo recarregamento normal dispara o efeito; movimento reduzido, âncoras e histórico têm saída imediata. A otimização de scroll e dos componentes continua preservada. Os oito capítulos editoriais V23 voltaram com seus ornamentos e composição.

## Adendo Loader v2 · 26/10/2026

A primeira impressão passa a seguir o protótipo HTML fornecido pelo cliente (anel desenhado, placa central com marca oficial, letras escalonadas, postes listrados, trilho de progresso com tesoura, abertura radial). Não substituir o hero por uma landing page fictícia e não transportar a paleta do protótipo para outros capítulos. O elemento `#sr-loader-stage` é autossuficiente, com CSS `snv2-` e sem dependências externas. A transição radial acontece por uma máscara de saída única, enquanto a entrada do hero usa apenas transformações e transparência; a estrutura e fotografia reais permanecem no DOM. Cada refresh da homepage repete o ritual, com saída imediata para reduced-motion/skip/deep links.

## The Perfect Cut · 26/10/2026

O HTML de referência "Sr. Navalha · The Perfect Cut" define agora a coreografia final. Preservar a introdução V2 até 100%; tesoura parte do trilho, voa ao centro, gira a lâmina, corta de cima para baixo e causa o deslocamento progressivo de faixas à esquerda/direita. Marca oficial faz um handoff FLIP para o logo real do hero, sem reproduzir o hero fictício da referência. Cores, fotos, oito divisores e funcionalidades permanecem intactas. Motion com `transform`/`opacity`, N=7 faixas mobile e N=12 desktop, media reduced-motion, skip, cleanup e F5. CSS separado: `css/ritual/perfect-cut-v3.css` após `loader-v2.css`. O mesmo gesto produz toda a revelação: não reintroduzir uma máscara radial concorrente.

### Refinamento de suavidade — V3.1 (26/10)

Após análise quadro a quadro do vídeo do usuário, a abertura do Perfect Cut deve usar apenas **duas metades contínuas** (sem linhas de blocos/retângulos) e uma incisão fina que avança no mesmo tempo linear da ponta da tesoura. O corte completa a travessia vertical, então os dois painéis se afastam; logo em seguida o logo realiza FLIP até o hero e textos/fotos ganham opacidade com stagger discreto. Remover zoom global do hero. Preservar scroll nativo, skip, reduced motion, F5, fontes/fotos oficiais e o restante do design system.

### The Perfect Cut V4 — duas tesouras independentes

O encerramento V4 substitui a viagem da tesoura do progresso: ela permanece na barra e desaparece por opacidade. Outro SVG entra acima da viewport, já vertical. Duas superfícies contínuas se inclinam e se deslocam por `transform`; suas bordas encontram-se exatamente na altura da ponta, mantendo sobreposição abaixo do corte. Linha e tesoura usam a mesma origem temporal e curva. Não há faixas nem máscaras animadas. A logo em voo usa o recorte do hero e escala uniforme, com crossfade e cancelamento integral dos efeitos. O hero preserva sua geometria e aparece durante o corte.

Preservar anel, marca, letras, trilhos e progresso iniciais. A frase do loader é “Seu estilo, nossa assinatura”; o letreiro superior discreto é “SR. NAVALHA • CORTE • BARBA • ACABAMENTO”. Não existe botão de pular no DOM: clique, teclado, toque, scroll, rotação, aba oculta e movimento reduzido liberam a abertura; os watchdogs continuam ativos. Esta especificação substitui o encerramento V3.1 acima, sem alterar a identidade nem os capítulos.

### Hero Signage V5 — placa de oficina

O letreiro sai do loader e substitui exclusivamente o cartão SN no alto à direita do hero. Superfície em tabaco, moldura de cobre, espessura escura, fixações pequenas e barber pole em SVG usam a paleta existente. As inscrições são “SR. NAVALHA”, “BARBEARIA · GRAVATÁ” e “CORTE · BARBA · ACABAMENTO”. A composição desktop/tablet mantém sua geometria; abaixo de 700 px, a placa recebe uma pequena faixa própria acima da logo, preservando o tamanho da marca e das fotografias.

A placa permanece invisível durante o Perfect Cut e entra uma única vez após `openingend`: opacidade e assentamento 3D em 1050 ms, com `cubic-bezier(.16,1,.3,1)`. Sem balanço contínuo. O controlador de movimento existente cancela a entrada com aba oculta ou preferência reduzida; a posição final continua visível. Sem JavaScript ou com falha da abertura, o CSS entrega a peça estática. A coreografia V4 permanece inalterada, exceto pela remoção das referências ao letreiro antigo.

## Creative Motion & Experience V6 — depois do corte

Este adendo substitui as diretrizes anteriores de placa textual e queda simultânea ao corte. O Perfect Cut V4 mantém anel, progresso, duas tesouras, painéis e transferência da logo. A conclusão natural remove todos os elementos e efeitos temporários e emite `openingend` com `completed: true`. Somente então o controlador independente do hero inicia a queda, no próximo quadro. Interrupções por interação, movimento reduzido ou navegação entregam o estado final diretamente.

A sequência segue cilindros, logo, título, subtítulo, fotografias, convite e ações. A logo real tem deslocamento curto depois do FLIP, sem clone adicional. Gravidade acelerada, dois rebotes decrescentes e balanço discreto das fotografias usam WAAPI; cada transformação termina na matriz CSS capturada antes da entrada. A opacidade durante a queda evita sobreposição visual prematura das fotografias com os textos. Movimento reduzido, foco, interação, resize durante a queda e aba oculta cancelam os efeitos e devolvem a composição final. Nenhuma fila CSS deixa conteúdo escondido.

Dois cilindros laterais pequenos usam apenas preto/branco, tampas simples e reflexo mínimo. O rotor interno tem período vertical de 32 px, camada independente e sentidos opostos; pausa por visibilidade/preferência preserva a fase. A geometria da marca, fotografias e botões continua definida pelo hero existente.

O controlador de revelações existente recebe perfis por material: fotografias assentam com inclinação curta; linhas do catálogo entram em grupos limitados; endereço, mapa e rodapé seguem a ordem de leitura. A galeria anima a janela interna, mantendo o FLIP das folhas com seu proprietário original. Filtros têm feedback curto, sem duplicação com a revelação de scroll. Contagem de produtos e cópia do endereço são os novos componentes funcionais; a cópia possui confirmação acessível e fallback por seleção do texto. Textos institucionais, dados comerciais, fotografias, capítulos, menu e CTA fixo com calendário permanecem preservados.

### Fechamento da validação V6 — 29/10/2026

As legendas pequenas dos divisores de produtos e localização usam `--wood` sobre suas placas claras para atingir contraste AA sem alterar fundos, ornamentos ou composição dos oito divisores. A regressão de âncoras aguarda a posição real do capítulo após a navegação; verifica simultaneamente destino visível e ausência do loader. A regressão de movimento reduzido aguarda o evento reconhecido pelo controlador antes de exigir zero animações ativas. A matriz específica do hero inclui 360 px. As suítes locais isolam a disponibilidade do mapa externo, mas preservam a verificação do iframe e da rota.
