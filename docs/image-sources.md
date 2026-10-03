# Imagens reais — Fase 1.1

Fonte: cinco capturas locais de 03/10/2026, encontradas em `Imagens/Capturas de tela` no ambiente do usuário. A captura 140525 identifica o perfil `barbeariasrnavalha01`; as capturas de publicações da mesma sequência mostram a marca nas capas de atendimento e o ambiente correspondente. Nenhuma imagem de banco ou geração artificial foi utilizada.

Os prints completos permanecem fora de `public` para não publicar dados da interface do Instagram ou de terceiros. `scripts/prepare-images.mjs` documenta os retângulos exatos de extração. Os recortes removem divisórias, ícones e faixas pretas quando possível, sem retocar pessoas, alterar a marca ou ampliar o arquivo.

| Arquivo em public/images | Captura 20261003 | Dimensões | Uso |
| --- | --- | --- | --- |
| brand/logo.webp | 140525 | 119 × 53 | Header, footer, OG |
| hero/corte-e-barba.webp | 140539 | 266 × 326 | Hero e OG |
| work/barba.webp | 140539 | 265 × 326 | Galeria |
| work/corte-perfil.webp | 140539 | 265 × 326 | Destaque da galeria |
| barbershop/ambiente.webp | 140551 | 246 × 148 | A barbearia, em composição compacta |
| work/corte-cacheado.webp | 140610 | 265 × 322 | Galeria |
| team/atendimento.webp | 140610 | 264 × 321 | Profissionais em atendimento, sem atribuir nomes |
| work/barboterapia.webp | 140624 | 263 × 325 | Composição da seção de serviços |

## Substituição

Logo: `src/config/brand.ts`. Fotos: `src/features/home/content.ts`. Atualize src, alt, width e height para os valores reais do novo arquivo. sizes descreve a largura renderizada por breakpoint. PhotoFrame preserva a proporção original; objectPosition fica disponível para futuros enquadramentos.

Não há mais placeholders de fotografia na Home. A prova social continua sem depoimentos ou avatares, pois não existem avaliações verificadas disponíveis. Os nomes e perfis individuais da equipe continuam pendentes. O favicon tipográfico anterior foi mantido: o recorte da logo não tem definição suficiente para representar o desenho completo em tamanhos tão pequenos.

## Limitações

Os recortes são de baixa resolução e servem como material provisório real; devem ser substituídos pelos originais para a publicação final. A imagem do ambiente foi limitada a 360 px de largura e a logo a 119 px. Não se pretende recuperar detalhes inexistentes nos prints. A logo mantém seu fundo original escuro. Fotos preservam o enquadramento, sem cortar rostos para preencher cartões.

Para reproduzir os recortes, execute `node scripts/prepare-images.mjs "/pasta/das/capturas"`. O script usa Sharp, já presente como dependência do Next.js nesta instalação.
