# Esteira infinita de avaliações — atualização da V4

## Escopo

Alteração restrita à seção de avaliações e sua documentação. Preservados os quatro registros em `js/reviews-data.js`, textos, autores, notas e fontes de `AVALIACOES_GOOGLE.md`. Não houve nova coleta ou atualização da média/quantidade; permanecem explicitamente datadas de 15/10/2026. A primeira avaliação conserva o trecho verificado da V4, sem novos cortes ou resumos.

Continua estático: abra `index.html` por **Open with Live Server**. Sem biblioteca adicional, Node, npm, build ou API.

## Implementação

- Esteira única com Web Animations API, `transform: translate3d`, easing **linear** e repetição infinita.
- Velocidade em `css/editorial.css`: **`--reviews-speed:30`**, em pixels por segundo. Ajustar para 25–35 altera a duração calculada no próximo carregamento/redimensionamento.
- Duração = largura real do grupo original / velocidade × 1000. A largura inclui o espaço após o último card; o primeiro card do grupo seguinte começa exatamente no passo esperado. Não existe pausa na emenda.
- Quatro artigos originais em um grupo. Cópias somente visuais são criadas na inicialização ou mudança de largura/preferência. A quantidade cobre a viewport mais um período de deslocamento. Não há alteração dos registros nem recriação do DOM durante os frames.
- Grupos duplicados usam `aria-hidden="true"`, `inert` e links com `tabindex="-1"`. Identificadores de artigo são removidos das cópias. Os quatro links originais permanecem acessíveis.
- Cards de largura consistente por breakpoint, mesma altura por flex stretch e conteúdo completo, sem line-clamp. Gaps de 22 px desktop e 18 px mobile. Máscara de 12 px nas extremidades somente enquanto há movimento.
- Removidos anterior/próximo, paginação, contador, progresso e handlers antigos de troca/arraste. Nenhum controle simula navegação entre comentários.

## Pausa e leitura

O compositor mantém o deslocamento. Somente durante aceleração/desaceleração há um pequeno requestAnimationFrame de **650 ms**, que ajusta `playbackRate` com smoothstep. O movimento estabilizado não executa um loop JS por frame.

Mouse na janela de cards desacelera até parar; sair retoma gradualmente, se não houver pausa explícita ou foco. O botão **Pausar/Reproduzir**, com `aria-pressed`, controla a pausa explícita. O foco dentro dos comentários pausa imediatamente e mantém os quatro links originais alcançáveis. O botão de reprodução fica fora dessa região de foco para poder reativar o movimento por teclado.

Toque pausa e mantém a pausa até Reproduzir; a janela passa a aceitar rolagem horizontal nativa para ler e enquadrar qualquer comentário. O gesto vertical da página não é bloqueado.

Ao parar, a fase do transform é transferida para `scrollLeft` no mesmo quadro. Ao reproduzir, o scroll manual é transferido de volta à fase da animação, módulo a largura do grupo. Assim a imagem permanece contínua durante a troca de propriedade; não há dois sistemas escrevendo na mesma posição.

`prefers-reduced-motion: reduce`, inclusive alterado em execução, cancela o autoplay, remove clones e oferece somente os quatro artigos originais com scroll nativo. Sem JavaScript, essa mesma lista horizontal já existe no HTML/CSS. Controles de pausa não aparecem nesses modos. Ao sair da viewport ou ocultar a aba, o movimento é suspenso para economizar recursos.

## Referências

[ReactBits](https://reactbits.dev/) e [Awwwards](https://www.awwwards.com/) consultados como direção visual de movimento contínuo/editorial. Nenhum componente React ou código externo foi copiado. A esteira é própria, em HTML/CSS/JS, com os materiais já existentes.

## Arquivos

Runtime: `index.html`, `css/editorial.css`, `js/reviews.js`.

Documentação: atualização pontual de `README.md` e `docs/AVALIACOES_GOOGLE.md`; este documento, relatórios JSON e capturas em `capturas/avaliacoes-infinito/`.

`js/reviews-data.js`, o utilitário `scripts/sync-reviews.py`, demais scripts/CSS e `agendar.html` não foram alterados. Os marcadores de geração do HTML continuam dentro do grupo original e compatíveis com o utilitário. Nenhum commit ou push.

## Testes

Resultados anexados após execução em Chromium/Playwright via HTTP estático na porta 4173. As observações dos ciclos usam tempo real à velocidade normal: não se acelera a animação nem se força sua fase. Emulação de toque não equivale a teste em aparelhos físicos; não foram ensaiados Safari/Firefox.

### Observação dos dois ciclos completos

| Viewport | Período (px) | Duração por ciclo (s) | Tempo observado (s) | Emendas observadas | Lacunas |
| --- | --- | --- | --- | --- | --- |
| 320 | 1032 | 34.4 | 68.37 | 2 | 0 |
| 375 | 1252 | 41.733 | 83.34 | 2 | 0 |
| 768 | 1128 | 37.6 | 74.8 | 2 | 0 |
| 1366 | 1608 | 53.6 | 107.39 | 2 | 0 |
| 1440 | 1608 | 53.6 | 107.36 | 2 | 0 |

Direção direita → esquerda e velocidade de 30 px/s confirmadas pela fase da animação. O resíduo máximo medido na emenda foi inferior a 0,01 px em todos os tamanhos. Esses valores medem continuidade geométrica, não uma garantia de FPS. As alturas dos cards permanecem iguais durante cada ciclo.

### Interações e mudança de preferência durante a sessão

A troca de `prefers-reduced-motion` foi acionada com a página já aberta em cada uma das cinco larguras. Em todos os casos, a preferência `reduce` removeu a animação e os clones, escondeu o controle e manteve a rolagem manual dos quatro comentários. Restaurar `no-preference` recriou a esteira e retomou o autoplay. Também foram aprovados botão e estabilidade da pausa, retomada após rolagem manual, pausa ao focar e acesso visual aos quatro links originais.

A interação por toque foi exercitada em viewport mobile emulada: o toque pausa e o gesto horizontal desloca a lista manualmente. JavaScript desativado e preferência reduzida inicial exibiram apenas os quatro artigos originais, sem clones e sem overflow da página. A passagem da fase animada para pausa manual teve resíduo máximo de **0,003 px** e altura constante. Não houve erros no console nos cinco tamanhos.

Os dados agregados estão em `docs/AVALIACOES_INFINITO_TESTES.json`, com observações dos ciclos em `docs/AVALIACOES_INFINITO_CICLOS.json`, pausa em `docs/AVALIACOES_INFINITO_PAUSA.json` e toque/sem JavaScript em `docs/AVALIACOES_INFINITO_TOQUE.json`. Capturas de viewport estão em `capturas/avaliacoes-infinito/`.
