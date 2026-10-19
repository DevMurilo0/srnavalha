# Direção artística · V9

Na Sr. Navalha, o enquadramento de quem recebe o cliente se transforma no enquadramento de quem será atendido. O espelho é o dispositivo visual; os cinco profissionais, seus aventais, os resultados e a localização no Prado são o conteúdo real.

## Matéria do projeto

Damião, Eduardo, Kauã, Rafael e Yan; logo original; aventais de couro; barba e acabamento; barboterapia; Agamenon Magalhães, 349; Prado, Gravatá; 42 serviços; 22 produtos; conversa e pertencimento descritos pela própria casa. Sem biografias, números comerciais ou resultados inventados.

## Estrutura e prova

1. Hero: fotografia oficial de Damião e identidade visual reconhecível; acesso imediato ao AppBarber.
2. Casa: o mesmo retrato passa de protagonista a enquadramento da apresentação institucional.
3. Serviços: catálogo completo, preço/duração preservados e fotografia ou fallback específico para a escolha.
4. Equipe: corte fotográfico e índice dos cinco nomes reais.
5. Rotina: mudança de superfície e catálogo editorial dos produtos.
6. Trabalho: provas fotográficas, grid com escalas diferentes e lightbox espacial.
7. Confiança: a composição desacelera para os depoimentos documentados.
8. Visita: endereço, mapa sob demanda, informação prática e encerramento com Yan.

## Composição

Carvão #141414, preto #202020, marfim #F3F0EB, cobre #AD8B73 e tabaco #756153. Manrope e Young Serif locais. Título grande em duas linhas separadas pela fotografia, moldura com cantos de precisão em SVG, fontes sem máscaras de texto experimental. A moldura não redesenha a marca.

Taste Frontend: `draw.mjs` executado, direção `pinned-poster`. A ficha sorteou hero sobre ambiente escuro e imagens de costa: ambos contrariavam o pedido (sem voltar ao hero de fundo antigo, apenas fotografias oficiais). Foram reinterpretados como retrato em primeiro plano com enquadramento próprio. A pinagem é limitada à abertura; não se aplicou sticky a todas as seções. Paleta e fontes da marca foram mantidas como solicitado. O concept-seed Impeccable também foi executado; o brief detalhado do usuário prevaleceu sobre a direção aleatória e sobre rodadas opcionais de aprovação.

O elemento interativo central é a escolha de atendimento/profissional com conteúdo real, navegável por toque e teclado. Botões usam uma forma consistente, sem cursor substituto ou magnetismo que dificulte o clique.

## Antes / depois

| V8 | V9 | Motivo |
|---|---|---|
| Hero em mosaico, título acima dos recortes. | Retrato dominante, título em dois planos e abertura coordenada. | Construir um primeiro enquadramento reconhecível. |
| Passagem fotográfica desligada no mobile. | Narrativa própria também no celular. | Manter continuidade nos dois contextos. |
| Superfícies alternadas sem costuras específicas. | Corte fotográfico, faixa em movimento, passagem de material e frase de reputação. | Fazer cada passagem responder ao conteúdo. |
| Galeria horizontal em todas as telas. | Grid editorial no desktop e coleção deslizável no mobile. | Respeitar escala e gesto de cada dispositivo. |
| Convite final apenas tipográfico. | Retrato real, convite e informações conectados ao rodapé. | Fechar a experiência com as pessoas da casa. |

## Crítica das capturas

Primeira rodada: o retrato e o título se tornam o foco em um segundo; o estado intermediário transmite deslocamento real. Problemas materiais observados: legenda mobile colidindo com título; limiar da apresentação poderia cruzar a foto no tablet; estados invisíveis ainda focáveis. Corrigidos com legenda acima do quadro, progressão da foto antecipada, texto posterior e `inert` nas camadas que desapareceram.

A auditoria automática Taste conserva discordâncias estilísticas documentadas em TESTES_V9.md; não se apresenta nota Awwwards ou aprovação integral desse detector. Não houve comparação pública de performance comercial.
