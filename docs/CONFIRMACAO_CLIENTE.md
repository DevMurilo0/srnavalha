# Confirmação de horários pelo site — Sr. Navalha

Fluxo sem WhatsApp Cloud API e sem automação não oficial. **A equipe envia
manualmente** pelo aplicativo WhatsApp (Android/iPhone, ZapZap no Linux ou
WhatsApp Desktop no Windows quando o protocolo estiver associado). A
confirmação/cancelamento é feita pelo **link seguro do site**.

## O que cada registro significa

| Campo | Como é registrado | O que representa |
|---|---|---|
| `whatsapp_manual_sent_at` | Equipe clica **Já enviei no WhatsApp** | Envio relatado manualmente pela equipe, não verificação de entrega |
| `status: pending` | Novo horário | Cliente ainda não confirmou/cancelou |
| `status: confirmed` | Cliente confirma pelo link ou equipe registra | Presença confirmada |
| `status: cancelled` | Cliente cancela pelo link ou equipe registra | Horário cancelado/liberado |
| `responded_at` | Resposta/alteração de status | Data da última decisão |
| `confirmation_channel: site` | Cliente confirma/cancela no formulário | **Resposta efetiva do cliente pelo site** |
| `confirmation_channel: staff` | Equipe muda manualmente a situação | Alteração da equipe |
| `confirmation_channel: whatsapp` | Integração oficial (se ativada) | Resposta via webhook oficial |

**O site não lê mensagens recebidas no aplicativo WhatsApp** e não determina
se a pessoa respondeu apenas pelo chat. Para detectar isso automaticamente,
seria necessário integrar uma API adequada. O painel diferencia essas situações
para não confundir "mensagem enviada" com "cliente respondeu".

## Fluxo na barbearia

1. Abra **Painel → Agenda completa** e escolha um agendamento pendente.
2. Clique em **Mensagem**, confirme o telefone e envie o texto pelo aplicativo.
3. Em modo compartilhado, o texto contém **um único link** para a página
   `confirmar.html`. Esse link é assinado (HMAC), expira e não permite
   trocar o identificador do agendamento sem invalidar a assinatura.
4. Na página, o cliente vê primeiro nome, serviço, profissional, data e hora,
   escolhe **Vou comparecer** ou **Cancelar horário** e confirma a intenção
   em uma segunda janela de confirmação.
5. A resposta é salva no Redis e marcada com `confirmation_channel: site`.
6. No painel, consulte **Atendimentos de hoje**, **Respostas recebidas** ou
   **Respostas dos clientes**. Os eventos são exibidos com data e situação;
   é possível buscar pelo nome e escolher o período de resposta.
7. Os filtros da agenda para **Mensagem enviada** continuam separados.

A equipe também pode conversar normalmente com o cliente no mesmo WhatsApp:
a mensagem enviada termina com um convite para responder em caso de dúvidas.

## Configuração para clientes reais

**A sincronização entre dispositivos não funciona usando apenas Live Server,
ou somente HTML/CSS/JS.** Necessita de backend compartilhado. O projeto já
tem endpoints de reservas, sessões e confirmações, mas precisa que as
configurações de produção estejam preenchidas:

- `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` do Upstash Redis;
- `BOOKING_SESSION_SECRET` (segredo criptograficamente aleatório, longo);
- `BOOKING_ADMIN_EMAIL` e `BOOKING_ADMIN_PASSWORD`;
- `BOOKING_PUBLIC_ORIGIN` com endereço HTTPS público, acessível em celulares
  e sem proteção de prévia — por exemplo o domínio oficial do projeto.

Depois de publicar a branch deliberadamente, verifique se
`https://DOMINIO/api/health` responde `{"enabled":true,"mode":"shared"}`.
**Nenhuma dessas credenciais deve ser salva no GitHub.** Verifique os custos
e limites gratuitos do provedor escolhido antes de ativá-lo.

### Verificação entre dispositivos

1. Crie um agendamento de teste pelo celular A.
2. Abra o painel no Windows ou Linux e confirme que o agendamento aparece.
3. Clique em **Mensagem**. O WhatsApp deve receber o link público com
   `acao=escolher`, nunca `localhost`.
4. Abra o link no celular B. Antes de clicar, o painel permanece **Aguardando**.
5. Clique em **Cancelar horário**, verifique a pergunta **Tem certeza?**,
   clique em **Voltar** e confira que nada foi modificado.
6. Repita e aceite **Sim, cancelar horário**. Confira a situação
   **Cancelado** no painel e em **Respostas dos clientes**.
7. Para outro agendamento, teste **Vou comparecer** e confira a situação
   **Confirmado**, aparecendo no dia correto.
8. Reabra um link respondido: a decisão já registrada deve ser mostrada,
   sem alterar o registro. Links expirados, adulterados ou inexistentes
   precisam ser rejeitados.

### Demonstração local

Sem Redis/ambiente compartilhado, a mensagem do WhatsApp **não inclui um
link público de confirmação**; o painel informa isso e oferece
**Testar página de resposta neste navegador**. Essa simulação usa
`localStorage` e só funciona no navegador que criou o pedido. Não envie
o link local da simulação para clientes reais.

## Segurança operacional

- O telefone do cliente não é retornado pela API pública de consulta da
  confirmação; apenas seu primeiro nome e informações do atendimento.
- O clique inicial nos botões não grava nada: a decisão só é enviada após
  a segunda confirmação.
- Link já utilizado não altera silenciosamente um status confirmado ou
  cancelado. Para corrigir decisões, a equipe deve revisar o agendamento.
- Cancelamento libera o horário.
- A API não comprova que o WhatsApp enviou ou entregou a mensagem.
- Não publique a versão de teste nem as senhas demonstrativas como conta real.
