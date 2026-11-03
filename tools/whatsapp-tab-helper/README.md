# Sr. Navalha — WhatsApp Universal v3.0

Extensão para Firefox, Floorp e Chrome. Ao clicar em **Mensagem** no painel,
ela reutiliza uma aba do WhatsApp Web já aberta e acessa **diretamente a
conversa do número com a mensagem preenchida**. Não pesquisa na barra lateral
e não envia mensagens automaticamente.

## Instalação

**Floorp/Firefox**: extraia o ZIP; abra
`about:debugging#/runtime/this-firefox`, remova a extensão antiga e clique em
**Carregar extensão temporária**; selecione `manifest.json`. Depois atualize
`admin.html` com Ctrl+Shift+R. O painel deve mostrar **Extensão conectada · v3.0**.

**Chrome/Chromium**: extraia o ZIP; acesse `chrome://extensions/`, ative
Modo do desenvolvedor, remova a extensão antiga e clique em
**Carregar sem compactação**, selecionando a pasta do `manifest.json`.
Atualize `admin.html`.

## Como funciona

1. Mantenha o WhatsApp Web conectado no mesmo navegador/perfil.
2. No agendamento, clique em **Mensagem**.
3. A extensão reutiliza a aba existente e abre
   `https://web.whatsapp.com/send?phone=55...&text=...`.
4. Confira o destinatário e clique em **Enviar** no próprio WhatsApp.
5. Volte ao painel e clique em **Já enviei no WhatsApp** para registrar o envio.

**Diferença para v2.2:** a versão anterior procurava números na barra lateral,
o que falhava para clientes sem conversas anteriores. A versão 3.0 usa o recurso
de link direto por número, sem depender do histórico ou de encontrar um item
na lista lateral.

**Limitação:** ao trocar de cliente, o WhatsApp Web **pode recarregar na mesma
aba**. Não existe API pública estável do WhatsApp Web para abrir qualquer chat
e preencher o campo sem navegação. É preferível à busca que não abria o contato
corretamente. A extensão nunca abre uma segunda aba se já houver uma aba do
WhatsApp acessível no mesmo perfil.

A extensão não lê conversas nem aperta Enviar.

## Diagnóstico

- **Extensão não detectada**: atualize o painel após carregar a extensão.
- **O WhatsApp não abriu**: clique em **Verificar extensão** no painel.
- **Abriu outra aba**: confirme que o WhatsApp está no mesmo navegador/perfil.
- **Mensagem não foi preenchida**: confira número válido e avisos de
  confirmação que o WhatsApp possa exibir; use **Copiar texto** como alternativa.
