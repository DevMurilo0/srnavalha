# Sr. Navalha · O Reflexo do Ritual

Site estático da Barbearia Sr. Navalha, no Prado, Gravatá–PE. Fotografias, marca, serviços, equipe, produtos, avaliações e destinos comerciais reais preservados.

## Abrir

Use **Open with Live Server** em `index.html`. Não precisa instalar dependências, rodar `npm run dev` ou gerar o site. Os módulos JavaScript precisam de HTTP; `file://` não substitui Live Server.

Alternativas opcionais:

```sh
python3 -m http.server 8047
```

ou:

```sh
PORT=8047 node scripts/serve.mjs
```

Abra `http://127.0.0.1:8047/`. O pacote `entrega/sr-navalha-v17-live-server.zip` contém uma pasta pronta para extrair. O pacote anterior permanece preservado.

## Reconstrução de motion · 26/10/2026

A fotografia e a marca reais se acomodam no hero; rolagem nativa sem cálculos de geometria por frame; entradas com concorrência limitada; oito passagens simplificadas. Sem dependências de runtime. Agendamento local e registros de teste preservados.

[Relatório, referências e comparação medida](docs/reflexo/RELATORIO.md). A fonte continua em `templates/v17/`; `node scripts/render-site.mjs` produz o mesmo `index.html`.

Verificações atuais:

```sh
node scripts/test-reflexo-static.mjs
node --experimental-default-type=module scripts/test-booking-local.mjs
PLAYWRIGHT_PACKAGE=/tmp/srnavalha-validation/package.json node scripts/test-reflexo.mjs
PLAYWRIGHT_PACKAGE=/tmp/srnavalha-validation/package.json node scripts/test-reflexo-resilience.mjs
PLAYWRIGHT_PACKAGE=/tmp/srnavalha-validation/package.json node scripts/profile-ritual.mjs after
```

`CHROME_PATH` e `PLAYWRIGHT_PACKAGE` permitem outros executáveis/instalações. Os testes Chromium usam `playwright-core` e `@axe-core/playwright` como ferramentas externas, sem alterar a entrega Live Server. Firefox: servidor BiDi com perfil isolado e `FIREFOX_PORT=9241 node scripts/test-reflexo-firefox.mjs`.

## Histórico V17



Abertura com placa gravada e máscara sobre o hero; tipografia por palavras e variantes por seção; oito vetores originais; Painel de Profissionais coordenando retrato, nome e régua; Álbum de Estilos que reorganiza as seis fotos entre folhas e parede com FLIP. Espelho e produtos mantêm a fotografia anterior durante a troca. Rolagem nativa, estados interrompíveis e pausa dos efeitos fora de vista.

O agendamento está em uma versão frontend de demonstração com horários fictícios e salvamento local no navegador. Nenhuma reserva é enviada à barbearia. Produtos continuam consultando disponibilidade pelo WhatsApp.

## Movimento autoral · V23 — O Primeiro Traço (24/10/2026)

A abertura V22 anterior foi **substituída integralmente** por um prólogo novo, inspirado no gesto preciso de uma navalha: a marca oficial surge no ateliê escuro; um traço de cobre se desenha; duas superfícies se afastam lateralmente e revelam a homepage. Não há porcentagem de carregamento falsa nem dependências de animação.

**Oito transições de capítulo** também foram recriadas, com layouts editoriais novos e diferentes entre A Casa, Serviços, Equipe, Trabalhos, Produtos, Avaliações, Localização e Rodapé. Cada passagem usa formas, tipografia e emblemas SVG autorais. O gatilho `IntersectionObserver` faz as passagens aparecerem antes de entrarem na área visível, sem recalcular parallax em cada evento de scroll.

As animações de títulos, molduras e textos foram atenuadas para reduzir saltos e movimentos de perspectiva. A implementação prefere `transform`, `opacity` e `translate` nas superfícies móveis. Não usa GSAP, WebGL, canvas ou bibliotecas externas. A navegação continua nativa e o sistema de agendamento local permanece intocado.

Arquivos principais: `templates/v17/loader.html`, `templates/v17/{inicio,casa,servicos,equipe,trabalhos,produtos,avaliacoes,localizacao}.html`, `index.html`, `js/ritual/opening.js`, `js/ritual/scene-cuts.js`, `js/ritual/motion.js` e `css/ritual/first-cut-v23.css`. `css/ritual.css` removeu os imports dos estilos antigos da cortina e dos interlúdios, mas preserva o restante do design.

A intro admite pular pelo botão, pelas teclas ou pela rolagem; não atrapalha âncoras e desativa movimento com `prefers-reduced-motion`. Fallback automático se a animação não finalizar. Os capítulos nunca dependem do efeito para mostrar informação vital: são decorativos e `aria-hidden`.

**QA final a executar no navegador:** F5 / Ctrl+Shift+R, abertura com conexão lenta, botão pular, rolagem enquanto abre, voltar do histórico, deep link `#servicos`, telas 320/375/390/768/1024/1440 px e preferência por movimento reduzido. Validação estática de sintaxe, HTML e preservação dos links já realizada. Os testes visuais em navegador real precisam ser confirmados antes de publicar na `main`.

**Referências (inspiração, não cópia):** Codrops “R—K ’26: The Thinking and Code Behind a Portfolio Led by Presence” (2026), guia de animações de alta performance do web.dev e padrões de respeitar movimento reduzido da MDN.

## Histórico: abertura anterior V22 (substituída)

