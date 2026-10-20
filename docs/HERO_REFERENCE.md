# Hero conforme a referência aprovada

Referência visual: `assets/herosrnavalha.png`, **1672 × 941 px**, aberta integralmente antes da implementação. A imagem define a composição; não foi usada como fundo, recorte de interface ou substituto do HTML. O título permanece “Seu corte começa aqui.”, com descrição e destinos reais preservados.

## Composição e comparação

| Antes | Depois | Motivo |
|---|---|---|
| Menu encostado nas bordas; marca com placa retangular | Navegação nos eixos da referência, marca central com recorte do arquivo original | Reproduzir os alinhamentos aprovados |
| Segunda linha sem itálico; apoio e ações pequenos | Bodoni Moda regular/itálico local; descrição de 24 px e CTA de 324 × 67 px em 1672 px | Aproximar contraste, desenho e escala da tipografia |
| Hero ultrapassava a altura da referência; faixa com filete horizontal extra | Hero de 941 px na viewport 1672 × 941, diferenciais junto à base com divisórias verticais | Corrigir proporção e posicionamento |
| Regras V10 e V11 sobrepostas | Folha específica consolidada, sem alterar estilos das outras seções | Tornar medidas e breakpoints previsíveis |
| Entrada e scroll escreviam no transform da fotografia | Uma sequência de entrada; scroll nativo mantém o enquadramento estável | Evitar conflitos e salto ao terminar a animação |

Na captura final desktop, o cabeçalho mede 108 px; o centro da marca fica em x=836; o CTA principal inicia em x=85,3 / y=668,3, mede 324,4 × 67 px; a referência apresenta aproximadamente x=85 / y=666 e 325 × 67 px. A faixa inferior ocupa y=853–899. Foram revisados visualmente `antes-1672.png`, `round-1-1672.png` e `final-1672.png`, além das capturas 390/320 e dos estados intermediários. A segunda rodada corrigiu escala do título, posição do convite, máscara da marca e separação das frases mobile. Uma conferência adicional corrigiu o fragmento da legenda da marca e elevou legendas mobile para 13 px.

Capturas em `capturas/hero-reference/`:

- `referencia-e-resultado.png`: referência à esquerda e página renderizada à direita, na mesma resolução.
- `final-1672.png`: desktop final.
- `final-mobile-390.png` e `final-mobile-320.png`: mobile final após a revisão de legibilidade.
- `entrada-*-0.png`, `entrada-*-600.png`, `entrada-*-950.png`: amostras dos próprios efeitos WAAPI pausados em pontos conhecidos, para examinar máscaras e sobreposições.
- `entrada-tempo-real-600.png`: abertura executada normalmente, sem pausar a timeline.

## Fotografia, marca e fontes

Fundo limpo existente: `assets/images/hero-ref-v10.webp` (**2048 × 1017**, 190.104 bytes), com a variante existente `hero-ref-mobile-v10.webp` (**960 × 879**). O desktop mantém o enquadramento abaixo dos 108 px do cabeçalho, aproximando as posições das luminárias, do relógio e dos espelhos. O mobile utiliza a variante própria e enquadramento a 66%, com proteção de contraste. Nenhum pixel de texto ou botão da referência integra o fundo.

**Limitação fotográfica:** o arquivo limpo já presente não é idêntico ao fundo da referência: há diferenças no lado esquerdo, nas pessoas, na nitidez e em detalhes do ambiente. Não foi localizado nos assets um original limpo que reproduza todos esses pixels. A proveniência documental desse derivado anterior não foi revalidada nesta tarefa. Não houve geração, reconstrução de rostos/arquitetura ou upscale novo. A variante reamostrada de 3840 px foi preservada no disco, mas saiu do carregamento. Para igualdade fotográfica seria necessário o original limpo exato utilizado na composição aprovada.

A marca do cabeçalho reutiliza `assets/images/v9/logo.webp` dentro de SVG com máscara e tratamento de transparência; suas letras não foram redesenhadas. Filetes e pequenos ornamentos são SVG/CSS. A abertura usa a logo original completa. Logos do rodapé e de agendamento permanecem intactas.

