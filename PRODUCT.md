# Sr. Navalha

Barbearia no bairro Prado, em Gravatá–PE. O site apresenta profissionais, serviços, produtos, trabalhos reais, avaliações e informações para a visita. A ação principal é abrir o agendamento oficial: https://sites.appbarber.com.br/srnavala-pqjj. WhatsApp é canal de conversa e consulta de produtos; o site não confirma reservas.

A V9 foi autorizada como reconstrução visual: carvão, marfim e cobre substituem a paleta anterior, com o logo original, fontes locais Manrope e Young Serif, fotografias oficiais e hero cinematográfico em moldura de espelho e narrativa de scroll. A especificação atual está em `DESIGN.md` e `.impeccable/design.json`; registros V6 são históricos.

## Conteúdo e confiança

O catálogo estático reúne 42 serviços, assinaturas e 22 produtos, com nomes, valores e durações do AppBarber consultados em 17/10/2026. A equipe reúne Damião, Eduardo, Kauã, Rafael e Yan. A consulta não representa disponibilidade de horários, estoque ou condições contratuais em tempo real. Procedimentos com valor variável preservam “a partir de” ou “sob consulta”. Itens sem foto oficial usam apresentação tipográfica explícita.

Fotografias do catálogo AppBarber e do acervo local devem manter sua proveniência. A antiga fotografia do interior tem apenas 246×148px e permanece como apoio pequeno; não autoriza ampliações, invenção do ambiente ou geração de clientes e profissionais. Logo, contato, endereço, links de origem das avaliações e crédito do site devem ser preservados.

Nota e total de avaliações são um retrato datado em 17/10/2026; os textos de depoimentos são do acervo de 15/10/2026 e têm links individuais. Horários publicados e facilidades informadas devem manter atribuição e convite à confirmação quando necessário. Não inventar prêmios, métricas, depoimentos ou promessas comerciais.

## Implementação e acesso

HTML, CSS e JavaScript nativos, compatíveis com servidor estático/Live Server, sem backend e sem build obrigatório. Tokens e estilos atuais: `css/tokens.css`, `css/site.css`, `css/motion.css`; interações: `js/site.js` e módulos `js/motion/`. Dados e conteúdo essenciais permanecem no HTML, com detalhes nativos e links diretos.

Filtros, retratos, produtos, visualizador, esteira e mapa são melhorias progressivas. Preservar navegação por teclado, foco visível, nomes acessíveis, retorno do foco e suporte inicial/dinâmico a `prefers-reduced-motion`. A passagem da fotografia do hero até a apresentação tem composições próprias desktop e mobile; não pode impedir leitura, consulta ou agendamento.
