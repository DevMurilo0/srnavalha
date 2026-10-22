---
name: Sr. Navalha — A arte do ritual
description: Fotografias reais, espelhos retangulares e consulta editorial em marfim, carvão quente e cobre
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
    fontFamily: "Bodoni, Georgia, serif"
    fontSize: "clamp(76px,7.8vw,112px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Bodoni, Georgia, serif"
    fontSize: "clamp(42px,5.6vw,80px)"
    fontWeight: 500
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  emphasis:
    fontFamily: "Bodoni, Georgia, serif"
    fontWeight: 500
  title:
    fontFamily: "Bodoni, Georgia, serif"
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
    padding: "17px 24px"
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
  review:
    backgroundColor: "{colors.tobacco}"
    textColor: "{colors.ivory}"
    padding: "32px"
    width: "360px"
---

# Design System: Sr. Navalha — A arte do ritual

## Overview

**Creative North Star: "A arte do ritual"**

A arte do ritual toma os espelhos retangulares, as perspectivas do salão e a luz linear da Sr. Navalha como matéria visual. Fotografias documentais em tamanhos desiguais, molduras finas e alternância de superfícies claras e escuras dão presença ao estabelecimento. A marca original permanece uma imagem própria; a assinatura tipográfica do rodapé é um elemento complementar.

Bodoni Moda desenha os títulos e Manrope sustenta a consulta. A assimetria deixa espaço para legenda, preço, duração e convite. O movimento acrescenta reenquadramento e continuidade ao conteúdo já visível; o fluxo de leitura e os destinos oficiais existem no HTML estático.

**Key Characteristics:**

- Fotografias reais em enquadramentos retangulares desiguais.
- Marfim e carvão quente como superfícies; tabaco, madeira e cobre como matéria e acabamento.
- Bodoni Moda normal e itálica no peso 500; Manrope local variável para consulta.
- Rolagem nativa, melhoria progressiva, pausa explícita e movimento reduzido.

Sistema extraído dos arquivos ativos `css/ritual/`, `index.html` e `js/ritual/`. A fonte canônica de geração é `scripts/render-site.mjs`, com dados em `js/data/`; `templates/ritual/` e `index.html` são entregas prontas. Este documento registra o mundo reconstruído e substitui a descrição V9. A revisão final dos cinco ajustes recebeu disposition `ship`, todos `resolved`, em `docs/ritual/REVISAO.md`; esse veredito é limitado ao lote revisado. As evidências de verificação estão em `docs/ritual/testes-chromium.json` e `docs/ritual/testes-firefox.json`; não são tokens nem regras visuais. Direção e seeds: `docs/ritual/DIRECAO.md` e `docs/ritual/SEED.txt`; Taste uneven-photographs (613466186), Impeccable seed:7e0b8d6a3efff99d. As seeds registram a exploração; os valores normativos acima vêm do código.

## Colors

A paleta combina papel mineral quente, profundidade de tabaco e acabamentos de madeira e cobre.

### Primary

- **Madeira — wood:** ênfase itálica em superfícies claras, foco e resposta do botão principal.
- **Cobre — copper:** molduras, acabamento, estrelas e ênfase sobre superfícies escuras.

### Neutral

- **Marfim — ivory:** fundo principal e texto sobre capítulos escuros.
- **Carvão quente — ink:** texto, ações principais, casa, avaliações e visualizador.
- **Tabaco — tobacco:** equipe, rodapé, moldura do espelho e depoimentos.
- **Pedra — stone:** seção de produtos, planos e fundo de imagens durante carregamento.
- **Texto suave — muted:** legendas e informação secundária sobre fundos claros.
- **Texto claro suave — light-muted:** informação secundária sobre fundos escuros.

**The Surface Contrast Rule.** Texto principal usa carvão sobre marfim ou marfim sobre carvão/tabaco; madeira e cobre acompanham o contexto de superfície.

