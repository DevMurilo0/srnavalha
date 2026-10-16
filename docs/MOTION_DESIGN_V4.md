# Sr. Navalha — refinamento V4

## Direção e arquitetura

A identidade existente permanece: preto, off-white, cobre, fotografia local do projeto, fontes Manrope e Barlow Condensed, logo, conteúdo institucional, contato e crédito de Murilo Gabriel. O site continua HTML/CSS/JS, aberto por **Open with Live Server** em `index.html`; o fluxo em `agendar.html` continua demonstrativo.

A V4 trabalha três relações: **precisão** nas proporções e leitura, **corte** nas máscaras e molduras, **reflexo** em respostas sutis das fotografias. Pesquisa individual das dez referências e limitações reais em [REFERENCIAS_AWWWARDS.md](REFERENCIAS_AWWWARDS.md). Autenticidade e manutenção dos depoimentos em [AVALIACOES_GOOGLE.md](AVALIACOES_GOOGLE.md).

Bibliotecas existentes preservadas: **GSAP, ScrollTrigger e SplitText 3.15.0**, UMD local. Não foram adicionados CDN, fonte, biblioteca de slider, Lenis, React ou dependência de build. A origem/licença GSAP permanece em `assets/vendor/gsap-3.15.0/`.

## Inspeção da base

Lidos HTML das duas páginas, todos os CSS ativos e scripts de menu, agendamento, motion, interações e galeria, além do inventário do repositório. `backup-nextjs/` e entregas anteriores são históricos. As alterações locais da rodada de motion anterior foram preservadas; não foi feito reset para HEAD.

Problema principal: tamanhos de 8–14 px apareciam no CSS base, no refinamento e novamente nos breakpoints. Uma correção apenas ao fim do arquivo manteria múltiplas escalas concorrentes. Foram convertidas as declarações informativas existentes para tokens semânticos, inclusive dentro dos breakpoints. Elementos vetoriais/decorativos como microtexto do selo continuam gráficos, não conteúdo essencial.

O motion anterior já tinha máscaras e controle de escopos. A V4 o adapta, em vez de instalar outro sistema por cima. Mantém os proprietários de movimento separados: trilho = scrollLeft real; câmera = revelação; imagem = hover; variável de enquadramento = reação ao ponteiro. FAQ conserva uma única timeline de altura e o header conserva seu único processamento agrupado de scroll.

## Escala tipográfica

Fonte única de tamanhos informativos: `css/typography.css`, carregada antes dos estilos de componentes. Os demais arquivos referenciam os mesmos tokens; os tamanhos não voltam a diminuir em breakpoints.

| Token | Intervalo | Aplicação |
| --- | --- | --- |
| `--type-body` | 16–18 px | Parágrafos, introduções, hero e explicações |
| `--type-small` | 15–16 px | Descrições de serviço, contato, respostas e campos secundários |
| `--type-nav` | 14–15 px | Menu desktop |
| `--type-action` | 13–14 px | CTAs e links de ação |
| `--type-faq` | 15–17 px | Perguntas |
| `--type-review` | 18–20 px | Depoimentos |
| `--type-meta` | 12–14 px | Rodapé, autoria, períodos e indicadores |
| `--type-label` | 11–12 px | Pequenos rótulos e marcadores |

Cabeçalho com links de no mínimo 48 px de altura, CTA proporcional e área de toque de 46 px no menu mobile. Controles da galeria têm 44 px e avaliações 46 px. O calendário mantém sete colunas compactas para caber em 320 px; seus dias não são forçados a 44 px, o que tornaria esse componente mais largo que a tela. Campos de entrada usam 16 px para leitura e evitar zoom automático comum em celulares.

A fonte e a escala marcante dos títulos foram preservadas. Houve ajuste de respiro, colunas e espaços para acomodar o texto maior; a V4 não pretende manter as alturas exatas da V3, pois a leitura maior exige espaço.

## Movimento e composição por componente