Fonte escolhida por semelhança, sem alegação de identificação exata: **Bodoni Moda**, peso 500, normal e itálico, desenho óptico de display. Os arquivos locais totalizam cerca de 90 KB. A licença SIL Open Font License está em `assets/fonts/OFL-BodoniModa.txt`. Fontes: [Google Fonts](https://github.com/google/fonts/tree/main/ofl/bodonimoda), [licença original](https://github.com/google/fonts/blob/main/ofl/bodonimoda/OFL.txt). Manrope local continua no apoio. A página não depende de Google Fonts em tempo de execução.

## Abertura

`js/hero-v11.js` controla uma única sequência com um início comum (`document.timeline.currentTime`):

1. Superfície escura, marca original central e filete breve.
2. Aos 250 ms, a máscara da superfície começa a liberar a fotografia; duração de 760 ms.
3. Linhas do título entram por máscaras aos 420/505 ms; descrição aos 630 ms.
4. Ações e faixa de diferenciais entram aos 700 ms. O movimento termina em até 1,4 s.

A fotografia muda apenas 1,8% durante a entrada. Não há bounce, rotação ou zoom contínuo. Teclado, foco, ponteiro e scroll interrompem a sequência e mostram o estado final imediatamente. Nenhuma ação espera uma animação terminar. O script não aguarda todas as imagens; há preload somente dos recursos essenciais, timeout JS de 1,7 s e salvaguarda CSS de 1,8 s para a cortina. Estados base já são visíveis, sem classe que oculte permanentemente conteúdo. Movimento reduzido inicial pula a abertura; alteração dinâmica cancela os efeitos. Aba oculta e saída da página fazem cleanup. Retorno via cache de navegação mantém o conteúdo visível.

## Integração e escopo

Fontes canônicas: `scripts/v11-templates/header.html`, `hero.html` e `head.html`. O `scripts/build-v9.mjs` utiliza `hero-v11-patch.mjs` para aplicar esses templates. Gerar novamente produziu bytes idênticos. O instalador `APLICAR_HERO_V11.py` também lê os mesmos templates, inclui as fontes/licença e foi verificado em dry-run e por idempotência. As cópias anteriores em `templates/` foram mantidas sincronizadas.

Backup anterior à intervenção: `backup/hero-reference-preflight/`. Alterações locais encontradas foram preservadas. O HTML a partir de Serviços é **byte a byte idêntico** ao backup. Nenhuma mudança em `js/site.js`, módulos de catálogo, dados, agendamento ou estilos das demais seções. A referência PNG e os arquivos de imagem já existentes não foram alterados. Sem commit/push.

## Validação

- Chromium real, servidor HTTP estático temporário compatível com Live Server: **1672 × 941, 1440 × 900, 768 × 900, 390 × 844 e 320 × 844**. Título, CTA e imagem carregados, sem overflow horizontal. Relatórios `HERO_REFERENCE_final.json` e `HERO_REFERENCE_final-mobile.json`.
- **20/20 verificações de motion/interação**: abertura ativa e estado final nos três tamanhos principais, atualização, Tab, menu, Escape/foco, âncora Serviços, scroll/retorno, movimento reduzido inicial/dinâmico, sem JS, falha de imagem, fontes locais, URLs AppBarber e ausência de exceções JavaScript. `HERO_REFERENCE_MOTION.json`.
- O teste dinâmico sincroniza a troca de preferência com os frames do navegador: a primeira sondagem imediata após navegação era prematura. Reexecução sincronizada e teste independente confirmaram cancelamento.
- Axe-core 4.10.3, escopo header + hero, 1672/390/320: **zero violações detectadas**. `HERO_REFERENCE_ACCESS.json`. Verificação realizada antes do aumento final das legendas mobile; cores, semântica e alvos não mudaram, e o novo layout móvel foi verificado separadamente.
- Sintaxe JS, gerador idêntico, instalador idempotente, caminhos locais do hero presentes e diff sem whitespace inválido. `HERO_REFERENCE_INTEGRATION.json`.
- Taste lint e inspector foram executados. Seus gates estilísticos **não estão integralmente aprovados**: rejeitam filetes, etiqueta superior, paleta quente, itálico e faixa de ícones que pertencem explicitamente ao design aprovado; também avaliam seções fora do escopo. A referência do usuário prevaleceu. O alerta de legendas pequenas no mobile foi corrigido para 13 px. A indicação de ausência de hero em 320 px não corresponde às capturas dedicadas e medições do título. Relatórios `HERO_REFERENCE_TASTE*.txt`.
- O launcher de contexto do Impeccable retornou Permission denied; as diretrizes originais e o contexto local foram lidos diretamente. Emil orientou a sequência, interrupção e cleanup; Taste orientou a comparação visual, sem sorteio de nova direção artística.

Limites: sem novo teste Firefox, Safari/iOS, telefone físico ou leitor de tela manual nesta intervenção. A auditoria identificou dois arquivos **já ausentes antes** no portfólio (`work-corte-cacheado.webp`, `work-corte-perfil.webp`); essa condição permanece documentada, pois a tarefa restringiu mudanças ao cabeçalho/hero/abertura. Os resultados antigos de outras versões não foram apresentados como testes desta implementação.

Reprodução: `CHROME_PATH=/caminho/do/chrome node scripts/test-hero-reference.mjs final` e `node scripts/test-hero-reference-motion.mjs` com a mesma variável. O teste de acessibilidade aceita `AXE_PATH=/caminho/axe.min.js` (4.10.3). Não é necessário npm, React ou servidor de build para visualizar o site.
