# Sr. Navalha — The Cut

Website editorial da Sr. Navalha Barbearia, reconstruído a partir da arte aprovada
em **[print/Site editorial da Sr. Navalha.png](print/Site%20editorial%20da%20Sr.%20Navalha.png)**.

## Rodar localmente

Abra este repositório no VS Code e inicie o **Live Server** em `index.html`.
Não precisa instalar dependências para navegar pelo site. Para servir manualmente:

```bash
python3 -m http.server 8047
# http://127.0.0.1:8047/
```

Para regerar o HTML a partir dos templates e dados existentes:

```bash
node scripts/render-site.mjs
```

**Fonte visual canônica:** `templates/the-cut/*.html` + `css/the-cut.css`.
**Interações:** `js/the-cut/app.js`.
**Conteúdo real:** `js/data/services.js`, `products.js`, `professionals.js` e `reviews.js`.

Os recursos do conceito foram preservados nos arquivos `assets/images/the-cut`,
incluindo a navalha do mockup, a textura, os produtos e **cinco retratos com canal alfa**.
Os arquivos de proveniência explicam a segmentação das fotos de profissionais e
as limitações da resolução do mockup.

## Conteúdo, funcionamento e limites

- **42 serviços**, incluindo Corte (R$ 30), Barba simples (R$ 20) e Corte + barba simples (R$ 50), com catálogo completo expansível e buscável.
- **5 profissionais** (Damião, Eduardo, Kauã, Rafael e Yan), mostrados com imagens transparentes e troca interativa.
- **18 produtos com fotografias**, com consulta de disponibilidade pelo WhatsApp e filtro por nome/categoria.
- **Galeria fotográfica** com visualizador acessível, navegação e Escape.
- **Agendamento próprio em `agendar.html`**: somente demonstração local, horários ilustrativos; **não reserva horários reais**. O atendimento deve confirmar pelo WhatsApp.
- Localização e redes sociais vinculadas ao estabelecimento real.
- Sem servidor de aplicação, checkout ou pagamento.

## Verificação

GitHub Actions: [workflow The Cut](.github/workflows/v6-regression.yml).
Após cada push na branch de desenvolvimento:

1. `node --check` e `node scripts/render-site.mjs`.
2. `git diff --exit-code -- index.html` para garantir fonte e HTML sincronizados.
3. Teste local do armazenamento de agendamentos.
4. Capturas reais de Chromium em 320, 390, 768, 900, 1366 e 1440 px; fotos são carregadas ao passar pelas seções.
5. Troca de profissionais, catálogos, galeria, Axe e movimento reduzido.
6. Testes do agendamento em etapas.
7. Artefatos ZIP e screenshots anexados ao workflow.

Os scripts de animação das versões V6–V31 e os templates anteriores
permanecem no histórico do repositório, mas não são carregados pelo `index.html` atual.

## Operação

Todas as alterações de desenvolvimento ficam na branch
`reconstruction/arte-do-ritual`. A `main` não recebe alterações automaticamente.
Um status de sucesso do Vercel para uma *Preview* não significa publicação em produção.

**Crédito:** [Murilo Gabriel](https://murilogabriel.com.br).