### Hero e navegação

Timeline inicial existente preservada: header, localização, linhas do título, câmera, parágrafo, ações, benefícios e frase lateral em sequência de aproximadamente 1,9 s. Acrescentada abertura diagonal discreta da fotografia, de polígono 94%/85% até o quadro completo em **1,2 s**, `power3.inOut`, sem atrasar o CTA. Depois, profundidade desktop de poucos pixels; sem cursor customizado.

Links maiores, gaps revistos e indicador ativo deslizante mantido em **0,45 s**, `power3.out`. Menu mobile mantém Escape, foco e fundo inert. Testadas também larguras intermediárias para conferir a passagem entre menu aberto e navegação desktop.

### Serviços

Máscaras alternadas **esquerda / baixo / direita**, em vez de três entradas iguais. Fotografias iniciam com escala 1,08; duração **1,05 s desktop / 0,82 s mobile**, atrasos desktop 0 / 0,13 / 0,26 s. Conteúdo textual entra após a fotografia. Seta em controle maior, deslocamento direcional no foco/hover e reflexo discreto existente. Nenhuma altura de card é animada.

### Ambiente — transição especial 1

A fotografia abre a moldura inset 9%/7% até preencher sua região com scrub **0,45**. Uma linha cobre desenha parte da moldura em **1 s**, acompanhando a entrada no espaço. A fotografia permanece no encontro do papel com o fundo escuro; não é substituída por uma faixa decorativa. Mobile usa entrada única simples, sem scrub/parallax de ponteiro.

### Galeria editorial viva

Fotografias maiores, duas molduras principais no desktop e vizinha parcialmente visível no celular; alturas alternadas trazem ritmo, sem mudar durante a navegação. Legendas reais descrevem as imagens. O título deriva até **5 px** conforme o mesmo progresso das fotos, com suavização CSS de **0,65 s**, sem alterar o layout.

Posição continua nativa e única (`scrollLeft`), setas/teclado com **0,68 s `power3.out`**, cancelamento ao iniciar gesto. Drift interno limitado a 6 px desktop / 3 px mobile. O ponteiro fino acrescenta enquadramento de ±2,5 px por fotografia, amortecido em **0,6 s**; o reflexo branco tem opacidade muito baixa e só aparece durante interação. Essa variável se soma ao drift; não há dois escritores do mesmo transform. Arraste, swipe, foco e Home/End preservados.

### Equipe — transição especial 2

Título e fotografia agora partem do mesmo gatilho editorial (`.sr-team__inner`). A imagem abre lateralmente em **1,12 s**, com atraso de 0,08 s; a frase entra depois. Linha cobre existente conecta texto e fotografia. Imagem menos escurecida, enquadramento revisto, sem adicionar blur. Fotografia e legenda recebem respiro maior.

Somente ambiente e equipe usam a linguagem especial de transição entre seções; a máscara inicial do hero não é uma terceira sequência longa de rolagem.

### Avaliações reais

Quatro autores conferidos diretamente na ficha correta do Google, dados separados em `js/reviews-data.js` e artigos HTML gerados por `scripts/sync-reviews.py`. O script Python é apenas utilitário de manutenção, não requisito de execução.

O carrossel usa Web Animations API nativa, sem outra biblioteca. Um estado ativo, duas animações temporárias de saída/entrada, **540 ms**, `cubic-bezier(.22,1,.36,1)`, deslocamentos de 36/42 px e opacidade. Novos comandos cancelam os anteriores; não há timelines órfãs. Mede a maior altura de todos os artigos e reserva esse espaço; trocar o texto não desloca a seção seguinte. ResizeObserver recalcula quando muda a largura; fontes são aguardadas novamente para a medição final. Navegadores sem ResizeObserver usam resize como contingência.

