---
name: Sr. Navalha V9
description: Fotografia real, enquadramento cinematográfico e movimento em carvão, marfim e cobre
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
    fontSize: "clamp(88px,9.7vw,154px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(44px,6.2vw,88px)"
    fontWeight: 500
    lineHeight: 1.07
    letterSpacing: "-0.04em"
  emphasis:
    fontFamily: "Young, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "23px"
    fontWeight: 400
    lineHeight: 1.07
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
    padding: "16px 25px"
  button-on-paper:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.square}"
    padding: "16px 25px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    rounded: "{rounded.square}"
    padding: "16px 25px"
  button-primary-hover:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.charcoal}"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.square}"
    padding: "8px 14px"
  filter-selected:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.ivory}"
  review:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.ivory}"
    padding: "32px"
    width: "360px"
---

# Design System: Sr. Navalha V9

## Overview

**Creative North Star: "O cuidado em enquadramento"**

A V9 preserva carvão, marfim e cobre, o logo original e as fotografias reais da Sr. Navalha. O enquadramento remete ao espelho da barbearia: retrato dominante, cantos recortados e tipografia editorial em duas vozes. A referência Salomé orienta ritmo, coordenação e continuidade espacial; a identidade permanece ligada às pessoas e ao cuidado da casa.

O movimento é uma camada progressiva da composição. Abertura por painéis, fotografia e título compartilham uma sequência; a rolagem nativa transforma o enquadramento até a apresentação da casa. Passagens breves alternam corte fotográfico, superfície e tipografia, sem tornar todas as seções sticky. O HTML preserva conteúdo e destinos reais sem depender dessas cenas.

**Key Characteristics:**

- Retratos oficiais em molduras de espelho e composições fotográficas assimétricas.
- Carvão e marfim estruturam capítulos; cobre e tabaco pontuam estados e acabamentos.
- Manrope local organiza leitura e escala; Young Serif local dá contraste editorial.
- Scroll nativo, controles explícitos e responsáveis distintos para entrada e progresso.

Esta atualização reconcilia o sistema V8 com a implementação V9 em `css/tokens.css`, `css/site.css`, `css/motion.css`, `index.html`, `js/site.js` e `js/motion/`. Os tokens confirmados de paleta e fontes permanecem; a composição e o movimento antigos não são autoridade para novas alterações.

## Colors

### Primary

Cobre envelhecido marca foco no escuro, indicador de navegação, estrelas e resposta ao hover. Tabaco dá contraste no marfim e participa das composições tipográficas de produtos. Os valores normativos estão no frontmatter, extraídos dos tokens CSS.

### Neutral

Carvão é a superfície principal; preto secundário diferencia avaliações e menu móvel. Marfim abre catálogos e localização. Papel sombreado sustenta produtos e mapa; texto claro e escuro oferecem notas adequadas às superfícies. Mineral permanece no vocabulário de tokens; não deve substituir automaticamente o texto principal.

**The Surface Contrast Rule.** Texto principal alterna entre marfim sobre carvão e carvão sobre marfim; cobre marca foco, estado e pequenos acentos.

## Typography

Manrope variável local (`manrope-v6-latin.woff2`, pesos 200–800) sustenta estrutura e leitura. Young Serif local (`young-serif.ttf`, registrada como `Young`, peso 400) compõe ênfases e nomes de produtos; não usa itálico sintético.

O display do hero segue o frontmatter. A segunda linha usa Young a 0.84em; a entrelinha do hero é 1.08. As adaptações atuais são 11vw até 1100px, 11.5vw até 850px, `clamp(51px,14vw,82px)` até 600px e 14vw até 350px; acima de 1600px o display é 160px. No mobile a segunda linha usa 0.86em, ou 0.85em até 350px. O tracking observado do hero é -0.055em, específico desta composição, sem propagá-lo ao corpo.

Títulos de seção usam o papel headline, entrelinha 1.07 e tracking -0.04em; nos cabeçalhos de seção passam a 48px até 850px e `clamp(36px,10vw,52px)` até 600px. O título da apresentação usa `clamp(44px,5.4vw,76px)` e 40px no mobile com cena ativa. Produtos usam Young em `clamp(35px,4vw,58px)`, com adaptações para 34px no tablet e 38px no mobile. Texto base permanece em 16px/1.65; medidas de leitura são locais, como 33ch na apresentação e 38ch nos produtos. Preços e indicadores usam algarismos tabulares quando definidos no componente.

