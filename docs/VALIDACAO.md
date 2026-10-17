# Verificação da entrega

## Executado neste ambiente
- Verificação de sintaxe em `js/site.js`, `js/reviews.js` e `js/booking.js` (Node `--check`).
- Renderização da interface por Chromium headless via `page.set_content` com CSS/JS e imagens locais incorporados para contornar o bloqueio administrativo de URLs locais.
- Capturas na pasta `preview/` de Home 1440, 390 e 320 px e agendamento 1440, 390 e 320 px.
- Sem overflow horizontal observado nessas seis combinações de página e largura após ajuste do header móvel.
- Sem erros JavaScript observados nas páginas nessas condições.
- Interações verificadas: seleção de serviços, expansão do portfólio, lightbox (abrir, avançar, Escape), menu mobile e geração de URL `wa.me` após escolha de Barba, com nome de teste.
- O mapa externo não pôde ser carregado via Chromium do ambiente; o fallback é disponibilizado e o iframe preserva a URL real da ficha do estabelecimento.

## Não concluído aqui
- O Chromium desta sessão retorna `ERR_BLOCKED_BY_ADMINISTRATOR` ao navegar para `http://127.0.0.1`, portanto não foi possível testar o fluxo final exatamente pelo Live Server.
- Não foi realizado teste real no Firefox, em iOS/Android ou de desempenho de rede.
- Não foi feita auditoria completa WCAG automatizada, e não há compromisso de 60 fps em todos os dispositivos.
- Não foi realizado push para GitHub: acesso de escrita autenticado não disponível no ambiente.
- Os registros fotográficos têm limitações de resolução original; não foi possível adquirir outros arquivos da câmera dos profissionais.

## Para conferir no seu Linux
Abra `index.html` pelo Live Server e teste desktop + telefone no DevTools, hover, clique, rolagem, modal com Escape, detalhes do FAQ, mapa e a mensagem pré-preenchida no WhatsApp. Verifique o desempenho em um notebook real e ajuste dados comerciais se mudaram desde 15/10/2026.