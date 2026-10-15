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
- `capturas/refinamento-v2/`: capturas atuais em 320, 375, 768 e 1440 px.
- `docs/`: refinamentos, origem dos assets, verificação de avaliações e resultados dos testes.
- `entrega/srnavalha-estatico-refinado.zip`: pacote da versão estática final.
- `backup-nextjs/`: histórico da implementação anterior, preservado apenas no workspace e fora do ZIP de entrega.

O fluxo em `agendar.html` é uma simulação local. Ele não cria reservas nem envia ou salva os dados informados.

A galeria aceita setas, teclado, arraste com mouse e swipe. As animações respeitam `prefers-reduced-motion`; o conteúdo da Home permanece visível sem JavaScript. Os depoimentos atribuídos aguardam confirmação; a seção atual direciona ao Google Maps.

As imagens originais foram preservadas e os novos derivados visuais estão documentados em [docs/ASSETS_GERADOS.md](docs/ASSETS_GERADOS.md).
