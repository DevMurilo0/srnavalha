# Sr. Navalha V19 — cena de entrada, recortes e superfícies

## Intenção
A Sr. Navalha deve parecer um ensaio editorial feito com materiais de barbearia: papel gravado, fios de metal, luz do salão, marca real e fotografias de clientes autorizadas. Nenhum novo personagem ou espaço foi inventado.

## Referências consultadas
- [Codrops — SVG Mask Transitions on Scroll (2026)](https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/): recortes geométricos que conectam duas cenas.
- [Codrops — Rapid Layers Animation](https://github.com/codrops/RapidLayersAnimation): saída rápida por camadas durante a transição da página.
- [Codrops — Page Preloading Effect](https://tympanus.net/codrops/2014/08/05/page-preloading-effect/): continuidade visual entre preloader e conteúdo.
- Identidade das escolas Peralta e Meus Primeiros Passos: cenas recortadas e componentes composicionais, sem copiar a estética infantil.

## O que foi feito
- `js/ritual/opening.js` refeito integralmente: logo real clonada da página, movimento em direção à marca do hero, abertura diagonal da cena, linhas de luz e entrada coordenada do título/fotos.
- O antigo erro de seletor `.hero-engraving svg` (removido na V18) foi eliminado.
- Entrada em primeira visita por sessão; parâmetro `?intro` reexecuta a abertura para testes. Sem porcentagem ou espera simulada. Eventos de interação encerram o overlay; recuperação automática em 1,8 s.
- Oito `sr-scene-join` intercalados nas transições de seções com diferentes recortes e pequenos medalhões inspirados em lâminas.
- Sete superfícies `sr-surface` com grades, pautas, linhas diagonais, luz e sombreamento em `scene-craft-v19.css`.
- Rodapé estruturado como marca | Explore | Encontre a gente | cartão fotográfico, incluindo layout móvel responsivo.
- JS opt-in `scene-cuts.js` para exibir a linha e o medalhão quando a junção chega à viewport. Sem esconder conteúdo nativamente.

## Contrato de qualidade
- Mantém HTML, CSS e JS compatíveis com Live Server, sem npm.
- `prefers-reduced-motion: reduce`: não apresenta overlay e não anima recortes.
- Sem JS: site completo visível, os ornamentos e texturas permanecem estáticos.
- Mantidas quatro avaliações, dados de endereço, loja AppBarber, fotos reais e crédito ao desenvolvedor.
- Site não foi renderizado em um navegador nesta sessão, pois o acesso externo ao repositório pelo ambiente local estava indisponível. As verificações realizadas foram de estrutura, sintaxe e ligações entre recursos.

## Captura/validação sugerida
Abrir a branch pelo Live Server em 320, 390, 768 e 1440 px, conferir a entrada `index.html?intro`, o fade/morph para o hero, juntas das seções e quatro colunas do rodapé; verificar console, ausência de overflow e o modo reduced motion.
