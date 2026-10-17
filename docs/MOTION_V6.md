# Motion V6

CSS e Web Animations API, sem biblioteca obrigatória. Diretrizes dos plugins Emil, Taste e Impeccable locais.

| Elemento | Comportamento | Duração |
|---|---|---|
| Hero | Máscaras alternadas e deslocamento de12px nos retratos, stagger65ms | 550–700ms |
| Catálogo | Faixa interrompível; foto revelada pela esquerda, por baixo ou pela direita | faixa280/200ms, foto650ms |
| Portfólio | Máscara direcional, opacidade e deslocamento7px; seleção recente invalida anterior | 260ms |
| Lightbox | Escala .98 e troca fotográfica; teclado troca imediatamente | 220–260ms |
| Ambiente/convite | Revelação única ao entrar na área visível | 650ms |
| Controles | Feedback imediato, foco, toque e hover condicionado ao dispositivo | 180–220ms |
| Avaliações | Movimento contínuo30px/s, desaceleração na pausa, suspensão fora da tela/aba | rAF, posição fracionária |

Curva principal `cubic-bezier(.22,1,.36,1)`. Uma animação ativa por elemento; nova interação cancela a anterior. Altura é animada somente na abertura local do catálogo. Não há filtros pesados animados nem smooth scroll de biblioteca.

Conteúdo visível por padrão. Movimento reduzido inicial e alteração ao vivo cancelam animações, removem clones e apresentam quatro depoimentos estáticos. Retorno à preferência normal reconstrói a esteira uma vez. CTA disponível imediatamente; hover separado da seleção e das máscaras.
