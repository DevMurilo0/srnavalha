# Validação da segunda edição

Servidor usado: HTTP estático local (Python), equivalente à entrega de arquivos pelo Live Server. Navegador: Chromium via Playwright já disponível no ambiente de teste; nenhuma dependência foi instalada no projeto.

| Largura | Home | Agendamento completo | Menu / galeria / FAQ | Overflow horizontal | Erros de console |
| --- | --- | --- | --- | --- | --- |
| 320 px | Passou | Passou | Passou | Ausente | Nenhum |
| 375 px | Passou | Passou | Passou, incluindo swipe | Ausente | Nenhum |
| 768 px | Passou | Passou | Passou | Ausente | Nenhum |
| 1440 px | Passou | Passou | Passou, incluindo arraste com mouse | Ausente | Nenhum |

Verificações:

- Imagens locais carregadas/decodificadas e fontes Manrope e Barlow Condensed disponíveis.
- Revelações com opacidade final visível e header reagindo à rolagem.
- Carrossel com posição intermediária medida durante o movimento, setas, extremos, Home/End, arraste e toque.
- Menu com painel cobrindo a área disponível, troca correta dos ícones, foco, fundo `inert`, fechamento por Escape e navegação por âncora.
- FAQ com expansão e recolhimento, incluindo mudança de altura.
- Agendamento: seleção, calendário, navegação de meses, horário, bloqueio dos dados incompletos, máscara do WhatsApp, revisão, retorno preservando dados, finalização explicitamente demonstrativa e reinício.
- `prefers-reduced-motion` ao carregar e ao mudar a preferência: conteúdo visível, parallax/entrada desativados e carrossel funcional.
- JavaScript desativado: Home e cinco imagens da galeria visíveis, navegação alternativa e orientação do agendamento disponíveis.
- Créditos presentes nas duas páginas. O clique em Murilo Gabriel abriu `https://www.murilogabriel.com.br/` em nova aba com `window.opener === null`.
- Instagram, Google Maps e portfólio retornaram HTTP 200 na conferência externa. A resposta HTTP do Google não comprova autoria de avaliações; ver `AVALIACOES.md`.
- Auditoria de arquivos locais e âncoras: nenhum asset ausente e nenhuma âncora interna quebrada.
- Sintaxe dos cinco arquivos JavaScript verificada com `node --check`, somente como ferramenta de desenvolvimento. Node não participa da execução do site.
- Conferência final após alinhamento dos cards: alturas iguais nos grids de tablet/desktop, rodapé/crédito visíveis, todas as revelações concluídas e capturas completas em quatro larguras.

A amostra de carregamento inicial transferiu aproximadamente 648 KB, com 342 elementos no DOM e nenhuma requisição externa necessária ao funcionamento. Não há autoplay, dependência CDN ou loop contínuo de animação. Esse registro indica o peso observado no teste local, não uma pontuação Lighthouse ou uma medição de FPS em aparelhos reais.

Resultados detalhados: `VALIDACAO_REFINAMENTO.json`. Capturas: `../capturas/refinamento-v2/`. Para documentar páginas completas, as capturas carregam também imagens lazy fora da faixa visível da galeria e tornam elementos sticky estáticos apenas no contexto da captura. Os testes funcionais utilizam os estilos normais.

Limites: não foram feitos testes em Safari/Firefox nem em hardware móvel físico. Toque foi verificado por emulação e eventos reais de toque enviados ao Chromium. O site continua sem backend e sem reservas reais.
