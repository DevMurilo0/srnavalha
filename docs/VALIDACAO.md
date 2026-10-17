# Validação V5

## O que foi executado

- `node --check` nos dois arquivos JavaScript.
- Verificação estática de caminhos locais nas páginas HTML.
- HTTP local (`python3 -m http.server`) retornando 200 para `index.html`.
- Renderização em Chromium via `page.set_content` com CSS e imagens embutidos, pois a política do navegador nesta sessão bloqueia a abertura de `localhost` e `file://` (ERR_BLOCKED_BY_ADMINISTRATOR).
- Verificação de **320, 375, 390, 768, 1024, 1366 e 1440 px**: nenhum overflow horizontal nem erro JS capturado neste modo.
- Teste de seleção dos serviços, abertura da galeria, lightbox, Escape e pausa da esteira.
- Teste da página de agendamento em 390 e 1366 px, validação de campo vazio e do formato do link de WhatsApp.
- Em movimento reduzido, verificadas quatro avaliações (sem clones), controle automático escondido e textos sem ocultação.
- Sem JavaScript, verificados HTML visível e galeria expansível; agendamento oferece link direto no bloco `<noscript>`.

Arquivos de evidência: `capturas/home-1440-viewport.png`, `capturas/home-390-viewport.png`, `capturas/home-{largura}.png`, `capturas/agendar-390.png` e `capturas/agendar-1366.png`. Os PNGs foram capturados por Chromium renderizando a cópia *embutida* do HTML/CSS e fotos; não constituem teste de navegação HTTP pelo Live Server.

## Limitações

- O Chromium local bloqueou navegação a `http://127.0.0.1` e `file://`; não foi possível executar uma inspeção end-to-end exatamente pelo Live Server.
- O iframe do Google Maps não pôde ser carregado no sandbox da prévia. Sua URL foi reutilizada do código público atual do repositório; conferir no navegador do usuário e com rede disponível.
- As fontes Google não carregaram nos screenshots isolados; as imagens foram renderizadas com fontes fallback. No computador com internet, Barlow Condensed e DM Sans devem carregar via CSS.
- A fotografia principal é um derivado disponível no ZIP anterior e não substitui uma foto original de alta resolução.
- Dados comerciais, avaliações e horários precisam ser confirmados antes da publicação.
- Nenhum commit/push foi realizado.

## Integração

Como o repositório remoto não pôde ser baixado diretamente por Git neste ambiente, a implementação é um pacote novo e autônomo. Guarde o repositório atual como backup antes de substituí-lo. A cópia em `backup/` representa o ZIP de 15/10/2026 previamente compartilhado, e **não** a versão mais recente do GitHub.

Os testes automatizados podem ser reproduzidos em um ambiente com Python, Chromium e Playwright pelos scripts `docs/test_inline_preview.py` e `docs/audit.py`. Eles são ferramentas opcionais para manutenção; Live Server não requer Python ou Node.
