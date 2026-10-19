# Sistema de movimento · V9

## Arquitetura

`js/site.js` mantém controles e catálogos; `js/motion/` separa core, opening, hero, passages, services e reviews. CSS de movimento antigo foi substituído. Não há GSAP, Lenis ou dependência de CDN em produção. Scroll nativo atende wheel, touchpad, toque e âncoras sem suavizador paralelo.

| Responsável | Propriedade / ação |
|---|---|
| core.js | Eventos passivos, filas separadas de leitura/escrita, um scheduler rAF compartilhado, cancelamento WAAPI, visibilidade da aba e cleanup dos módulos. |
| opening.js | Logo e filete, dois painéis, máscaras de linha e entrada da foto. Apenas recursos essenciais aguardam até 180 ms; abertura principal de 930 ms após 430 ms de preparação. Remoção visual até 1,4 s; timeout independente de 2,2 s e CSS de segurança em 2,4 s. |
| hero.js | Único progresso entre início e fim do percurso sticky. Move wrapper da foto, wrapper tipográfico e apresentação; entrada usa filhos distintos. Atualiza somente enquanto a cena está próxima da viewport. |
| passages.js | Faixa em deslocamento, máscara entre resultado e Eduardo, superfície marfim na passagem para produtos, alinhamento das duas frases de reputação e reenquadramento de Yan. |
| services.js | Uma foto correspondente ao serviço, revelada em 560 ms; sem foto específica, fallback tipográfico explícito. Seleções antigas não vencem as novas. |
| site.js / equipe | Camadas persistentes, corte lateral 560 ms, enquadramento 650 ms, nome e legenda sincronizados; último pedido vence. |
| site.js / produtos | Decodificação antes da troca, camada anterior abaixo da próxima, máscara de 520 ms e texto sincronizado; link WhatsApp sempre corresponde ao estado visível. |
| site.js / galeria | Dialog nativo, FLIP de 520 ms com origem no retângulo da miniatura e escala X/Y; retorno 180 ms, Escape, setas e swipe. Sequências invalidam solicitações antigas e fechamentos interrompidos. |
| reviews.js | 22 px/s em scroll nativo fracionário; clone `aria-hidden` e `inert`, pausa por botão/foco/mouse/toque. Loop registrado no scheduler somente quando necessário. |

## Passagens

A. **Hero → casa:** o retrato desloca e reduz, o título deixa a cena, a apresentação ganha seu próprio espaço. Desktop em duas colunas; mobile com foto acima da leitura. A frase entra depois de o quadro desocupar sua região.

B. **Serviços → equipe:** a frase desliza, um recorte do resultado abre espaço para o retrato de Eduardo e a cor carvão retoma o palco da equipe. Seção curta, sem fullscreen ou pin adicional.

C. **Equipe → produtos:** frase em duas direções e superfície marfim que sobe dentro da costura; a geometria dos retratos dá lugar ao quadro de embalagens.

D. **Portfólio → reputação:** termina o grid fotográfico, duas linhas se alinham progressivamente e a leitura passa para os comentários lentos. Sem captura do wheel.

E. **Localização → encerramento:** informação prática em superfície clara, retrato de Yan com leve reenquadramento e convite ligado ao rodapé.

## Estados e falhas

- Sem JS, não há curtain no DOM. Texto e catálogos continuam no HTML; details e links nativos funcionam.
- Redução de movimento inicial/dinâmica pula abertura, remove pinagem/movimento, mostra apresentação em fluxo e avaliações em grade.
- Controles do hero a opacidade quase zero ficam `inert`; links da apresentação ficam fora do Tab até serem visíveis. O texto institucional permanece disponível semanticamente.
- Inputs não esperam efeitos terminarem. Decodificação pode levar tempo de rede; os controles continuam aceitando a última escolha.
- A aba oculta interrompe o rAF e pausa animações WAAPI rastreadas; o motor dorme quando não há movimento contínuo visível.
- As camadas de conteúdo nunca dependem de uma classe inicial invisível para funcionar. As revelações das seções são disparadas só após IntersectionObserver confirmar sua entrada.
- Não há blur animado ou filtro pesado sobre grandes fotografias.

Leituras de layout do hero e passagens são feitas antes das escritas do mesmo frame. A largura do ciclo das avaliações é medida em setup/resize/fontes, não a cada frame. Medições e estados intermediários em `V9_MOTION_MEDICOES.json` e `capturas/v9/transicao-*`.
