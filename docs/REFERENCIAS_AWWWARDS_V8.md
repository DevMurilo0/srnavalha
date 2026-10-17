# Referências Awwwards V8

Consulta: 17/10/2026. Nove projetos consultados; fichas públicas recuperadas por Firecrawl. Os efeitos abaixo são os elementos **documentados** nas fichas e os pontos já identificados no briefing. Não se afirma inspeção quadro a quadro dos vídeos nem auditoria interna do código desses sites. As explicações de implementação são decisões da V8, não afirmações sobre a engenharia original.

| Projeto e fonte | Evidência consultada | Princípio estudado | Adaptação V8 |
|---|---|---|---|
| [Invisible North](https://www.awwwards.com/sites/invisible-north) | Typography Scroll, Hero Gallery, Grid Transition e Project Interaction documentados | Uma fotografia pode conectar posições de layout em vez de sumir e reaparecer. | Foto de barboterapia atravessa hero e introdução; texto permanece legível. |
| [Peak’n Film](https://www.awwwards.com/sites/peakn-film) | Portfolio Navigation Transition e rollover tipográfico do briefing; ficha pública lida | Associar a escolha de nome ao enquadramento fotográfico, sem reproduzir o visual do site. | Nomes de profissionais deslocam discretamente e acionam máscaras persistentes. |
| [Humbert & Poyet](https://www.awwwards.com/sites/humbert-poyet) | Scroll Portfolio e menu de hover citados no briefing; ficha consultada | Leitura espacial por fotografia e índice, em vez de uma grade de cartões. | Portfólio em trilho nativo e nomes como índice de retratos. |
| [Family Style](https://www.awwwards.com/sites/family-style) | Hero e Studio Scroll documentados na página de referência | Distribuir imagem, texto e espaço como uma composição que muda durante a visita. | Abertura assimétrica e encerramento com convite em vez de cartão isolado. |
| [Noxediem](https://www.awwwards.com/sites/noxediem-creative-production) | Accordion animation to present services; gallery slider; text reveal | Manter o catálogo compacto e revelar informação no contexto. | Details nativos de serviços, descrição e acesso ao agendamento. |
| [FEED Agency](https://www.awwwards.com/sites/feed-agency) | Hero animation, Menu page transition e Work slider | Coordenar navegação e tipografia por tempos curtos e uma hierarquia clara. | Menu móvel com máscara, links coordenados e galeria horizontal. |
| [Cosie Studio](https://www.awwwards.com/sites/cosie-studio) | Image transition, Navigation open and close, Approach accordion | Mudança de estado tem imagem anterior como referência espacial. | Camada anterior de produto permanece sob a máscara entrante. |
| [Balans](https://www.awwwards.com/sites/balans) | Scroll and page transition | A passagem transforma a composição sem tomar o controle da rolagem. | Movimento geométrico da abertura, via scroll nativo e rAF limitado. |
| [Palomino](https://www.awwwards.com/sites/palomino) | Transition Work To Archive, Work Grid e Testimonials Section | Alternar contexto mantendo consistência entre índice, imagem e prova social. | Lightbox entra e retorna ao trabalho; reputação tem escala própria junto ao título. |

## Recursos técnicos

- [React Bits](https://reactbits.dev/): biblioteca consultada como repertório de imagem/texto e interação. Nenhum componente React ou código copiado para a página estática.
- [Codrops](https://tympanus.net/codrops/): índice consultado; princípio de tipografia e transição orientadas por scroll. Pesquisa técnica não equivale à execução dos tutoriais.
- [GSAP](https://gsap.com/): exemplos e famílias Scroll/Flip/Text consultados. A V8 optou por WAAPI, transições CSS e rolagem nativa para evitar dependência; não se afirma uso de GSAP.

## Decisão de autoria

Identidade, logo, textos e fotografias pertencem ao contexto da Sr. Navalha. Referências orientam continuidade espacial e resposta, sem copiar layouts integrais, arquivos ou marcas. Nenhum loader obrigatório, scroll-jacking ou calendário falso.
