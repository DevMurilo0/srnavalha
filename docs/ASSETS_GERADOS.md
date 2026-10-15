# Derivados visuais da segunda edição

Ferramenta: `image_gen` integrada, seguindo a skill `imagegen`, em modo de edição com imagens locais de referência. Os arquivos foram depois codificados em WebP para uso local no navegador. Não há geração ou serviço de imagens em execução no site.

As imagens generativas recuperam aparência e composição a partir de fontes pequenas; detalhes podem ser reconstruídos. Não são novas fotografias documentais nem uma recuperação garantida de todos os detalhes originais. As fontes originais permanecem no projeto sem substituição.

| Asset novo | Fonte preservada | Dimensões finais | Uso |
| --- | --- | --- | --- |
| `assets/images/hero/atendimento-editorial-v2.webp` | `assets/images/hero/atendimento-cinematico.webp` | 1672 × 941 | Hero, equipe e fotos demonstrativas do agendamento |
| `assets/images/barbershop/ambiente-editorial-v2.webp` | `assets/images/barbershop/ambiente-cinematico.webp` | 1680 × 936 | Ambiente e CTA final |
| `assets/images/brand/logo-restaurada-v2.webp` | `assets/images/brand/logo.webp` | 720 × 300, transparência | Header, footer e favicon |
| `assets/images/decor/grain.svg` | SVG escrito para esta edição | 180 × 180 | Textura discreta do hero |

## Prompt do hero

> Use case: identity-preserve. Edit target: supplied Sr Navalha barbershop photograph. Create a faithful high-quality restoration for a cinematic editorial website hero. Keep the exact two barbers, client, poses, clothing, hairstyle, facial identities and actual salon furnishings from this photograph. Restore natural fine photographic detail without inventing objects or changing the people. Remove the artificial blurred vertical side panels; extend the actual dark salon environment naturally across the frame. Wide landscape 16:9 composition, primary barber and client in right half; left third is naturally dark subdued salon wall with usable negative space for HTML text. Refined contrast, restrained warm copper highlights, charcoal blacks, realistic skin, fine subtle grain, no fake lens flare. Keep lighting believable and the same salon, not a luxury replacement. No text, logo, borders or watermarks. Intended 2560px wide hero; sharp but natural, no plastic AI faces or oversharpened halos.

O resultado retornado tem 1672 × 941 pixels; não foi ampliado artificialmente para alegar uma resolução maior.

## Prompt da logo

> Use case: identity-preserve. Edit target: this original Sr Navalha barbershop logo. Faithfully restore this same existing logo at high resolution, preserving the distinctive curved bold condensed lettering SR.NAVALHA, small BARBEARIA lettering, flowing script below, original contours and framing. Keep exact identity and arrangement; not a new logo. Clean white/ivory artwork, natural ink edges, no colors, remove tiny colored corner artifacts and surrounding rectangular gray photographic background. Transparent background, artwork only with generous clear safe space, horizontal 2.4:1 composition. Sharp professional brand asset appropriate on a charcoal website header and footer. Do not add slogans or any additional lettering.

## Prompt do ambiente

> Use case: precise-object-edit. Edit target: supplied photograph of Sr Navalha barbershop interior. Faithful photographic restoration only, for a premium editorial website. Preserve the exact room layout and perspective: light gray walls and floor, black ceiling with white angular LED lines, wood drawer counter along right wall, black barber chairs, suspended oval mirrors with black straps, wall clock upper right, mirror reflections and existing people in background. Restore natural photographic definition and tonal quality from this soft image. Remove existing compression artifacts and artificial edge blur. Do not redesign the salon, replace furnishings, introduce decorations, remove people or add new people. Clean neutral lighting with restrained warm wood tones, realistic details, no plastic surfaces or oversharpening. Wide landscape composition approximately 16:9. No text, watermark, border or logos.
