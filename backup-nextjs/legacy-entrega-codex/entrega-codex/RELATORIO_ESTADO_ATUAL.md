# Estado atual — Barbearia Sr. Navalha

**Levantamento:** 15/10/2026. **Escopo:** estado local do repositório, inclusive alterações ainda não commitadas. **Aplicação principal:** Next.js em `/` e `/agendar`; `index.html` e `agendar.html` são versões HTML independentes para pré-visualização e não participam das rotas do Next.js. Nenhuma interface ou arquivo de origem foi alterado para esta entrega.

## 1. Resumo executivo

O projeto é um site institucional de uma barbearia de Gravatá, PE, com uma Home editorial e uma demonstração navegável de agendamento. A Home apresenta serviços em termos gerais, ambiente, equipe, trabalhos, avaliação declarada, endereço, perguntas frequentes e chamadas para agendar. O agendamento deixa escolher um profissional ficticiamente identificado, data e horário simulados, preencher nome/telefone e ver revisão/conclusão. **Nenhuma reserva é criada, persistida ou enviada**, e não há backend. O código é explícito sobre esse caráter demonstrativo.

A direção visual atual mistura preto quase absoluto, off-white, cinza quente e cobre amadeirado. Títulos muito grandes em Barlow Condensed, textos em Manrope, fotografia real recortada de capturas do Instagram, superfícies retangulares e linhas finas constroem uma estética editorial de barbearia contemporânea. Há boa hierarquia visual, mas a documentação de negócio é provisória: faltam catálogo, preços, duração dos serviços, nomes reais dos profissionais e fotos originais em resolução adequada.

## 2. Stack tecnológica e arquitetura

| Camada | Implementação atual |
| --- | --- |
| Framework | Next.js `^16.3.8`, App Router em `src/app`; React/React DOM `^19.3.0` |
| Linguagens | TypeScript/TSX, CSS, HTML e JavaScript/MJS; conteúdo em português brasileiro |
| Estilos | `src/app/globals.css` com tokens CSS, regras de componentes e media queries; Tailwind CSS `^4.3.3` importado no início do CSS, com `@theme inline`; não há biblioteca visual pronta dominando o layout |
| Tipografia | `@fontsource/barlow-condensed` 600/700 e `@fontsource-variable/manrope`, distribuídos pelo bundle local |
| Interface | `lucide-react` para ícones; Radix Dialog para menu móvel; Radix Slot + `class-variance-authority`, `clsx`, `tailwind-merge` para o botão reutilizável |
| Movimento | `motion/react`: aparição das seções, tesoura com rolagem, transições e toque no fluxo de agendamento; CSS adiciona hover/transições |
| Imagens | `next/image` com recursos WebP em `public/images`; `sharp` compõe a imagem Open Graph e prepara recortes |
| Estado | `useState`, `useEffect`, `useMemo`, `useRef` locais nos componentes cliente; sem estado global ou armazenamento persistente |
| API/backend | Nenhuma rota API, Server Action de negócio, banco, autenticação, Supabase, pagamento, WhatsApp API ou envio de formulário. Disponibilidade e retenção de 7 minutos são mocks no navegador |
| Qualidade | ESLint, TypeScript, Playwright e Axe nos testes E2E; `playwright.config.ts` usa o servidor de produção |

O `RootLayout` inclui fontes, CSS, metadados, link “Pular para o conteúdo”, `Header` e `Footer`. A Home é composta por componentes de `src/features/home`. `/agendar` chama um único componente cliente `BookingFlow`. Configuração da marca, endereço e links fica em `src/config/brand.ts`; fotos, textos de cards e FAQ ficam em `src/features/home/content.ts`. Não foram encontrados provedores de dados externos ou estado compartilhado.

### Árvore de diretórios relevantes

