# Testes · V9

Executados em 19/10/2026 via HTTP local (`127.0.0.1:8019`), sem build obrigatório. Chromium 1243 instalado no cache de ferramentas e Firefox instalado no sistema, por CDP/BiDi. Mobile significa emulação de viewport/toque, não aparelho físico.

## Auditoria prévia V8

Antes de substituir CSS/JS, a V8 foi aberta em 1440 e 390 px e medida em cinco posições de scroll. `fontes-v9/auditoria-v8.json` registra estados de transformação e animações. Nenhuma exceção de inicialização apareceu nesse percurso. A passagem desktop realmente muda de matriz; no mobile a passagem é desligada por condição `innerWidth<=850`. Não se atribui toda a falta de impacto a erro de inicialização.

O CSS antigo tinha entradas CSS, view timeline na imagem e movimento JS no wrapper. Não era uma colisão literal do mesmo transform em todas as camadas, mas uma composição fragmentada e dependente do suporte do navegador. A V9 remove essa arquitetura concorrente. O tick antigo das avaliações continuava solicitando rAF mesmo quando não fazia trabalho útil; o novo scheduler desregistra o movimento fora da viewport.

## Matriz executada

| Verificação | Evidência / resultado |
|---|---|
| Chromium: 320, 375, 390, 768, 1024, 1366, 1440 px | Catálogos completos, cinco profissionais, imagens carregadas, abertura removida e sem overflow horizontal. `V9_TESTES_CHROMIUM.json` |
| Firefox: mesmas sete larguras | Layout/conteúdo/motor, seleção Yan, filtro Barba, produto, dialog e Escape. Sem exceções JavaScript. `V9_TESTES_FIREFOX.json` |
| Abertura | Capturas inicial, logo, painéis, final e hero. Timeline WAAPI real; timeout, redução de movimento e remoção verificados. `capturas/v9/abertura-*` |
| Hero | Progresso muda com wheel real, reversível; retorno e salto rápido chegam a estado estável. Camadas ocultas ficam inertes. |
| Continuidade | Amostras 0%, 25%, 50%, 65%, 80%, 100%, retorno 50%, 0% em 390/768/1440. Retângulos da foto/apresentação e screenshots intermediários; sem interseção da apresentação legível com o quadro nas amostras. `V9_MOTION_MEDICOES.json` |
| Serviços | Filtro, details, Barboterapia com foto correta; Corte sem foto específica apresenta fallback e nenhuma imagem residual. |
| Equipe | Seleções rápidas terminam em Kauã; um retrato ativo. Retratos reais e controles por clique/toque/foco. |
| Produtos | Fallback sem foto; sequência rápida; índice, nome e WhatsApp correspondentes. |
| Lightbox | Expansão espacial, próxima por teclado, swipe sintético, Escape e retorno do foco à miniatura. |
| Avaliações | Movimento fracionário real, pausa e clone oculto/inert. Loop removido fora da tela; contagem de frames fica estável em repouso. |
| Menu | Details mobile, Escape, foco no acionador e sequência Tab. |
| Redução de movimento | Emulação inicial e alteração dinâmica; sem curtain, sem clone, apresentação em fluxo. |
| Sem JavaScript | HTML com catálogos, equipe alternativa, links e apresentação. `sem-js-final.jpg` força apenas o carregamento das imagens para a captura, sem habilitar módulos do site. |
| Falhas externas | Imagens bloqueadas: CTA e identidade textual preservados. Mapa bloqueado: endereço e rota permanecem disponíveis. `V9_ACESSIBILIDADE_FALHAS.json` |
| Agenda | Link oficial em home e agendar.html; não foi efetuada reserva ou ação autenticada. |
| Axe-core 4.10.3 | 390 e 1440 px, tags WCAG2A/AA e WCAG2.1AA: zero violações detectadas; 25 regras aprovadas por execução. |
| Performance | Sem loop ocioso nas amostras; métricas locais de Task/Script/Layout/RecalcStyle e percurso wheel em `V9_CONFIRMACAO_FINAL.json`. Não equivale a benchmark em aparelho modesto ou pontuação Lighthouse. |
| Gerador | V9 é a fonte canônica; alias V8 gera os mesmos dois HTML. Backup original preservado. |

## Revisão independente

O papel de finish-reviewer do Impeccable foi executado por agente separado, em leitura. Duas correções materiais: controles invisíveis focáveis e foto antiga sob legenda de outro serviço. Após correção, o revisor confirmou ambos no Chromium e emitiu `ship` restrito aos dois estados. Não é certificação de todos os requisitos possíveis.

## Taste Frontend

Draw, lint e inspect foram executados com os arquivos originais do plugin. O relatório inicial e o final ficam em `V9_TASTE_INSPECT*.txt`, o lint em `V9_TASTE_LINT.txt`. **Não há aprovação integral desse gate estilístico.**

- Filete de abertura e indicador da navegação: solicitados pelo brief / estado funcional.
- Linhas dos catálogos: separação de dados reais de serviços/preços, não ornamentos genéricos.
- Estrelas e comentários repetidos: reputação e esteira explicitamente solicitadas.
- Marfim e combinação tipográfica: decisões explícitas do usuário.
- Falta de vídeo: não há clipe oficial disponível; nenhum vídeo externo se passa pela casa.
- “Eyebrows”: o detector também relaciona textos e links do catálogo a títulos de outra seção. Não foram removidos preços/descrições para silenciar esses resultados.
- “Covered text” em menu fechado mobile: o detector inclui os links de navegação do details fechado. Testes de menu aberto/fechado e screenshots não demonstraram uma navegação persistentemente coberta.
- “Pinned over picture”: a progressão foi recalibrada e medida geometricamente; o texto institucional visível ocupa região separada do retrato nas amostras finais.
- Sombra de legenda: removida e substituída por contraste local. Número de tamanhos fluidos continua sendo ressalva estilística.

## Limites

Sem teste físico, leitor de tela manual, Safari/iOS, rede móvel real ou hardware de baixo desempenho. Swipe foi exercitado por PointerEvents sintéticos. Não se garante disponibilidade futura de AppBarber/Google/WhatsApp. Nota 5,0 foi reencontrada; o total de 467 não foi reconfirmado e conserva a data anterior. A consulta Instagram foi bloqueada. A nitidez do acervo antigo continua limitada pelos originais.

A V9 foi comparada à V8 por capturas e comportamento real. Não foi realizado teste A/B com visitantes nem avaliação oficial Awwwards.

## Leitura das capturas

Capturas integrais `depois-*` / `final-pagina-*` preservam as tentativas originais, mas não são prova suficiente da pinagem: a pista sticky deixa espaço no documento e o Chromium pode omitir camadas fotográficas compostas fora da viewport no captureBeyondViewport. Para avaliar a experiência, use os quadros reais de `storyboard-1440/` e `storyboard-390/`, as capturas de cada seção e `transicao-*`. O storyboard percorre as regiões com imagens decodificadas e captura cada viewport real, sem alterar a composição do site para fabricar uma página longa. `V9_STORYBOARD.json` registra as fontes e o carregamento.

Pacote: `entrega/srnavalha-v9-completo.zip`, com páginas, recursos locais, módulos, geradores, manifesto necessário ao gerador, documentação, capturas e backup prévio V9. Os originais fotográficos completos continuam preservados no repositório; o ZIP usa os derivados necessários à visualização.
