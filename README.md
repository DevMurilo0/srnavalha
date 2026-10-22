# Sr. Navalha — A arte do ritual

Site estático reconstruído para a Barbearia Sr. Navalha, no Prado, Gravatá–PE. Fotografias oficiais, marca original e conteúdo comercial preservado.

## Abrir

Abra esta pasta no VS Code e use **Open with Live Server** em `index.html`. Não precisa executar npm, instalar dependências ou gerar o site. Módulos JavaScript exigem HTTP; abrir por `file://` não equivale ao Live Server.

Alternativas opcionais de desenvolvimento, na raiz:

```sh
python3 -m http.server 8033
```

ou:

```sh
node scripts/serve.mjs
```

Acesse `http://127.0.0.1:8033/`. O ZIP em `entrega/sr-navalha-arte-do-ritual.zip` contém uma pasta pronta para extrair e abrir com Live Server, incluindo fontes locais e licenças, originais usados, documentação e capturas.

## Editar

- `scripts/render-site.mjs`: fonte canônica da estrutura. A geração **opcional** `node scripts/render-site.mjs` escreve `templates/ritual/*.html` e o `index.html` pronto.
- `js/data/`: serviços, profissionais, produtos e avaliações com suas origens.
- `css/ritual/tokens.css`: paleta, fontes, medidas e curvas. Os outros cinco módulos separam base, cabeçalho, hero, seções e movimento.
- `js/ritual/`: núcleo WAAPI, orquestração, serviços, equipe, produtos, galeria e mapa.
- `DESIGN.md`, `PRODUCT.md` e `docs/ritual/`: direção, arquitetura, pesquisa, motion, inventário e evidências.

O HTML já inclui todo o catálogo. Sem JavaScript, menu e detalhes nativos funcionam, fotografias têm links diretos, produtos abrem consulta e o agendamento segue para o AppBarber. O script acrescenta filtros, seleção fotográfica, lightbox e coreografia.

## Interações

Espelho Vivo com quatro cuidados e imagens correspondentes; catálogo filtrável com 42 serviços e três planos mensais distintos; cinco profissionais com retratos por foco/ponteiro/toque; 22 produtos com consulta pelo WhatsApp; seis fotos com expansão espacial, setas, Escape, swipe e retorno de foco; esteira contínua com pausa; mapa Google verdadeiro e alternativa de rota.

Movimento reduzido funciona desde a abertura e ao mudar a preferência. Há pausa global, pausa da esteira por botão/foco/hover e pausa de efeitos/vídeo fora de vista ou com aba oculta. Não há scroll-jacking ou backend fictício.

## Conteúdo e imagens

Serviços, produtos e equipe conferidos no AppBarber em 22/10/2026: 69 comparações em `docs/ritual/conteudo-verificado.json`. A ficha Google Maps exibiu nota 5,0 e 474 avaliações em 22/10/2026; a captura do cartão real está em `docs/ritual/mapa-diagnostico.png`. Os depoimentos mantêm seus links individuais. Horários mantêm a data da coleta anterior e convite à confirmação.

A fachada, o salão e os instrumentos vêm do Reel colaborativo oficial de 08/10/2026. O acesso público atual ao Instagram foi parcial; não se certifica a ausência de reformas posteriores. Fotos respeitam a definição original, inclusive as de 290, 358 e 410px. Produtos sem foto oficial são identificados por texto. Não houve geração ou reconstrução de rostos, produtos ou espaços.

`docs/ritual/IMAGENS.md` e `inventario-imagens.json` registram resolução real, bytes, origem, uso e variantes. Os originais permanecem em `assets/originals/`. A proveniência foi embutida em 98 WebPs sem alterar pixels decodificados.

## Verificação de desenvolvimento

O relatório real está em `docs/ritual/TESTES.md`; evidências brutas e capturas estão ao lado e em `capturas/ritual/`. Não há promessa de teste em telefone físico, Safari/iOS ou leitor de tela manual.

Para repetir a validação comercial:

```sh
node scripts/validate-content.mjs
```

Testes Chromium usam Node22+, Playwright Core e Axe somente como ferramentas externas de desenvolvimento. A variável `PLAYWRIGHT_PACKAGE` aponta para um `package.json` no qual `playwright-core` está instalado; `CHROME_PATH` aponta para o Chromium. A suíte procura Axe em `/tmp/peralta-a11y/node_modules/axe-core/axe.min.js`. Ajuste esse caminho no script se a instalação for diferente.

```sh
node scripts/test-ritual.mjs
```

Firefox usa WebDriver BiDi nativo e o helper em `scripts/lib/firefox-bidi.mjs`; iniciar um perfil de teste separado em porta9227 antes de `node scripts/test-ritual-firefox.mjs`. Essas ferramentas não são requisitos para visitar ou publicar a página estática.

## Preservação

Branch: `reconstruction/arte-do-ritual`. Nenhum commit, merge, push ou deploy foi realizado. As modificações locais anteriores em `preview/` e nas imagens hero-ambiente permanecem preservadas. Geradores antigos estão em `backup/legacy-tools/`, runtime antigo em `backup/legacy-runtime/` e o estado anterior à reconstrução em `backup/ritual-preflight/`. Apenas a arquitetura nova é carregada pelo HTML entregue.

Os plugins originais Taste Frontend, Impeccable UI e Emil Design Engineering foram lidos e aplicados. O Firecrawl estava sem créditos; a pesquisa pública continuou no navegador. Direção, exceções dos detectores, fontes e limitações estão documentadas. O ZIP exclui Git, plugins e versões históricas para manter apenas a entrega utilizável; esses arquivos seguem no repositório.

Desenvolvido por [Murilo Gabriel](https://murilogabriel.com.br).
