# Validação V17 — 22/10/2026

## Resultado executado

- Chromium: **46/46** verificações em `testes-chromium.json`.
- Firefox: **24/24** em `testes-firefox.json`, via WebDriver BiDi do Firefox instalado.
- Larguras: **320, 375, 390, 768, 1024, 1366 e 1440 px**. Nenhum overflow horizontal no percurso completo. Após o refinamento visual, as sete larguras foram verificadas novamente (`post-refinement.json`).
- Axe: nenhum achado nos conjuntos WCAG 2 A/AA e 2.1 AA, incluindo nova passagem final (`axe.json`, `final-axe.json`). É uma auditoria automatizada; não equivale a certificação ou teste manual com leitor de tela.
- Console: nenhum erro de JavaScript nas suítes. Recursos externos, como o mapa Google, continuam sujeitos ao provedor.

## Fluxos

Abertura termina, é interrompida por interação, não repete na mesma sessão e é dispensada em âncora profunda. Hero, fotografias, títulos e catálogos permanecem visíveis. Espelho sincroniza serviço, imagem e informação; filtros mantêm categorias reais. Equipe responde a hover, clique, foco, setas e seleções rápidas — a última solicitação vence.

Álbum transforma folhas em parede com FLIP, muda folha/legenda e aceita teclado e toque. Galeria abre o diálogo, navega com setas, fecha com Escape e devolve foco. A foto de 410px é limitada a 410px na ampliação (`motion-evidence.json`); o mesmo limite por origem vale para as demais. Produto muda foto e informação e preserva consulta por WhatsApp.

Esteira desliza continuamente para a esquerda e pausa pelo controle. Corte do salão foi amostrado em quatro posições, inclusive retorno à posição intermediária. Rolagem rápida e retorno às seções não prenderam placas ou imagens.

Movimento reduzido mantém todos os controles e usa estados estáticos. Sem JavaScript, foram conferidos 42 serviços, 22 produtos, seis links de fotografia, agendamento, expansão nativa e ausência de overflow. Com o módulo principal bloqueado, o conteúdo continua legível. Links de equipe/produtos só recebem papel de botão após a ativação do JavaScript (`progressive-enhancement.json`); antes disso são links nativos.

O teste de toque usa emulação de dispositivo e `tap` real do Playwright. O teste de swipe despacha uma sequência de PointerEvents de toque; não é ensaio em telefone físico.

## Evidência de movimento

`motion-evidence.json` e `capturas/v17/motion/` registram os movimentos reais sem seek de timeline. Foram usados screenshots rápidos pelo CDP, pois a captura normal do Playwright pode terminar depois de uma transição breve.

| Movimento | Tempos reais amostrados | Duração |
|---|---:|---:|
| Abertura | ~217, 467, 967 ms | 1.330 ms |
| Espelho | ~50, 533 ms | 680 ms |
| Equipe | 0, ~450 ms | 680 ms |
| Álbum | ~233 ms | 780 ms |
| Produto | ~33, 433 ms | 460 ms |
| Lightbox | ~33 ms | 650 ms |

Há arquivos de início, meio e fim da abertura, Espelho, Equipe, Álbum e produtos. O salão tem três quadros de progresso; Firefox possui intermediários próprios. Estados finais e intermediários não foram inferidos apenas do CSS.

## Conteúdo preservado

Comparação DOM contra o commit `554e5e2`: igualdade dos 42 serviços, planos, 22 produtos, cinco profissionais, quatro depoimentos com fontes, mapa, destino do agendamento e 35 imagens do conteúdo principal (`content-integrity.json`). Esta rodada preserva os snapshots comerciais existentes; não afirma nova confirmação de preços ou disponibilidade.

## Performance observada

Comparação sequencial no mesmo Chromium headless, 1440 × 960, 110 passos nativos de rolagem por requestAnimationFrame (`performance-comparison.json`):

| Medida | V16 | V17 |
|---|---:|---:|
| Intervalo mediano de frames | 24,4 ms | 17,3 ms |
| Percentil 95 | 42,7 ms | 31,6 ms |
| Frames acima de 33,4 ms | 25 / 110 | 3 / 110 |
| CLS observado | 0,00068 | 0,00016 |
| Recursos locais decodificados | 1,22 MB | 1,34 MB |

Uma execução por versão, sem simulação de CPU/rede mobile: estes valores descrevem a amostra e não garantem 60 fps em qualquer aparelho. A V17 registrou tarefas longas de 140 e 73 ms durante carregamento/execução. A fonte Sora agora é local, por isso a contagem local inclui um recurso antes externo.

O ensaio de reorganizações repetidas (`performance.json`) terminou com uma imagem em cada palco e apenas o trilho decorativo visível em execução. Heap amostrado em ~2,6 MB. A primeira amostra de scroll teve maior variação enquanto outros navegadores estavam ativos; foi preservada, e não apresentada como benchmark final. Não foi observado acúmulo de fotografias; uma medição isolada de heap não prova ausência absoluta de vazamentos.

## Plugins e revisão

Taste: direção registrada, lint do runtime e inspetor real em 1440/768/390. O inspetor precisou de `CHROME_PATH` explícito. Relatórios brutos em `taste-lint.json`, `taste-inspect-run.json` e `taste-inspect/`.

Os relatórios não são “zero alertas”: filetes/molduras, marfim, índices de navegação e sombras entre folhas são escolhas exigidas pelo universo deste projeto. O detector também classifica links de catálogo como eyebrows e encontra links do menu mobile fechado como texto coberto. Títulos editoriais podem ocupar três linhas sem corte. A leitura foi verificada nas capturas e por Axe; pequenos textos funcionais do hero, equipe e rodapé foram ampliados durante o refinamento.

Impeccable: contexto e detector executados. O detector estático informou h1/h2 de 16px por não resolver os imports CSS — as capturas e os valores computados demonstram a escala real. O alerta de Sora ausente na documentação antiga foi corrigido em DESIGN.md e no sidecar. O detector não foi reexecutado para esconder o registro original.

Emil: princípios aplicados à resposta imediata, cancelamento, fotografia anterior retida durante a máscara, última seleção válida, teclado/toque e timing coordenado. Não se utilizou um “motor automatizado Emil” inexistente.

A revisão independente e sua pontuação final estão em `REVISAO_FINAL.md`. A documentação foi conferida por um segundo agente, conforme o fluxo do Impeccable. Capturas antes/depois: `capturas/v17/comparacao.html`.

## Limites

Sem ensaio em Safari/iOS, aparelhos físicos ou leitor de tela manual. O teste de módulo bloqueado cobre o fallback estático; bloqueios arbitrários de arquivos isolados não foram exaustivamente simulados. As fontes e o código principal são locais, e mapa/Instagram/agendamento permanecem serviços externos reais.

## Encerramento da revisão

A revisão independente encontrou dois ajustes: PRODUCT obsoleto e eyebrow redundante no rodapé. Ambos foram corrigidos. As mesmas capturas do rodapé e os fullpages foram substituídos pelo resultado final; Axe permaneceu sem achados. O revisor pontuou os dois ajustes como resolvidos e retornou `disposition: ship` nesse escopo. Documento: `REVISAO_FINAL.md`.

O HTML também foi remontado pelo gerador e manteve exatamente o mesmo SHA-256, confirmando que os parciais canônicos reproduzem o arquivo entregue. O ZIP final é verificado após extração; relatório separado em `entrega/v17-validation.json`.
