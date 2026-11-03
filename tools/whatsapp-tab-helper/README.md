# Sr. Navalha — WhatsApp em uma aba (universal v2.1)

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
5. Veja se aparece **Sr. Navalha — WhatsApp em uma aba, versão 2.1.0**.
6. Volte ao `admin.html` e pressione **Ctrl + Shift + R**. Abra **Mensagem**.
7. Verifique se o aviso exibe **Extensão conectada · v2.1**. Caso contrário,
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
7. O painel deve informar **Extensão conectada · v2.1**.

O Chrome permite conservar a extensão carregada sem compactação enquanto a
pasta original continuar no mesmo lugar. Não mova a pasta depois de carregá-la.

## Como usar

- Mantenha o **WhatsApp Web** conectado em qualquer aba.
- Abra `admin.html` do Sr. Navalha no **mesmo navegador e perfil**.
- Clique em **Mensagem** para um cliente. O complemento procura uma aba do
  WhatsApp Web e **reutiliza a mesma aba**, inclusive se você a abriu antes.
- Ao escolher outro cliente, **o WhatsApp Web não recarrega**. O auxiliar
  procura o número na barra lateral de busca da mesma aba e deixa os
  resultados visíveis. Clique no cliente certo para abrir a conversa.
- A mensagem continua disponível na prévia do painel, em **Copiar texto**.
  Cole-a no campo da conversa e pressione Enviar manualmente.
- Se a barra de busca do WhatsApp mudar em uma futura atualização e não for
  identificada, o painel exibirá um erro. Ele **não** recarregará a aba como
  alternativa. A interface do WhatsApp é externa e pode mudar.
- Se não houver WhatsApp aberto, uma aba nova é criada somente uma vez.
- **Clique em Enviar no WhatsApp**. Em seguida, confirme **Já enviei no
  WhatsApp** no painel. Abrir uma conversa não significa que a mensagem foi
  enviada ou entregue.

O complemento não lê mensagens recebidas nem executa envios automáticos.
Ele apenas acessa a caixa de busca da interface e digita o número de telefone
para localizar a conversa. As APIs do navegador usadas são `tabs.query`,
`tabs.update` (somente ativação da aba), `tabs.sendMessage` e,
quando necessário, `scripting.executeScript` para executar a busca
sem atualizar a página.

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

## Atualização da v2 para v2.1

Se já instalou o auxiliar anterior, faça `git pull --ff-only` na pasta do
projeto e recarregue a extensão: em `about:debugging`, clique em **Recarregar**,
ou no Chrome clique no ícone de atualização da extensão em
`chrome://extensions`. Depois atualize **somente** `admin.html` com
**Ctrl + Shift + R**. Não é necessário atualizar a aba do WhatsApp.

A alteração principal é que `tabs.update({url: ...})` foi substituído por
uma pesquisa feita na barra lateral do WhatsApp Web. Essa alteração evita
reinicializar o WhatsApp quando o contato muda. Ela não altera a conversa
por trás dos controles oficiais e não envia mensagens automaticamente.