```text
.
├── AGENTS.md, CLAUDE.md, README.md, .nvmrc, .env.example, .gitignore
├── package.json, package-lock.json, tsconfig.json
├── next.config.ts, postcss.config.mjs, eslint.config.mjs, components.json
├── playwright.config.ts
├── index.html, agendar.html             # prévias HTML independentes
├── src/
│   ├── app/
│   │   ├── layout.tsx, page.tsx, globals.css, not-found.tsx
│   │   ├── agendar/page.tsx
│   │   ├── icon.svg, opengraph-image.tsx, robots.ts, sitemap.ts
│   ├── components/
│   │   ├── brand/photo-frame.tsx, scissor-scroll.tsx, wordmark.tsx
│   │   ├── layout/header.tsx, footer.tsx, mobile-booking.tsx
│   │   └── ui/button.tsx, reveal.tsx
│   ├── config/brand.ts
│   ├── features/home/hero.tsx, sections.tsx, content.ts
│   ├── features/booking/booking-flow.tsx, booking-mocks.ts
│   └── lib/utils.ts
├── public/images/{brand,hero,barbershop,team,work}/
├── scripts/prepare-images.mjs
├── tests/e2e/{home,booking}.spec.ts
├── docs/{image-sources,phase-1-validation}.md
├── artifacts/                       # capturas históricas de fases anteriores
└── entrega-codex/                  # esta documentação, capturas e exportação
```

### Arquivos principais

- `src/app/page.tsx`: ordem exata das seções da Home e chamada do botão fixo em dispositivos menores.
- `src/app/agendar/page.tsx`: rota de agendamento demonstrativo, com `noindex` próprio.
- `src/app/globals.css`: fonte única dos tokens e de quase toda a aparência, inclusive regras antigas de versões anteriores que ainda estão no arquivo.
- `src/features/home/sections.tsx`: oito seções abaixo do hero; `hero.tsx`: seção inicial.
- `src/features/booking/booking-flow.tsx`: calendário, etapas, validação simples, cronômetro, revisão e tela de conclusão; `booking-mocks.ts`: profissionais e horários fictícios.
- `src/config/brand.ts`: logo, nome, telefone, endereço, horários declarados, avaliação declarada, navegação e URLs externas.
- `src/app/opengraph-image.tsx`: gera PNG 1200×630 a partir da logo, fotografia e texto; `icon.svg` é o favicon tipográfico.
- `src/app/robots.ts` e `sitemap.ts`: indexação depende de `NEXT_PUBLIC_SITE_URL`; sem domínio, `robots` bloqueia o site e o sitemap fica vazio.
- `index.html`/`agendar.html`: versões estáticas com CSS/JS embutidos. Servem como referência alternativa, mas podem divergir do Next.js ao longo do tempo.

## 3. Rotas e componentes

| URL/saída | Conteúdo |
| --- | --- |
| `/` | Home institucional com header, 9 seções de `main`, CTA móvel condicional e footer |
| `/agendar` | Quatro etapas de agendamento simulado, com o mesmo header/footer |
| URL desconhecida | `not-found.tsx`: 404 com “Vamos voltar ao início?” e botão para Home |
| `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, favicon | Saídas geradas pelas convenções do App Router |

**Reuso:** `Wordmark` exibe a logo em header e footer; `Button` oferece variantes padrão, clara e contornada; `PhotoFrame` mostra foto com legenda e ainda contém fallback de placeholder sem uso na Home atual; `Reveal` anima ao entrar na viewport; `ScissorScroll` desenha e anima uma tesoura SVG; `MobileBooking` mostra uma chamada fixa depois que o hero sai da tela; `Header` usa Radix Dialog em telas menores; `Footer` repete navegação. Há `Link` do Next para rotas internas e âncoras.

## 4. Identidade visual

### Paleta e tipografia

| Uso | Valor do CSS | Observação |
| --- | --- | --- |
| Preto principal `--ink` | `#0B0D0E` | Header, hero, galeria, footer, cards de resumo |
| Papel `--paper` | `#F2F0EB` | Fundo geral e textos sobre preto |
| Cobre/madeira `--wood` | `#B98B68` | CTAs, destaques, ícones e linha da etapa ativa |
| Superfície `--surface` | `#E8E5DE` | Sobre, prova social e algumas caixas |
| Texto secundário `--muted` | `#62625E` | Parágrafos e metadados em fundo claro |
| Linhas claras `--line` | `#D5D3CC` | Bordas e divisórias em fundo claro |
| Texto escuro secundário `--dark-muted` | `#B5B5AE` | Legendas em fundo escuro |
| Linhas escuras `--dark-line` | `#343637` | Divisórias sobre preto |
| Outros acentos | `#202522`, `#8C664A`, `#805D42`, `#ECE8DF`, `#F7F5F0` | CTA final, títulos/ícones do agendamento, seleção e calendário |