## Typography

**Display Font:** Bodoni Moda, declarada no CSS como `Bodoni`, com Georgia e serif como fallback. Arquivos locais normal e itálico no peso 500.

**Body Font:** Manrope local variável (200–800), com Arial e sans-serif como fallback. O corpo usa peso normal; ações usam 600 e nomes selecionáveis 500.

O contraste vem dos traços editoriais da Bodoni e da leitura direta da Manrope. O itálico continua na mesma família do título.

### Hierarchy

- **Display:** título do hero; escala desktop no frontmatter. Em até 1000px usa `clamp(72px,10vw,100px)`; em até 700px usa `clamp(38px,12.4vw,88px)`, entrelinha 1.08 e alinhamento à esquerda; até 350px usa 40px.
- **Headline:** títulos de seção. Em até 700px usa `clamp(40px,10.4vw,64px)`; casa e visita têm ajustes próprios no CSS.
- **Title:** títulos do catálogo e FAQ; títulos do espelho e produto têm escalas próprias, respectivamente `clamp(27px,3vw,43px)` e `clamp(36px,5vw,70px)` no desktop.
- **Body:** parágrafos na escala do frontmatter; textos auxiliares e descrições variam entre 13–17px conforme o componente.
- **Label:** legendas, fonte da informação e navegação usam 13px. Preços e durações usam algarismos tabulares quando declarado pelo componente.

## Layout

O contêiner comum tem largura máxima de 1400px e desconta duas calhas; o cabeçalho chega a 1560px e o hero a 1260px. O espaçamento de seção e a calha são fluidos, com valores normativos no frontmatter. Até 700px as seções usam 78px e cabeçalhos de seção deixam a composição horizontal.

O hero combina três colunas desiguais; no celular, título, texto e agenda precedem duas fotos. A galeria usa 12 colunas no desktop e seis até 600px, mantendo larguras e deslocamentos distintos. Equipe e Espelho Vivo articulam lista, foto e informação em vez de repetirem cartões iguais. Produtos usam uma seleção editorial e catálogo em linhas; a lista passa a uma coluna até 800px.

A navegação móvel substitui a navegação horizontal até 1000px. O cabeçalho passa de 100px para 84px até 700px. Os pontos de adaptação observados são 1600, 1100, 1000, 800, 700, 600 e 350px; 1001px também delimita a cena desktop da casa. A casa usa uma curta cena sticky desktop com altura estável quando o movimento é pausado; no celular segue o fluxo normal.

## Elevation & Depth

A profundidade vem principalmente de superfícies alternadas, enquadramentos e molduras finas. Não há sombra nos cartões de depoimento nem nas fotos. O menu móvel usa a sombra observada `0 15px 40px #17161526` para separar a navegação do conteúdo.

Movimento usa easing de entrada `cubic-bezier(.22,1,.36,1)` e espacial `cubic-bezier(.76,0,.24,1)`. O Reflexo troca imagens decodificadas por máscara lateral (650ms); produto usa translação e escala moderadas (420ms). O Corte acompanha o progresso de rolagem nativa da casa. A Continuidade usa FLIP na galeria (650ms na entrada, 280ms na saída por clique). Entrada e scroll afetam camadas distintas.

**The Natural State Rule.** O CSS natural mantém conteúdo visível; cancelar animações retorna a ele. Movimento reduzido e pausa cancelam WAAPI, removem abertura e preservam acesso ao conteúdo. A esteira torna-se grade com movimento reduzido ou sem JavaScript.

## Shapes

Botões, filtros, fotografias e superfícies são retangulares, sem arredondamento decorativo. Molduras finas e bordas de uma linha acompanham os espelhos reais. Fotografias preservam proporções e usam recorte `object-fit:cover`; o visualizador usa `contain` para apresentar a imagem inteira. Ícones são SVGs de traço fino.

