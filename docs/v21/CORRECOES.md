# Sr. Navalha — correções de fluidez e celular (V21)

Base: `33f6d8210100a1bc87386ea631f2ea20463a824d`, branch `reconstruction/arte-do-ritual`.

A gravação enviada tem 61,7 s e todos os quadros estão pretos, exceto pelo cursor. O diagnóstico foi feito reproduzindo a página real da branch no Chromium, e não inferindo defeitos a partir desse vídeo.

| Antes | Depois | Motivo |
| --- | --- | --- |
| Quatro seletores `$()` tratados como listas geravam `forEach/slice is not a function`. O módulo parava antes de concluir a inicialização; títulos e imagens ficavam ocultos. | Uso correto de `$$()` para as coleções; inicialização e observers concluem sem essas exceções. | Elimina a causa das áreas vazias e da liberação abrupta pelo temporizador de segurança. |
| Entradas com atrasos acumulados e disparo depois de entrar na tela. | Antecipação de 36 px, stagger limitado e tempos menores, preservando movimentos distintos por seção. | Acompanha a leitura durante a rolagem. |
| WAAPI terminava em `transform:none` e opacidade 1 mesmo onde o CSS compunha outra posição ou transparência. | Captura do estado natural após retirar a classe de fila, no mesmo ciclo; animação termina no estado composto. | Evita saltos ao cancelar os efeitos concluídos e mantém as molduras e fotografias originais. |
| Decorações tinham máscaras de entrada que competiam com o recorte original. | Recorte original preservado; entrada por deslocamento, escala e opacidade. | Evita a troca brusca entre geometrias. |
| Filas podiam sobreviver à interrupção do movimento. | Conteúdo liberado ao reduzir movimento ou ocultar a aba, sem repetir a entrada de texto já exposto. | Recuperação previsível. |
| Serviços comprimidos em duas colunas estreitas no celular. | Controles em duas colunas, foto centralizada e informações em largura inteira. | Leitura e agendamento acessíveis. |
| Equipe com lista e foto pequenas lado a lado. | Faixa horizontal de profissionais e retrato maior abaixo, sem esconder nomes por reveal. | Seleção por toque com área fotográfica estável. |
| Fotos do álbum posicionadas a uma distância fixa em telas de larguras diferentes. | Altura e posição das folhas proporcionais à viewport; `touch-action` preserva o scroll vertical e permite swipe horizontal. | Evita sobreposição e cancelamento do gesto pelo navegador. |
| Hover podia deixar as avaliações pausadas após um toque. | Pausa por hover limitada a ponteiro fino; botão e pausa por foco mantidos. | Evita o hover persistente no celular. |
| Templates antigos não reproduziam o loader e as oito transições atuais. | Templates atualizados, loader incluído no montador e destino funcional para “Pular para o conteúdo”. | Regeneração preserva a versão entregue. |

## Verificação

`scripts/test-v21.cjs` verifica 320, 375, 390, 600, 768, 1024, 1366 e 1440 px. Resultados em `qa-chromium.json`. Testes usam Chromium headless; celular emulado e eventos de toque enviados por CDP. Não houve teste em aparelho físico, Safari ou Firefox nesta rodada.

Cobertura: loader em abertura e refresh, saída por teclado, leitura completa sem filas presas/overflow/imagens inválidas, serviços, equipe e teclado, álbum por toque e swipe, mural, lightbox/Escape, produtos e WhatsApp, menu, avaliações/pausa, movimento reduzido inicial e dinâmico, JavaScript desligado e módulo bloqueado. Requisições externas são bloqueadas no teste: não certifica o carregamento remoto do Google Maps nem a disponibilidade do AppBarber. Os links e módulos dessas integrações foram preservados.

As 69 comparações locais de conteúdo comercial em `scripts/validate-content.mjs` passam. Essa checagem compara o snapshot já existente, sem alegar nova consulta comercial. Sem redesenho global ou mudança nos dados comerciais. A estética material e fotográfica existente foi preservada; regras genéricas de lint de estilo sobre gradientes e molduras não foram aplicadas contra essa direção já aprovada.

## Execução

Abra `index.html` no Live Server. Não precisa instalar dependências nem gerar o HTML. Para remontagem opcional: `node scripts/render-site.mjs`. A montagem agora inclui loader e as oito passagens.

Teste opcional: instale Playwright no seu ambiente de desenvolvimento e execute `node scripts/test-v21.cjs`; `PLAYWRIGHT_PACKAGE`, `CHROME_PATH` e `QA_OUTPUT` permitem usar uma instalação e um navegador existentes. Python 3 fornece apenas o servidor local temporário do teste.
