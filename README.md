# Sr. Navalha · V17

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

## V17

Abertura com placa gravada e máscara sobre o hero; tipografia por palavras e variantes por seção; oito vetores originais; Painel de Profissionais coordenando retrato, nome e régua; Álbum de Estilos que reorganiza as seis fotos entre folhas e parede com FLIP. Espelho e produtos mantêm a fotografia anterior durante a troca. Rolagem nativa, estados interrompíveis e pausa dos efeitos fora de vista.

O agendamento está em uma versão frontend de demonstração com horários fictícios e salvamento local no navegador. Nenhuma reserva é enviada à barbearia. Produtos continuam consultando disponibilidade pelo WhatsApp.

## Abertura harmoniosa · V22 (23/10/2026)

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