**The Real Photograph Rule.** Usar o acervo documental correspondente ao conteúdo; ausência ou falha de imagem recebe informação textual explícita. A proveniência dos rasters está registrada em `docs/ritual/proveniencia-embutida.json` e no inventário, sem alteração dos pixels ao incorporar metadados.

## Components

### Buttons

Ação retangular, texto Manrope (14px, peso 600), seta diagonal e distribuição entre extremidades. O botão comum tem altura mínima de 56px e escala de pressão .975; até 700px usa altura mínima de 54px e padding `16px 20px`. Hover de ponteiro fino usa madeira; no rodapé, o botão claro muda para cobre. O link de agenda do cabeçalho usa fundo transparente e borda inferior.

Foco global: contorno de madeira (2px), afastado 6px; contextos escuros específicos usam cobre. Links textuais têm sublinhado e alvo mínimo de 44px. Ícones acompanham hover com deslocamento curto quando aplicável.

### Chips

Filtros retangulares com borda translúcida de madeira, seleção carvão/marfim e `aria-pressed`. O grupo se reorganiza em linhas; no celular cada filtro usa altura mínima de 40px. A seleção é explícita e o resultado possui texto de status.

### Cards / Containers

Depoimentos usam tabaco sobre a seção carvão, largura e padding do frontmatter, altura mínima de 295px e citação Bodoni (25px, entrelinha 1.4). Até 600px usam largura de 295px, padding de 26px e citação de 24px. A esteira tem ciclo linear de 58s e pausa por controle, foco, hover, saída da viewport e aba oculta; o clone é oculto à tecnologia assistiva.

### Inputs / Fields

A categoria de produtos usa `select` nativo transparente, borda inferior de texto suave, padding `12px 26px 12px 8px` e largura máxima de 220px. Rótulo permanece visível. Não existe formulário de reserva local.

### Navigation

Cabeçalho claro com marca original; links Manrope e linha inferior revelada no hover. Menu móvel usa `details` nativo, painel tabaco e links Bodoni; abre em 240ms, fecha ao escolher destino, clicar fora ou pressionar Escape, devolvendo foco ao acionador nesse último caso.

### Espelho Vivo, equipe e catálogo

O Espelho Vivo combina seletores tipográficos, moldura tabaco/cobre, fotografia e informações do serviço; categorias vêm depois do título. A equipe combina cinco nomes e um retrato persistente. Seleções mantêm estado acessível e aceitam teclado/toque; trocas aguardam decodificação e o último pedido vence. Linhas de serviço usam `details` nativo com preço, duração e condições; assinaturas ficam em agrupamento separado. Os números do catálogo são dados comerciais, não tokens visuais.

### Galeria e mapa

Links nativos de fotografia abrem imagens sem JavaScript. Com melhoria progressiva, o diálogo ocupa a viewport, permite setas, Escape e swipe, e devolve foco ao link de origem. O mapa é um iframe externo real, com endereço e rota em texto; timer e tentativa de recarga tratam falhas detectáveis. O `details` “Não consigo ver o mapa” esconde a viewport e oferece rota mesmo diante de bloqueio silencioso de origem externa.

## Do's and Don'ts

### Do:

- Do preservar a marca original e fotografias reais, incluindo o fundo fotografado dos produtos.
- Do manter texto, preços, durações, destinos e detalhes essenciais disponíveis sem JavaScript.
- Do conservar foco perceptível e estados de seleção acessíveis.
- Do respeitar prefers-reduced-motion inicial e dinâmico e a pausa global.
- Do distinguir catálogo datado de disponibilidade e confirmação na plataforma oficial.

### Don't:

- Don't fabricar fotografias, biografias ou resultados de tratamentos.
- Don't substituir o logo original por uma composição tipográfica.
- Don't depender da animação para tornar o conteúdo legível.
- Don't transformar catálogos ou o mapa externo em promessa de estoque, agenda ou carregamento garantidos.
