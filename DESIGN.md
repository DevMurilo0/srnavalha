---
name: Sr. Navalha V6
description: Ensaio de cuidado com fotografias reais em escala controlada
colors:
  paper: "#e5e1d8"
  surface: "#dad5ca"
  ink: "#2a1d17"
  muted: "#65564c"
  green: "#456f3a"
  dark: "#241e1a"
  light-ink: "#ece7df"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 500
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(1rem,.95rem + .22vw,1.125rem)"
    lineHeight: 1.6
  caption:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
spacing:
  gutter: "clamp(20px,4vw,64px)"
  section-heading-gap: "44px"
rounded:
  map: "3px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "#ffffff"
    padding: "15px 23px"
    height: "54px"
---

## Overview

Sistema extraído da V6 implementada. Referência executável: `css/tokens.css`, `css/base.css` e componentes de Home/agendamento. A direção é Ensaio de cuidado, adaptação compacta de contact-sheet, não uma parede de fotos inventadas.

## Colors

Papel osso e tinta chocolate recebem fotografias naturais. Verde identifica escolha/ação e o convite final. O ambiente e o portfólio formam um ensaio escuro contínuo. Não acrescentar gradientes para disfarçar qualidade fotográfica.

## Typography

Uma família local, Manrope variável; corpo regular, títulos peso500. Marca horizontal no hero, títulos de seção em32–64px, legendas13px. Não recriar o hero anterior de slogan à esquerda/foto à direita.

## Layout

Contêiner máximo1440px, margens20–64px. Hero com retratos deslocados no desktop e dois por linha no mobile. Catálogo em faixas com conteúdo próprio, ambiente/equipe em conjunto, portfólio com índice e fotografia ativa. Breakpoints observados:1100,800,700,540 e350px; agendamento760/420px.

## Elevation & Depth

Predominantemente plano. Hierarquia por cor e espaço. O menu móvel aberto tem sombra suave para separação, sem cartões flutuantes em todas as seções.

## Shapes

Fotografias retangulares e proporções reais. Espelho desenhado em SVG como motivo gráfico. Cantos retos, mapa com raio3px e controles fotográficos circulares.

## Components

Catálogo nativo, visualizador de portfólio, dialog acessível, esteira de quatro avaliações, mapa com ativação e solicitação WhatsApp. Conteúdo funcional sem JS por HTML e links diretos. Movimento reduzido inicial/dinâmico cancela animações e apresenta avaliações estáticas.

## Do's and Don'ts

Preservar dados, fontes das avaliações, contato e crédito. Usar fotografias reais em escala honesta. Não gerar clientes, aumentar artificialmente o acervo, criar preços/disponibilidade ou afirmar reserva confirmada. Não introduzir bibliotecas obrigatórias de execução.
