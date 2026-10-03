# SR Navalha

Fase 1: site institucional e página temporária de agendamento. Sem banco, autenticação, OTP, integração WhatsApp ou painéis nesta entrega.

## Desenvolvimento

Requer Node.js 22 ou superior.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. Para testar produção: `npm run build` e `npm start`.

## Verificação

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npx playwright test
```

Os testes verificam Home e `/agendar` em 320, 375, 768 e 1440 px, overflow, menu, CTA, FAQ, erros de navegador e acessibilidade automatizada. Screenshots são gerados em `artifacts/`.

## Conteúdo e identidade

- `src/config/brand.ts`: nome, contato, endereço, links e navegação.
- `src/features/home/content.ts`: referências editoriais, FAQ e posições para fotos reais.
- `src/components/brand/photo-frame.tsx`: placeholder substituído por `next/image` quando uma foto é configurada.
- `src/app/globals.css`: tokens, estilos globais, componentes e breakpoints.
- `src/components/ui/button.tsx`: botão no padrão shadcn/ui, personalizado para a marca.

As fotografias reais da Fase 1.1 estão em `public/images/`, organizadas por finalidade. Para trocar uma foto, atualize `src`, `alt`, `width`, `height` e `sizes` na entrada correspondente de `photos`. A logo é configurada em `brand.logo`. Consulte [a origem e as limitações dos recortes](docs/image-sources.md).

Barlow Condensed (600/700) e Manrope Variable são distribuídas localmente via Fontsource, sem requisições ao Google Fonts.

Serviços e texto institucional são provisórios. Não há preços, nomes de profissionais, depoimentos ou horários inventados. A prova social está preparada, sem avaliações fictícias. Os contatos fornecidos ainda precisam de confirmação do proprietário.

## SEO

Metadados em português, imagem Open Graph própria, favicon, robots e sitemap. Defina `NEXT_PUBLIC_SITE_URL` com o domínio oficial aprovado para ativar canonical, sitemap e indexação. Sem essa configuração, o preview permanece `noindex`. `/agendar` permanece fora da indexação nesta fase. Não publicamos dados estruturados comerciais ainda não confirmados.

## Próximas fases

A arquitetura aprovada prevê Supabase, autenticação, disponibilidade transacional e painéis. Não foram implementados nesta fase. Não há coleta de dados pessoais no site atual.
