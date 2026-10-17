# Validação V6 integrada — 17/10/2026

Execução real em **Firefox157.0.1 headless**, por HTTP em `http://127.0.0.1:8016/`, equivalente ao Live Server. Não foi usado HTML embutido com `set_content`. A V6 está na raiz; `.v6-stage/` permanece como cópia de implementação.

## Resultados executados

| Grupo | Resultado | Evidência |
|---|---|---|
| Home/agendamento em320,375,390,768,1024,1366,1440px |90 verificações aprovadas; sem overflow, imagens quebradas ou erros JS capturados; fonte local carregada|`V6_TESTES_INTEGRADA.json`|
| Acessibilidade/movimento reduzido/sem JS |6 verificações aprovadas|`V6_TESTES_ACESSIBILIDADE_INTEGRADA.json`|
| Foco, toque, arraste, atualização, rolagem, mapa, data passada |15 verificações aprovadas|`V6_TESTES_INTERACOES.json`|
| Emenda, hover, CTA, DPR2, mapa real e falha induzida |12 verificações aprovadas e1 observação de suporte CLS|`V6_TESTES_FINAIS.json`|
| Esteira após correção de largura |Geometria/emenda conferidas nas7 larguras|`V6_TESTES_ESTEIRA_FINAIS.json`|
| Caminhos, conteúdo e preservação |Nenhum caminho local ausente; quatro textos e iframe originais preservados, crédito e fotos intactos|`V6_VERIFICACAO_ESTATICA.json`|
| Taste lint |0 FAIL;2 WARN explicados abaixo|`V6_TASTE_LINT.json`|
| Diff |`git diff --check` sem erros|Revisão final da árvore de trabalho|

As imagens lazy dentro de serviços fechados podem aparecer como pendentes no inventário anterior à abertura. Os testes abrem as faixas e verificam as revelações. Isso não é uma imagem quebrada.

### Interações comprovadas

- Corte, Barba e Sobrancelha/acabamento: máscaras medidas durante execução, com progresso entre0 e1, e término sem máscara residual. Capturas intermediárias em390/1440px.
- Portfólio/lightbox: seleção, próximo por teclado, Escape, Tab/Shift+Tab contidos, retorno do foco, clique fora, swipe por toque e arraste com mouse. Rolagem restaurada ao fechar.
- Menu móvel: abrir, Escape e retorno de foco.
- Esteira: direção direita→esquerda; velocidade medida de30px/s; pausa/retomada, hover, toque e clones inacessíveis. Emenda de16px, igual ao espaço entre depoimentos; grupo desktop1664px. Conferência perto da emenda evita repetir ciclos longos.
- Reduced motion: preferência real do Firefox alterada durante animação; movimento cancelado, imagem visível, clones removidos. Também testado ao carregar e ao retornar à preferência normal sem recarregar.
- Sem JavaScript: conteúdo, cinco links fotográficos, quatro depoimentos, catálogo/menu nativos e contato direto do agendamento.
- Solicitação: preferência de serviço, campos obrigatórios, foco no erro, data passada recusada e WhatsApp com acentos/caracteres especiais corretamente codificados. Links interceptados durante testes: nenhuma mensagem foi enviada. Nenhuma reserva confirmada pelo site.
- Rolagem rápida, retorno ao topo e atualização posicionada no portfólio. Conteúdo permanece visível.
- Google Maps carregado com nome/endereço/marcador reais; iframe original preservado. Controle ativa/desativa interação. Falha simulada bloqueando solicitação do Google via BiDi: endereço, link independente e layout continuam acessíveis. Nenhuma biblioteca de JavaScript depende de serviço externo.
- DPR2: sem overflow ou variantes artificialmente ampliadas.

## Problemas corrigidos