## Layout

Contêiner máximo de 1440px, margens e espaçamento de seção fluidos conforme frontmatter. Até 600px, margens de 22px e seções de 76px; até 350px, margens de 18px. Breakpoints usados: 1600, 1100, 850, 600 e 350px.

O cabeçalho sticky tem alturas de 94px, 82px até 850px e 76px até 600px. A navegação horizontal cede a `details` móvel até 850px. A ação de agendamento permanece no cabeçalho.

O hero desktop combina retrato principal, detalhe fotográfico menor, convite e título em duas linhas. A fotografia ocupa 31.5% da largura, limitada a 460px, com altura `clamp(400px,48vh,500px)`; a segunda linha fica separada pela composição, com intervalo `clamp(340px,38vh,430px)`. A cena tem altura `calc(100svh - 94px)`, mínimo de 820px e máximo de 1000px. Com JavaScript e movimento permitido, a jornada ocupa 185svh e sua cena é sticky; no mobile a cena mede 795px e a jornada `calc(795px + 85svh)`. A foto mobile usa largura de 69%, altura de 300px e posição própria. Esses valores descrevem a cena existente; não são um modelo universal para novas páginas.

Catálogos usam colunas assimétricas; no mobile os serviços preservam fotografia de apoio de 125px junto da legenda. Equipe mantém nomes e retrato lado a lado, com ação abaixo. Produtos e localização empilham no mobile. Portfólio é grid editorial no desktop e faixa horizontal nativa com snap até 600px. Movimento reduzido transforma a jornada em leitura estática e avaliações em grade; sem JavaScript o HTML mantém conteúdo e links.

## Elevation & Depth

Profundidade nasce da sobreposição fotográfica, recorte, diferença de superfícies e diálogo nativo. Não há sistema recorrente de sombras de elevação. O pequeno text-shadow da legenda desktop serve somente ao contraste fotográfico.

**The Single Motion Owner Rule.** Entrada e scroll usam camadas distintas; uma única fonte de progresso controla os wrappers do hero.

## Shapes

Botões e catálogos têm cantos retos. A moldura de espelho recorta os cantos superiores do retrato e recebe acabamentos SVG próprios. Setas diagonais indicam destinos; sinais de mais giram nos detalhes nativos. Filetes organizam catálogos e acompanham a precisão do enquadramento; não são uma decoração universal para novas superfícies.

**The Real Photograph Rule.** Usar imagens oficiais com escala compatível com a resolução; ausência de fotografia específica recebe apresentação tipográfica explícita.

## Components

### Buttons

Ações retangulares em Manrope 15px, peso 650, altura mínima de 58px e padding conforme frontmatter. Superfícies claras e escuras invertem a ação. A variante transparente tem borda cobre. Hover com ponteiro fino muda para cobre e desloca a seta; pressionar reduz a escala para 0.98. Foco usa contorno de 2px e afastamento de 6px, cobre no escuro e tabaco no marfim. Links textuais têm alvo mínimo de 44px. Adaptações mobile do CTA usam 14px e mínimo de 54px.

### Navigation

Logo original, links desktop de 14px e indicador cobre sob a seção ativa. Menu móvel com detalhes nativos, entrada por máscara e links por deslocamento curto; Escape fecha e devolve foco ao acionador. Navegação e agendamento preservam destinos reais.

### Opening and hero

Abertura injetada por JavaScript, com identidade central, filete e dois painéis. O movimento principal dos painéis dura 930ms, após atraso de 430ms; a cortina é removida em 1400ms, com timeout JS de segurança de 2200ms e fallback CSS de 2400ms. O orçamento de espera pelos recursos essenciais é de 180ms. Rolagem, movimento reduzido e falhas de execução encerram a abertura.

Máscara da fotografia (1050ms), escala do seu filho (1250ms), linhas tipográficas (900ms, intervalo de 95ms) e elementos de apoio (550ms) se coordenam com os painéis. A entrada pertence aos filhos; o scroll pertence aos wrappers `hero-photo-travel` e `hero-title-travel`, nunca aos mesmos transforms.

