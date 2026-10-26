---
name: Sr. Navalha — A arte do ritual
description: Fotografia documental, gravura e enquadramentos em marfim, carvão quente e cobre
colors:
  ivory: "#f3eee5"
  ink: "#202a2a"
  tobacco: "#283131"
  wood: "#795343"
  copper: "#ba9a75"
  stone: "#e3ddd2"
  muted: "#625b53"
  light-muted: "#c8c8ba"
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
- **Headline:** títulos gerais na escala do frontmatter. A casa usa `clamp(40px,5.1vw,72px)`; o convite do rodapé usa `clamp(42px,4.6vw,66px)`, peso 600 e entrelinha 1.03. As composições têm ajustes próprios no celular.
- **Title:** títulos de catálogo e FAQ na escala do frontmatter; serviços e produtos têm escalas específicas conforme a extensão dos nomes.
- **Body:** parágrafos na escala do frontmatter. Descrições e textos auxiliares usam variações de 13–18px conforme função.
- **Label:** navegação, legendas e fontes usam a escala do frontmatter. Preços e durações usam algarismos tabulares quando declarado.

Títulos preservam seu HTML sem divisão em palavras. Um observador compartilhado limita entradas concorrentes a três no celular e seis no desktop, sem ocultação em fila.

## Layout

O contêiner comum tem largura máxima de 1400px e desconta duas calhas; cabeçalho chega a 1560px e hero a 1320px. Calha e espaçamento de seção são fluidos. Até 700px, seções comuns usam 78px entre capítulos e os cabeçalhos passam ao fluxo vertical.

O hero tem centro tipográfico e três fotografias desiguais: fachada, ambiente e detalhe. No telefone, fachada e salão precedem o convite com detalhe lateral. Espelho Vivo combina seleção, fotografia e informação. O Painel de Profissionais usa nomes, retrato e convite em três colunas; abaixo de 1100px o convite ocupa outra linha. Produtos usam imagem e informação, seguidas de catálogo em linhas; a lista passa a uma coluna até 800px.

O Álbum de Estilos alterna uma superfície de folhas sobrepostas com a parede editorial de 12 colunas (seis no celular). Mudanças de composição usam FLIP; o estado sem JavaScript preserva a parede com links nativos. Fotografias pequenas mantêm limites particulares de tamanho. A casa mantém fluxo natural. A fotografia dissolve por CSS view timeline em desktops compatíveis e por entrada pontual no Firefox; no celular, permanece estável.

A navegação móvel aparece até 1000px. O cabeçalho usa 106px no desktop e 84px até 700px. Outros pontos de adaptação observados são 1600, 1200, 1100, 900, 800, 700, 600, 500, 375 e 350px, conforme o componente.

## Elevation & Depth

A profundidade vem de planos cromáticos, recortes, sobreposições e filetes. Fotografias do hero têm elevação difusa no hover; folhas do álbum usam sombra suave que reforça sua sobreposição física. Depoimentos permanecem superfícies planas. Não há sombra dura deslocada.

### Shadow Vocabulary

- **Menu móvel** (`0 15px 40px #202a2a26`): separa o painel da página.
- **Folha fotográfica** (`0 12px 25px -18px #28313166`): distingue as folhas sobrepostas.
- **Fotografia em hover** (`0 24px 50px -33px #202a2ab0`): resposta localizada no hero.

Movimento usa easing de entrada `cubic-bezier(.22,1,.36,1)` e espacial `cubic-bezier(.76,0,.24,1)`. O núcleo WAAPI registra animações e cancela efeitos de componentes ao interromper estados. Trocas fotográficas aguardam decodificação; a imagem anterior permanece sob a dissolução e o último pedido vence. Não existe agendador JavaScript ligado à rolagem. Progresso usa CSS scroll timeline quando disponível; o fallback mantém a composição estática. O preview da equipe tem somente um RAF finito enquanto o ponteiro se move.

**The Natural State Rule.** O CSS natural mantém conteúdo visível. Cancelamento, movimento reduzido e falhas de dependência preservam leitura e destinos reais; a apresentação não depende de uma classe de entrada oculta.

## Shapes

Ações, filtros, imagens e superfícies são predominantemente retangulares. Cantos chanfrados, filetes duplos e estudos de ferramentas são vetores originais em `assets/decor/v17/`. A exceção circular pertence aos controles anterior/próximo do álbum e à geometria dos instrumentos. Molduras e bordas são parte da direção pedida pelo proprietário; não aplicar proibições genéricas que eliminem essa materialidade.

Gravuras não interceptam ponteiro nem escondem conteúdo essencial. Traços mantêm espessura consistente ao escalar. A construção animada de parte dos caminhos usa `pathLength`, sem exigir que a animação aconteça para revelar o desenho.

**The Real Photograph Rule.** Usar o acervo oficial correspondente ao conteúdo, respeitando sua resolução. Ausência ou falha de imagem recebe informação explícita; ornamentos vetoriais não substituem logo, ambiente, profissionais ou embalagens.

