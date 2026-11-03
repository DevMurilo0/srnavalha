# Sr. Navalha — WhatsApp em uma aba (v4.0)

Extensão universal de navegador para **Firefox, Floorp e Chrome**.

## O que mudou nesta versão

A versão 3 navegava para `web.whatsapp.com/send?...` ao selecionar outro
cliente; isso recarregava o WhatsApp Web inteiro.

A versão 4 **não navega para outra URL quando a aba já existe**. Em vez disso,
ela tenta usar o botão **Nova conversa** e os resultados do próprio WhatsApp
Web para abrir o número e colocar a mensagem como rascunho. A conversa só é
selecionada automaticamente quando há **uma correspondência exata** do número.

**Limitação importante:** o WhatsApp Web não possui uma API pública e estável
para controlar sua interface. Como a extensão depende dos controles visuais,
ela pode deixar de reconhecer um resultado depois de uma atualização do site,
ou não encontrar números que o WhatsApp não exibe na lista de novos chats.
Nessas situações, ela **não atualiza a página nem troca para outro cliente**;
mostra uma mensagem de erro no painel, onde o texto continua disponível para
cópia manual. O recurso de abrir números não salvos com maior compatibilidade
é o link oficial de conversa por número, mas ele pode provocar recarregamento.

O auxiliar **não lê histórico, não aperta Enviar e não confirma agendamentos**.
O funcionário precisa conferir o número e enviar pelo WhatsApp.

## Instalação

**Floorp / Firefox**

1. Extraia este ZIP (não carregue o ZIP diretamente).
2. Abra `about:debugging#/runtime/this-firefox`.
3. **Remova a extensão antiga** Sr. Navalha — WhatsApp em uma aba.
4. Clique em **Carregar extensão temporária** e selecione `manifest.json`
   da nova pasta.
5. Volte ao painel `admin.html` e use **Ctrl + Shift + R**.
6. No botão **Mensagem**, confirme **Extensão conectada · v4.0**.

**Chrome / navegadores Chromium**

1. Extraia o mesmo ZIP e abra `chrome://extensions/`.
2. Ative **Modo do desenvolvedor**.
3. Remova a versão antiga, clique em **Carregar sem compactação** e selecione
   a pasta extraída que contém `manifest.json`.
4. Atualize `admin.html` e confira **Extensão conectada · v4.0**.

## Teste

1. Deixe `https://web.whatsapp.com/` aberto e conectado.
2. Clique em **Mensagem** para um cliente no painel.
3. A extensão tentará abrir a conversa pela interface existente, sem recarregar.
4. Se houver um resultado exato, o texto ficará no campo de composição.
5. Confira o destinatário, clique em **Enviar** no WhatsApp e depois em
   **Já enviei no WhatsApp** no painel.
6. Experimente outro cliente e confira se a URL da aba do WhatsApp não mudou.

Se o painel mostrar **“Extensão desatualizada”**, a v3 ainda está carregada.
Remova a versão antiga e instale a v4. Se aparecer **“Nova conversa não
encontrada”** ou **“Selecione manualmente”**, o WhatsApp não mostrou os
controles ou o número de forma identificável; use **Copiar texto** em vez de
forçar uma navegação.

## Conteúdo do pacote

- `manifest.json` — extensão universal Manifest V3.
- `background.js` — reutilização da aba existente sem alterar sua URL.
- `bridge.js` — comunicação entre o painel e a extensão.
- `whatsapp-page.js` — automação de nova conversa e rascunho, sem envio.
- `test-helper.mjs` — testes locais simulados: `node test-helper.mjs`.

Código-fonte: https://github.com/DevMurilo0/srnavalha/tree/reconstruction/arte-do-ritual/tools/whatsapp-tab-helper
