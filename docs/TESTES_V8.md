# Testes V8

Executados em 17/10/2026 no site servido por HTTP local, sem build obrigatório. Não houve teste físico em aparelho; mobile é emulação de viewport/toque. Não se declara auditoria completa de tecnologia assistiva.

## Matriz executada

| Verificação | Resultado / evidência |
|---|---|
| Chromium, 320, 375, 390, 768, 1024, 1366 e 1440 px | Sem overflow horizontal; 42 serviços, 22 produtos e cinco profissionais; imagens carregadas. `V8_TESTES_CHROMIUM.json` |
| Firefox, mesmas sete larguras | Conteúdo, logo, fonte e layout; seleção Yan e filtro Barba; sem erro de console. `V8_TESTES_FIREFOX.json` |
| Serviços | Filtro e abertura do catálogo correto, preços/durações no HTML. |
| Equipe | Sequência rápida termina na última seleção, um retrato ativo; seleção por toque em Rafael. |
| Produtos | Filtro Barba, produto sem foto em texto, link WhatsApp correspondente; três Next rápidos chegam a 11/22, Pomada teia. |
| Lightbox | Abre, próxima, setas reais de teclado, Escape e retorno do foco; handler de swipe por pointer sintético. |
| Avaliações | Movimento automático, pausa e emenda do ciclo; clone oculto/inert. Nota de 5,0 e 467 consta no HTML com data. |
| Passagem editorial | Sete posições de scroll (0–960 px) verificadas sem interseção da foto com CTA, texto institucional ou título. `V8_TESTES_PASSAGEM.json` |
| Menu | Abre em mobile, fecha por Escape; fallback details sem JS. |
| Movimento reduzido | Alteração dinâmica cancela animações, remove clone e esconde pausa; retorno da preferência recria uma única cópia. |
| JavaScript desativado | Conteúdo completo em HTML, equipe em fallback, catálogos e links de agendamento presentes. Captura `sem-js.jpg`. |
| Falhas de imagens | Requisições abortadas, rótulos e CTA permanecem. `V8_TESTES_FALHAS_TECLADO.json` |
| Falha de mapa | Provedor bloqueado, endereço e link de rota continuam acessíveis. Mesmo relatório. |
| Agendamento | Destino AppBarber correto na Home e em agendar.html. Não se efetuou reserva/compra nem se testou fluxo autenticado. |
| Acessibilidade automática | Axe-core 4.10.3, tags WCAG2A/AA e WCAG2.1AA, 390/1440 px: zero violações detectadas. `V8_AXE.json` |
| Foco | Tab/skip link e retorno de foco do dialog; foco tabaco em marfim medido em 5,14:1. `V8_TESTES_CORRECOES.json` |
| Console | Sem exceções de execução Chromium; sem entradas de erro Firefox na matriz final. Falhas de rede simuladas foram intencionais. |

O carregamento do mapa remoto real não é um resultado garantido: a validação cobre carregamento sob demanda e fallback por endereço/rota, sem depender da disponibilidade do Google. WhatsApp e AppBarber têm destinos reais conferidos, sem mensagem enviada ou ação autenticada executada.

## Inspeção dos plugins

Taste draw, lint e inspect executados. `V8_TASTE_LINT.txt`: zero FAIL e um aviso de travessões do conteúdo/atribuições. `V8_TASTE_INSPECT.json` foi a rodada inicial; `V8_TASTE_INSPECT_FINAL.json` registra a confirmação após correções. Capturas e medição reais em `.taste-skill/inspect-v8*`.

O gate estilístico do Taste **não ficou integralmente verde**. Permanecem classificações automáticas que conflitam com requisitos ou com a composição adotada: estrelas tratadas como emoji, linhas de catálogo tabular, cards de depoimentos pedidos pelo usuário, textos de interface detectados como eyebrows, tipografia de duas famílias, marfim solicitado, trilhos horizontais solicitados, falta de vídeo oficial e contagem de apenas sete elementos durante o percurso automático. Não se adicionou movimento sem função para satisfazer contagem. O detector também marcou texto de navegação coberto em sua varredura; capturas e revisão independente não confirmaram um defeito persistente de navegação. A leitura manual e os testes funcionais têm seu escopo registrado, sem converter esses achados em “aprovado”.

Foram corrigidos problemas reais encontrados: proporção de fotos com height HTML, título móvel deslocado além da viewport, texto de produto sobreposto à fotografia, carregamento dos retratos ocultos, acumulação fracionária da esteira, caminho da foto fora do texto, contraste do foco e navegação rápida de produtos.

Revisão independente conforme o Impeccable: três apontamentos materiais, todos corrigidos. Retorno final **Ship no escopo das três correções**, não uma certificação de ausência de qualquer problema. Sistema documentado por agente independente em DESIGN.md, PRODUCT.md e sidecar.

## Capturas

`capturas/v8/`: antes-desktop/mobile; depois em sete larguras; versões Firefox; hero/equipe/produtos; equipe em 120 ms, produtos em 100 ms e passagem em andamento; menu mobile; avaliações; movimento reduzido; sem JS; falhas de imagens. `final-390.png` e `final-1440.png` são a composição completa após correções principais. Capturas iniciais ficam como evidência histórica; fotos lazy não tinham sido forçadas a carregar em algumas primeiras capturas, corrigido no procedimento final.

Scripts reproduzíveis em `scripts/test-v8.mjs`, `test-v8-firefox.mjs`, `check-v8-final.py`, `check-v8-failures.py` e `check-v8-a11y.py`. Chromium utiliza CHROME_PATH; Firefox usa WebDriver BiDi local. Playwright e Axe são ferramentas de teste externas, não dependências de produção.

## Limites honestos

Sem teste manual com leitor de tela, Safari/iOS ou dispositivo físico; swipe foi exercitado por eventos sintéticos. Não foram confirmados direitos de terceiros sobre fotos do Google, por isso não foram importadas. Instagram bloqueou acesso. Três depoimentos mantêm a evidência anterior de 15/10. A qualidade do interior depende de original melhor do proprietário. O teste não mede vendas, ranking ou performance em hardware modesto real.
