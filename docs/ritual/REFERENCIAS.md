# Pesquisa e transposição

Consulta em 22/10/2026. Firecrawl foi tentado e recusou as consultas por falta de créditos; a pesquisa continuou em Chromium e no acesso público. Nenhuma autenticação foi contornada.

## Os dois projetos escolares

Checkouts locais com remotes confirmados:
- `../EscolaPeraltaPrototipo`: https://github.com/DevMurilo0/escola-peralta
- `../escolaMPP/escola-meus-primeiros-passos`: https://github.com/DevMurilo0/meus-primeiros-passos

Foram lidos os arquivos pedidos de produto, design, Home, hero, Caderno, arte, galeria, motion e estilos. Capturas `docs/design/screenshots/rodada-2/` e `docs/apresentacao/atualizadas/` foram consultadas; a Peralta publicada também abriu em navegador. Os registros locais são o estado disponível na máquina, sem alterar nem fazer pull nesses projetos.

Peralta: o grid do hero une fotografia principal, apoios e título; o Caderno tem estados de conteúdo e de cor coerentes, não uma faixa automática; a galeria combina progresso e arraste; o footer retoma a materialidade da capa. `site-motion.tsx` centraliza observer, conjunto de Animation, preferência e pausa, com fill backwards e limpeza que recupera a leitura.

MPP: `SiteMotion.tsx` define bloom/rise/swing/cascade/lift com deslocamentos e durações próprios, depois coordena outra animação na foto interna e uma terceira na legenda. MutationObserver inclui fotos inseridas por filtros. `ExplorePaths` mantém seleção explícita; `PhotoGallery` preserva o índice do filtro e retorno do foco. O movimento deriva do álbum, não de uma lista de presets desconectada.

Aplicação: um orquestrador nativo na Sr. Navalha, variantes de enquadramento (frame/side/shutter), movimento interno em wrappers distintos, seleção explícita e fotografias oficiais. Nenhum doodle, paleta escolar, caderno ou código React foi transplantado. O Espelho Vivo usa o vocabulário de bancada e moldura, mantendo serviços e fotografia correspondentes.

## Referências externas

| Fonte | Evidência obtida | Princípio adaptado |
|---|---|---|
| [Humbert & Poyet](https://www.awwwards.com/sites/humbert-poyet) e [site](https://humbertpoyet.com/) | Ficha Awwwards e navegador ao vivo; navegação por categorias, frames fotográficos desiguais. Parte das imagens permaneceu como superfície de carregamento no período observado. | Ritmo por proporção e espaço; fotos verticais respeitando a definição real. Não copiar as cores nem reproduzir telas de carregamento. |
| [Invisible North](https://www.awwwards.com/sites/invisible-north) | Ficha Awwwards acessível na primeira consulta. O domínio tentado no navegador não resolveu; não se afirma ter validado o site ao vivo. | Alternância editorial e densidade fotográfica descritas na referência do briefing; usada como hipótese, não como evidência de implementação técnica. |
| [Peak'n Film](https://www.awwwards.com/sites/peakn-film) e [site](https://peaknfilm.com/) | Navegador e scroll; fotografia e navegação de portfólio, página atual diferente de uma captura histórica de prêmio. | O artefato fotográfico continua sendo o foco da exploração; imagem ampliada mantém contexto e saída explícita. |
| [Salomé Bistrô](https://salome-bistro-a5cj-theta.vercel.app/) | Página pública, abertura e rolagem acessíveis; captura em `source-salome.jpg`. | Abertura, título e fotografia compartilham sequência; não copiar gastronomia, cores, textos nem o layout. |
| [Codrops](https://tympanus.net/codrops/) | Índice e scroll acessíveis em Chromium. | Máscara fotográfica e transição espacial são estudadas como técnicas; sem importar demos ou WebGL. |
| [React Bits](https://reactbits.dev/) | Consulta pública; nenhum componente ou dependência incorporado. | Efeitos devem ter orçamento e uma finalidade; a stack estática pede WAAPI/CSS. |
| [GSAP](https://gsap.com/) | Consulta pública em navegador. | Sequência, progressos normalizados e cancelamento. A implementação não depende de GSAP. |

Capturas e resultados brutos em `source-*.jpg`, `reference-*.jpg`, `referencias-browser.json` e `fontes-publicas.json`. Não se trata de cópia pixel a pixel ou alegação de equivalência a um prêmio.

## Marca atual e limites

[Perfil oficial](https://www.instagram.com/barbeariasrnavalha01/) abriu publicamente, confirmou contato, endereço e link AppBarber; highlights e grade não ofereceram navegação pública completa nesta sessão. O [Reel colaborativo](https://www.instagram.com/bocadedidi/reel/DePNevYxDML/) abriu com a identificação de ambas as contas. Frames do vídeo preservado mostram fachada, salão e instrumentos; não foi localizada uma publicação posterior acessível que documente toda a arquitetura. O registro de 08/10 é a melhor evidência disponível, sem certificação de que nenhuma mudança aconteceu depois.

Paredes claras, teto escuro, espelhos, bancada e aventais sustentam a paleta de materiais. Carvão, marfim, tabaco e cobre são interpretação editorial dessas evidências, não um manual oficial homologado. Nenhum verde dominante, dourado automático, homônimo, banco de imagens ou espaço sintético foi usado.

[AppBarber](https://sites.appbarber.com.br/srnavala-pqjj): após aguardar o carregamento, serviços, produtos e equipe foram recuperados. `conteudo-verificado.json` compara 69 registros com o conteúdo público de hoje. As três assinaturas mensais são apresentadas separadamente dos atendimentos para assinantes.

[Google Maps da ficha específica](https://www.google.com/maps/place/?q=place_id:ChIJU15canBJqgcRARZqMshC8cA&hl=pt-BR): endereço, telefone e nota 5,0 conferidos. A primeira versão pública limitada não expôs a quantidade; após o carregamento do mapa incorporado, a ficha correta exibiu 5,0 e 474 avaliações. A captura `mapa-diagnostico.png` comprova nome, endereço e total. O registro no site agora é datado de 22/10/2026. Horários também mantêm a data de sua coleta. Os quatro depoimentos existentes conservam os links individuais.
