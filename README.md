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
- **18 produtos com fotografias**, catálogo pesquisável por nome/categoria; a consulta é feita diretamente na barbearia, sem links de WhatsApp na seção.
- **Galeria fotográfica** com visualizador acessível, navegação e Escape.
- **Agendamento em `agendar.html`**: escolha serviço, profissional, data, horário, nome e WhatsApp, com comprovante redesenhado e aviso de confirmação futura; horários ilustrativos, **sem reserva real**.
- **Gestão em `admin.html`**: acesso de apresentação com e-mail/senha, lista de solicitações, pesquisa, filtros e status de confirmação/cancelamento; tudo acessa o mesmo armazenamento local do navegador.
- **Respostas em `confirmar.html`**: links de demonstração que registram confirmação ou cancelamento apenas quando abertos no navegador onde existe o registro. Em outros dispositivos, será necessária uma agenda centralizada.
- **WhatsApp**: o botão do painel abre conversa com mensagem preenchida para envio manual; respostas e envios automáticos exigirão integração posterior com WhatsApp Business Platform e webhooks.
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
6. Testes do agendamento em etapas e verificação da área administrativa, incluindo confirmação e cancelamento.
7. Artefatos ZIP completos e screenshots anexados ao workflow.

Os scripts de animação das versões V6–V31 e os templates anteriores
permanecem no histórico do repositório, mas não são carregados pelo `index.html` atual.

## Operação

Todas as alterações de desenvolvimento ficam na branch
`reconstruction/arte-do-ritual`. A `main` não recebe alterações automaticamente.
Um status de sucesso do Vercel para uma *Preview* não significa publicação em produção.

**Crédito:** [Murilo Gabriel](https://murilogabriel.com.br).

## Testes de movimento

O CI executa Playwright na branch de desenvolvimento e na `main`, incluindo as verificações de estados antes da primeira pintura, a transferência da navalha, acessibilidade e movimento reduzido. Os scripts de diagnóstico não dependem mais de caminhos particulares de outro computador. Para executar localmente, instale `playwright-core` e `@axe-core/playwright` em um ambiente de testes e disponibilize um Chromium. Use `PLAYWRIGHT_PACKAGE` para apontar para o `package.json` desse ambiente e, se necessário, `CHROME_PATH` para o executável do navegador. Os testes temporais usam `SITE_URL` (padrão `http://127.0.0.1:8047`). As capturas são produzidas em `docs/motion-states/` e o GitHub Actions também entrega artefatos de screenshots.

## Confirmação pública por WhatsApp — configuração de produção

O botão **Preparar WhatsApp** envia uma mensagem preenchida para revisão manual.
O site **não** dispõe de autorização da WhatsApp Business Platform para enviar
templates com botões nativos nem para receber webhooks da Meta; os dois endereços
HTTPS de resposta funcionam como links clicáveis em mensagens comuns.

Os endpoints em `api/` já foram implementados para confirmação real **entre
dispositivos**, mas precisam de um Redis Upstash conectado à Vercel.
Sem essas variáveis, a aplicação permanece em **modo demonstração local** e
**nunca inclui `localhost` ou `127.0.0.1` nas mensagens de WhatsApp**.

Para ativar:

1. Na Vercel, abra o projeto `srnavalha`, vá a **Storage / Marketplace** e conecte um Redis Upstash (verifique o plano antes de concluir a instalação).
2. Configure `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` no ambiente do projeto. Normalmente são adicionados pela integração.
3. Configure `BOOKING_SESSION_SECRET` (32 bytes ou mais de aleatoriedade), `BOOKING_ADMIN_EMAIL` e `BOOKING_ADMIN_PASSWORD` (uma senha forte, diferente do login de demonstração).
4. Configure `BOOKING_PUBLIC_ORIGIN` com o endereço HTTPS **público e acessível pelos clientes** que contém `confirmar.html` e `/api/confirm` — por exemplo, `https://srnavalha.vercel.app`. Não use domínio de prévia protegido por login nem `localhost`.
5. Aplique as mudanças ao ambiente de produção, publique e confirme que `/api/health` retorna `{"enabled":true,"mode":"shared"}`.
6. Verifique a criação do pedido no celular e sua presença no painel de outro dispositivo. Teste os dois links de confirmação e cancelamento, e confira se o horário cancelado volta a ficar disponível.

A conta do painel em produção é protegida por cookie assinado HTTP-only e credenciais mantidas no servidor. Os links de confirmação/cancelamento são assinados e expiram. Não publique senhas nem tokens no GitHub.

**Importante:** a `main` não recebe automaticamente as alterações da branch de desenvolvimento. Antes de testar publicamente, publique a versão revisada no domínio de produção. Links emitidos por uma prévia com autenticação Vercel não podem ser usados diretamente pelos clientes.

A demonstração local (sem backend) preserva a funcionalidade anterior do navegador. Nela, links de confirmação só são exibidos na simulação interna; eles não vão para mensagens de WhatsApp.

