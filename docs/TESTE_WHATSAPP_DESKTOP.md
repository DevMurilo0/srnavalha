# Sr. Navalha — Como testar o WhatsApp no Windows e no Linux

O botão **Mensagem** da agenda usa um link nativo:
`whatsapp://send?phone=55DDDNUMERO&text=MENSAGEM`.

Ele apenas **abre a conversa e prepara o texto** quando o sistema possui um
aplicativo que reconheça esse protocolo. Não envia mensagens por conta própria.
O funcionário deve conferir o número e clicar em **Enviar** no WhatsApp, e
depois marcar **Já enviei no WhatsApp** no painel.

## Teste definitivo — PC da barbearia (Windows)

1. Instale o aplicativo oficial pelo [site do WhatsApp para Windows](https://www.whatsapp.com/download/desktop),
   que direciona para a Microsoft Store.
2. Abra o WhatsApp e conecte o número da barbearia em **Dispositivos conectados**.
3. Abra a versão atualizada do site Sr. Navalha no navegador do mesmo PC.
4. Entre em `admin.html` e abra uma reserva de teste com um número que você
   tenha autorização para contatar.
5. Clique em **Mensagem**. Se o Windows perguntar qual programa usar,
   escolha **WhatsApp**.
6. Confira se o chat do número correto abriu e se o texto de confirmação
   apareceu. Só então clique em Enviar.
7. Volte ao painel e marque **Já enviei no WhatsApp**. Confirme que o registro
   aparece em **Mensagem enviada**, sem mudar automaticamente a presença.
8. Teste mais dois clientes diferentes, incluindo número ainda não salvo.

**Se abrir WhatsApp Web em vez do aplicativo:** verifique a associação de
protocolo em **Configurações > Aplicativos > Aplicativos padrão > escolher padrões por tipo de link**
(termos variam conforme a versão do Windows). Procure `WHATSAPP`. Nem
toda versão do aplicativo tem suporte idêntico para esse protocolo; a
associação precisa existir e o comportamento só pode ser confirmado no
Windows real. Se o Windows não oferecer essa associação, evite instalar
automação não oficial: use o app e **Copiar texto** no painel.

## Teste preliminar no Linux

### 1. Instale um cliente Linux de forma segura

O WhatsApp **não possui aplicativo desktop oficial para Linux**. Para testar
um app desktop de terceiros você pode usar o
[ZapZap no Flathub](https://flathub.org/apps/com.rtosta.zapzap), um cliente
de código aberto que **carrega o WhatsApp Web** em uma janela própria.

No Linux Mint moderno, Flatpak/Flathub já são normalmente disponíveis.
No Arch Linux, verifique antes:

```bash
flatpak --version
flatpak remotes
```

Se o Flatpak não estiver instalado (Arch):

```bash
sudo pacman -S flatpak
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

No Mint, se não houver Flatpak, instale-o pelo gerenciador de aplicativos
ou com `sudo apt install flatpak`.

Instale e execute o ZapZap:

```bash
flatpak install flathub com.rtosta.zapzap
flatpak run com.rtosta.zapzap
```

Conecte sua conta em **Dispositivos conectados**. Por ser um aplicativo que
incorpora WhatsApp Web, isso **não garante** o comportamento do WhatsApp
Desktop oficial do Windows.

### 2. Verifique o protocolo do aplicativo

Em um terminal do Linux, execute:

```bash
xdg-mime query default x-scheme-handler/whatsapp
```

- Se retornar o nome de um arquivo `.desktop`, existe um aplicativo
  registrado para tratar links `whatsapp://`; ainda será necessário
  testar se ele aceita **número e texto**.
- Se não retornar nada, o sistema **não tem um manipulador padrão**.
  O ZapZap pode estar instalado e funcionando, mas isso **não significa**
  que ele seja registrado automaticamente para o protocolo.

Para testar sem enviar mensagem, utilize um número **seu ou de um colega que
autorizou o teste**, preenchido no painel em um agendamento de teste.
Clique em **Mensagem**, observe qual aplicativo o sistema oferece e **não
pressione Enviar** durante a verificação.

Se preferir testar sem acessar o painel, substitua apenas o número abaixo
pelo seu número real autorizado, mantendo os dígitos do país/DDD:

```bash
xdg-open 'whatsapp://send?phone=5511999999999&text=Teste%20de%20abertura%20do%20Sr.%20Navalha'
```

**Importante:** não instale handlers genéricos que redirecionem para
`web.whatsapp.com` esperando reproduzir o comportamento do app Windows.
Esse redirecionamento apenas disfarça o problema anterior. Não execute
comandos que modifiquem associações de protocolo sem entender o resultado.

### 3. O que é possível concluir no Linux?

Se o ZapZap abrir o link diretamente com número e texto: ótimo,
o fluxo pode ser experimentado localmente. Se não abrir, **não quer dizer
que o WhatsApp Desktop do Windows vai falhar**: são programas diferentes.

## Limitações do protótipo

- A agenda local utiliza armazenamento do navegador, não é compartilhada
  entre celular e Windows sem um servidor configurado.
- `whatsapp://` não prova que uma mensagem foi enviada ou entregue.
- Não existe integração automatizada, API não oficial ou envio silencioso.
- O fluxo comercial definitivo deve ser testado no Windows da equipe.

Referências:
- [WhatsApp Desktop oficial](https://www.whatsapp.com/download/desktop)
- [ZapZap — projeto](https://github.com/rafatosta/zapzap)
- [ZapZap — Flathub](https://flathub.org/apps/com.rtosta.zapzap)
- [Documentação do Flatpak](https://docs.flatpak.org/en/latest/using-flatpak.html)
