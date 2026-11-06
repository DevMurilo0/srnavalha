# O Trabalho — fotografia em primeiro plano

Escopo: seção #trabalhos e diálogo de portfólio. Mantidos os caminhos das seis fotos WebP de 960 px, marca oficial, fontes, paleta e arquitetura estática. Nenhuma dependência de produção adicionada.

## Referências e decisões

Pesquisa nas demonstrações/documentação e código-fonte de https://reactbits.dev/:
- Animated Content: entrada com transform/opacity, stagger de 75 ms; IntersectionObserver e Web Animations nativas.
- Tilted Card: perspectiva limitada a 2 graus por eixo, somente mouse fino, atualização agrupada por requestAnimationFrame.
- Spotlight Card / Glare Hover: uma única camada luminosa suave sobre cada fotografia; movimento por transform, sem filtros animados.
- Carousel: navegação direcional, teclado, swipe e seleção explícita. Sem autoplay.

Fontes: https://github.com/DavidHDev/react-bits/tree/main/src/content (Animations/AnimatedContent, Animations/GlareHover, Components/TiltedCard, Components/SpotlightCard, Components/Carousel). Implementação própria em JavaScript nativo, sem copiar componentes React.

Taste Frontend: direção contact-sheet, adaptada à quantidade fixa de três destaques e seis registros fornecidos. O portfólio real de Gravatá vira uma sequência de provas fotográficas. A composição herda a identidade existente. Impeccable: hierarquia, foco protegido no diálogo, contraste e alvos de toque. Emil: transições interrompíveis, entradas curtas, movimento reduzido inicial e dinâmico.

## Comportamento

Fotografias inteiras com object-fit:contain. Legendas fora da imagem. No celular, cartões em coluna; seis miniaturas em uma faixa dentro do diálogo. Título no topo. Navegação por setas, Home, End, Escape, clique e swipe. Foco retorna ao acionador. A página não rola atrás do diálogo. O atalho flutuante de agendamento fica oculto enquanto esta seção aparece, evitando cobrir as fotos.

A próxima imagem é decodificada antes de atualizar título e seleção. Duas camadas preservam a foto anterior durante a transição. Um identificador de solicitação descarta carregamentos antigos, inclusive ao fechar. Erros permitem nova tentativa nas miniaturas. Movimento reduzido cancela tilt e transições.

## Validação reproduzível

Servidor: `PORT=8048 node scripts/serve.mjs`.
Testes Chromium: `scripts/test-gallery-experience.mjs` e `scripts/test-the-cut.mjs`, com SITE_URL, PLAYWRIGHT_PACKAGE e CHROME_PATH apontando ao ambiente de testes.
Galeria: 1366, 768, 390 e 320 px, mais 390 px com reduced motion. Verificações de cartões separados, imagens carregadas, miniaturas, ciclo de navegação, swipe, entradas rápidas, foco, overflow, console e axe WCAG. Capturas inspecionadas em 1440, 768, 390 e 320 px. Testes de agendamento local e contrato da API também executados.

Não houve medição em aparelho físico; 60 FPS é uma meta de implementação, não uma garantia para todos os dispositivos.

Resultado final: galeria 79/79 verificações; site 84/84; contrato API 24/24; agendamento local aprovado. Axe sem violações na seção e no diálogo. Revisão independente confirmou correções e aprovou a entrega.
