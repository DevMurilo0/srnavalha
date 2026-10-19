# Pesquisa Salomé · V9

Consulta em 19/10/2026: https://salome-bistro-a5cj-theta.vercel.app/

## Método e evidência

Chromium real, navegação por wheel do início ao rodapé em 1440×900 e 390×900. Capturas em `capturas/v9/referencia/`, medidas em `fontes-v9/salome-browser.json`. Também foi acionada a galeria; `reference-details.json` registra dialog aberto e `galleryFlips: 1`. A imagem voadora já tinha terminado quando a consulta posterior ao screenshot ocorreu: não se declara uma captura intermediária perfeita do FLIP.

Arquivos públicos consultados: `/js/hero-v2.js`, `/js/motion.js`, `/js/motion-director.js`, `/css/hero-v3.css`, `/css/motion-director.css`. Seus conteúdos foram lidos para compreender mecanismos; não integram a aplicação nem a entrega. Hashes da consulta em `fontes-v9/reference-source-manifest.json`.

## O que foi observado

| Região | Observação real | Reinterpretação Sr. Navalha |
|---|---|---|
| Abertura/hero | Fotografia da fachada, título coordenado, cena sticky e progresso reversível. | Retrato real em moldura de espelho, título em duas linhas e foto que muda de posição/escala até a apresentação. |
| Hero atual | `SalomeHeroV2` edição 2.9.3. Uma fonte de progresso em `.hero-journey`; valores medidos mudam com o scroll. | Um progresso calculado em `hero.js`, aplicado diretamente aos wrappers de scroll. |
| Painéis | O mecanismo existe em motion-director, mas é excluído quando o hero está dentro de `.hero-journey`. `heroPlays: 0` na versão consultada. Não foi observada a abertura por painéis nessa publicação. | Abertura própria implementada por solicitação explícita: dois painéis, logo oficial e entrada coordenada do hero. |
| Casa/cozinha | Mudança de superfície, composições fotográficas de tamanhos diferentes, revelações por máscara e tipografia editorial. | Passagem da pessoa à casa e catálogo com foto sincronizada ao serviço. |
| Cardápio | Catálogo denso com filtros, busca e ampliação progressiva. | Details nativos e filtros preservados; sem copiar lógica de gastronomia. |
| Música/encontros | Faixa tipográfica responde ao scroll, layouts alternados e movimento condicionado à visibilidade. | Faixa “O corte tem técnica. O cuidado tem nome.” e corte entre resultado e profissional. |
| Galeria | Dialog e cálculo FLIP; movimento no top layer. | Expansão da miniatura real com escala nos dois eixos, teclado, Escape e swipe. |
| Encerramento | Convite e informação prática participam da mesma linguagem. | Endereço/mapa seguido de retrato de Yan, convite e logo/crédito. |
| Mobile | Reenquadramento, reduções de escala e percurso vertical próprio. | Uma coluna narrativa, retrato reduzido acima da apresentação, galeria horizontal por toque. |

Nem todos os mecanismos descritos no pedido estavam ativos simultaneamente na versão publicada. Distinguir código existente de comportamento observado foi parte da auditoria.

## Referências técnicas complementares

- [MDN — Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API): controle e cancelamento de animações nativas.
- [GSAP — FLIP](https://gsap.com/docs/v3/Plugins/Flip/): princípio First/Last/Invert/Play, reinterpretado sem dependência GSAP.
- [React Bits — Split Text](https://reactbits.dev/text-animations/split-text): referência de coreografia tipográfica; implementação local por linhas, sem React.
- [Codrops](https://tympanus.net/codrops/): referência complementar de fotografia e exploração de transições.
- A URL de Awwwards foi tentada pelo navegador de pesquisa web, que não a recuperou. Não se atribui a esta sessão uma navegação completa no acervo Awwwards.

Não foram importadas fontes, fotos, ornamentos, cores ou código de aplicação do Salomé.
