# Sr. Navalha — Correção pontual V10

A atualização **NÃO substitui a Home nem as seções do site**. Ela se aplica sobre a sua versão V9 mais recente do GitHub e substitui **apenas o cabeçalho e o hero**, acrescentando um único arquivo de animação de palavras (progressivo e acessível). Mantém todo o restante do HTML/CSS e todos os dados comerciais exatamente como estão.

## Instalação no Linux / VS Code

1. Faça uma cópia do projeto ou mantenha o backup que você já fez.
2. Extraia este ZIP em qualquer pasta.
3. Abra um terminal **na pasta extraída**.
4. Execute:

```bash
python3 APLICAR_CORRECAO_V10.py ~/Dev/andamento/srnavalha
```

5. Abra o `index.html` da sua pasta `srnavalha` no VS Code → **Open with Live Server**.

O instalador cria um backup dos arquivos originais ao lado do repositório e gera também `srnavalha-V10-completo.zip` com **todos os arquivos do seu projeto**, sem `node_modules`, caches e artefatos de teste. Se sua pasta tiver outro caminho, substitua o argumento pelo caminho correto.

Para testar o reconhecimento de arquivos sem alterar nada:

```bash
python3 APLICAR_CORRECAO_V10.py ~/Dev/andamento/srnavalha --dry-run
```

## Alterações exatas

- `index.html`: somente o `<header>` e a seção que antecede `<section class="services paper section">` (hero), mais 2 tags de recursos no `<head>`;
- `js/site.js`: desliga somente `initHero()` e `initOpening()` antigos (dependem do hero removido), mantém todas as outras funções;
- `scripts/build-v9.mjs`: aplica também a nova composição quando alguém executa o gerador opcional;
- novos arquivos: `css/hero-pontual-v10.css`, `js/hero-pontual-v10.js`, fotografia WebP e tipografia Noto Serif Display via Google Fonts, com fallback Georgia.

Serviços, equipe, produtos, portfólio, avaliações, mapa, agendamento e rodapé **não são reescritos**. Logotipo original continua no cabeçalho e no rodapé, sem duplicar no conteúdo do hero.

## Fotografia

O fundo segue a referência visual aprovada e usa o recurso anterior em 1672 px, com uma versão WebP de 2048 px com correção conservadora de contraste, cor e nitidez. **Ampliar pixels não recupera detalhes originalmente ausentes**. Para qualidade fotográfica significativamente superior, substitua por uma fotografia original do ambiente em alta resolução. Este recurso não deve ser descrito como registro fotográfico não modificado.

## Fonte

**Noto Serif Display Medium**, família tipográfica real do Google Fonts, carregada pelo navegador com fallback Georgia, usada **somente no título do hero**. Nenhum arquivo de fonte adicional é distribuído; demais fontes do site permanecem inalteradas.

## Animações

- Entrada editorial coordenada de cada linha do hero e dos elementos de apoio;
- Zoom/deslocamento suave na fotografia limitado ao avanço da rolagem;
- Revelação de palavras por blocos em outras seções ao entrarem na viewport (sem alterar os dados e a semântica);
- Sem dependência de React/npm ou smooth-scroll artificial;
- Respeita `prefers-reduced-motion`; sem JS todo conteúdo permanece visível.

## Validação local desta entrega

Apliquei o instalador a uma estrutura de teste representativa da V9. Foram verificados sete tamanhos (320, 375, 390, 768, 1024, 1366 e 1440 px), com **zero overflow horizontal e zero exceções JavaScript**, e o fallback tipográfico. O acesso do Chromium a URLs locais está bloqueado neste ambiente; a prévia foi inspecionada por HTML/CSS/JS incorporados em uma página de testes. Ainda é necessário conferir a atualização aplicada ao repositório completo pelo Live Server.
