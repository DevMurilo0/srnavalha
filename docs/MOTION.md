# Motion design

- **Abertura:** assinatura SN com barra de progresso, no máximo ~2 segundos, uma vez por sessão (`sessionStorage`). Failsafe visual CSS caso o script não prossiga. Reduzido desliga a abertura.
- **Hero:** títulos surgem linha a linha em máscaras; fotografias entram em rotações e clip-paths diferentes; tipografia de contorno e selo giratório. Mobile ajusta as posições de fotografia para não cobrir o CTA.
- **Serviços:** uma área de fotografia compartilha os três serviços. Mouse, foco e clique selecionam. A nova foto revela-se por clip-path e escala com Web Animations API e o conteúdo anterior desaparece; o efeito é cancelável pelo token de sequência.
- **Portfólio:** grid escalonado; imagem abre em `dialog` nativo; setas, Escape, foco restaurado e gesto horizontal. Fotos ganham zoom sutil por hover/foco.
- **Avaliações:** quatro comentários datados em marquee linear; clones puramente visuais, `inert` e `aria-hidden`. Pausa por hover, foco, clique e aba oculta. No modo reduzido, não há animação nem clones e a lista aceita rolagem horizontal.
- **Menu:** indicador de navegação ligado à seção ativa, menu mobile dobrável, linha de progresso no topo.
- **Complementos:** linha fina no CTA final, seta de botões com giro, ornamentos de uma cor e leve resposta magnética de CTA apenas em ponteiros precisos.
- **Scroll:** nativo e suave para âncoras via `scroll-behavior:smooth`; sem bibliotecas que capturem o wheel. Esta foi uma escolha deliberada para preservar fluidez e performance em notebooks antigos.
- **Fallback:** animações de seção ativadas progressivamente pelo JS, mas HTML começa visível; `prefers-reduced-motion` desliga deslocamentos.

Adaptação dos princípios disponíveis: Taste Frontend (direção fotográfica, assunto específico e crítica visual), Impeccable UI (tipografia/contraste/mobile/foco/fallback) e Emil Design Engineering (transições interrompíveis, feedback, motion mínimo com intenção).