Títulos `h1/h2` usam **Barlow Condensed**, peso 600, caixa alta no conteúdo, `line-height: .94`, espaçamento `-.025em` e tamanhos fluidos (`h1` global 58–136 px; hero até 150 px). Cards usam 26–54 px da mesma família. Texto corrido usa **Manrope Variable**, base de 14 px e entrelinha 1,7; rótulos “eyebrow” são 10 px, peso 700, espaçamento `.15em`, caixa alta. Botões têm 11 px em caixa alta, peso 800, raio de apenas 2 px e altura mínima 54 px. Links editoriais recebem sublinhado fino em cobre; links de navegação usam mudança de cor no hover. O visual privilegia letras condensadas grandes, fotografias verticais, blocos de cor sólidos, muito espaço, bordas finas e poucos cantos arredondados. Sombras aparecem sobretudo na tesoura SVG e na marca sobre as fotos; o hero tem uma grade sutil e a seção sobre usa a tesoura metálica com gradientes SVG.

A logo real `public/images/brand/logo.webp`, com fundo escuro incorporado, aparece no header e footer e na arte OG. O hero sobrepõe ainda um monograma tipográfico “SR / NAVALHA”. As fotos reais derivam de capturas de publicações, conforme `docs/image-sources.md`; não são arquivos fotográficos originais. A consistência é alta entre Home e agendamento no uso de fonte, cores, botões e divisórias. O agendamento é visualmente mais utilitário, com painéis claros e resumo preto.

## 5. Home: descrição na ordem real

**Elementos compartilhados — header e footer.** O header preto contém logo à esquerda, cinco âncoras (“Serviços”, “A barbearia”, “Equipe”, “Trabalhos”, “Localização”) no desktop e botão cobre “Agendar horário” à direita. Abaixo de 1024 px a navegação vira um botão de menu que abre painel lateral claro com links numerados e CTA; Escape e fechamento devolvem foco ao gatilho. O footer preto traz logo, frase “Seu estilo. Nosso próximo encontro.”, Instagram, repetição dos links, copyright, cidade e “Voltar ao topo”. A logo é a única imagem desses elementos. Em móvel, os itens do rodapé quebram em linhas e o menu ocupa até 430 px de largura.

