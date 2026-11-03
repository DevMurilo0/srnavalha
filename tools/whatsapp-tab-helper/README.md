# Sr. Navalha — auxiliar de aba do WhatsApp

Este complemento opcional foi criado para **Firefox e Floorp**. Ele permite que
o botão **Mensagem** reutilize uma aba do WhatsApp Web já aberta, inclusive se
aquela aba foi aberta manualmente antes do painel.

Ele **não lê mensagens, não envia nada automaticamente, não interage com o
conteúdo das conversas e não fecha abas**. Apenas localiza uma aba do WhatsApp,
troca o endereço para a conversa solicitada e a ativa. Se não houver uma aba
WhatsApp aberta, cria uma única; os contatos seguintes reutilizam a mesma.

## Instalar para testes no Firefox/Floorp

1. Descompacte `srnavalha-whatsapp-tab-helper.zip` ou baixe esta pasta do GitHub.
2. Abra `about:debugging#/runtime/this-firefox` no navegador.
3. Clique em **Carregar extensão temporária / Load Temporary Add-on**.
4. Selecione o arquivo `manifest.json` desta pasta.
5. Volte ao `admin.html` e **atualize a página**.
6. Mantenha o WhatsApp Web já conectado no navegador. Clique em **Mensagem**
   para abrir o cliente naquela mesma aba.

A extensão temporária é removida pelo Firefox após reiniciar o navegador.
Uma instalação permanente requer assinar/distribuir o complemento conforme
as regras do Firefox/AMO. Não ignore avisos de segurança de extensões.

## Como funciona

- O script em `bridge.js` só responde na página `admin.html` de domínios
  específicos da Sr. Navalha (prévia autorizada da Vercel ou servidor local).
- O script em `background.js` valida a origem e o endereço de destino:
  somente `https://web.whatsapp.com/send?phone=55...&text=...`.
- Utiliza `browser.tabs.query/update` para reutilizar a aba existente.
- Não usa Evolution API, automações de envio ou tokens de terceiros.
- O clique em **Enviar** dentro do WhatsApp continua sendo manual.
- A situação **Mensagem enviada** é marcada pela equipe no painel, não
  inferida automaticamente pela extensão.

## Sem extensão

Por segurança, o site não consegue controlar abas abertas manualmente.
O painel tenta usar sua aba nomeada; se a referência for perdida, não abre
novas abas indefinidamente: apresenta instruções para utilizar a aba existente,
copiando o texto da mensagem ou instalando este complemento.

O código fica junto ao repositório, para auditoria e alterações futuras.