Botões anterior/próximo, teclado com setas/Home/End, swipe com limite mínimo e arraste com resposta de até 42 px. O gesto vertical continua do navegador. Sem autoplay: hover e foco nunca são interrompidos por troca automática, dispensando botão de pausa. Inativos usam `aria-hidden` e `inert`; o contador anuncia a posição. Sem JS, os quatro artigos ficam no fluxo normal, legíveis e com links. Ausência/mismatch do arquivo de dados mantém o HTML, sem inventar conteúdo.

A nota 5,0 / 466 é uma fotografia da consulta de 15/10/2026, explicitamente datada; não é integração ao vivo.

### Localização, FAQ e agendamento

Pin e linha do mapa mantidos, sem animar o mapa inteiro. Contatos entram em sequência curta lateral de **7 px / 0,65 s / stagger 0,08 s**, `power3.out`. FAQ mantém altura fluida de **0,34 s**, reversível durante o movimento, sem fechar abruptamente. Itens de grid alinham no início para evitar o esticamento de uma resposta pela vizinha.

Agendamento compartilha tokens, campos e controles maiores. A lógica original de seleção, calendário, horários, validação, revisão, voltar, conclusão demonstrativa e reset não foi reescrita. Não há envio ou reserva real.

## Performance e acessibilidade

Sem dependências novas de runtime. Bibliotecas, fotografias e fontes locais existentes. Sem polling, autoplay, scroll hijacking ou novos loops permanentes. Alterações por rAF e tweens eventuais; filtro animado restrito a pequenos trechos já existentes. Sem `will-change` indiscriminado. Novos componentes mantêm semântica, foco visível e áreas de toque.

`prefers-reduced-motion` desliga cenas/parallax/reflexos e troca avaliações instantaneamente, inclusive quando alterado durante a sessão. Sem JavaScript a Home inteira, a galeria nativa, o FAQ e as avaliações continuam legíveis. O agendamento é uma interação JS e mostra seu aviso de dependência de JavaScript; não se promete executar o fluxo sem script. Falha de qualquer biblioteca de motion não impede o restante da interface ou o carrossel de avaliações independente.

## Testes e evidências

Servidor HTTP estático local na porta 4173, equivalente ao Live Server. Chromium via Playwright já disponível no ambiente, sem instalar dependências no projeto. Capturas em `capturas/v4/antes/` e `capturas/v4/depois/`. Antes: versão local V3, não HEAD. Depois: estados finais e recortes das interações reais. Capturas integrais usam movimento reduzido e header no fluxo somente no contexto da captura para não registrar seções parcialmente animadas fora da viewport; testes funcionais usam o layout normal com animações habilitadas.

Os JSON `V4_TESTES_*.json` registram os resultados concluídos. As capturas foram inspecionadas para hierarquia do hero, escala do menu, fotos, avaliações e composição mobile. A comparação é visual e funcional, não igualdade pixel a pixel: fontes informativas maiores, fotos editoriais e avaliações são mudanças intencionais.

Limites: toque emulado, não aparelhos físicos; testes em Chromium, não Safari/Firefox. O teste com CPU limitada é uma aproximação de equipamento mais lento, não promessa de FPS ou Core Web Vitals em produção. Não houve commit, push ou publicação.

### Correções encontradas durante a validação

- Classificação tipográfica revisada para ignorar classes dentro de `:not(...)`: parágrafos com `:not(.sr-kicker)` não podem receber o token de rótulo.
- O modo `no-js` apresentava uma navegação expandida no primeiro quadro mobile antes de o runtime iniciar. Uma identificação mínima no `<head>`, antes dos estilos, evita esse deslocamento quando JS está habilitado; com JS desativado ela não executa e a navegação alternativa permanece.
- O ensaio de CPU limitada mostrou trabalho concentrado na preparação inicial. Títulos fora de 120% da viewport agora mantêm seu HTML original até se aproximarem, quando o ScrollTrigger prepara o SplitText. Os recursos continuam pertencendo ao escopo e são revertidos ao mudar a preferência de movimento. Sem observer adicional ou conteúdo escondido antes da preparação.
- FAQ validado por quadros intermediários e estado final, incluindo oito sequências de reversão no desktop. Esperar somente um número fixo de milissegundos não é uma medição confiável em um processo headless ocupado; a confirmação final também aguarda o componente terminar.
- A interrupção da galeria foi novamente medida no pointerdown: **0 px** de salto enquanto o botão permaneceu pressionado.

