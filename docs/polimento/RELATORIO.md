# Polimento visual e motion — Sr. Navalha

Intervenção local sobre `15e0a87`, na branch existente `reconstruction/arte-do-ritual`. O Git estava limpo no início. **Nenhum commit ou push nesta rodada.**

## O que mudou

A arquitetura, a ordem das seções, os grids, a tipografia, a marca e os destinos comerciais foram preservados. Não há novo framework, biblioteca, backend, npm ou etapa de build necessária para abrir o site. `index.html` permanece pronto para Live Server; os três parciais alterados foram sincronizados pelo montador já existente.

**Decoração:** navalha e pente reconhecíveis substituem a gravura do hero; os cantos do Espelho Vivo recebem geometria mais limpa e acabamento consistente. O pente isolado de A Casa dá lugar a uma pequena fotografia oficial da bancada, com recorte em CSS, moldura e sombra suave. Os outros ornamentos coerentes foram mantidos.

**Fundos:** campos claros ganham luz difusa e fibra fina; Casa, Equipe, Avaliações e Rodapé recebem variações discretas de pigmento e vinheta. Serviços, Álbum, Produtos e Localização possuem nuances próprias da mesma paleta. A textura tem tile de 192px, baixa opacidade, não recebe animação nem filtros de ruído em tempo real. A primeira inspeção mostrou textura grande demais: a escala foi corrigida antes das capturas finais. O topo do hero se encontra com a cor do cabeçalho sem uma faixa abrupta.

**Motion:** uma curva suave compartilhada coordena títulos, apoio, fotos, CTAs e gravuras. O stagger respeita os irmãos de cada grupo, com atraso máximo de 260ms. O observador antecipa a entrada em 48px para iniciar a preparação antes de o elemento estar visível, em vez de primeiro mostrar e depois recortar o conteúdo. O Álbum ganha entrada leve por folha, preservando a rotação e o FLIP existentes. Os links do menu entram em sequência; fechar o menu cancela sua coreografia. O mapa usa uma entrada discreta, sem perspectiva ou recorte que atrapalhe o iframe.

**Interações:** o preenchimento direcional dos CTAs agora fica perceptível em vez de ser encoberto pela troca imediata de fundo. Sublinhados respondem também ao foco, setas do álbum têm hover/foco contrastantes e miniaturas dos produtos ganham uma resposta breve. Os hovers do cabeçalho deixam de alterar padding e espaçamento das letras.

## Engenharia — antes e depois

| Antes | Depois | Motivo |
|---|---|---|
| Abertura nominal de 1,33s | 1,08s; timeout de 1,65s e fallback CSS de 1,8s | Entrada mais curta, com passagem contínua ao hero |
| Visita repetida sem entrada no hero | Coreografia compacta sem repetir a placa | Mantém acabamento sem impor outro loader |
| Interação dispensava apenas a placa | Interação cancela também a chegada do hero | Resposta imediata e estado legível |
| Elementos de apoio geralmente simultâneos | Delays por grupo e stagger limitado | Hierarquia perceptível sem formar uma fila longa |
| Easing muito rápido no começo da troca | Curva `.22,.68,.2,1`; máscara em 620ms, produto em 440ms | Movimento distribuído com suavidade, mantendo resposta rápida |
| `left` da linha de corte atualizado no scroll | Deslocamento por transform | Evita animar posição de layout |
| Hover alterava largura do cabeçalho | Cor e sublinhado com geometria fixa | Evita deslocar a navegação |

## Assets

Três novos vetores em `assets/decor/polimento/`: `navalha-pente.svg`, `cantos-espelho.svg` e `trama-papel.svg`. Todos originais e locais. Nenhuma fotografia foi gerada, substituída por imagem genérica ou alterada por IA; o novo detalhe reutiliza uma fotografia oficial já presente. Originais e licenças existentes foram preservados.

## Arquivos alterados

