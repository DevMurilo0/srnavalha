# Sr. Navalha — WhatsApp em uma aba (universal v2)

**Um único complemento para Firefox, Floorp e Google Chrome**, desenvolvido em
WebExtensions Manifest V3. Não é necessário um ZIP diferente para cada navegador:
o `manifest.json` inclui os dois tipos de execução de segundo plano, porque o
Chrome usa **service worker** e Firefox/Floorp usam **background scripts**.

## Antes de instalar

Se você carregou a versão antiga, **remova/desative a extensão anterior** para
evitar dois complementos com o mesmo nome disputando a navegação. Extraia o ZIP
novo, mantendo os arquivos **juntos na mesma pasta**:

```
srnavalha-whatsapp-universal/
  manifest.json
  background.js
  bridge.js
  README.md
```

Instale o conteúdo **extraído**, não o arquivo ZIP diretamente.

### Firefox e Floorp

1. Na barra de endereços, abra `about:debugging#/runtime/this-firefox`.
2. Na lista de **Extensões temporárias**, remova a versão antiga se existir.
3. Clique em **Carregar extensão temporária** (*Load Temporary Add-on*).
4. Escolha **manifest.json** da pasta extraída.
5. Veja se aparece **Sr. Navalha — WhatsApp em uma aba, versão 2.0.0**.
6. Volte ao `admin.html` e pressione **Ctrl + Shift + R**. Abra **Mensagem**.
7. Verifique se o aviso exibe **Extensão conectada · v2**. Caso contrário,
   clique em **Verificar extensão** na janela de mensagem.

Extensões temporárias são desinstaladas ao **reiniciar o navegador**. Para
instalação permanente no Firefox/Floorp é necessário assinar o complemento.

### Google Chrome e navegadores Chromium

1. Abra `chrome://extensions/`.
2. Ative **Modo do desenvolvedor** (*Developer mode*) no canto superior direito.
3. Remova a versão anterior, se existir.
4. Clique em **Carregar sem compactação** (*Load unpacked*).
5. Selecione a **pasta extraída** `srnavalha-whatsapp-universal`
   (aquela onde está o arquivo `manifest.json`).
6. Atualize o painel com **Ctrl + Shift + R** e entre em **Mensagem**.
7. O painel deve informar **Extensão conectada · v2**.

O Chrome permite conservar a extensão carregada sem compactação enquanto a
pasta original continuar no mesmo lugar. Não mova a pasta depois de carregá-la.

## Como usar

- Mantenha o **WhatsApp Web** conectado em qualquer aba.
- Abra `admin.html` do Sr. Navalha no **mesmo navegador e perfil**.
- Clique em **Mensagem** para um cliente. O complemento procura uma aba do
  WhatsApp Web e **reutiliza a mesma aba**, inclusive se você a abriu antes.
- Ao escolher outro cliente, a conversa muda **nessa mesma aba**.
- Se não houver WhatsApp aberto, uma aba nova é criada somente uma vez.
- **Clique em Enviar no WhatsApp**. Em seguida, confirme **Já enviei no
  WhatsApp** no painel. Abrir uma conversa não significa que a mensagem foi
  enviada ou entregue.

O complemento não acessa conversas, não lê mensagens e não executa envio
automático. Apenas navega pela API oficial de **abas do navegador**
(`tabs.query`, `tabs.update`, `tabs.create`).

## Diagnóstico: ainda não funciona?

1. Verifique se o complemento **v2.0.0** aparece na tela de extensões.
2. Atualize **admin.html** depois de instalar, preferencialmente com
   **Ctrl + Shift + R**.
3. No painel, clique em **Mensagem → Verificar extensão**.
4. Se mostrar **Extensão não detectada**, verifique se está usando o mesmo
   perfil do navegador; no Chrome abra a página da extensão e veja se houve
   erros do service worker. No Floorp/Firefox consulte **Inspecionar** na
   entrada da extensão temporária.
5. Se mostrar **Extensão com erro**, anote a mensagem no painel.
6. Confira se o painel está em uma das origens previstas: servidor local
   `localhost` ou `127.0.0.1`, prévia Vercel autorizada, produção
   `srnavalha.vercel.app` ou `srnavalha.com.br`.
7. Não instale duas versões ao mesmo tempo. Teste primeiro com **uma aba**
   `https://web.whatsapp.com/` aberta.

Para sua privacidade, a extensão **não** responde em outros sites.
Domínios arbitrários da Vercel não podem controlar as abas do WhatsApp:
os scripts validam a origem da mensagem no servidor da extensão.

O código é aberto e está incluído no repositório Sr. Navalha.
