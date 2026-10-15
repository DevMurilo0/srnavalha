# Refinamento da versão estática — segunda edição

A implementação principal continua em `index.html` e `agendar.html`, com HTML, CSS e JavaScript locais. Abra `index.html` com Live Server. Não há build, dependência npm ou biblioteca via CDN.

## Composição e identidade

- Hero com derivado visual mais definido da fotografia existente, enquadramento responsivo, contraste mais controlado, texto lateral legível, linhas finas e grão discreto.
- Logo derivada com fundo transparente e mais definição, aplicada sem os antigos modos de mistura/contraste que prejudicavam a leitura.
- Hierarquia de títulos, respiros, cards, grids, CTA, contato e rodapé revisados.
- Equipe organizada em duas colunas editoriais, com fotografia em moldura própria e legenda discreta; a antiga fusão larga com blur foi retirada.
- Fotografias e logo originais preservadas. Os novos derivados são reconstruções generativas para uso visual, não novas capturas documentais. Ver `ASSETS_GERADOS.md`.
- Crédito “Site feito por Murilo Gabriel” nas duas páginas, com link externo para https://murilogabriel.com.br.

## Movimento e interação

- Revelações progressivas com Intersection Observer, iniciadas somente após o observador estar pronto. Sem JavaScript, o conteúdo permanece visível.
- Entrada escalonada no hero, parallax curto, resposta discreta ao cursor e magnetismo de poucos pixels nos botões, restritos a mouse e movimento permitido.
- Feedback de clique/toque, linhas de navegação animadas, estados de foco, controles acessíveis e menu mobile com entrada escalonada.
- Header sticky com fundo translúcido, altura compacta ao rolar e linha fina de progresso. O blur fica em um pseudo-elemento para não restringir o painel mobile.
- Menu com fechamento por Escape/link, foco contido, retorno do foco, bloqueio do fundo via `inert` e fechamento ao voltar para desktop.
- Galeria com os cinco slides já no HTML: rolagem nativa, scroll snap, setas, indicador de intervalo/progresso, teclado, arraste com mouse e swipe nativo. As imagens não são recriadas a cada clique. Sem autoplay.
- FAQ baseado em `details`, com expansão animada local e comportamento nativo quando movimento reduzido ou JavaScript indisponível.
- `prefers-reduced-motion` respeitado também quando a configuração muda com a página aberta.

A maioria dos efeitos usa `transform` e `opacity`; somente a expansão curta do FAQ anima altura para acompanhar o conteúdo. Os listeners de rolagem são passivos e as atualizações visuais são agrupadas em `requestAnimationFrame`, sem loop contínuo de animação.

## Funcionalidade e verificação

O agendamento continua demonstrativo, com validação, calendário, horários simulados, revisão e reinício. A conclusão informa que nenhum horário foi reservado e nenhum dado foi enviado/salvo.

Resultados automatizados: `VALIDACAO_REFINAMENTO.json`. Capturas finais: `../capturas/refinamento-v2/`. As capturas de página inteira tornam header/ações sticky estáticos apenas durante a captura para evitar sobreposição no registro; o comportamento real é testado com os estilos normais.

As verificações usam um servidor HTTP estático e Chromium. Elas não constituem medição de desempenho em todos os aparelhos reais nem testes em Safari/Firefox. Os efeitos de toque foram verificados com emulação e eventos de toque no Chromium.

## Arquivos

- `index.html`, `agendar.html`: marcação, assets, créditos, galeria progressiva e nova composição de avaliações.
- `css/style.css`: reset de margens e visibilidade de elementos `hidden` compartilhados.
- `css/refinements.css`: composição, microdetalhes, estados e ajustes responsivos desta edição.
- `css/animations.css`: revelações e entrada do hero com fallback acessível.
- `js/main.js`: navegação, header, foco e menu mobile.
- `js/animations.js`: revelações e parallax.
- `js/gallery.js`: controles, teclado, arraste e estado do carrossel.
- `js/interactions.js`: microinterações e FAQ.
- `js/booking.js`: somente caminhos/enquadramentos dos novos derivados nas fotos demonstrativas.
- `assets/images/`: três novos derivados WebP e textura SVG; arquivos originais preservados.

O ZIP em `../entrega/` contém a aplicação estática, assets, documentação e capturas desta edição. O histórico `backup-nextjs`, `.git`, capturas antigas e ferramentas de teste temporárias ficam fora da exportação.
