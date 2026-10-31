# Sr. Navalha — Corte de Luz

Reconstrução localizada do hero, 31/10/2026. Branch `reconstruction/arte-do-ritual`.

## Diagnóstico verificado no Chromium

O HEAD local e remoto eram `1533be0e25c63f0deea98c7f65598108a77d3931`; a árvore estava limpa.
Em 900×550, `getComputedStyle` e os retângulos reais mostraram hero com 710 px, CTA entre y=552 e 626 e etiqueta com `writing-mode:vertical-rl`. A cascata combinava alturas mínimas, linhas de grid rígidas, paddings V27/V29 e proprietários antigos de visibilidade. Trocar apenas `position` e `transform` da etiqueta não removia o modo vertical herdado.

## Direção e implementação

A assinatura da Sr. Navalha torna-se um convite editorial sobre a fotografia do próprio estabelecimento. Marca, postes, localização e inscrição formam uma composição simétrica; título e conversão compartilham o eixo esquerdo. Preto, branco e aço, Sora e Manrope locais, logo e imagens oficiais preservados.

- `hero-cinema.css` concentra a geometria: altura útil menos cabeçalho, grid sem linha mínima rígida, escala limitada por largura **e** altura, composição própria para mobile e janelas curtas. Não contém `!important`.
- `hero.css` conserva as regras de A Casa que já compartilhavam o arquivo; regras antigas do hero foram retiradas das folhas históricas sem alterar as declarações das outras seções. Comparação AST confirmou essa preservação em 12 folhas.
- V27 e V29 foram removidos da carga e do repositório. `hero-atelier.css` histórico deixou de ser importado. Não foi criada outra camada de correção.
- `GRAVATÁ / PE` usa fluxo normal, centralização e `writing-mode:horizontal-tb` explícito. A inscrição usa três grupos e dois divisores curtos, sem moldura, losangos ou cápsulas.
- CTA sólido claro com seta circular, foco visível, hover de 2 px e feedback de pressão. Destino `agendar.html` mantido.
- O flutuante começa com `hidden`, acompanha o hero/rodapé por IntersectionObserver em todos os tamanhos, considera a margem das âncoras e entra em 200 ms. A ação escondida fica fora do teclado; não há listener de scroll para esse controle.

## Movimento e recuperação

`opening.js` continua sendo o único dono do FLIP da logo e da tesoura. Os cálculos usam o retângulo real da logo estática, com o mesmo viewBox. Progresso inicial: 1000 ms; corte: 1020/1120 ms; separação final: 420 ms. CSS do progresso e contador usam os mesmos tempos.

`hero-sign.js` é o único coordenador da entrada do hero. Começa em `openingcutmidpoint`, enquanto a tesoura ainda abre a cena. Duas superfícies se afastam, os postes estabilizam com deslocamento curto, inscrições entram em grupos e a conversão acompanha o fim do título, sem quique. A logo não recebe uma segunda animação.

O modo `lightcut` foi incorporado ao motor existente `text-motion.js`: seis janelas estáticas preservam as métricas naturais das duas linhas; placas de texto se movem em direções opostas com rotação Y pequena. Somente `transform` e `opacity` são animados. Textos originais continuam acessíveis; cópias visuais têm `aria-hidden`. Não há fragmentação permanente ou leitura de layout por frame.

Input, foco, rolagem, resize, pagehide e mudança de movimento liberam o estado final, cancelam efeitos e removem as máscaras. Resize também invalida o FLIP da abertura. Sem JS e com movimento reduzido, o conteúdo parte visível. Cilindros permanecem CSS, com rotação pausada fora da viewport; nenhum loop JS foi adicionado ao hero.

## Referências consultadas

Pesquisa feita antes da implementação por leitura das páginas, sem copiar código, imagens ou design de terceiros:

1. [CRISP / Casa Media](https://casamedia.com/projects/crisp-website/) — integração entre identidade existente, fotografia, navegação responsiva e agendamento orientou a composição e a prioridade da conversão.
2. [Codrops — SplitText / MorphSVG](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/) — máscaras, tempos proporcionais ao número de unidades e limpeza do efeito anterior. Aplicação com seis grupos, sem adicionar GSAP.
3. [Codrops — Sliced Text](https://tympanus.net/codrops/2023/12/05/on-scroll-sliced-text-animation/) — fragmentos convergindo à geometria natural e janelas com overflow. Inspirou as placas opostas, sem repetir o efeito integral.
4. [GSAP — matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/) — estados responsivos e reversão das animações ao mudar condições. Implementado com APIs nativas e cancelamento coordenado.
5. [Motion — animate](https://motion.dev/docs/animate) — sequências sobrepostas e controle das animações nativas. Inspirou atrasos curtos e objetos com chegada firme, sem dependência adicional.
6. [web.dev — animações eficientes](https://web.dev/articles/animations-guide) — priorização de compositor, evitar layout/paint por frame e não promover camadas indiscriminadamente.

Também consultados: [Awwwards](https://www.awwwards.com/websites/), [Godly, redirecionado para Recent](https://www.godly.website/), [SiteInspire](https://www.siteinspire.com/) e [React Bits](https://reactbits.dev/). Serviram como panorama, sem importar componentes ou bibliotecas.

Skills originais Taste Frontend, Impeccable UI e Emil Design Engineering foram lidas. Taste forneceu a direção “page is the object”; o convite e o ambiente real foram mantidos dentro do escopo do hero. A coreografia solicitada substitui a sugestão de história fixada por várias telas. O launcher Impeccable falhou por permissão de execução; PRODUCT.md, DESIGN.md e suas referências foram lidos diretamente. Revisão visual independente: **ship**, sem bloqueios, após examinar as oito capturas.

O inspector Taste foi executado no site inteiro. Seus 17 apontamentos de estilo não equivalem a aprovação: incluem componentes e títulos fora do escopo, além de convenções pedidas explicitamente aqui (frase superior, inscrições pequenas, instrumentos metálicos e profundidade do CTA). O contador de palavras também capturou cópias visuais temporárias durante a entrada; elas são ocultas da árvore acessível e removidas ao finalizar. Não foram alteradas outras seções para satisfazer essas convenções.

## Evidências e testes

`hero-results.json`: 62/62 verificações no Chromium real. Capturas finais nas oito dimensões solicitadas, mais o antes em 900×550 e dois momentos intermediários. Em 900×550, o CTA final termina em y≈511, dentro da primeira tela.

Cobertura: simetria, retângulos de texto sem cortes, CTA na primeira tela, ausência de scroll horizontal, localização horizontal, rotação dos cilindros, ida/volta do flutuante, restauração de texto/métricas, Axe WCAG A/AA do hero, foco e Enter, navegação para agenda e histórico, interrupções por wheel/teclado/resize/reduce/pagehide, modo reduzido e ausência de JS. Nenhum erro JS nessa suíte.

400/400 checks de navegador nas sete suítes registradas em `verification.json`: hero 62, movimento 109, tesoura 39, navegação 66, agendamento 101, estados da agenda 12 e resiliência 11. O soak percorreu mais de 150 segundos, com listeners estáveis após aquecimento e DOM oscilando apenas entre 3452 e 3454 nós. O teste de mídia fora de tela passou a aceitar a ausência do antigo vídeo auxiliar, já inexistente no hero fotográfico. As asserções antigas foram atualizadas somente onde exigiam início após `openingend`, cortina única, glifos individuais ou os arquivos V27 removidos. O teste da tesoura captura a geometria no evento de ponto médio para não perder a janela mais curta durante screenshots.

As verificações automatizadas usam Chromium Linux headless. Não substituem avaliação em aparelhos físicos ou garantem FPS em GPUs específicas. Nenhuma métrica de FPS foi inferida. O perfil existente com CPU 4× foi executado como smoke de funcionalidade; não se reivindica ganho comparativo de desempenho.
