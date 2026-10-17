---
name: Sr. Navalha V8
description: Fotografia real, composição editorial e cuidado em carvão, marfim e cobre
colors:
  charcoal: "#141414"
  soft-black: "#202020"
  ivory: "#f3f0eb"
  mineral: "#85817b"
  copper: "#ad8b73"
  tobacco: "#756153"
  light-text: "#c7c2ba"
  dark-text: "#655f58"
  paper-shade: "#e7e2da"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(48px,7.3vw,106px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(38px,5.2vw,76px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  emphasis:
    fontFamily: "Young, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "13px"
rounded:
  square: "0"
spacing:
  gutter: "clamp(20px,5vw,80px)"
  section: "clamp(80px,10vw,150px)"
components:
  button-primary:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.square}"
    padding: "17px 23px"
  button-on-paper:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.square}"
    padding: "17px 23px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    rounded: "{rounded.square}"
    padding: "17px 23px"
  button-primary-hover:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.charcoal}"
  filter:
    backgroundColor: "{colors.paper-shade}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.square}"
    padding: "9px 14px"
  filter-selected:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.ivory}"
  review:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.ivory}"
    padding: "30px"
    width: "360px"
---

# Design System: Sr. Navalha V8

## Overview

**Creative North Star: "O cuidado em enquadramento"**

A V8 combina carvão, marfim e cobre com o logo original e fotografias reais da Sr. Navalha. A direção editorial usa proporções desiguais, intervalos amplos e títulos que alternam Manrope com Young Serif para aproximar o cuidado cotidiano de uma apresentação autoral.

A identidade depende das pessoas, dos serviços e do acervo da casa. Movimento acompanha escolhas e relações espaciais: a mesma fotografia atravessa o hero até a introdução no desktop; máscaras revelam títulos e retratos. O conteúdo permanece legível sem movimento.

**Key Characteristics:**

- Fotografia real em retângulos de tamanhos e posições desiguais.
- Contraste entre superfícies carvão e marfim, com cobre pontual.
- Manrope local para leitura e estrutura; Young Serif local para ênfase.
- HTML nativo, controles explícitos e movimento progressivo.

Esta documentação descreve a implementação atual em `css/tokens.css`, `css/site.css`, `css/motion.css`, `index.html` e `js/site.js`. A V8 substitui a especificação V6; arquivos históricos e estudos anteriores não são autoridade visual atual.

## Colors

### Primary

Cobre é o acento contido: indicador de navegação, foco em superfícies escuras, estrelas, seleção de texto e resposta ao hover. Tabaco dá contraste ao foco no marfim e aparece na palavra editorial dos produtos.

### Neutral

Carvão estrutura a página e a identidade; preto suave diferencia avaliações e o menu móvel. Marfim abre os catálogos e a localização. Papel sombreado sustenta filtros e produtos; mineral marca nomes inativos e contornos. Texto claro e texto escuro organizam legendas conforme a superfície. Os valores normativos estão no frontmatter e vêm dos tokens CSS.

**The Surface Contrast Rule.** Texto principal alterna entre marfim sobre carvão e carvão sobre marfim; cobre marca foco, estado e pequenos acentos.

## Typography

Manrope variável local (`manrope-v6-latin.woff2`, pesos 200–800) é a voz de leitura e estrutura. Young Serif local (`young-serif.ttf`, registrada como `Young`, peso 400) traz ênfase em palavras e linhas específicas, sem itálico sintético. Não substituir o logo por texto composto nessas fontes.

O hero e os títulos de seção seguem os papéis display/headline; o destaque serifado herda o tamanho do título. Produtos usam Young em títulos próprios, com escala de 34–54px no desktop. Corpo tem limite de leitura de 65ch; descrições e legendas são mais curtas. Preços e indicadores numéricos usam algarismos tabulares quando definidos no componente.

No mobile até 600px, o hero usa `clamp(38px,8.7vw,52px)` e entrelinha 1.12; a 350px ou menos usa 38px. Legendas relevantes permanecem em 13px e o texto de leitura em 16px. As regras finais de `site.css` prevalecem sobre os tamanhos menores que aparecem anteriormente no arquivo.

## Layout

Contêiner máximo de 1440px com margens fluidas e seções amplas. Até 600px as margens são 22px e o ritmo de seção é 76px; até 350px as margens são 18px. Breakpoints efetivos: 1600, 1100, 850, 600 e 350px.

O hero combina texto e duas fotografias de escala desigual. Catálogos e equipe usam colunas assimétricas; na equipe, lista de nomes e retrato continuam lado a lado no mobile, com legenda e ação abaixo. Catálogos, localização e convite se empilham em telas pequenas. O apoio lateral de serviços desaparece até 600px sem remover o catálogo.

