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

## Mensagens de confirmação no aplicativo WhatsApp (celular)

O fluxo de contato da área administrativa foi simplificado para **celulares**,
sem extensão de navegador, sem WhatsApp Web, sem automação não oficial e sem
disparo de mensagens por servidor.

1. O administrador abre `admin.html` no celular e escolhe um agendamento
   **Aguardando**.
2. O botão **Mensagem** é um link verdadeiro para
   `whatsapp://send?phone=55DDDNUMERO&text=MENSAGEM_CODIFICADA`, preenchido
   dinamicamente com **o telefone do próprio agendamento** e a mensagem de
   confirmação (serviço, profissional, data e hora).
3. O navegador solicita a abertura do **aplicativo WhatsApp instalado**.
   Não há redirecionamento automático para WhatsApp Web.
4. O administrador confere o destinatário e **toca em Enviar** no aplicativo.
   O site não envia automaticamente nem pode verificar o envio.
5. Ao voltar ao painel, clica em **Já enviei no WhatsApp** para registrar
   `whatsapp_manual_sent_at` na agenda e organizar os filtros independentes
   **Aguardando contato** e **Mensagem enviada**.

O link principal é um elemento `<a>` real (navegação nativa iniciada por
um clique), não uma tentativa via `window.location.assign` ou pop-up.
A página mantém uma prévia e uma segunda opção **Abrir conversa no aplicativo
WhatsApp** caso o navegador exija nova interação. Para números inválidos,
o botão fica desabilitado e mostra por quê.

**Limitação:** é necessário ter o WhatsApp instalado no celular. A abertura
de links `whatsapp://` depende das permissões do navegador/sistema. O foco
deste fluxo é Android/iPhone; navegadores desktop sem aplicativo associado
ao protocolo podem não abrir o link. A extensão antiga continua disponível
no repositório para referência, mas **não é utilizada no painel**.

Os estados de contato e presença são diferentes: registrar que a equipe
enviou uma mensagem **não** significa que o cliente confirmou a reserva.

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


## Ativação dos botões dentro do WhatsApp (Cloud API Meta)

Além das variáveis do Redis e da agenda acima, configurar na Vercel, como segredos
do servidor:

- `WHATSAPP_PHONE_NUMBER_ID`: ID do número conectado à WhatsApp Cloud API;
- `WHATSAPP_ACCESS_TOKEN`: token de acesso do sistema com permissão de envio;
- `WHATSAPP_APP_SECRET`: segredo do aplicativo Meta, usado para verificar a
  assinatura de todos os eventos recebidos;
- `WHATSAPP_VERIFY_TOKEN`: segredo de verificação do webhook, escolhido pela equipe;
- `WHATSAPP_TEMPLATE_NAME`: nome **exato** do modelo aprovado na Meta
  (sugestão: `confirmacao_agendamento_srn`);
- `WHATSAPP_TEMPLATE_LANGUAGE`: `pt_BR` (opcional; é o padrão);
- `WHATSAPP_GRAPH_VERSION`: versão da Graph API habilitada pela Meta (opcional;
  há um valor padrão no código, que deve ser atualizado periodicamente).

No **WhatsApp Manager**, criar e enviar para aprovação um modelo da categoria
**Utility** com idioma **Português (Brasil)** e texto:

> Olá, {{1}}! Aqui é da Barbearia Sr. Navalha. Precisamos confirmar o
> atendimento de {{2}}, no dia {{3}}, com {{4}}.
> Você poderá comparecer? Escolha uma das opções abaixo.

Adicionar **dois botões do tipo Resposta rápida**, nesta ordem exata:

1. Botão índice **0**: `Confirmar`
2. Botão índice **1**: `Cancelar`

**Não** usar botões de URL, chamada, copiar código ou botão de envio comum,
pois a integração espera o retorno de uma **Resposta rápida**. Os quatro campos
dinâmicos do texto e os dois índices dos botões precisam coincidir com o template
aprovado. A Meta poderá rejeitar o modelo se a categoria/texto não respeitar
as políticas.

Em **WhatsApp Business Platform → Webhooks**:
- URL de callback: `https://DOMINIO-PUBLICO/api/whatsapp-webhook`.
- Token de verificação: mesmo valor de `WHATSAPP_VERIFY_TOKEN`.
- Assinar o campo `messages` da conta do WhatsApp Business.
- Manter `WHATSAPP_APP_SECRET` somente no servidor.

Fluxo:
1. A equipe abre a agenda, escolhe um pedido **Aguardando** e clica em
   **Mensagem**. Quando o modo oficial está ativo, o envio é solicitado
   diretamente à API do WhatsApp Business.
2. O endpoint `POST /api/whatsapp` verifica o login do administrador,
   confirma o horário e solicita o envio do template aprovado à Meta.
3. O cliente recebe **Confirmar** e **Cancelar** dentro do WhatsApp.
4. O clique retorna à plataforma por webhook assinado; somente respostas do
   número do cliente correspondente são aceitas.
5. A agenda atualiza o status automaticamente (consulta a cada 15 s ou
   botão Atualizar). Um cancelamento libera novamente o horário.

Os endpoints exigem acesso administrativo e um armazenamento compartilhado;
o envio também limita reenvios de um mesmo pedido a uma vez a cada 10 minutos.
**Sem Redis, tokens válidos e template aprovado, o sistema permanece na
demonstração**, sem fingir que enviou mensagens.

Os botões do WhatsApp não podem ser injetados por `wa.me`, WhatsApp Web ou
texto formatado. A Meta exige o canal oficial para que o aplicativo renderize
componentes interativos. Não enviar tokens por mensagem ou salvar no GitHub.