1. **Hero (`Hero`, `#hero`).** Objetivo: apresentar a proposta e levar ao agendamento. Texto: “Barbearia em Gravatá · PE”, “SEU CORTE. NO SEU TEMPO.”, “Cortes, barba e cuidado em um espaço feito para atender bem. Escolha seu horário e venha para a cadeira.”, CTAs “Agendar horário” e “Ver trabalhos”, avaliação configurada “5.0 / 460 avaliações no Google”. Desktop: duas colunas em fundo preto; tipografia enorme à esquerda e montagem de duas fotos à direita. Imagens: `/images/team/atendimento.webp` como foto maior; `/images/hero/corte-e-barba.webp` como recorte menor sobreposto. O monograma branco “SR” e legenda “Prado / Gravatá” completam a composição. Botões navegam; link secundário rola à galeria; imagens ampliam discretamente no hover. Abaixo de 768 px, texto e fotos empilham, mantendo a sobreposição, e o título usa `clamp(62px, 20vw, 92px)`.
2. **Serviços (`Services`, `#servicos`).** Objetivo: mostrar categorias de trabalho, sem catálogo operacional. Título “O QUE VOCÊ QUER FAZER HOJE?” e introdução sobre cortes, barba e estilos reais. Três cards com “Cortes — Do clássico ao fade…”, “Barba — Desenho, contorno…” e “Identidade — Textura, riscos e detalhes…”. Fotos respectivas `/images/work/corte-perfil.webp`, `/images/work/barba.webp` e `/images/work/corte-cacheado.webp`; recorte vertical 4:5, título condensado e descrição em cinza. Fundo papel, divisórias finas, hover com leve zoom. Em celular os cards ficam em coluna; a partir de 640 px, em três colunas. **Não há preços nem botões individuais de serviço.**
3. **A barbearia (`About`, `#sobre`).** Objetivo: apresentar ambiente. Texto “UM ESPAÇO FEITO PARA CORTAR BEM.”, parágrafo sobre ambiente claro, estrutura confortável e equipe, metadados “Prado” e “Gravatá · PE”. Foto `/images/barbershop/ambiente.webp` à esquerda e texto à direita no desktop; fundo cinza quente `#E8E5DE`. `ScissorScroll` desenha uma tesoura SVG metálica grande que se move em posição, rotação, escala e opacidade com a rolagem; é decorativa. No móvel, foto/texto empilham e a tesoura se reduz e desloca para não ocupar toda a leitura.
4. **Equipe (`Professionals`, `#profissionais`).** Objetivo: mostrar atendimento sem atribuir nomes não confirmados. Texto “QUEM ESTÁ ATRÁS DA CADEIRA.” e descrição do trabalho coletivo. Três cartões “Equipe SR Navalha”, “Na cadeira” e “Cuidado no detalhe”; os dois primeiros reutilizam `/images/team/atendimento.webp` com posições de recorte diferentes; o terceiro usa `/images/work/barboterapia.webp`. Fundo papel, legendas sobre barra escura, pequenas descrições; no desktop/tablet ≥640 px as colunas são assimétricas e os cartões descem em degraus; no telefone, empilham. Não há perfis individuais nem links para profissionais.
5. **Trabalhos (`Gallery`, `#trabalhos`).** Objetivo: exibir resultados e apontar para o Instagram. Título “RESULTADO SEM FILTRO.”, link externo “Ver mais no Instagram”. Três fotos `/images/work/corte-perfil.webp`, `/images/work/barba.webp`, `/images/work/corte-cacheado.webp` com legendas “Corte e forma”, “Barba e acabamento”, “Textura e degradê”. Fundo preto, cartões verticais 4:5, layout escalonado ≥640 px; coluna única no telefone. Hover amplia/acentua contraste. Não é carrossel, lightbox ou feed dinâmico.
6. **Prova social (`SocialProof`).** Objetivo: apresentar a avaliação configurada. Faixa cinza quente com estrela e “5.0”, rótulo “NO GOOGLE”, título “460 AVALIAÇÕES.” e frase sobre a ficha no Google. Um botão circular abre a pesquisa de endereço no Google Maps. Não existem depoimentos, nomes de clientes, integração com Google Reviews ou verificação automática da contagem. No celular as colunas se empilham.
7. **Localização (`Location`, `#localizacao`).** Objetivo: ajudar a chegar e entrar em contato. Título “É AQUI EM GRAVATÁ.”, endereço completo `Av. Governador Agamenon Magalhães, 349 - Prado, Gravatá - PE, 55642-210`. Um `iframe` do Google Maps ocupa a largura da seção; abaixo há três blocos: endereço, horários declarados (seg–sáb 08:30–18:30; domingo 09:30–14:00) e links “Traçar rota”/telefone `(81) 99572-2396`. Fundo papel, divisórias finas e ícones cobre. O mapa depende da rede e do serviço externo; os três blocos se alinham horizontalmente ≥640 px e empilham abaixo disso.
8. **Dúvidas (`FAQ`, `#duvidas`).** Objetivo: responder quatro questões práticas. Título “ANTES DE SENTAR NA CADEIRA.”; perguntas sobre como agendar, escolha de profissional, atendimento infantil e cancelamentos/remarcações. As respostas dizem que o agendamento online está sendo preparado, apontam para o Instagram, remetem confirmação de detalhes à equipe e prometem regras futuras. Usa `<details>/<summary>` com ícone `+` que gira ao abrir, em linhas com borda. Layout em duas colunas ≥640 px e em uma coluna no telefone; não há API.
9. **CTA final (`FinalCTA`).** Objetivo: converter após a leitura. Faixa verde quase preta `#202522` com “PRONTO PARA MARCAR?”, botão claro “Agendar horário” para `/agendar` e link secundário para Instagram. Em telas largas texto e ação ficam lado a lado; no telefone, empilhados. O CTA móvel fixo (`MobileBooking`) só aparece após o hero sair acima da viewport e apenas abaixo de 1024 px, levando à mesma rota.

