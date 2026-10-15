# Sr. Navalha — implementação da referência visual

Design aprovado: `docs/referencia-visual-aprovada.png`.

## Como executar

Requisitos: Node.js 22 ou superior; na raiz do projeto rode `npm ci`, `npm run dev` e abra http://localhost:3000. Para validar, rode `npm run lint`, `npm run typecheck` e `npm run build`. O roteiro de testes pode ser executado com `npm run test:e2e` após instalar Chromium para Playwright.

## Onde cada elemento está implementado

- Header, navegação responsiva, marcador ativo e menu: `src/components/layout/header.tsx`.
- Hero com imagem atmosférica, texto e destaques: `src/features/home/hero.tsx`.
- Serviços com três cartões, imagem e ação individual: `src/features/home/sections.tsx` / `Services`.
- Separação superior curva e imagem da barbearia com selo vetorial: `About`.
- Galeria animada e navegável por setas: `src/features/home/gallery-carousel.tsx`.
- Apresentação da equipe: `Professionals`.
- Prova social baseada na classificação local do projeto: `SocialProof`. **Não foi fabricado depoimento de cliente**; o card abre as avaliações no Google Maps.
- Endereço, mapa estilizado vetorial, horários, telefone e FAQ: `Location`.
- CTA fotográfico e rodapé: `FinalCTA`, `src/components/layout/footer.tsx`.
- Todos os estilos, superfícies, texturas, transições, animações, breakpoints e opção de movimento reduzido: `src/app/redesign.css`.

## Fotografias e recursos

As fotografias da marca fornecidas no ZIP original foram preservadas. `public/images/hero/atendimento-cinematico.webp` e `public/images/barbershop/ambiente-cinematico.webp` são composições ampliadas feitas **a partir das fotos reais incluídas no projeto**, sem trocar rostos ou inventar funcionários. Pode-se regenerá-las com `python scripts/build-design-assets.py` (requer Pillow). O mapa ornamental foi desenhado como SVG em `public/images/decor/mapa-gravata.svg` e **não representa georreferenciamento preciso**: o clique abre o mapa real em `brand.mapsUrl`.

## Observações importantes

- A rota `/agendar` foi mantida no estado original, com agendamento **demonstrativo**: não há servidor, reserva real ou confirmação por WhatsApp. Não publique mensagens afirmando confirmação real até implementar backend.
- O número de avaliações, a pontuação, endereço e horários são dados estáticos do projeto anterior: devem ser confirmados com a barbearia.
- A referência visual mostra um depoimento com nome próprio, sem fonte verificável. Na implementação, o bloco foi substituído por acesso às avaliações reais, sem falsa atribuição.
- As imagens de origem estão em resolução muito baixa. As composições melhoram a aplicação visual, mas não recuperam detalhes ausentes. Solicite originais em alta resolução para resultado final de produção.
- A implementação segue a imagem com proporções responsivas; fidelidade literalmente pixel-a-pixel não é garantida entre tamanhos de tela e renderizadores de fonte.

## Versões HTML antigas

As prévias `index.html` e `agendar.html` da versão anterior foram movidas para `docs/legacy-previews/` para não serem confundidas com a Home Next.js atual. Para abrir o redesign, execute `npm run dev` e acesse o endereço do servidor.

## Situação da validação

A sintaxe dos arquivos TypeScript/TSX foi verificada, e um renderizador estático temporário permitiu inspecionar a composição responsiva sem overflow horizontal em 1440 px e 390 px. **Não foi possível instalar as dependências via npm nem executar o build/E2E completo neste ambiente**, por isso esses resultados não são apresentados como testes aprovados. Execute os comandos descritos acima na sua máquina para a validação final.