A galeria mantém rolagem horizontal nativa com encaixe e fotografias desencontradas. A navegação desktop cede a um `details` móvel até 850px; o cabeçalho fica fixo durante a rolagem, com alturas de 100px, 86px e 82px conforme a largura. A passagem da fotografia do hero só atua acima de 850px e com movimento permitido; nessa condição a fotografia termina junto da introdução, em um encaixe de 240px.

## Elevation & Depth

Superfícies planas, separadas por cor, espaço e filetes. Não há sombra de elevação recorrente; o contorno do botão secundário é um filete interno. Fotografia sobreposta, máscara de recorte e o fundo escuro do diálogo produzem profundidade sem cartões flutuantes.

**The Progressive Motion Rule.** Movimento reforça a relação entre elementos; navegação, leitura e agendamento continuam disponíveis sem animação.

## Shapes

Cantos retos em botões, filtros, retratos e contêineres. As fotografias variam de quadrado a retrato e enquadramento horizontal, com recorte definido por contexto. Setas diagonais finas indicam ações; sinais de mais giram na abertura de detalhes. Divisores discretos organizam as linhas do catálogo.

**The Real Photograph Rule.** Usar imagens oficiais e do acervo com escala compatível com a resolução; ausência de fotografia vira apresentação tipográfica explícita.

## Components

### Buttons

Ações retangulares, texto em Manrope 14px e peso 700; altura mínima de 58px. A ação clara no carvão inverte no papel. A variante transparente tem contorno mineral. Hover com ponteiro fino usa cobre e desloca a seta; pressionar reduz a escala para 0.98. Foco visível tem contorno de 2px e afastamento de 6px, cobre no escuro e tabaco no papel. Links textuais sublinhados têm alvo mínimo de 44px.

### Filters and catalogs

Filtros retangulares têm altura mínima de 44px, estado explícito `aria-pressed` e seleção carvão/marfim. Serviços são linhas de `details` nativo com nome, preço, duração e descrição; nenhuma linha depende de uma animação para abrir. O catálogo completo fica sob uma abertura própria. Produtos têm consulta nominal via WhatsApp; itens sem fotografia oficial exibem nome e aviso tipográfico, sem imagem fabricada.

### Navigation

Logo original preservado, links em 14px e indicador cobre animado sob a seção ativa. O menu móvel usa `details`, fecha por seleção, clique externo ou Escape e retorna o foco ao acionador por Escape. O link de agendamento aponta diretamente ao sistema oficial.

### Editorial photograph and masked title

O mesmo elemento fotográfico do hero reduz, atravessa e se acomoda na introdução conforme a rolagem desktop. A fotografia não é duplicada para simular a passagem. Títulos entram por máscara tipográfica; os estados HTML padrão continuam visíveis sem JavaScript. A passagem é cancelada no mobile e com movimento reduzido.

### Professional portrait selector

Nomes em grande escala, seleção marfim e estado inativo mineral. Retratos persistem em camadas: a imagem seguinte é decodificada antes da ativação, com máscara horizontal de 480ms. Trocas rápidas aceitam a última solicitação; foco e clique também selecionam. O nome ativo é anunciado em região `aria-live`. Hover apenas existe para ponteiro fino.

### Product showcase and gallery

Produto e descrição mudam juntos, com máscara de 280ms e texto de 220ms. O catálogo textual conserva nome, preço e consulta. A galeria abre `dialog` nativo, com setas, Escape, gesto horizontal e retorno de foco; os links originais abrem a imagem sem script.

### Reviews and map

Depoimentos são blocos carvão sobre preto suave, sem arredondamento ou sombra. A esteira avança 25px/s quando visível; pausa com foco, ponteiro e controle explícito. Com movimento reduzido, remove clones e exibe grade estática. O mapa carrega por ação do visitante, preservando endereço e links diretos para rotas caso o provedor falhe.

## Do's and Don'ts

### Do:

- Do preservar o logo original e identificar fotografias do catálogo e do acervo.
- Do usar os tokens reais e conferir o contraste na superfície correspondente.
- Do manter links diretos, detalhes nativos, foco visível e alvos de pelo menos 44px nos controles.
- Do respeitar prefers-reduced-motion inicialmente e quando a preferência mudar.
- Do apresentar datas de consulta, preços condicionais e disponibilidade sob consulta.

### Don't:

- Don't gerar profissionais, clientes, ambiente ou fotografias fictícias para preencher o layout.
- Don't recuperar o verde e a tinta chocolate da V6 como tokens atuais.
- Don't ampliar a pequena fotografia antiga do interior como imagem de destaque.
- Don't apresentar o catálogo estático como estoque, agenda ou confirmação de reserva em tempo real.
- Don't transformar todos os blocos em cartões arredondados com sombra.