Todas as seções que usam `Reveal` entram com opacidade e deslocamento vertical. O efeito da tesoura é o movimento mais marcante. Não há vídeo, depoimentos individuais, tabela de preços nem feed remoto.

## 6. Página `/agendar`: visual e fluxo

O layout compartilhado inclui header/footer. A página tem fundo papel e topo com link “Voltar”, rótulo “AGENDAMENTO”, título “SEU HORÁRIO. SEM COMPLICAÇÃO.” (segunda frase em cobre) e texto informando que tudo acontece apenas no navegador. A barra horizontal exibe **Profissional → Data e horário → Seus dados → Revisão**, com etapa ativa em cinza e linha cobre. O desktop mostra painel principal e resumo lateral preto, fixo ao rolar; no telefone o resumo desaparece e os botões “Voltar”/“Continuar” ficam em faixa fixa no rodapé do painel. A etapa de progresso rola horizontalmente em tela estreita.

1. **Profissional:** título “COM QUEM VOCÊ QUER CORTAR?”. Três opções: “Qualquer profissional”, “Profissional 01” e “Profissional 02”. As opções numeradas usam a mesma `/images/team/atendimento.webp` com dois enquadramentos; a primeira usa ícone. Seleção mostra borda/indicador; mensagem informa que nomes/fotos individuais aguardam confirmação. O botão de continuar exige seleção. Três cartões em desktop ≥700 px; cartões horizontais empilhados no celular.
2. **Data e horário:** calendário mensal com setas, dias em português e datas passadas/domingos desabilitados. Pode avançar meses sem limite definido. Após escolher um dia, aparecem horários simulados entre 08:30 e 17:30 filtrados por fórmula local; clicar em horário inicia contador visual de 07:00. O estado selecionado usa preto e cobre. O calendário e horários ficam lado a lado ≥1180 px; empilham abaixo disso. Os horários são mocks, não disponibilidade real. O texto “HORÁRIO RESERVADO PARA VOCÊ” é apenas simulação.
3. **Seus dados:** título “COMO A GENTE FALA COM VOCÊ?”, campos Nome e WhatsApp em duas colunas ≥700 px, empilhados em celular. Nome exige ao menos 2 caracteres; telefone é formatado como número brasileiro e exige 10 dígitos pelo bloqueio de continuação. Um bloco com “WA” explica que confirmação por WhatsApp será ativada depois. Não há envio nem consentimento operacional porque o fluxo é uma demonstração local.
4. **Revisão:** lista profissional, data, horário, nome e WhatsApp; aviso “Demonstração frontend. Confirmar mostra apenas a conclusão do fluxo. Nenhum registro será criado.” O botão Confirmar apenas muda o estado local para a tela final.
5. **Conclusão:** ícone de check, “HORÁRIO CONFIRMADO.”, ressalva de que nenhum horário ou dado pessoal foi salvo, cartão de resumo, botões “Testar novamente” e “Voltar para o site”. O texto “confirmado” é visual e explicitamente demonstrativo.

