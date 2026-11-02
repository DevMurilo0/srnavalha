# Motion states — Sr. Navalha

## Causas verificadas

- `motion-armed` só existia depois da execução do módulo; fotografias e embalagens não tinham estado pré-observação. O primeiro keyframe de várias entradas tinha opacidade parcial (.2–.35).
- O título era dividido em inline-blocks durante a entrada e reconstruído no fim, alterando kerning e geometria durante a apresentação.
- A abertura usava duas navalhas, retângulos já transformados, um timer de partida e encerramento CSS independente do carregamento e da viagem.
- O parallax podia atualizar o destino durante o voo. A primeira rodada mediu um salto de 3,21 px em 1366 px. O destino agora fica fixo até a conclusão.
- Retratos tinham transições CSS de transform concorrendo com WAAPI.
- Monogramas decorativos nos templates ativos e dois fallbacks antigos.

## Implementação

HTML gerado com `data-reveal="pending"`, opt-in síncrono no head, estados pending/playing/done e animações com fill both. Sem JavaScript ou recursos de animação, a página é visível por padrão. Watchdog de inicialização, tempo limitado de decode, recuperação de observação perdida, cancelamento por foco, resize, movimento reduzido e aba oculta.

Títulos mantêm seus nós originais no fluxo/acessibilidade. Letras decorativas aria-hidden são posicionadas por Range e removidas ao concluir; o original não é substituído. Fontes locais pré-carregadas usam font-display optional para evitar trocas tardias em redes lentas. Fotografias têm entrada no contêiner e parallax em outra camada. Produtos aguardam decode com prazo e usam rotação/desaceleração com delay curto e opacidade zero.

Uma única imagem da navalha é movida para uma camada fixa e devolvida ao mesmo pai ao terminar. A geometria, a sombra e o asset são os mesmos. As superfícies mineral/carvão revelam o hero; a marca é a logo oficial.

## Evidência visual

- [Antes: título visível antes do módulo](before-before-module.png)
- [Depois: título e retrato aguardam ocultos](after-before-module.png)
- [Abertura desktop: marca e navalha](razor-1440-300.png)
- [Abertura desktop: chegada](razor-1440-1549.png)
- [Imediatamente após a chegada](razor-1440-landed.png)
- [Abertura mobile](razor-390-300.png)
- [Equipe: estado estável](team-final.png)
- [Medições da transferência](geometry.json)
- [Resultados automatizados](results.json)

Arquivos JPG identificam seletor, largura e tempo da animação (0, 80, 120, 180, 450, 990 e 1100 ms). `intro-*` são amostras em tempo real. `razor-*` e as séries por seletor são capturas com WAAPI pausada e tempo controlado. O capturador estende os watchdogs apenas dentro do navegador de captura; o teste temporal usa os prazos reais de produção.

## Reprodução

Servidor: `python3 -m http.server 8047`.

- `node scripts/test-motion-states.mjs`: amostra cada requestAnimationFrame, opacidade pending/delay, geometria de chegada, CLS, overflow, acessibilidade e recuperação; viewports 320, 390, 768, 1366, 1440.
- `node scripts/capture-motion-frames.mjs`: sequência temporal desktop/mobile.
- `node scripts/test-the-cut-motion.mjs`: parallax, equipe, produtos e catálogos.
- `node scripts/test-booking-wizard-state.mjs`: regressão do fluxo de agendamento.

A regressão geral passou em 60/60 verificações; a regressão de movimento em 44/44; o wizard em 13/13 e a lógica local em 10/10. A suíte temporal final passou em 67/67 verificações, com CLS 0 nos cinco viewports; resultados em results.json. A rodada de rede lenta encontrou uma espera de fontes repetida por seção, corrigida com um único prazo compartilhado.

Os scripts usam Playwright já instalado no ambiente de validação, sem adicionar dependência ao site.

## Limites da validação

Ensaio adicional com CPU 4×, latência de 150 ms e download de 150 kB/s: 766 frames amostrados, zero flashes pending, CLS 0 e zero overflow (throttled.json). Não é um benchmark de FPS.

Chromium headless em Linux, sem ensaio em aparelho físico ou Safari. Mudança de aba simulada por visibilitychange; rede lenta por atraso das respostas de imagens/fontes. Não equivale a medir FPS em celular modesto. Fontes extremamente lentas podem usar a fonte de fallback naquela visita, sem troca tardia. Assets que falham mantêm o conteúdo/alternativo acessível e não bloqueiam a página.
