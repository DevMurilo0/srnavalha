# Sr. Navalha — Ateliê Navalha (redesign estático)

Uma reconstrução editorial da Barbearia Sr. Navalha: identidade verde-carvão, papel quente e cobre discreto, hero com fotografias originais em montagem, catálogo interativo, portfólio/visualizador, avaliações reais documentadas, Google Maps e agendamento direto via WhatsApp.

## Abrir com Live Server (sem npm)
1. Extraia este ZIP **na pasta do projeto**, preservando as subpastas.
2. No VS Code, clique com o botão direito em `index.html` e selecione **Open with Live Server**.
3. `agendar.html` funciona de modo independente. Não utiliza backend e **não confirma uma reserva**.

Este pacote NÃO atualiza seu repositório GitHub sozinho e não deve ser usado para apagar dados não relacionados da versão anterior. A implementação usa nomes próprios (`css/site.css`, `css/motion.css`, `js/site.js`, `js/reviews.js`, `js/booking.js`) e foi criada como substituição de interface. Faça backup antes de sobrepor arquivos como `index.html` e `agendar.html`.

### Pastas
- `index.html` / `agendar.html`: páginas estáticas.
- `css/`: identidade, responsividade, animações e agendamento.
- `js/`: interações e dados das avaliações.
- `assets/images/`: variantes WebP tratadas conservadoramente.
- `assets/originais/`: fotografias-fonte preservadas para futuras substituições por arquivos maiores.
- `assets/decor/`: SVGs originais do novo sistema gráfico.
- `docs/`: pesquisa, motion, procedência e verificação.
- `preview/`: capturas renderizadas da interface.

### Publicar depois de conferir localmente
Após copiar o conteúdo do ZIP para a raiz do seu repositório, execute `git status`, confira exatamente as alterações, e então use `git add index.html agendar.html css/ js/ assets/ docs/ README.md`, `git commit -m "feat: nova experiencia editorial Sr Navalha"` e `git push origin main` se desejar publicar na branch main. Estes comandos **não foram executados** pelo assistente.

### Integrações
- WhatsApp: +55 81 99572-2396. Mensagens são montadas no navegador e abertas em `wa.me`.
- Google Maps: Place ID `ChIJU15canBJqgcRARZqMshC8cA`. O mapa embutido só carrega com rede; fallback oferece link externo.
- Depoimentos: 4 registros do snapshot datado de 15/10/2026, não são atualizados automaticamente. Ver `docs/AVALIACOES.md`.
- Fontes: pilha tipográfica do navegador (`Impact`, `Arial`, `Georgia` e alternativas locais). Nenhum download de fonte é necessário.

### Limitações honestas
A fotografia original de vários trabalhos é muito pequena (~265 × 325 px). Os derivados WebP foram redimensionados com Lanczos, ajustes sutis de contraste/cor e nitidez conservadora; **isso não cria detalhes originais ausentes**. A montagem foi desenhada para que as fotos não precisem virar backgrounds enormes. Para qualidade documental superior, peça aos profissionais os arquivos de câmera ou as fotos originais exportadas sem compressão de redes sociais.