# Sr. Navalha · V17 — Oficina de enquadramentos

Implementação na branch `reconstruction/arte-do-ritual`, partindo do commit `554e5e2`. O estado inicial estava limpo; a branch local `backup/pre-v17-554e5e2` preserva a versão anterior. O trabalho aprofunda a identidade existente, com conteúdo comercial preservado.

## Direção e ornamentos

O metal aparece como desenho de precisão, sem simular relevo ou materiais inexistentes. Oito SVGs originais em `assets/decor/v17/` têm espessura consistente e traços normalizados. Brasão aberto no hero, esquadria em volta do salão e do espelho, estudo de tesoura junto à equipe, lombada do álbum, etiqueta de produtos, placa junto ao endereço e filete de encerramento. Cada elemento possui uma função espacial; nenhum cobre rostos, preços, controles ou o mapa.

Marfim, carvão, tabaco, madeira e cobre permanecem nos tokens existentes. Sora, já usada na V16, passa a ser local, junto com Manrope. O arquivo original e a licença OFL de Sora acompanham a entrega. Nenhuma fotografia foi gerada, substituída por acervo genérico ou ampliada para criar falsa resolução.

## Referências e transformação

- **Peralta**, `peralta-art.tsx`, `peralta-caderno.tsx` e estilos: decoração com papel na navegação e estados que mudam fotografia, texto e composição juntos. Reinterpretado em lombada e folhas fotográficas; sem cores ou desenhos infantis. Repositório local consultado: `../EscolaPeraltaPrototipo`, [fonte](https://github.com/DevMurilo0/escola-peralta).
- **Meus Primeiros Passos**, `PlayfulArt.tsx`, `ExplorePaths.tsx` e `home.css`: sobreposições, resposta imediata e personalização por contexto. Aplicação: estudos vetoriais próprios e seleção coordenada de profissionais. [Fonte](https://github.com/DevMurilo0/meus-primeiros-passos).
- [Humbert & Poyet](https://www.awwwards.com/sites/humbert-poyet): portfólio arquitetônico e menu por interação; princípio adaptado à relação entre nomes e retratos.
- [Invisible North](https://www.awwwards.com/sites/invisible-north): referências históricas do projeto sobre galeria, tipografia e abertura. A nova navegação à ficha expirou nesta rodada; não se afirma nova inspeção do site ao vivo.
- [Peak’n Film](https://www.awwwards.com/sites/peakn-film): transição de navegação fotográfica e resposta tipográfica; continuação espacial entre miniatura e ampliação.
- [Palomino](https://www.awwwards.com/sites/palomino): mudança entre lista e arquivo e cuidado com o encerramento; transposição para folhas e parede, mantendo as mesmas fotografias.
- [Noxediem](https://www.awwwards.com/sites/noxediem-creative-production): abertura, texto e encerramento coordenados; uma gramática de tempos compartilhada.
- [Codrops, máscaras SVG no scroll](https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/): máscara conduzida pelo progresso, reinterpretada numa placa de abertura e corte diagonal reversível do salão.
- [Codrops, Polaroid stack to grid](https://tympanus.net/codrops/2016/02/17/polaroid-stack-to-grid-intro-animation/) e [view switch](https://tympanus.net/codrops/2022/10/05/on-scroll-animation-and-view-switch/): os mesmos objetos sobrevivem à reorganização; implementação FLIP original com WAAPI.
- [React Bits Split Text](https://reactbits.dev/text-animations/split-text) e [Scroll Float](https://reactbits.dev/text-animations/scroll-float): divisão visual preservando leitura semântica. Sem React, blur pesado ou animação por palavra nos parágrafos.
- [Skiper Hover Members](https://skiper-ui.com/v1/skiper6): nomes controlam o retrato. A demonstração pública foi consultada; a página indica recurso Pro e os [termos](https://www.skiper-ui.com/docs/terms-of-service) não autorizam copiar indiscriminadamente. Nenhum código Pro foi reutilizado. Painel implementado originalmente com módulos locais.
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): progresso, reversibilidade e agrupamento de cenas. A implementação final usa WAAPI, IntersectionObserver e um único agendador de frames por eventos; não adiciona GSAP ou smooth scroll.

As fichas acessíveis foram lidas no navegador. `docs/v17/references-browser.json` registra respostas e limitações; capturas de fichas não equivalem à execução integral dos sites. O hub Codrops exigiu verificação no navegador; o artigo específico foi acessível pela ferramenta de leitura web. Não se contornou proteção.

## Componentes

**Álbum de Estilos:** seis registros reais. Folhas sobrepostas, navegação por miniaturas, setas, teclado e gesto; a opção “Ver todos” reorganiza os mesmos elementos em parede editorial. Primeiro toque numa folha secundária seleciona; a fotografia ativa abre o diálogo existente. Imagens pequenas respeitam o limite de largura original documentado. Sem JavaScript, permanece a parede com links nativos.

**Painel de Profissionais:** os cinco nomes reais controlam retrato, nome ampliado, índice e régua lateral. Hover em dispositivos precisos, foco, clique e toque compartilham o estado. Setas verticais/Home/End navegam pelos nomes. Nenhuma biografia ou disponibilidade foi inventada; o destino continua sendo o agendamento oficial.

**Espelho Vivo e produtos:** a imagem anterior permanece sob a nova máscara até o fim da transição; apenas o pedido decodificado mais recente pode alterar o palco. Seleções sucessivas cancelam o movimento anterior. Produtos sem foto continuam identificados honestamente.

## Gramática de movimento

- **Matriz de entrada:** placa única escura com gravura, marca original e abertura por máscara SVG sobre o enquadramento do salão. Duração nominal 1,33 s; não espera rede nem mede porcentagens. Executa uma vez por sessão; interação ou âncora profunda a dispensam. Timeout JS em 1,95 s e fallback CSS em 2,1 s. Movimento reduzido e ausência de JavaScript não exibem a placa. `?intro=1` permite repetir na validação.
- **Tipografia:** palavras recortadas com variações: perspectiva na equipe, giro no álbum, direção lateral na localização e elevação recortada nas demais cenas. O texto original é o nome acessível do título. Parágrafos têm entrada breve por bloco.
- **Fotografia:** revelação diagonal, recorte central em perspectiva ou obturador vertical, com deslocamento interno coordenado. A fotografia não depende da classe de animação para aparecer.
- **Gravura:** traços `pathLength=1` se desenham na entrada. A geometria permanece completa sem movimento. Sem loops de traços ou `will-change` global.
- **Corte do salão:** progresso nativo de rolagem controla máscara diagonal e linha de precisão; funciona em ambos os sentidos. Nenhum evento de scroll é cancelado.
- **Continuidade:** FLIP no álbum e miniatura ↔ lightbox; marco final é o layout real, não um clone permanente. O rodapé conecta fotografia, filete e grande nome por progresso.
- **Microinterações:** preenchimento direcional no CTA, deslocamentos limitados a 7 × 5 px para ponteiro preciso, resposta imediata dos seletores, indicadores e ícones.
- **Ambiente:** esteira de depoimentos continua da direita para a esquerda com pausa por botão, foco e hover; animações decorativas do rodapé e fotografias das avaliações pausam fora de vista e em aba oculta.

Curvas base: `cubic-bezier(.22,1,.36,1)` para acomodação e `.76,0,.24,1` para deslocamento espacial. Interações em 240–680 ms, títulos em 780–900 ms, cenas fotográficas em até 1.250 ms. Movimento reduzido mantém todas as informações e interações com troca direta.

## Arquitetura

`templates/v17/` é a fonte canônica do HTML atual, extraída da V16 antes da intervenção para preservar suas alterações manuais. `scripts/render-site.mjs` agora apenas monta esses parciais em `index.html`. O gerador antigo está em `scripts/history/`; não deve regenerar a página ativa. O HTML já está pronto para Live Server, sem instalar dependências ou executar build.

`js/ritual/core.js` gerencia animações e pedidos fotográficos; `motion.js` coordena entradas e cenas, com um único RAF agendado por scroll/resize/ponteiro; `opening.js`, `album.js` e `team.js` cuidam das interações específicas. Os antigos motores `atelier.js` e `footer-atelier.js` foram retirados da árvore ativa e preservados no histórico. CSS ornamental e de motion foi substituído, sem manter as cortinas antigas ou novas camadas de overrides por versão. Os novos componentes têm estilos próprios.

Catálogos, depoimentos, fontes, endereço, telefone, mapa, links e crédito foram preservados. Os números comerciais continuam snapshots datados dos documentos existentes; esta intervenção não afirma nova confirmação da disponibilidade ou dos preços.

## Validação

Os resultados executados e suas limitações constam em `docs/v17/TESTES.md` e nos relatórios JSON; capturas em `capturas/v17/`. Os quadros de movimento são estados reais das animações em execução. Não representam apenas o layout final.

## Aplicação dos plugins instalados

Instruções originais lidas no marketplace local `.agents/plugins/marketplace.json`: Taste em `plugins/taste-frontend-design/skills/design-taste-frontend/SKILL.md` orientou composição fotográfica e inspeção; Impeccable em `plugins/impeccable-ui/skills/impeccable/SKILL.md` orientou contexto, revisão, documentação, semântica e responsividade; Emil em `plugins/emil-design-engineering/skills/emil-design-eng/SKILL.md` orientou cancelamento, resposta imediata e coordenação entre estados. Taste/Impeccable tiveram ferramentas executadas e relatórios preservados; Emil foi aplicado como instruções de engenharia, sem alegar um automatizador que não existe. A direção do briefing prevalece sobre restrições genéricas contrárias a molduras, gravuras e à paleta real.
