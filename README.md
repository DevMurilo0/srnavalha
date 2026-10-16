# Sr. Navalha Barbearia

Site estático em HTML5, CSS3 e JavaScript puro. O projeto não precisa de npm, Node.js, build ou backend para ser visualizado.

**Para executar: clique com o botão direito em `index.html` e selecione Open with Live Server.**

## Estrutura

- `index.html`: página inicial.
- `agendar.html`: fluxo demonstrativo de agendamento.
- `css/`: estilos do site, animações, responsividade e agendamento.
- `js/`: menu, animações, galeria, microinterações e fluxo de agendamento.
- `assets/images/`: fotografias, logotipo e elementos gráficos locais.
- `assets/fonts/`: fontes locais Manrope e Barlow Condensed.
- `capturas/refinamento-v2/`: capturas da rodada visual anterior em 320, 375, 768 e 1440 px.
- `docs/`: refinamentos, origem dos assets, verificação de avaliações e resultados dos testes.
- `entrega/srnavalha-estatico-refinado.zip`: pacote histórico anterior ao sistema de motion; não representa as alterações atuais.
- `backup-nextjs/`: histórico da implementação anterior, preservado apenas no workspace e fora do ZIP de entrega.

O fluxo em `agendar.html` é uma simulação local. Ele não cria reservas nem envia ou salva os dados informados.

A galeria aceita setas, teclado, arraste com mouse e swipe. As animações respeitam `prefers-reduced-motion`; o conteúdo da Home permanece visível sem JavaScript. A seção de avaliações apresenta quatro depoimentos conferidos na ficha pública do Google Maps em 15/10/2026, com fonte e data de consulta. Os dados são estáticos, com atualização manual.

As imagens originais foram preservadas e os novos derivados visuais estão documentados em [docs/ASSETS_GERADOS.md](docs/ASSETS_GERADOS.md).

## Motion design

O sistema atual usa GSAP, ScrollTrigger e SplitText 3.15.0 locais, sem build. Arquitetura, licença, coreografia e testes: [docs/MOTION_DESIGN.md](docs/MOTION_DESIGN.md). Comparações em `capturas/motion/`; relatórios de validação em `docs/MOTION_TESTS_*.json`.

## Refinamento V4 — versão atual

Escala tipográfica compartilhada em `css/typography.css`; composição editorial em `css/editorial.css`. Avaliações verificadas em `js/reviews-data.js`; a esteira de avaliações tem movimento contínuo e controle Pausar/Reproduzir, com leitura manual em movimento reduzido. Para atualizar o HTML acessível após editar os dados, execute `python3 scripts/sync-reviews.py` (somente manutenção; não é necessário para abrir o site).

- [Direção de arte e motion V4](docs/MOTION_DESIGN_V4.md)
- [Referências Awwwards e limites da inspeção](docs/REFERENCIAS_AWWWARDS.md)
- [Fontes das avaliações Google](docs/AVALIACOES_GOOGLE.md)
- Capturas comparativas em `capturas/v4/antes/` e `capturas/v4/depois/`.

Os documentos e pacotes V2/V3 são históricos; os arquivos na raiz representam a versão atual.
