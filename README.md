# Sr. Navalha · V9

Site estático da Barbearia Sr. Navalha, no Prado, Gravatá–PE. HTML, CSS, JavaScript e SVG, com fontes e fotografias locais. Funciona diretamente no Live Server, sem npm ou build obrigatório.

## Abrir

No VS Code, abra `index.html` com **Open with Live Server**. Alternativa: `python3 -m http.server 8019`, depois `http://localhost:8019`. Use HTTP para os módulos JavaScript. Sem JavaScript, o conteúdo e os links essenciais continuam disponíveis. `agendar.html` leva ao AppBarber oficial.

## V9

- Abertura curta com logo original, filete e dois painéis coordenados à revelação do hero.
- Hero com retrato oficial em moldura de espelho, título monumental e progresso reversível de scroll.
- Apresentação da casa integrada à transformação do hero em desktop e mobile.
- Passagens próprias entre serviços/equipe, equipe/produtos, portfólio/avaliações e encerramento.
- 42 serviços, preços e durações; 5 profissionais reais; 22 produtos; assinaturas e contatos preservados.
- Seleção de serviços com máscara de foto ou fallback honesto; equipe em camadas e produtos sincronizados ao WhatsApp.
- Galeria editorial no desktop, coleção deslizável no mobile, lightbox espacial com teclado/Escape/swipe.
- Esteira de comentários com pausa, foco, toque e suspensão fora da tela.
- Rolagem nativa, scheduler compartilhado, redução de movimento inicial/dinâmica e conteúdo sem JS.

## Manutenção

Dados: `js/data/services.js`, `professionals.js`, `products.js`, `reviews.js`. Após editar, execute **opcionalmente** `node scripts/build-v9.mjs`, que gera `index.html` e `agendar.html`. `build-v8.mjs` agora encaminha ao gerador V9 para evitar restaurar acidentalmente o layout antigo. O gerador original e os arquivos anteriores estão em `backup/v9-preflight/`; backups anteriores foram preservados.

Visual: `css/tokens.css`, `css/site.css` e `css/motion.css`. Comportamento: `js/site.js` e módulos `js/motion/` (core, opening, hero, passages, services, reviews). Não acrescente outra timeline ao transform de um wrapper já controlado por scroll.

O site não depende de CDN, GSAP ou Lenis. AppBarber, Google Maps, WhatsApp e Instagram continuam como destinos externos reais; o mapa só é solicitado por ação do visitante. Reservas e compras não são simuladas.

## Pesquisa e testes

- [Pesquisa Salomé](docs/REFERENCIA_SALOME_V9.md)
- [Direção artística](docs/ART_DIRECTION_V9.md)
- [Sistema de movimento](docs/MOTION_V9.md)
- [Imagens e limites de resolução](docs/IMAGENS_V9.md)
- [Testes executados e limitações](docs/TESTES_V9.md)
- [Sistema visual](DESIGN.md)

Capturas V8/V9 e estados intermediários: `capturas/v9/`. Evidências: `docs/V9_*.json`. Scripts de navegador são opcionais e usam Node 22+, Chromium local (`CHROME_PATH`) e Firefox BiDi. Nenhuma ferramenta de teste é dependência de produção.

## Conteúdo e limites

[AppBarber](https://sites.appbarber.com.br/srnavala-pqjj) consultado em 19/10/2026; acervo comercial original de 17/10 mantido. [Google Maps](https://www.google.com/maps/place/?q=place_id:ChIJU15canBJqgcRARZqMshC8cA) confirmou 5,0 na consulta de 19/10, mas não exibiu o total: as 467 avaliações permanecem explicitamente datadas de 17/10/2026. Depoimentos mantêm suas fontes individuais.

Instagram bloqueou a consulta automatizada. Não houve acesso a novos originais de atendimento ou ambiente em alta resolução, nem geração de rostos/detalhes. Fotografias pequenas continuam em escala adequada. Sem validação em aparelho físico, Safari/iOS ou leitor de tela real. O detector estilístico Taste conserva ressalvas documentadas; não se declara aprovação integral.

Crédito de Murilo Gabriel preservado. Sem commit ou push nesta entrega.
