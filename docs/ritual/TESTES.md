# Relatório real de testes — 22/10/2026

## Resultado

| Verificação | Resultado | Evidência |
|---|---:|---|
| Chromium, incluindo interação e responsividade | 45/45 | `testes-chromium.json` |
| Firefox, incluindo interação e responsividade | 26/26 | `testes-firefox.json` |
| Conferência comercial AppBarber | 69/69 | `conteudo-verificado.json` |
| Falhas de imagem/módulo, vídeo e repetição de troca | 6/6 | `resiliencia-performance.json` |
| Referências locais/âncoras/IDs | 136 referências, sem ausências/duplicações | `entrega-validacao.json` |
| Regeneração do HTML | Bytes idênticos | `entrega-validacao.json` |
| Proveniência dos WebPs entregues | 98, nenhum sem origem | `proveniencia-scan.txt` |
| Pixels após metadados de origem | 98/98 inalterados | `proveniencia-embutida.json` |
| ZIP extraído, fora do repositório | 6/6 e integridade válida | `zip-browser.json`, `zip-validacao.json` |
| Revisão independente | Cinco ajustes resolved; disposition ship | `REVISAO.md` |

## Matriz responsiva

Chromium e Firefox reais em **320, 375, 390, 768, 1024, 1366 e 1440px**, altura de teste 900px. Em cada largura: hero, carregamento de fotos, CTA visível, fim da abertura, documento sem overflow e texto do título sem recorte na máscara. Capturas individuais em `capturas/ritual/depois/final-hero-*.png` e `firefox-*.png`. Contextos touch/reduced/noJS usam 390×844.

## Movimento e interação

A abertura foi instrumentada por wrapper de Element.animate, sem substituir seus keyframes. As capturas têm estados inicial, intermediário e final. O Corte registrou máscaras diferentes no início/meio/fim e a mesma máscara ao voltar ao meio. O Reflexo, equipe, produto e Continuidade têm capturas intermediárias e estado WAAPI registrado. Não se inferiu movimento apenas da imagem final.

Espelho Vivo: serviço/preço/duração/foto corretos; seleção rápida termina na última escolha. Filtros abrem o catálogo correspondente e preservam42 serviços. Detalhes de condições e destino AppBarber conferidos. Equipe troca por clique e foco. Produtos trocam nome/preço/link; item sem foto recebe texto explícito; filtro por categoria. Lightbox abre, navega por setas, fecha por Escape e devolve foco; swipe foi feito com eventos touch reais em emulação Chromium. Não houve teste de toque em telefone físico.

Esteira: matriz de transformações muda na direção esperada, botão pausa e foco pausa. O teste retira o ponteiro de cima da esteira para medir seu movimento; hover sobre ela deve pausá-la. Pausa global cancela WAAPI e transições, preserva altura1125 e posição3894 da leitura na amostra da casa. Preferência reduzida inicial/dinâmica remove deslocamentos e transforma depoimentos em grade. Aba oculta e saída da viewport são tratadas pelo orquestrador; vídeo fora de vista foi verificado pausado.

## Acessibilidade, falhas e mapa

Axe-core no documento em1440/390: **zero violações detectadas** nas tagsWCAG2A/AA eWCAG2.1AA. O menu aberto após pausar movimento mantém opacidade1 e nenhuma animação, com zero violações Axe no ensaio focado (`menu-com-pausa.json`). Menu, serviços e FAQ usam elementos nativos; foco visível, nomes acessíveis, estado pressionado, diálogo e retorno do foco estão no código e nas interações testadas.

Sem JavaScript:42 serviços,22 produtos,cinco links de retrato e agenda continuam presentes; menu e catálogo expandem nativamente. Recursos fotográficos bloqueados: abertura termina e agendamento segue visível; o serviço não mantém uma foto de outro cuidado. Módulo JS bloqueado: HTML permanece utilizável. Há timeout de abertura e fallbackCSS.

O mapa verdadeiro foi capturado depois de carregar em1440/390, inclusive cartão com nome/endereço/5,0/474 avaliações. `review-mapa-*.png` e `mapa-diagnostico.png` são evidência visual. Quando o fornecedor não dispara load, há mensagem após 12s e nova tentativa. Um iframe bloqueado silenciosamente pode disparar load mesmo sem cartografia; o frontend não afirma conseguir inspecionar sua origem externa. O controle nativo **Não consigo ver o mapa** recolhe a área e oferece rota. Esse caso foi testado com a navegação Google abortada, em `mapa-indisponivel.png` e `veredito-correcoes.json`.

## Performance observada

A amostra de 90 frames do Chromium teve medianaRAF **16.7ms**, máximo **16.8ms**. É uma janela do navegador headless na máquina de teste, não um benchmark de telefone nem garantia de 60 fps durante toda a página. A soma de layout shifts sem entrada recente observada nessa visita foi **0.000553**; não é uma medição de campo.

A cena usa um RAF agendado por eventos, sem vários loops contínuos. Observers limitam efeitos visíveis; a esteiraCSS e o vídeo pausam. A amostra após 15 trocas de profissional manteve **um** retrato no palco. Heap passou de844512 para 2269576 bytes após carregamento/interação e coleta solicitada; isso observa uso naquele ensaio, não comprova ausência de vazamento numa sessão longa. O array métricas da suíte principal estava vazio; os valores de heap vêm da sessãoCDP explícita em `resiliencia-performance.json`, não desse array.

Console sem exceçõesJS e recursos locais sem404 na suíte Chromium; Firefox sem errosJS. Fotografias não foram ampliadas para criar suposta4K; resoluções reais e limites estão em `IMAGENS.md`. O trecho de vídeo tem86 KB, não carrega o vídeo original de12 MB na página.

## Escopo e limitações

Sem teste físico de telefone, Safari/iOS, leitor de tela manual ou sessão de memória prolongada. Instagram/destaques tiveram acesso público parcial; nenhuma restrição foi contornada. O Firecrawl estava sem créditos e não foi usado como evidência de consulta bem-sucedida. ConteúdoGoogle pode mudar depois da data registrada. Testes anteriores em `desenvolvimento/` e capturas em `capturas/ritual/processo/` são históricos, não resultados finais.

O ZIP é conferido separadamente em `zip-validacao.json`; a documentação do runtime e a direção ficam no mesmo pacote. Sem publicação, commit, merge ou push.
