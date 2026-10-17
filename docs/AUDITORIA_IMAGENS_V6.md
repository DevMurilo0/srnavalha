# Fotografias V6

Inventário medido na auditoria anterior e reaproveitado. Nenhuma foto foi editada, gerada, recomprimida ou ampliada nesta implementação: arquivos WebP preservados byte a byte. A melhora vem de composição, escala e retirada dos derivados ampliados da apresentação.

| Arquivo em `assets/images/` | Dimensões | Bytes antes = depois | Origem e uso V6 |
|---|---:|---:|---|
| `brand-logo.webp` |119×53|2.974|Marca de captura; header66–86px|
| `hero-corte-e-barba.webp` |266×326|25.282|Trabalho real; hero até210px e viewer até265px|
| `work-corte-perfil.webp` |265×326|16.360|Trabalho real; hero, catálogo e viewer até265px|
| `work-corte-cacheado.webp` |265×322|17.736|Trabalho real; hero e viewer até265px|
| `work-barba.webp` |265×326|24.558|Atendimento real; hero, catálogo e viewer até265px|
| `work-barboterapia.webp` |263×325|13.612|Atendimento real; índice e viewer até265px|
| `team-atendimento.webp` |264×321|17.596|Equipe real,110–205px|
| `barbershop-ambiente.webp` |246×148|11.748|Espaço real, máximo246px|
| `hero-atendimento-cinematico.webp` |1720×880|50.350|Derivado pequeno; preservado, não usado nem distribuído no ZIP|
| `barbershop-ambiente-cinematico.webp` |1400×780|62.362|Derivado pequeno; preservado, não usado nem distribuído no ZIP|

`currentSrc`, resolução natural e tamanho renderizado foram registrados pelo Firefox em sete larguras. Proporções preservadas; viewer usa `object-fit:contain`; lightbox não força preenchimento da tela. `width/height` reservam espaço, fonte local é pré-carregada e fotos abaixo da abertura usam lazy loading.

Não foram criados srcsets640/1280 a partir de265px. Em DPR2,265px naturais equivalem a cerca de132 CSS px de detalhe nativo. A limitação permanece; não se promete resolução recuperada. Não foram usados filtros CSS para disfarçar falta de definição.

## Origem e limites

O histórico `backup/referencia-codigo-anterior-2026-10-15.zip`, arquivo `srnavalha-redesign/docs/image-sources.md`, documenta recortes das capturas do Instagram oficial `@barbeariasrnavalha01`, de03/10/2026. Fontes locais e cadeia de recorte: `V6_CHECKPOINT.md`. São os materiais reais já fornecidos no projeto; não foi obtida licença aberta adicional. Novas imagens externas exigem origem/autorização adequadas.

Reconstruções generativas `atendimento-editorial-v2.webp`, `ambiente-editorial-v2.webp` e `logo-restaurada-v2.webp` constam no histórico Git e já estavam excluídas: não foram restauradas. O processo exato dos derivados cinematográficos atuais não foi confirmado; dimensão grande não comprova detalhe documental.

Não há original melhor confirmado. Nenhuma nova pesquisa externa nesta etapa. O portfólio continua com cinco trabalhos; repetição entre hero/serviço/índice tem função de navegação, sem inflar a contagem. Não há novos arquivos WebP; os oito assets originais usados estão listados acima.
