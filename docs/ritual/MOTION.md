# Movimento: A arte do ritual

Código ativo: `js/ritual/core.js`, `motion.js`, `gallery.js`, `services.js`, `team.js`, `products.js`; estilos: `css/ritual/motion.css`.

## Assinaturas

**O Reflexo.** O Espelho Vivo usa um palco persistente. A próxima imagem é decodificada antes de entrar, uma máscara lateral atravessa o novo enquadramento e o deslocamento interno se resolve em sua posição natural. A seleção atualiza preço, duração, descrição e estado pressionado. A equipe usa o mesmo vocabulário de espelho, com seleção por ponteiro, foco, clique e toque. Não há espelhamento físico de rostos ou transformação de resultados.

**O Corte.** A entrada da casa revela a perspectiva interna sobre a fachada por `clip-path: inset`. Uma linha acompanha a borda da máscara. O progresso vem da posição real da seção na viewport, de 0 a 1, com ida e volta. Não há interceptação de wheel ou touch, nem rolagem artificial. Uma breve área sticky desktop mantém o enquadramento; mobile mantém fluxo normal. O título, a foto e a legenda têm wrappers distintos.

**A Continuidade.** O visualizador relaciona a posição real da miniatura à imagem do diálogo por FLIP. A imagem viaja até o centro, pode ser navegada e retorna à miniatura na saída por clique. Escape e navegação por teclado são imediatos. O foco volta ao link que abriu a imagem, mesmo ao navegar para outra foto. A imagem respeita suas dimensões decodificadas.

## Abertura e hero

A marca original parte do centro e ocupa seu destino no cabeçalho; a mesma abertura se recolhe enquanto o título sai da máscara e os enquadramentos se revelam em sequência. Movimento principal de aproximadamente 1,2s, fotos até 1,6s. Não espera rede, não simula porcentagem, não bloqueia clique. Timeout JS de 2,4s e failsafe CSS de 2,8s. Sem JS não se cria camada de abertura. Preferência reduzida ou pausa durante a sequência cancela e remove a camada.

## Vocabulário

| Contexto | Gesto | Tempo |
|---|---|---:|
| Título | Máscara e deslocamento curto por bloco | 850ms |
| Foto vertical | Reenquadramento de moldura e movimento interno | 950–1070ms |
| Foto lateral | Recorte horizontal e pequena translação | 950ms |
| Moldura do espelho | Abertura vertical | 950ms |
| Texto de apoio | Entrada discreta | 500ms |
| Troca de serviço/profissional | Máscara lateral; último pedido vence | 650ms |
| Troca de produto | Deslocamento e escala moderados | 420ms |
| Informação da seleção | Transição curta | 240–260ms |
| Lightbox | FLIP entrada / saída | 650 / 280ms |
| Menu | Movimento a partir da origem superior direita | 240ms |
| Botão | Pressão responsiva | 160ms |
| Avaliações | Translação contínua linear para a esquerda | 58s por ciclo |

Easing de entrada `.22,1,.36,1`; deslocamento espacial `.76,0,.24,1`. Parallax limitado a 24px, restrito aos componentes em vista. Nada depende de uma biblioteca remota.

## Orquestração e interrupção

`core.js` mantém preferência, pausa e conjunto de animações WAAPI. Um único RAF agendado por scroll/resize calcula progressos, sem loop contínuo. IntersectionObserver limita as cenas e aciona entradas apenas uma vez; o conteúdo tem estado natural visível. A animação termina/cancela de volta ao CSS natural, sem `opacity:0` permanente. As camadas de abertura que precisam persistir só existem durante a sequência e são removidas pelo timeout.

Trocas de imagem possuem token por palco; o último pedido decodificado é o único autorizado a atualizar a imagem. Uma troca para produto sem foto invalida pedidos pendentes e apresenta texto explícito. Falha de imagem mostra estado textual, sem inventar embalagem ou manter fotografia de serviço não correspondente.

A esteira duplica um único grupo, mantém o clone inert/aria-hidden e traduz exatamente metade do trilho. Pausa por botão, hover, foco, preferência, aba oculta e saída da viewport. Com movimento reduzido, vira grade estática; sem JS também.

Um trecho documental de 3s dos instrumentos, 86KB, pode aparecer no detalhe do hero desktop. Sem áudio. Só toca em vista e com movimento habilitado; pausa com a aba oculta, preferência reduzida e botão global. O pôster estático permanece como fallback e no mobile.

## Evidências

`capturas/ritual/motion/` contém quadros reais durante abertura, máscara de corte, troca do espelho, equipe, produto e expansão da galeria. `testes-chromium.json` guarda estados WAAPI e máscaras calculadas; os testes de Firefox incluem captura intermediária própria. Não são apenas imagens do estado final. Testes automatizados não certificam a fluidez de um telefone físico nem de Safari/iOS.