O módulo do hero calcula um único progresso limitado de 0 a 1. Foto reduz e desloca entre 0.05 e 0.72; título e apoios recuam antes da apresentação aparecer entre 0.58 e 0.94. Controles dos apoios ficam inert quando sua opacidade cai abaixo de 0.05; a apresentação conserva texto disponível a leitores de tela e retira o link da ordem de Tab enquanto não está legível. Movimento reduzido restaura controles e leitura estática.

### Section passages

Serviços para equipe: faixa tipográfica desloca horizontalmente e uma fotografia revela a seguinte por corte de máscara. Equipe para produtos: superfície marfim atravessa a passagem enquanto suas palavras respondem em sentidos opostos. Portfólio para avaliações: duas linhas desaceleram visualmente a sequência fotográfica. Encerramento: fotografia recebe deslocamento e escala discretos junto do convite e rodapé. As passagens trabalham apenas enquanto próximas da viewport; entradas fotográficas avulsas usam máscara de 850ms ao atingir 12% de visibilidade.

### Filters and services

Filtros retangulares, altura mínima de 44px, `aria-pressed` e seleção carvão/marfim. Serviços são `details` nativos com nome, preço, duração e destino oficial. Fotografias específicas são decodificadas antes da troca, em máscara de 560ms; pedidos rápidos aceitam a última seleção. Serviços sem fotografia específica mostram fallback tipográfico identificado. O catálogo completo mantém seus dados no HTML.

### Professional selector

Cinco profissionais reais, nomes em escala editorial e retratos persistentes em camadas. Máscara e deslocamento de 560ms, escala da imagem de 650ms e estado ativo explícito. Clique, toque e foco selecionam; hover complementa apenas com ponteiro fino. O carregamento termina antes da ativação e a última seleção prevalece.

### Products and gallery

Imagem e informações mudam juntas; máscara do produto dura 520ms e transição textual 220ms. O catálogo mantém consulta nominal por WhatsApp. Falta de fotografia recebe apresentação tipográfica honesta. O portfólio abre `dialog` nativo, expansão espacial de 320ms, fechamento de 180ms, setas, Escape, swipe e retorno de foco; sem script os links abrem a imagem.

### Reviews and map

Avaliações usam superfície carvão sobre preto secundário, largura desktop de 360px e padding conforme frontmatter; no mobile, largura de 285px e padding de 26px. A esteira avança a 22px/s enquanto visível, com pausa por foco, ponteiro e controle explícito. Movimento reduzido remove clones e apresenta grade estática. O mapa carrega por ação do visitante e preserva endereço e links para rotas quando o provedor falha.

O motor coordena leituras, escritas e esteira em um único requestAnimationFrame, dorme sem trabalho contínuo e pausa na aba oculta. Transições CSS usam `--ease`; animações WAAPI usam `cubic-bezier(.16,1,.3,1)`. Ambos são valores atuais distintos; máscaras usam `--cut`. Recursos externos, acervo antigo pequeno e estados de catálogo datados são limitações documentadas, não tokens ou regras para ocultar falhas.

## Do's and Don'ts

### Do:

- Do preservar o logo original e usar fotografias oficiais na escala permitida pela resolução.
- Do manter um único responsável por transformação; separar wrappers de entrada, scroll e imagem.
- Do manter conteúdo padrão visível, foco perceptível e controles ocultos fora da navegação por teclado.
- Do respeitar prefers-reduced-motion inicialmente e em mudanças durante a visita.
- Do identificar ausência de fotografia e manter datas, preços e disponibilidade sob consulta.

### Don't:

- Don't transferir cores, símbolos gastronômicos ou recursos proprietários do Salomé para a marca.
- Don't fabricar fotografias de profissionais, cortes ou ambiente, nem ampliar indiscriminadamente o acervo pequeno.
- Don't substituir a marca original por texto estilizado.
- Don't apresentar catálogo estático como estoque ou confirmação de reserva em tempo real.
- Don't acumular soluções de suavização, timelines concorrentes ou efeitos sticky em todas as seções.
