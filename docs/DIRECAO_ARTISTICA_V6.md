# Ensaio de cuidado — contrato V6

**THESIS:** aproximar o visitante do trabalho real com fotografias pequenas, composição editorial e interação direta.

**OWN-WORLD:** retratos dos cortes da Sr. Navalha, espelhos, pente/navalha/tesoura desenhados em SVG como linguagem gráfica, cuidado e conversa. O endereço é informação, não sistema ornamental.

**STORY:** a abertura mostra resultados; o catálogo permite escolher; ambiente/equipe apresentam o lugar real; o portfólio explora cinco registros; avaliações comprovam experiências; localização e solicitação encerram o percurso.

**FIRST VIEWPORT:** marca horizontal, apresentação breve e CTA disponível, quatro retratos em composição de proporções e alturas distintas, sem hero dividido nem imagem de fundo. Em mobile, dois quadros por linha e CTA anterior às fotos.

**FORM:** interpretação compacta de `contact-sheet`, seed Taste 882532839. Não existe seed Impeccable: motor indisponível e usuário proibiu repetir downloads. Sem comp gerada, execução em código conforme instrução do usuário. A ficha pede 24 quadros, mas o acervo verdadeiro tem cinco trabalhos: não fabricar densidade. Fonte Manrope local do histórico substitui Hanken, ainda não disponível localmente. Paleta: osso #e5e1d8, superfície #dad5ca, chocolate #2a1d17, verde #456f3a. Corpo 16–18px, legenda mínima 13px.

| V5 | V6 | Por quê |
|---|---|---|
| Hero escuro dividido, imagem derivada larga | Marca sobre composição de retratos pequenos | Escala honesta e estrutura nova |
| Lista lateral com preview único | Faixas de catálogo que abrem o próprio conteúdo | Toque e leitura local, sem repetir a estrutura V5 |
| Ambiente ampliado como fundo | Foto original em moldura editorial e atendimento separado | Preserva documentação real |
| Grid assimétrico expansível | Índice com fotografia selecionável, swipe e lightbox | Exploração ativa do pequeno acervo |
| Slogan gigante no final | Convite como ficha editorial com espelho gráfico e ação | Encerramento útil e conectado |

Assinaturas: entrada por máscaras no hero; revelação direcional dentro dos serviços; troca fotográfica de portfólio. Transições de interface rápidas e interrompíveis. Sem conteúdo oculto por CSS antes do JS. Movimento reduzido cancela animações em execução.

## Estado entregue

V6 integrada em `index.html` e `agendar.html`, com cinco folhas de estilo e quatro scripts locais. A `.v6-stage/` foi preservada e sincronizada com a implementação principal. Capturas comparativas em `capturas/v6/antes/` e `capturas/v6/integrada/`.

Correções de validação: fechamento do CTA, offset de âncoras, estrelas SVG, contraste do placeholder e largura intrínseca dos grupos da esteira. Testes e limitações documentados em `TESTES_V6.md`. Fotografias originais e conteúdo real preservados; nenhum novo download, pesquisa ou sorteio de direção.
