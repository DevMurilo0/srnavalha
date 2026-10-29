# Validação final V6 — 29/10/2026

A V6 local foi recuperada no commit `dfccce2`. Após consultar o remoto, os 19 commits descendentes até `f5cba80` foram integrados por fast-forward, sem conflitos nem descarte de implementação. A main não foi modificada.

## Resultados desta execução

Chromium Headless Shell 153, via Playwright, com servidor HTTP local. Suítes executadas em sequência na rodada conclusiva.

| Suíte | Resultado |
| --- | --- |
| test-experience-v6.mjs | 46/46 |
| test-perfect-cut-v4.mjs | 39/39 |
| test-reflexo.mjs | 64/64 |
| test-reflexo-resilience.mjs | 11/11 |
| test-booking-wizard.mjs | 101/101 |
| test-booking-wizard-state.mjs | 12/12 |
| test-reflexo-static.mjs | aprovado |
| test-booking-local.mjs | 10 verificações aprovadas |

Os JSON correspondentes estão nos diretórios experience-v6, perfect-cut-v4, reflexo/validation e booking-v5. Axe WCAG A/AA sem violações em reflexo/validation/axe.json.

## Ajustes finais

- Duas legendas pequenas dos divisores de produtos e localização receberam a cor existente `--wood`, corrigindo contraste AA sem alterar sua composição.
- A regressão de navegação isola o mapa externo e continua verificando iframe e link de rota.
- As âncoras aguardam a posição real do capítulo antes da medição; a ausência do loader continua obrigatória.
- A mudança de movimento reduzido aguarda reconhecimento do controlador antes de exigir zero animações em execução.
- A matriz do hero inclui 360px, além de 320, 390, 430, 768, 1024 e 1440px.
- O CI passa a recolher também checks.json, axe.json e resilience.json.

## Experiência preservada e evidências

Carregamento completo, corte, remoção do loader, openingend completed:true e queda independente com dois rebotes decrescentes foram verificados. Geometria final, logo única, inclinações das fotos, rotação independente, pausas por visibilidade, movimento reduzido e recuperação de falhas passaram. Menu, galeria, filtros, produtos, cópia acessível do endereço e agendamento local continuam funcionais.

Foram inspecionadas capturas do hero nas sete larguras e de casa, galeria, produtos, localização e rodapé no mobile, além do corte e rebote. A nova captura hero-360.png é versionada. Para evitar churn binário, as demais capturas históricas foram preservadas no Git; as capturas regeneradas e relatórios desta rodada estão no arquivo local `/tmp/sr-v6-release-2026-10-29.tar.gz`.

A resiliência executou 30 ciclos em aproximadamente 152 segundos: 174 listeners estáveis após aquecimento, oscilação de dois nós e um retrato ao final das seleções. Rede móvel simulada, toque sintetizado e rotação passaram.

## Limites

Validação em Chromium e viewports emuladas; não substitui testes em aparelhos físicos ou outros motores. A disponibilidade real do mapa externo não foi medida. O agendamento segue como demonstração local, sem backend. As tentativas preliminares com suítes simultâneas tiveram timeouts e não foram consideradas aprovação; os resultados acima vêm das execuções conclusivas. O status remoto do CI é independente destes resultados locais.