1. Link do CTA final sem fechamento: aviso de confirmação virou texto irmão do botão.
2. Deslocamento de âncora aplicado duas vezes: removido scroll-margin duplicado.
3. Estrelas Unicode marcadas FAIL no lint: substituídas por símbolo SVG acessível.
4. Esteira herdava max-width1312px da lista estática e sobrepunha clones: modo animado usa largura intrínseca sem limite, margem zero e posição fracionária. Emenda final verificada.
5. Placeholder do nome tinha contraste4,19:1: passou a usar `--muted`,5,38:1.
6. Dimensões do lightbox: o índice passou a ler os atributos originais `width/height`, evitando herdar o tamanho renderizado da miniatura. Conferido em390/1440px, com navegação, Escape e retorno de foco; `V6_TESTES_LIGHTBOX_FINAL.json`.

Falhas dos auxiliares foram investigadas separadamente: sessão Firefox antiga aberta; conversão de objeto remoto sem `value`; cache V5 e navegação só por fragmento reaproveitando documento antigo; padrão de interceptação com curinga inválido. O transporte agora ignora cache e acrescenta identificador de navegação de teste. As falhas não foram tratadas como aprovação. O stack trace da conversão está preservado no JSON da etapa isolada.

Uma captura de agendamento com skip link sobreposto foi identificada como artefato de screenshot de documento capturado após rolagem. Posição do link foi conferida no navegador; capturas finais partem do topo. O skip link aparece ao receber foco e fica oculto em repouso.

## Capturas e revisão visual

`capturas/v6/antes/`: hero V5 em1440/390px. `capturas/v6/integrada/`: hero nas7 larguras, Home e componentes em390/768/1440px, três máscaras em andamento, agendamento, mapa carregado e mapa bloqueado. `capturas/v6/depois/`: evidência da etapa isolada e reduced motion/sem JS.

Capturas foram abertas para inspeção. A V6 troca a estrutura do hero, o catálogo lateral da V5 por faixas locais, o fundo ampliado do ambiente por registros controlados, o grid por índice/visualizador e o slogan final por convite funcional. Não foi feito outro redesign após essa direção.

O revisor independente Impeccable apontou o fechamento do CTA, que foi corrigido. O agente foi interrompido pelo limite de uso **antes de emitir o contrato final**; não existe aprovação independente completa. O motor automatizado Impeccable e o inspect Chromium do Taste não foram executados. Foram usadas suas instruções locais, lint do Taste e testes/inspeção no Firefox.

WARN restantes do lint: `padStart` formata datas reais; travessões pertencem a endereços/textos. Não são ícones emoji ou erros de implementação.

## Limitações

- Chromium não disponível; nenhum novo download tentado. Firefox é o navegador efetivamente validado.
- Toque foi exercitado via WebDriver, sem aparelho físico. Leitor de tela não foi testado com usuário; semântica, foco, teclado, clones e reduced motion foram verificados.
- Firefox não oferece `layout-shift` no PerformanceObserver desta instalação. Não há número CLS certificado; dimensões reservadas e capturas foram conferidas, sem salto inesperado observado. Expansões do catálogo são mudanças intencionais de layout.
- Fotos reais continuam pequenas; não houve recuperação de detalhe inexistente.
- Mapa e WhatsApp dependem dos respectivos serviços. O link Google foi preservado e conferido; a abertura do aplicativo externo de rotas no aparelho não foi testada. Nenhuma solicitação real foi enviada.
- Horários e total de avaliações são registros do projeto, não disponibilidade consultada ao vivo.

## Reproduzir, opcional

O site não depende destas ferramentas. Para os testes, Node22, Firefox instalado e servidor HTTP:

```sh
python3 -m http.server 8016 --bind 127.0.0.1
mkdir -p /tmp/srnavalha-v6-firefox
firefox --headless --no-remote --profile /tmp/srnavalha-v6-firefox --remote-debugging-port 9223 about:blank
node scripts/test-v6.mjs
node scripts/test-v6-final.mjs
```

Execute o servidor e o Firefox em terminais separados. Para os testes Marionette, use outro perfil temporário com `user_pref("marionette.port",2836);` no `user.js`, inicie Firefox com `--marionette --remote-allow-system-access`, e execute `test-v6-accessibility.mjs`/`test-v6-interactions.mjs`. Esses testes alteram preferências apenas desse perfil e as restauram. Não rodar dois clientes no mesmo protocolo/perfil simultaneamente. Nenhum npm necessário.