- `css/ritual/header.css`: hover e foco sem alteração geométrica.
- `css/ritual/motion.css`: timing, respostas de botões, links e controles; failsafe mais curto.
- `css/ritual/ornaments.css`: fundos, textura, acabamento e detalhe fotográfico.
- `css/ritual/tokens.css`: curva `--ease-soft`.
- `js/ritual/core.js`: curva compartilhada e refinamento da troca fotográfica.
- `js/ritual/motion.js`: entradas por função, stagger por irmãos, menu e corte por transform.
- `js/ritual/opening.js`: abertura curta, hero compacto e interrupção coordenada.
- `templates/v17/inicio.html`, `casa.html`, `servicos.html`: substituições ornamentais pontuais.
- `index.html`: HTML entregue sincronizado com esses parciais.
- `assets/decor/polimento/`: três SVGs e registro de origem.
- `capturas/polimento/` e `docs/polimento/`: evidências desta rodada, sem sobrescrever os registros V17.

## Diretrizes utilizadas

Foram lidas as instruções originais dos três plugins instalados em `plugins/`, conforme `.agents/plugins/marketplace.json`:

- Taste Frontend: preservação da composição editorial e do sistema tipográfico, fotografia real e inspeção visual desktop/mobile. Lint e inspetor inicial executados; os limites genéricos contrários a gradientes, sombras e ornamentos cedem ao pedido explícito desta rodada.
- Impeccable: playbooks `polish.md`, `animate.md` e `craft-floor.md`; intervenção no menor escopo correto, semântica, foco, contraste, fallback e auditoria real no navegador. O detector estático registra um falso alerta de hierarquia de 16px por não resolver a cadeia de imports; as capturas mostram a tipografia computada real. Os demais avisos foram preservados, não tratados como prova de aprovação estética.
- Emil Design Engineering: resposta imediata, transições interrompíveis, easing coerente e estabilidade geométrica. Aplicação manual das instruções; não se afirma execução de um automatizador Emil.

As referências escolares e a pesquisa editorial já documentadas na V17 foram mantidas como contexto, sem outra rodada de pesquisa online nem cópia de composições.

## Testes executados

**Chromium: 46/46. Firefox: 24/24.** Suítes funcionais existentes executadas com destinos de relatórios/capturas redirecionados para esta rodada; não foi instalada dependência de produção.

Verificadas larguras **320, 375, 390, 768, 1024, 1366 e 1440px**, com ausência de overflow horizontal. Verificação adicional de A Casa em **1366 × 768**, sem corte da fotografia pelo limite da seção. Capturas finais das nove seções principais em desktop e mobile, além dos fullpages.

Axe WCAG A/AA: **nenhum achado** na suíte e na passagem final. Nenhum erro de JavaScript. Galeria, navegação por setas/Escape, retorno de foco, seleção da equipe, produto, filtros, pausa da esteira, toque e swipe foram exercitados. Movimento reduzido, conteúdo sem JavaScript e módulo principal bloqueado permaneceram funcionais.

A rodada final inclui interrupção do Álbum durante a entrada: seis imagens presentes, modo final correto, nenhum elemento oculto e nenhuma animação residual (`validacao-final.json`). A geometria do CTA do cabeçalho foi comparada em repouso, hover e foco (`cabecalho.json`).

A comparação DOM contra o HTML inicial confirmou preservação de serviços, planos, produtos, equipe, depoimentos, mapa e agendamento. Todas as imagens anteriores continuam presentes; a imagem extra é decorativa e reutilizada do acervo.

Quadros reais de coreografia em `capturas/polimento/coreografia/`: início, meio e fim da revelação de Serviços, e menu intermediário. `coreografia.json` registra delay, duração, tempo e valores computados dos alvos. Não houve seek de timeline. A captura rápida via CDP evita perder uma entrada breve durante a geração do PNG. Capturas adicionais da abertura, trocas e FLIP estão em `regressao/motion/`; alguns samples de trocas já chegam ao estado final devido ao tempo de captura, portanto a demonstração principal de stagger é a sequência `coreografia/`.

Os registros iniciais em `antes/` usam movimento reduzido para fixar a composição; as capturas finais principais usam movimento normal já acomodado. A galeria de evidências está em `capturas/polimento/galeria.html`.

**Limites:** testes em navegadores de desktop e emulação mobile, sem telefone físico, Safari/iOS ou leitor de tela manual. Axe e screenshots não equivalem a certificação de acessibilidade nem garantem desempenho em todo aparelho. Nenhum benchmark novo de FPS foi realizado nesta rodada.
