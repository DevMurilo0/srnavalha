# Sr. Navalha — V18: arte fotográfica + profundidade + motion

## Intervenção
A versão V17 continha oito elementos que pareciam desenhos geométricos deslocados da marca. Eles foram substituídos na V18 por composições editoriais usando imagens reais já autorizadas da Sr. Navalha (fotografias de fachada, salão, resultados e produtos) e vetores baixados do repositório público Tabler Icons.

## Imagens utilizadas
- `assets/images/hero-redesign/fachada-480.webp`, `interior-720.webp`: fachada e salão.
- `assets/images/v8/servico-comb-cort-barb-simples-640.webp`, `servico-luzes-640.webp`: trabalhos reais.
- `assets/images/v8/oleo-para-barba-640.webp`: produto registrado.
- `assets/decor/v18/tabler-{razor,blade,scissors}.svg`: imagens vetoriais de referência disponíveis na internet, [Tabler Icons](https://github.com/tabler/tabler-icons), sob MIT © 2020–2026 Paweł Kuna (texto em `TABLER_LICENSE.txt`).

## Pesquisa de fundos
- [Codrops Atmospheric Depth Gallery](https://github.com/houmahani/codrops-depth-gallery): leitura de profundidade a partir de imagens.
- [Wensity Textures](https://ui.wensity.com/tools/noise-texture-generator): campos granulados e gradientes em camadas.
- Diretrizes dos projetos Escola Peralta e Meus Primeiros Passos, aplicadas sem reutilizar suas cores nem elementos infantis.

## Novas cenas
Fundo do salão com luz e fotografia na Casa; pigmento quente nos Serviços; textura fotográfica sutil na Equipe; ambiente claro e enquadramentos no Portfólio; acabamento tonal em Produtos; luz escura e imagem de fachada nas Avaliações; relevo quente em Localização e assinatura no Rodapé.

## Movimento
Observadores passam a disparar entradas dentro da viewport: rootMargin inferior negativo, threshold de 13%, atrasos entre 170–450 ms, durações em torno de 1.1 s e stagger por palavras. Elementos novos usam cortes laterais, profundidade e progressão da imagem. Os elementos permanecem naturalmente visíveis sem JS e para usuários com movimento reduzido.

## Preservação
Live Server sem npm. Não altera a equipe, preços, mapa, quantidade de avaliações, depoimentos, navegação, agendamento ou estrutura semântica. A branch main não foi modificada. Inspeção visual posterior é necessária para validar todo o timing no navegador.
