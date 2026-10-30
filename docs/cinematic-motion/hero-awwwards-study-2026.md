# Sr. Navalha — direção artística do hero (30/10/2026)

## Pesquisa e limites de verificação

Pesquisa de cinco experiências efetivamente publicadas, com fontes públicas.
A galeria direta [Awwwards / Websites](https://www.awwwards.com/websites/) não
respondeu à consulta automatizada (timeout). Cruzei o registro histórico
público dos prêmios com websites originais, portfólios das agências e capturas
de UI. **Não afirmo ter testado movimento por reprodução de vídeo** quando
a fonte disponível era apenas textual ou captura. As notas são uma avaliação
editorial de adequação ao projeto, não pontuações oficiais da Awwwards.

| Referência real | Composição e tipografia | Fotografia, movimento e interatividade | Encaixe / viabilidade |
| --- | --- | --- | --- |
| **CRISP Barbershop**, Montréal — [site](https://www.crispmtl.com/), [case Casa Media](https://casamedia.com/projects/crisp-website/), [capturas UI Discovery](https://uidiscovery.com/sites/crisp-barbershop) | Declaração curta, caixa alta de grande impacto, preto e branco | Hero fotográfico de largura total, caminho de agendamento claro, movimento subordinado à imagem | **9,6 / 10 — vencedor** |
| **Tweed Barbers**, Boston — [case Metropolis](https://www.metropoliscreative.com/projects/tweed-barbers/) | Comunicação sóbria, relações humanas e detalhes do ofício | Fotografias reais da equipe; projeto reconhecido com Honorable Mention | 8,8 / 10 — identificação com o ofício; apresentação menos experimental |
| **OFFFORM**, agência de talentos — [site](https://offform.net/) | Frases monumentais, direção editorial austera | Retratos, presença, hierarquia e seleção de visuais por categorias | 8,6 / 10 — tipo e ritmo excelentes; menos diretamente comercial |
| **Bryhel Cosmetic Lab** — [site](https://bryhel.com/), [registro de prêmio](https://awwwards.withseismic.com/author/antara.studio) | Composição experimental para beleza/cosméticos; vocabulário técnico | Navegação visual, linguagem de laboratório e materialidade | 8,1 / 10 — visual sofisticado, mas escopo menos diretamente ligado a cortes |
| **UNIMATIC Watches**, Milão — [site](https://www.unimaticwatches.com/), [arquivo Awwwards](https://awwwards.withseismic.com/) | Produto e tipografia de precisão, enquadramento disciplinado | Imagens de produto e controle editorial dos detalhes | 7,9 / 10 — materialidade premium; foco em e-commerce |

Outras fontes públicas de apoio:
- CRISP teve Honorable Mention de agosto/2026 no arquivo histórico
  [Awwwards Archive](https://awwwards.withseismic.com/author/bonjour-casa).
- [CRISP DESIGN.md (captura 06/10/2026)](https://www.zeroslop.design/library/crispmtl-com)
  descreve um hero fotográfico cinza de tipografia ampla e pesada.
- [Seleção de projetos da agência antara.studio](https://awwwards.withseismic.com/author/antara.studio)
  registra Bryhel como Site of the Day.
- O arquivo consultado apresenta UNIMATIC como Honorable Mention de setembro/2026.

## Direção adotada — THE FRAME / A PRECISÃO EM PRIMEIRO PLANO

**On this page, a photograph of the Sr. Navalha's own barbershop becomes
the room-sized canvas that the typography cuts through.**

O CRISP é a referência mais ajustada porque apresenta o próprio trabalho
como a peça gráfica dominante. O Sr. Navalha, entretanto, não recebe código,
mídias, logomarca, fonte proprietária ou captura extraída de outro site.
O hero foi implementado do zero com material próprio.

### Escolhas concretas

1. Substituição do layout anterior em duas colunas com três fotografias
   flutuantes por **uma única capa fotográfica full-bleed**.
2. Tipografia de enorme escala, branca e diretamente sobre a fotografia,
   com texto real: **SEU ESTILO. / NOSSA ASSINATURA.**
3. A fotografia do salão é um arquivo existente e otimizado
   (`hero-ambiente-1920.webp`, `hero-ambiente-3840.webp` e versão mobile).
4. A metáfora da lâmina aparece em uma cortina de transformação horizontal
   depois da tesoura, não em uma segunda intro conflituosa.
5. Três escolhas curtas — **O ambiente**, **A casa**, **O ritual** —
   controlam enquadramentos reais por botões acessíveis. Nenhuma lib gráfica
   pesada, vídeo forçado ou scroll listener contínuo.
6. A marca oficial conserva seu único elemento de destino FLIP;
   agendamento segue com link navegável.
7. O acabamento reduz movimento para `prefers-reduced-motion` e
   filtros fotográficos para hardwares modestos.

### Diferença em relação às iterações anteriores

Anterior: **texto à esquerda + retrato principal e dois recortes à direita**.
Agora: **fotografia imersiva no plano de fundo + assinatura tipográfica
integrada à cena + pequenos controles de edição embaixo**.

### Fluxos e QA

Testar após o commit:
- Intro com tesoura e handoff da marca em 320, 390, 430, 768, 1024, 1440 px
- Primeira pintura sem flash (sobretudo banner e CTA)
- Enquadramentos com mouse, toque e setas de teclado
- Navegação `#casa` e link `agendar.html`
- Acessibilidade e modo movimento reduzido
- Scroll completo do website; demais seções devem ser idênticas à branch base

**Sem copiar material de terceiros**: referências são apenas bibliografia de
direção artística e padrões de interação.