Transições entre etapas usam `AnimatePresence`/Motion. O contador é controlado por `setInterval` e ao expirar remove a escolha do horário; não há bloqueio no servidor nem sincronização entre usuários. Voltar pelas etapas concluídas é possível pela barra. A página não apresenta seleção de serviço, preço, duração, login, pagamento ou confirmação real.

## 7. Inventário de imagens e recursos visuais

Dimensões obtidas diretamente dos arquivos. **Todos os oito WebP originais permanecem intactos no ZIP.** O documento `docs/image-sources.md` explica que foram extraídos de capturas locais de publicações; obter originais em alta qualidade é prioridade para uma publicação final.

| Arquivo | Formato/dimensões | Uso e papel |
| --- | --- | --- |
| `public/images/brand/logo.webp` | WebP 119×53 | Logo real em header, footer e composição OG; fundo escuro está na própria imagem |
| `public/images/hero/corte-e-barba.webp` | WebP 266×326 | Foto menor sobreposta no hero; também na composição OG |
| `public/images/team/atendimento.webp` | WebP 264×321 | Foto principal do hero; dois recortes nos cards da equipe e nos cards de profissionais do agendamento |
| `public/images/barbershop/ambiente.webp` | WebP 246×148 | Foto do interior na seção A barbearia |
| `public/images/work/corte-perfil.webp` | WebP 265×326 | Card “Cortes” e primeiro item da galeria |
| `public/images/work/barba.webp` | WebP 265×326 | Card “Barba” e segundo item da galeria |
| `public/images/work/corte-cacheado.webp` | WebP 265×322 | Card “Identidade” e terceiro item da galeria |
| `public/images/work/barboterapia.webp` | WebP 263×325 | Terceiro card da equipe, cuidado em atendimento |
| `src/app/icon.svg` | SVG vetorial | Favicon tipográfico gerado do código-fonte; não é a logo raster |
| `src/components/brand/scissor-scroll.tsx` | SVG inline | Tesoura decorativa metálica com gradientes e sombra; gerada pelo componente |
| `src/app/opengraph-image.tsx` | PNG gerado 1200×630 | Cartão social com logo, foto, slogan e paleta da marca |

Não há arquivos de fonte em `public`; Fontsource fornece os arquivos instalados por dependência após `npm ci`. `artifacts/` contém capturas **históricas** de fases anteriores, úteis para acompanhar evolução, mas não são imagens usadas pelo site em execução. `entrega-codex/capturas/` contém as capturas desta análise.

## 8. Responsividade e inspeção visual

Breakpoints efetivos: **359, 520, 640, 700, 767/768, 980, 1024 e 1180 px**. A Home passa de cartões empilhados para grids a 640 px; hero e apresentação dividem colunas a 768 px; navegação completa só aparece a 1024 px. O agendamento passa para cards/inputs de múltiplas colunas a 700 px, resumo lateral a 980 px e calendário lado a lado a 1180 px; resumo é ocultado até 520 px. Há `clamp()` para tamanhos e espaçamentos, container máximo de 1320 px, gutter variável 20–80 px. Em 320–375 px, fotos e seções alongam bastante a página; conteúdo continua em coluna. Em 768 px, o hero já divide colunas, mas o menu continua compacto. Em 1440 px, o hero é horizontal e os cards recebem composição editorial escalonada.

