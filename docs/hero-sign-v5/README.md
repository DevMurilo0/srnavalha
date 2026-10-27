# Hero Signage V5

A placa substitui o cartão SN no alto à direita do hero. Tabaco, cobre e marfim, moldura interna, espessura de 5 px, fixações e barber pole SVG. Nenhuma imagem ou dependência nova. O letreiro e seus estilos antigos foram removidos integralmente do loader.

A entrada usa somente transform e opacity, por 1050 ms, após `openingend`. Sem loop; o controlador de movimento existente cancela a entrada quando necessário. No celular, a placa recebe uma faixa compacta própria acima da logo: o cartão anterior ficava oculto nesse breakpoint e não havia espaço lateral suficiente para inscrições legíveis. Logo, fotografias e CTA mantêm seus tamanhos. Desktop/tablet não recebem altura adicional.

## Validação executada

- `node scripts/render-site.mjs`: HTML sincronizado.
- `node scripts/test-hero-sign-v5.mjs`: 32/32. Chromium real em modo headless, larguras 320, 375, 390, 430, 768, 1024 e 1440; geometria, inscrições, Axe, sincronização, término da animação, preferência reduzida inicial/dinâmica, ausência de JS e módulo de abertura bloqueado. O ciclo de aba oculta é simulado via `document.hidden` e evento `visibilitychange`.
- `node scripts/test-perfect-cut-v4.mjs`: 37/37; duas tesouras, geometria da incisão, FLIP da logo, interrupções e fallbacks.
- `node scripts/test-booking-wizard.mjs`: 101/101; única expectativa atualizada é a localização do letreiro no hero.
- `node scripts/test-booking-wizard-state.mjs`: 12/12.
- `node scripts/test-reflexo-static.mjs`: aprovado.
- `node --experimental-default-type=module scripts/test-booking-local.mjs`: 10 verificações aprovadas.
- `node --experimental-default-type=module --check`: módulos de `js/ritual/` aprovados.
- `git diff --check`: aprovado.

Capturas `hero-*.png` mostram a composição final com movimento reduzido; `entrance.png` registra a entrada pausada em 420 ms; `loader-390.png` mostra a abertura limpa. Resultados JSON acompanham as capturas. Conferência visual realizada em desktop, tablet e celular. Não foi executada uma rodada em Safari/Firefox nesta alteração.
