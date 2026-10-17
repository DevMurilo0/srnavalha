# Sistema de movimento V8

## Três assinaturas

1. **Fotografia em passagem editorial.** A mesma figura de barboterapia deixa o hero e se acomoda acima do texto da introdução. O percurso tem três fases: reduz a escala à direita, cruza uma faixa sem texto e termina no encaixe à esquerda. Medidas relativas ao layout são recalculadas após fontes, load e resize; um único rAF responde ao scroll passivo. Nenhuma reserva de scroll ou canvas. Acima de 850 px; mobile e movimento reduzido mantêm a fotografia em sua posição original e retiram o espaço do encaixe.
2. **Retratos como navegação.** Cinco camadas reais são mantidas no DOM. Seleção carrega/decodifica a foto, mantém a anterior e abre uma máscara na seguinte. Um contador de requisições impede respostas antigas de vencerem a seleção atual. Transições CSS são interrompíveis; estado ativo único. Hover só em ponteiro preciso; toque, foco e clique funcionam. Nome, imagem e legenda têm associação explícita. Sem biografias fictícias.
3. **Tipografia em corte.** Duas linhas do título inicial entram por máscaras, com pequeno intervalo. O título da introdução responde ao scroll por deslocamento vertical moderado onde CSS view timelines é suportado. O conteúdo permanece visível quando JavaScript, animação ou recurso CSS não existem. Sem split-text em parágrafos.

## Respostas de componentes

- Controles: 180–280 ms, easing `cubic-bezier(.22,1,.36,1)`, pressão scale(.98), seta diagonal 3 px. Não há magnetismo contínuo nem cursor substituto.
- Equipe: máscara 480 ms `cubic-bezier(.76,0,.24,1)`, deslocamento interno de 3,5%. Teclado finaliza a transição para resposta imediata.
- Produtos: 280 ms de máscara, 220 ms de texto. Camada anterior permanece abaixo; índice solicitado é atualizado antes da decodificação para respeitar cliques rápidos. WhatsApp sempre corresponde ao produto visível.
- Catálogos: details nativos, símbolo rotaciona ao abrir; filtros removem somente itens não correspondentes e mantêm contagem anunciada. Sem atraso artificial para acessar conteúdo.
- Menu: details funcional sem JS, entrada de 240 ms e links escalonados em 25 ms. Escape, clique externo, seleção e mudança para desktop fecham o menu.
- Portfólio: scroll horizontal nativo com snap, sem wheel hijack. Dialog nativo, entrada espacial 320 ms e retorno 180 ms, fotos em contain, Escape/setas e swipe; foco retorna ao trabalho acionado.
- Avaliações: 25 px/s, posição fracionária acumulada para não perder deslocamentos menores que 1 px. Grupo visual repetido uma vez, `aria-hidden`, `inert` e sem links focáveis. Emenda usa a largura real do grupo incluindo espaçamento. Pausa por botão, foco, mouse e interação; toque pode assumir a rolagem e deixa pausa explícita. Sem movimento fora da viewport ou com aba oculta.

## Continuidade entre seções

| Passagem | Lógica |
|---|---|
| Hero → casa | Fundo carvão compartilhado; fotografia desloca-se até a apresentação da casa. |
| Casa → serviços | Marfim abre o catálogo; imagem pequena e preços substituem a escala da abertura. |
| Serviços → assinaturas | Mesma superfície e alinhamento dos valores; mensalidade é distinguida do atendimento. |
| Serviços → equipe | Carvão retoma os uniformes e o couro; faixas de texto viram índice de pessoas. |
| Equipe → produtos | A imagem única compartilhada reaparece como palco de embalagem em marfim. |
| Produtos → trabalhos | A coleção se abre horizontalmente em carvão, com larguras e offsets próprios. |
| Trabalhos → avaliações | Preto suave dá uma mudança tonal, sem corte fotográfico artificial; a nota recebe escala editorial. |
| Avaliações → visita | Marfim volta à informação prática; endereço e mapa carregável. |
| Visita → convite → rodapé | Carvão e logo original encerram a narrativa e repetem o acesso à agenda oficial. |

## Segurança e custo

Rolagem nativa. Não há loader que bloqueie conteúdo, smooth-scroll externo, filtros animados ou múltiplas seções fullscreen/sticky. A antiga simulação de calendário foi retirada. Apenas o aside de serviços fixa no desktop. Elementos animados não ficam invisíveis por falha de script. Preferência reduzida inicial e dinâmica cancela animações, remove clones e mostra avaliações em grade estática, inclusive em Firefox sem view timelines.