A animação inicial foi simplificada a partir de referências de transições editoriais (Codrops) e das recomendações de performance do web.dev. Mantém a marca real no centro e revela a homepage com **uma cortina que sobe por `transform`**, seguida por uma entrada discreta do hero (`opacity` + `transform`), em vez de animar várias máscaras `clip-path` e fotografias simultaneamente.

Arquivos ativos: `js/ritual/opening.js`, `css/ritual/loader-harmony-v22.css`, `css/ritual.css`, `templates/v17/head.html`, `templates/v17/loader.html` e `index.html`. O CSS V22 vem por último na cascata e substitui apenas o comportamento da abertura, preservando os demais capítulos e recursos do site.

A abertura reinicia após F5, aceita interrupção por interação, é omitida para âncoras internas e com `prefers-reduced-motion: reduce`, e tem salvaguarda para liberar conteúdo se o JavaScript falhar. O `js/ritual/app.js` inicializa primeiro somente a coreografia e os elementos visuais necessários; catálogo, equipe, álbum, galeria, produtos e mapa entram após o término da cortina para reduzir trabalho inicial na thread principal. Verificação manual recomendada em 320, 375, 390, 768, 1024, 1366 e 1440 px; testar F5, Ctrl+Shift+R, retorno pelo navegador, scroll durante a abertura e redução de movimento.

## Agendamento próprio — protótipo frontend local (23/10/2026)

O cliente pode testar o fluxo em `agendar.html`: selecionar serviço (42 itens do catálogo), profissional (cinco nomes reais), dia, horário ilustrativo e preencher dados de exemplo. A simulação gera um código e pode ser visualizada ou excluída na lista de registros do mesmo navegador.

**Tudo funciona sem Supabase, sem backend e sem dependências externas de agendamento.** Os dados são mantidos em `localStorage`, com chave `srnavalha:agendamentos-demo:v1`, apenas para experimentar a interface. Os horários configurados são **fictícios** (segunda a sábado, 9h–12h e 14h–19h) e não indicam vagas reais. **Não há confirmação, envio ou recebimento pela barbearia.**

Arquivos: `agendar.html`, `css/agendar.css`, `js/agendar.js`, `js/booking-local.js`. Instruções de teste e limites: `docs/AGENDAMENTO_PROPRIO.md`. O painel admin ficará para outra fase.

## Editar

- `templates/v17/`: fonte canônica dos parciais HTML. `node scripts/render-site.mjs` monta opcionalmente o `index.html`, já entregue pronto.
- `css/ritual/`: tokens, base, cabeçalho, hero, seções, rodapé, ornamentos, painel de equipe, álbum e motion; entrada única `css/ritual.css`.
- `js/ritual/`: núcleo WAAPI, abertura, orquestração de cenas e interações de cada componente.
- `js/data/`: conteúdo comercial e origens. Alterações de conteúdo devem ser refletidas também nos parciais estáticos correspondentes.
- `assets/decor/v17/`: vetores originais; `assets/fonts/`: Sora e Manrope locais com licenças; `assets/originals/`: originais preservados.
- `scripts/history/` e `templates/ritual/`: ferramentas/fontes históricas, sem participação no runtime ativo.

## Acessibilidade e fallback

Menu e expansão do catálogo usam elementos nativos. Sem JavaScript, fotografias e produtos mantêm links reais. O script acrescenta filtros, seleções, lightbox e coreografia. Movimento reduzido elimina a abertura e mantém os componentes funcionais com troca direta. A esteira possui pausa por botão, foco e hover; vídeo e movimentos decorativos pausam fora de vista e com aba oculta.

## Documentação e testes

[Direção e motion V17](docs/DIRECAO_MOTION_V17.md), [relatório executado](docs/v17/TESTES.md), [antes/depois](capturas/v17/comparacao.html), [sistema visual](DESIGN.md) e [produto](PRODUCT.md).

Chromium: 46/46 verificações. Firefox: 24/24. Larguras 320, 375, 390, 768, 1024, 1366 e 1440 px. Capturas e dados intermediários em `capturas/v17/motion/` e `docs/v17/motion-evidence.json`. Limitações e alertas das ferramentas constam no relatório, sem equivaler testes automáticos a certificação.

Ferramentas de desenvolvimento opcionais: Node22+, Playwright Core e Axe. `PLAYWRIGHT_PACKAGE` aponta para um `package.json` onde Playwright Core está instalado; `CHROME_PATH` aponta para o executável Chromium; `AXE_PATH` aponta para `axe.min.js`. Os caminhos padrão dos scripts refletem o ambiente usado nesta entrega.

```sh
node scripts/test-v17.mjs
node scripts/capture-motion-v17.mjs
```

Firefox usa `scripts/lib/firefox-bidi.mjs`, com Firefox headless em `--remote-debugging-port 9237` e perfil isolado; `FIREFOX_PORT` permite outro porto.

```sh
node scripts/test-v17-firefox.mjs
```

## Conteúdo

A integridade foi comparada ao commit `554e5e2`: 42 serviços, planos, 22 produtos, cinco profissionais, quatro depoimentos, mapa, agendamento e 35 imagens do conteúdo principal. Os preços e números de avaliações continuam snapshots datados dos documentos de origem, não disponibilidade em tempo real. Inventário e fontes comerciais: `docs/ritual/IMAGENS.md`, `inventario-imagens.json` e documentos de coleta nessa pasta.

Desenvolvido por [Murilo Gabriel](https://murilogabriel.com.br).