Capturas atuais em `entrega-codex/capturas/`: `home-{1440,768,375,320}.png`, `agendar-{1440,768,375,320}.png`, `calendario-{1440,768,375}.png`, `revisao-1440.png` e `conclusao-1440.png`. A captura da Home exige passar pelas seções para disparar `Reveal`; fotografias e elementos ocultos por animação foram inspecionados no modo normal de movimento. As imagens da captura não substituem as imagens originais.

Na execução local, não houve overflow horizontal em 1440, 768, 375 ou 320 px nas duas rotas, e nenhuma exceção JavaScript foi capturada no fluxo verificado. **Problema de movimento reduzido:** ao emular `prefers-reduced-motion: reduce`, elementos `Reveal` abaixo do hero permaneceram com opacidade 0 mesmo após rolagem; isso pode deixar grande parte da Home invisível para usuários dessa preferência. A evidência foi observada no navegador; não foi corrigida por restrição deste trabalho. A documentação anterior em `docs/phase-1-validation.md` registra outro estado/rodada e não substitui esta observação.

## 9. Funcionalidades e integrações

**Implementadas:** navegação interna por âncora e rotas; menu móvel em Dialog; FAQ nativo; botões para Instagram, telefone (`tel:`) e Google Maps; mapa incorporado via `iframe`; CTA móvel condicional; fluxo local de quatro etapas; máscara visual do telefone; estados de seleção, revisão, contador e reinício; metadados, robots/sitemap e arte social condicionados à configuração.

**Demonstrativas ou incompletas:** disponibilidade, profissionais numerados e retenção de sete minutos são dados locais sem reserva real; “Confirmar” só troca a tela; não há mensagem de WhatsApp nem persistência. A avaliação 5,0/460, horários e contato são constantes de `brand.ts` e não recebem atualização de Google ou Instagram; devem ser confirmados com o negócio antes de divulgação final. O link de prova social busca o endereço no Maps, não abre um conjunto de depoimentos verificados. O mapa depende de conectividade e política do serviço. O Instagram oficial fornecido é um link externo; a página bloqueou leitura automatizada nesta análise, portanto o relatório não usa informações adicionais do perfil. Nenhuma integração com WhatsApp foi encontrada, apesar do campo com esse nome.

**Sem comportamento próprio:** cards de serviços, equipe e galeria são expositivos, sem clique; o monograma e a tesoura são decorativos; a caixa “WA” é apenas informativa. Não há formulário de contato na Home, feed, carrossel, busca, autenticação ou painéis. Não há tabela de preços.

## 10. Problemas e riscos observados

1. **Acessibilidade com movimento reduzido:** `Reveal` pode manter seções invisíveis, conforme a inspeção descrita acima.
2. **Agendamento não é transacional:** a aparência de calendário/contador pode sugerir disponibilidade real; o texto de demonstração atenua, mas a conclusão “HORÁRIO CONFIRMADO.” requer cuidado antes de publicar como serviço definitivo.
3. **Dados de negócio pendentes:** sem serviços/valores/durações, nomes reais, regras de cancelamento e texto final; horários, telefone e nota devem ser validados com a barbearia. Há uma inconsistência específica: `brand.openingHours` declara domingo aberto, mas `isMockDayAvailable` bloqueia todos os domingos no calendário.
4. **Fotografia de baixa resolução:** a maior foto de equipe tem 264×321 px, embora apareça bem maior no hero; no desktop pode ficar visivelmente suave/pixelada. A logo tem 119×53 px e inclui fundo escuro, limitando aplicações em fundos claros.
5. **CSS acumulado:** `globals.css` mantém blocos de layout de fases anteriores (`.hero`, `.services`, `.booking-page` etc.) ao lado das classes atuais `*-v2`/`booking-flow-*`. Isso aumenta o custo de manutenção e pode gerar conflitos futuros; a exportação preserva o arquivo exatamente como está.
6. **Duas implementações de prévia:** `index.html`/`agendar.html` duplicam estrutura e lógica da aplicação Next.js. São úteis para compartilhar visualização, mas precisam de conferência sempre que o site muda.
7. **SEO condicionado ao domínio:** sem `NEXT_PUBLIC_SITE_URL`, o preview fica `noindex`, robots bloqueia tudo e sitemap é vazio. `/agendar` permanece fora da indexação por configuração própria.
8. **Calendário simulado:** não há limite de meses futuros, regras de expediente por profissional/serviço, feriados ou bloqueio simultâneo. A validação do telefone verifica comprimento, não titularidade; o estado é perdido ao recarregar.
9. **Dependência externa do mapa:** o `iframe` pode não carregar em redes restritas; não há mapa local de fallback. Os links de rota e telefone continuam disponíveis.

