# Movimento — V5

A interface deve parecer resolvida mesmo sem animações. Os movimentos acrescentam direção e significado, não escondem informações.

1. **Assinatura: abertura fotográfica do hero.** Máscara direcional em `clip-path` revela fotografia; escala muito leve e sequência do título. 1,2s com easing controlado, sem preloader.
2. **Assinatura: escolha fotográfica nos serviços.** Selecionar Corte, Barba ou Acabamento muda o enquadramento e legenda em uma transição interrompível. A ação do visitante é sempre a prioridade.
3. **Galeria:** zoom mínimo no hover apenas em dispositivos de ponteiro fino, visualização via `<dialog>` nativo com teclado, setas e swipe; expansão dos trabalhos por `<details>`.
4. **Depoimentos:** esteira horizontal contínua a aproximadamente 30px/s, duplicações apenas visuais (`inert` e `aria-hidden`), pausa por clique/hover/foco/toque. Em movimento reduzido, nenhuma duplicação e rolagem manual.
5. **Revelação do conteúdo:** `IntersectionObserver` com introdução progressiva de 23px/750–850ms. Nenhum conteúdo nasce oculto em HTML/CSS: a classe de inicialização só entra depois do observer estar instalado.
6. **Botões:** controle de ícone circular e sublinhado em transição interrompível.
7. **Mapa:** interação de ponteiro liberada somente após ação explícita; permite continuar rolando sem prender o usuário.

CSS usa `transform` e `opacity` para a maioria dos efeitos; `clip-path` se limita à abertura do hero. Filtros não são animados continuamente. O conjunto respeita `prefers-reduced-motion` e a página permanece utilizável sem JS.

Os controles do formulário não têm animações que retardem preenchimento.
