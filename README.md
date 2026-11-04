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
- **Gestão em `admin.html`**: acesso por e-mail/senha, visão geral com os cinco horários futuros mais próximos, agenda completa com filtros e uma tela **Confirmados** que lista nome, telefone, serviço, profissional, data e horário. A tela de confirmados permite busca por nome ou telefone e exibe atendimentos futuros por padrão.
- **Respostas em `confirmar.html`**: links de demonstração que registram confirmação ou cancelamento apenas quando abertos no navegador onde existe o registro. Em outros dispositivos, será necessária uma agenda centralizada.
- **WhatsApp**: o botão **Mensagem** abre a conversa do número do cliente com texto preenchido; a equipe toca em **Enviar** no WhatsApp e só então em **Já enviei no WhatsApp** para registrar o contato no painel. Abrir a conversa não equivale a enviar. Sem automação não oficial, sem envio silencioso.
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


### Painel da equipe — organização de operações

A versão atual de `admin.html` prioriza:
- **Próximos horários** e **Contatos pendentes** na primeira tela.
- Quatro indicadores compactos (contato a enviar, aguardando resposta,
  confirmados e total), com contagem independente de presença e mensagem.
- **Agenda completa** com busca por cliente/telefone, filtro de mensagem
  imediatamente acessível e filtros de situação/período recolhidos.
- **Presenças confirmadas** em uma tela de consulta separada.
- Fluxo manual de WhatsApp pelo aplicativo instalado, sem API não oficial.

Para conferir a integração com o WhatsApp Desktop oficial no Windows e
fazer um teste preliminar no Linux com ZapZap, siga o
[guia Windows + Linux](docs/TESTE_WHATSAPP_DESKTOP.md).
O protocolo `whatsapp://` depende de uma associação válida de aplicativo:
ter o aplicativo instalado não garante, sozinho, que o link será aceito.

## Confirmação de agendamentos pelo link do site

A barbearia pode enviar a mensagem pelo aplicativo WhatsApp instalado,
**sem API paga do WhatsApp, sem extensão e sem envio automático**.

- O funcionário toca em **Mensagem**; o site abre `whatsapp://send` com o
  telefone do cliente e uma mensagem curta e amigável.
- Em ambiente compartilhado, essa mensagem contém **um único link assinado**
  para `confirmar.html?acao=escolher&...`.
- A página mostra serviço, profissional, data e horário. O cliente escolhe
  **Vou comparecer** ou **Cancelar horário**, e depois precisa confirmar
  essa escolha na janela **Tem certeza?**.
- O registro é salvo com `confirmation_channel: site` e `responded_at`.
- O painel destaca **Atendimentos de hoje**, **Respostas recebidas** e uma
  página própria **Respostas dos clientes**, com consulta e filtro de período.
- **Mensagem enviada** (registrada manualmente pela equipe) e **resposta
  do cliente pelo site** são eventos independentes. Não há detecção das
  mensagens comuns recebidas dentro do chat do WhatsApp.

**Para funcionar entre dispositivos**, a aplicação necessita de Redis e das
variáveis de ambiente de produção (`UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, `BOOKING_SESSION_SECRET`,
`BOOKING_ADMIN_EMAIL`, `BOOKING_ADMIN_PASSWORD` e
`BOOKING_PUBLIC_ORIGIN`). Consulte o guia completo:
[Confirmação do cliente, segurança e testes](docs/CONFIRMACAO_CLIENTE.md).

Sem backend, o site continua em **modo demonstração local**: o WhatsApp
não recebe um link público, e o painel disponibiliza um link de teste
válido **somente no navegador da demonstração**. Não envie esse link de
teste para clientes reais.

Para testar o protocolo `whatsapp://` no ZapZap (Linux) ou no aplicativo
oficial Windows, consulte [Guia Windows/Linux](docs/TESTE_WHATSAPP_DESKTOP.md).

### Testes

```bash
npm run test:booking
npm run test:api
node scripts/test-admin-whatsapp-link.mjs
node scripts/test-admin-redesign.mjs
```

O teste visual e funcional completo é executado no CI do GitHub quando
o workflow de regressão estiver habilitado. A branch
`reconstruction/arte-do-ritual` não altera automaticamente a `main`.