## Components

### Buttons

Ação retangular, texto Manrope (14px, peso 600), seta SVG e distribuição entre extremidades. O botão comum tem altura mínima de 56px; até 700px, 54px. Ação principal usa carvão/marfim e resposta madeira. Fundo direcional e deslocamento curto complementam o hover em ponteiro fino; foco recebe resposta equivalente. O CTA especial do rodapé usa superfície clara, altura mínima de 80px no desktop e seta em área própria.

Foco global usa contorno de madeira (2px), afastado 6px; contextos escuros usam cobre. Pressão tem escala curta. Movimento reduzido retira o deslocamento. O agendamento aponta para agendar.html, demonstração local de horários.

### Chips

Filtros e seletores de modo são retangulares com filete contextual. Seleção usa carvão/marfim e `aria-pressed`. O grupo quebra linhas conforme espaço disponível. O catálogo informa o resultado em texto. O modo do álbum altera a composição completa.

### Cards / Containers

Depoimentos são superfícies tabaco com citação Sora e fonte individual. O módulo ativo usa largura do frontmatter e citação `clamp(17px,1.65vw,22px)`; no telefone, 18px. A esteira desliza da direita para a esquerda em ciclo linear de 44s e pausa por botão, foco, hover, saída da viewport ou aba oculta. Sem JavaScript ou com movimento reduzido, os depoimentos ficam estáticos; o clone é inerte e oculto à tecnologia assistiva.

### Inputs / Fields

Categoria de produtos usa `select` nativo transparente, borda inferior, rótulo persistente e largura máxima de 220px. agendar.html mantém o formulário frontend local e o contrato de localStorage; não há backend nem checkout.

### Navigation

Cabeçalho claro, marca original e links com linha revelada. O menu móvel usa `details` nativo e painel tabaco com Sora. Fecha ao escolher destino, clicar fora ou pressionar Escape; nesse último caso, devolve foco ao acionador. O rodapé reúne navegação, contatos, endereço e convite fotográfico; não repete o bloco de horários removido anteriormente.

### Espelho Vivo e Painel de Profissionais

O espelho coordena seleção, fotografia e dados reais do serviço. O painel da equipe coordena nome selecionado, índice, marcador vertical, retrato, moldura e destino de agenda. Hover em ponteiro fino, foco, clique e toque têm equivalentes funcionais; setas, Home e End percorrem profissionais. A legenda confirma a imagem carregada. Nenhuma biografia é inferida.

### Álbum de Estilos e visualizador

Folhas sobrepostas e parede são dois estados do mesmo conjunto de fotografias. Seis miniaturas, anterior/próximo e ampliação permitem exploração; a navegação por teclado e swipe tem suporte. No modo de folhas, o primeiro toque seleciona a fotografia e a selecionada abre o visualizador. Este usa diálogo nativo com setas, Escape, swipe e devolução do foco. Sem JavaScript, os links abrem o arquivo real.

### Abertura e encerramento

O Reflexo do Ritual reposiciona a própria fotografia do salão e a marca oficial desde um quadro sobre fundo mineral até seus espaços no hero. Abertura é breve, sem porcentagem falsa e com prazo curto para decodificar a imagem essencial; executa uma vez por sessão, possui timeout e aborta com interação, preferência reduzida ou aba oculta. Âncoras profundas entram diretamente no destino. O rodapé combina fotografia, chamada e assinatura estática; a faixa ambiente pausa fora da viewport. Movimentos ambientais pausam fora de vista.

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


## Reconstrução · O Reflexo do Ritual (26/10/2026)

A paleta mineral parte de #202a2a, marfim #f3eee5 e bronze #ba9a75. Terracota #795343 mantém contraste nos títulos claros. Fotografias, marca e fontes locais são preservadas.

A abertura mede fotografia e logo uma vez, move os nós reais para planos temporários e anima transform/opacity. Conclusão ou interrupção recoloca os nós nos slots originais. Imagem e fontes têm prazo de 450ms; falha libera o hero. O deslocamento dura 940ms; o watchdog independente no head libera tudo em 1800ms. Primeira visita por sessão; ?intro=1 permite revisão. Âncoras profundas, histórico e movimento reduzido entram diretamente. Nenhum gesto é cancelado.

As oito costuras conservam suas frases, com superfícies contíguas e três alinhamentos: entrada, saída e centro. Quatro filetes pequenos se constroem uma vez; textos estáticos. Saem placas inclinadas, carimbos, números duplicados e ocultação global prévia.

Movimento ambiente pausa sem reiniciar a fase. Trocas do espelho/equipe usam dissolução e deslocamento discreto. O álbum agrupa leituras antes de criar animações e responde diretamente ao teclado. No celular o filme decorativo mantém a fotografia real, sem requisição de vídeo competindo com scroll.

[Medições, capturas, exceções do inspector e limites de validação](docs/reflexo/RELATORIO.md). Resultados de versões anteriores são históricos.
