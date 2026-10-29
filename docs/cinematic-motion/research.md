# Pesquisa e decisões — Cinematic Motion (29/10/2026)

Implementação original em HTML, CSS e JavaScript, sem nova dependência de produção. O código preserva a geometria das fotografias, o loader e o FLIP da marca. Conteúdo e controles continuam acessíveis sem motion. A referência de produção não respondeu nesta sessão; a base auditada foi a branch atualizada em `0aea391` e seu servidor local.

## Fontes consultadas

- [React Bits: tipografia](https://reactbits.dev/c/text-animations) e [animações](https://reactbits.dev/c/animations): Split Text, Stroke, Fold, Depth, Blur, Echo, Masked Heading, Scroll Reveal/Float, Animated Content, Halftone e Scroll Expand. Selecionamos máscaras, caracteres com perspectiva, foco por palavra e convergência de camadas. Halftone e expansão de layout foram dispensados para preservar as fotos e o custo em celulares.
- [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/): fontes prontas, segmentação, semântica e limpeza em resize. A implementação conserva os nós de texto originais, mantém links reais e esconde somente a cópia visual dos leitores de tela. Não aplica aria-label sobre parágrafos contendo links.
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): distinção entre entrada e progresso controlado por scroll. Duas frases usam progresso monotônico; as demais entradas acontecem uma vez.
- [Motion animate](https://motion.dev/docs/animate), [scroll](https://motion.dev/docs/scroll), [text animation](https://motion.dev/docs/text-animation): separar medição de escrita, manter as métricas tipográficas e limitar efeitos de blur. O site já usa WAAPI; adicionar outra biblioteca não trouxe vantagem suficiente.
- [Aceternity Text Generate](https://ui.aceternity.com/components/text-generate-effect): foco encadeado para explicações; aplicado com blur máximo de 3 px e duração curta.
- [Codrops: 3D text](https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/): perspectiva contida nas camadas de tinta.
- [Codrops: dual wave](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/): escalonar partes sem tornar a leitura dependente de uma longa timeline.
- [Codrops: sticky grid](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/): organizar fases de revelação mantendo molduras estáveis. Sem pinning ou scroll artificial.
- [Codrops: infinite gallery](https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/): separar transição de layout e movimento interno da foto. Preservamos o álbum existente; não criamos galeria infinita.

## Licenças e custo

- [React Bits](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md): MIT + Commons Clause, não MIT irrestrito. Não copiamos nem portamos seus componentes.
- [GSAP](https://gsap.com/community/standard-license/): licença própria permite uso em sites sem cobrança, com condições. Não foi incorporado.
- [Motion](https://motion.dev/): núcleo aberto MIT; [Motion+](https://motion.dev/pricing) é oferta paga separada. Não incorporamos ferramentas pagas.
- [Aceternity](https://ui.aceternity.com/licence): licença própria de componentes Pro, com restrições de redistribuição. Nenhum código ou asset foi copiado.

Firecrawl estava sem créditos; a pesquisa foi feita por navegação web nas fontes acima. A experiência entregue não carrega scripts desses serviços.

## Contrato por seção

| Seção | Texto | Fotografia |
| --- | --- | --- |
| Hero | Caracteres mascarados, perspectiva e ecos; introdução em foco; CTA depois do título | Abertura lateral, diafragma e corte diagonal, somente após `openingend.completed` |
| A Casa | Linhas dobradas e citação ligada ao scroll | Máscara horizontal e reenquadramento interno |
| Serviços | Contorno varrido seguido de preenchimento, palavras em foco e microrecortes das linhas | Moldura preservada, troca com recorte |
| Equipe | Nomes por caracteres verticais; legenda viva não é dividida | Diafragma e troca com dono único |
| Trabalhos | Título ligado ao scroll, metadados em recorte curto | Máscaras diagonais e parallax de até 3 px com ponteiro fino |
| Produtos | Palavras em foco, preço em microrecorte após decode | Diafragma e reenquadramento do produto selecionado |
| Avaliações | Revelação por linhas e detalhes por recortes | Moldura revelada; loop existente conserva seu controle |
| Localização | Linhas em perspectiva e microtextos recortados | Máscara horizontal; mapa permanece interativo |
| Rodapé | Convergência de camadas tipográficas e CTA em profundidade | Obturador e enquadramento interno |

`text-motion.js`, `image-motion.js`, `scroll-motion.js` são os efeitos; `motion.js` coordena entradas, foco, seleção, cancelamento e recuperação. `hero-sign.js` coordena exclusivamente o pós-loader. Os efeitos temporários são cancelados, os nós originais voltam ao DOM e a preferência reduzida entrega o layout final sem splits. A navegação rápida finaliza conteúdo ultrapassado. Não se repetem entradas ao voltar.