As fotografias de trabalhos existentes têm resolução de origem limitada. Foram preservadas; não se usou geração para inventar cortes ou clientes. Originais de maior resolução podem melhorar a nitidez futura das molduras maiores.

## Arquivos modificados especificamente na V4

- `index.html`, `agendar.html`, `README.md`.
- `css/style.css`, `css/booking.css`, `css/responsive.css`, `css/refinements.css`, `css/animations.css`.
- Novos: `css/typography.css`, `css/editorial.css`.
- `js/gallery.js`, `js/interactions.js`, `js/motion-text.js`, `js/motion-scenes.js`.
- Novos: `js/reviews-data.js`, `js/reviews.js`, `scripts/sync-reviews.py`.
- `docs/AVALIACOES.md` recebe referência ao status atual; novos `docs/REFERENCIAS_AWWWARDS.md`, `docs/MOTION_DESIGN_V4.md`, `docs/AVALIACOES_GOOGLE.md`, `docs/AVALIACOES_GOOGLE_EVIDENCIAS.json` e relatórios `docs/V4_TESTES_*.json`.
- Novas capturas PNG em `capturas/v4/antes/` e `capturas/v4/depois/`.

Os arquivos de core, inicialização, menu e bibliotecas locais já tinham alterações locais da rodada V3; foram preservados. `js/booking.js`, fotografias, fontes e logotipo não foram alterados nesta rodada.

## Resultado final da validação

- **6/6 larguras aprovadas** na Home e no fluxo completo de agendamento: 320, 375, 390, 768, 1366 e 1440 px. Sem overflow horizontal ou erros de console/HTTP locais observados; imagens decodificadas e fontes locais conferidas.
- **4 avaliações reais navegadas** em cada largura, autoria/estrelas conferidas com os dados, setas, teclado, reversão rápida e altura estável. Swipe real emulado pelo protocolo de toque do Chromium em 375 px. Foco dentro de um link da avaliação volta à região do carrossel ao trocar, evitando deixar foco em artigo inert.
- **8 cenários adicionais aprovados**: JS desativado, indisponibilidade individual de GSAP/ScrollTrigger/SplitText, movimento reduzido inicial, mudança dessa preferência durante a sessão, resize repetido e recuperação explícita de falha.
- **6/6 larguras aprovadas** novamente para títulos preparados sob demanda, salto rápido ao fim, retorno da rolagem, visita das seções, remoção de todas as divisões/triggers em movimento reduzido e ausência de máscaras aninhadas ao reativar.
- Menu sem sobreposição também em **1041, 1100 e 1200 px**.
- Ensaio mobile com CPU limitada a **4×**: hero terminou, controles responderam, nenhum título anterior ficou oculto; **CLS observado 0** após a correção do modo inicial do header. Ainda há tarefas longas de inicialização/rolagem no ambiente emulado (máxima de 462 ms nessa medição). Não se promete ausência de travamentos em qualquer hardware nem 60 fps garantidos; os relatórios preservam esses limites.
- Sintaxe de todos os JS e `git diff --check` aprovados; todos os caminhos locais referenciados nas duas páginas existem.

Evidências: `V4_TESTES_FUNCTIONAL.json`, `V4_TESTES_SPECIAL.json`, `V4_TESTES_LAYOUT.json`, `V4_TESTES_PERFORMANCE.json`, `V4_TESTES_LAZY.json` e `V4_TESTES_FOCUS.json`. No inventário geométrico, imagens maiores que sua moldura são recortadas intencionalmente pelo ancestral; isso não é overflow horizontal do documento.