## 11. Preparação para redesign

**Reutilizáveis:** estrutura App Router, tokens de marca, `brand.ts`, conteúdo editorial de `content.ts`, componentes `Header`, `Footer`, `Button`, `PhotoFrame`, SEO, imagens existentes e o fluxo de agendamento como protótipo de interação. A separação de conteúdo e apresentação facilita trocar o visual sem reescrever toda a navegação. A tesoura SVG pode ser preservada ou simplificada após revisar desempenho e acessibilidade.

**Preservar:** nome/logotipo real, vínculo com Gravatá e Prado, identidade de barbearia, uso honesto de fotos reais, contraste escuro/claro e cor cobre se aprovados pelo proprietário. A tipografia condensada e o tom direto de texto já fornecem personalidade. O redesign deve partir da marca efetiva, validando-a com arquivos originais.

**Melhorar:** obter logo vetorial/alta resolução e fotografias originais autorizadas; definir catálogo de serviços, valores e duração; confirmar nomes, funções, contato, horário, nota pública, endereço e política de agendamento/cancelamento; resolver a invisibilidade em movimento reduzido; reduzir estilos legados; diferenciar de forma inequívoca a demonstração de uma reserva real; reforçar acessibilidade manual, contraste em textos pequenos, legibilidade móvel e estados de erro/vazio. Testar com mapas indisponíveis e larguras de 320 px também é recomendável.

**Limitações técnicas atuais:** sem backend, banco, API de WhatsApp ou fonte de horários. Para um agendamento profissional serão necessários modelo de serviços/profissionais, disponibilidade confiável no servidor, reserva atômica, confirmação, regras de cancelamento/remarcação, proteção de dados e um canal de contato confirmado. Para o redesign visual isolado, o material existente é suficiente para prototipar telas, mas as fotos pequenas limitam peças de grande destaque.

## 12. Como executar e verificar

Requer Node.js **22 ou superior** (`.nvmrc` indica 22). Na raiz do projeto:

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`. Para executar o build de produção: `npm run build` e `npm start`. Para validação de código: `npm run lint`, `npm run typecheck` e `npm run test:e2e` (Playwright Chromium deve estar instalado, por exemplo com `npx playwright install chromium`). O projeto usa `package-lock.json`; mantenha-o para reprodução. `NEXT_PUBLIC_SITE_URL` é opcional em desenvolvimento e deve receber o domínio oficial aprovado antes de indexar o site. `.env.example` documenta a variável sem credenciais.

`index.html` e `agendar.html` também podem ser abertos com servidor estático/Live Server para uma prévia independente; a aplicação de referência para este relatório é a versão Next.js. O script `scripts/prepare-images.mjs` exige capturas de origem externas ao repositório e serve apenas para reproduzir os recortes, não para executar o site.

## 13. Notas sobre a exportação

O ZIP acompanha este relatório, as capturas atuais, código-fonte completo, oito imagens WebP, arquivos HTML independentes, configurações, scripts, testes, documentação, lockfile e `artifacts/` histórico. `node_modules`, `.git`, `.next`, caches, logs, arquivos de ambiente reais, compilações e arquivos temporários foram filtrados apenas no momento de empacotar. O inventário exato está em `ARQUIVOS_INCLUIDOS.txt`.
