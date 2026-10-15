# Validação da Fase 1

Implementação limitada ao site institucional e à rota temporária `/agendar`.

## Resultados

- `npm run lint`: aprovado, sem erros ou avisos após ajuste do PostCSS.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado; páginas pré-renderizadas estaticamente.
- `npx playwright test`: 4 testes aprovados em produção (18,5 s).
- Larguras verificadas: 320, 375, 768 e 1440 px.
- Home e agendamento: sem overflow horizontal e sem erros de JavaScript capturados.
- Axe WCAG 2 A/AA e 2.1 AA: nenhuma violação detectada nas duas páginas, nos quatro tamanhos. Verificação automatizada não equivale a certificação completa de acessibilidade.
- Menu: abre, fecha por Escape e devolve foco ao botão.
- CTA mobile: ausente no hero, presente depois de sua saída.
- FAQ: abertura e fechamento funcionais.
- Fontes locais verificadas no navegador: Barlow Condensed e Manrope Variable.
- Capturas com animação normal revisadas visualmente nas quatro larguras.
- `/opengraph-image`: HTTP 200.
- `git diff --check`: aprovado.
- `npm ci --dry-run --ignore-scripts`: aprovado, lockfile consistente.

Servidor de produção utilizado: http://localhost:3000. Os testes automatizados usam o endereço equivalente http://127.0.0.1:3000.

## Pendências conhecidas

- O domínio oficial ainda não foi definido. O build informa fallback de `metadataBase` para localhost; robots bloqueia indexação enquanto `NEXT_PUBLIC_SITE_URL` estiver vazio. Configurar domínio aprovado antes de publicar.
- `npm audit --omit=dev`: zero vulnerabilidades reportadas.
- Auditoria completa: cinco alertas altos na cadeia de desenvolvimento `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. A versão disponível de `braces` é 3.0.3; o reparo automático sugerido regride a configuração do Next para outra versão principal. Não foi aplicado downgrade incompatível. Reavaliar atualização compatível das ferramentas. Essas dependências não fazem parte do runtime de produção.
- Fotos, equipe, catálogo, preços, durações, expediente, avaliações e texto institucional definitivo dependem do proprietário.

## Screenshots

Em `artifacts/`: `home-{largura}.png` e `agendar-{largura}.png` mostram páginas completas; `home-{largura}-viewport.png` mostra a primeira tela nas quatro larguras.
