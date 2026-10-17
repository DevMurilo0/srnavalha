# Sr. Navalha V6 — checkpoint de continuidade

Atualizado em **16/10/2026, horário de Recife**; o arquivo de direção do Taste foi gravado em 17/10/2026 às 02:27 UTC. Este documento registra o trabalho efetivamente realizado e fecha o planejamento para a próxima sessão.

## 1. Instrução mais recente do usuário — prevalece sobre a execução anterior

**Pausar a reconstrução e apenas salvar o contexto.** Não iniciar implementação nesta sessão, não fazer novas pesquisas externas, não baixar ferramentas adicionais. O objetivo é economizar o limite e permitir que outro modelo continue sem repetir auditoria e pesquisa.

Ao retomar, confirmar o escopo da nova mensagem: este checkpoint não é autorização para reiniciar automaticamente downloads ou pesquisas interrompidas. Não fazer commit, push, reset ou checkout que descarte alterações locais.

## 2. Estado real do projeto

- Diretório: `/home/murilo/Dev/andamento/srnavalha`.
- Repositório de referência: <https://github.com/DevMurilo0/srnavalha>.
- Site estático, HTML/CSS/JavaScript, deve continuar abrindo por `index.html` no Live Server. Sem dependência de execução de React, Next, Vite, npm ou build.
- **A V6 ainda não foi implementada.** Não foram criados novos componentes, fontes, fotografias ou animações de produção.
- A interface encontrada é a V5, conceito **Linha 349**, com arquivos planos. Ela não corresponde à estrutura antiga descrita nas primeiras mensagens da conversa.
- Há muitas alterações locais anteriores à sessão, inclusive centenas de exclusões de arquivos antigos rastreados. Elas não são trabalho desta reconstrução e devem ser preservadas.
- `git status` e arquivos principais foram inspecionados. A leitura completa do diff de conteúdo ainda não foi concluída; não chamar isso de auditoria final do diff.
- Foi lido o HTML atual, o JavaScript principal/agendamento, documentação local e materiais históricos selecionados. O inventário de fotos atuais foi confirmado com ImageMagick.
- Não houve validação nova em Chromium/Firefox nem inspeção visual completa das capturas nesta sessão. Resultados de testes antigos não certificam uma V6 inexistente.

### Arquitetura atual encontrada

| Papel | Arquivos atuais |
|---|---|
| Páginas | `index.html`, `agendar.html` |
| Estilos | `css/site.css`, `css/motion.css`, `css/booking.css` |
| Comportamento | `js/site.js`, `js/booking.js` |
| Fotos | `assets/images/`, arquivos planos listados adiante |
| Decoração | `assets/decor/` |
| Documentação anterior | `docs/ART_DIRECTION.md`, `docs/MOTION_SYSTEM.md`, `docs/REFERENCIAS.md`, `docs/VALIDACAO.md`, `docs/AVALIACOES.md` |
| Evidências antigas | `capturas/`, `docs/test-output.json`, `docs/audit-result.json` |
| Ferramentas antigas de teste | `docs/audit.py`, `docs/test_inline_preview.py` — examinar antes de reutilizar |
| Histórico local | `backup/referencia-codigo-anterior-2026-10-15.zip` |

### Diagnóstico estrutural da V5, a partir do código e do relato do usuário

1. Hero: título grande à esquerda, imagem cinematográfica ampliada à direita, sobreposições escuras. Não reconstruir essa estrutura.
2. Ambiente: fotografia derivada de 1400 × 780 usada em uma seção larga com overlay. A origem pequena não oferece detalhes equivalentes às dimensões do derivado.
3. Encerramento: “O PRÓXIMO É SEU”, título dominante sobre campo simples. Substituir a ideia, não apenas ajustar margens.
4. **Serviços da V5 já usam uma lista com imagem compartilhada.** Não afirmar que a versão atual tem três cards convencionais e não apresentar a mesma lista lateral como inovação da V6.
5. Agendamento atual já encaminha preferências pelo WhatsApp; manter a honestidade da solicitação e reconstruir a apresentação sem voltar ao fluxo de etapas.
6. Fontes atuais são externas via Google Fonts (Barlow Condensed/DM Sans); V6 deve hospedar fontes localmente.
7. A esteira atual tem clones/pausa; preservar os quatro textos e fontes, mas validar novamente qualquer implementação nova. Não importar automaticamente o resultado de testes de versões anteriores.
8. `docs/ART_DIRECTION.md` da V5 já descreve a galeria como folha de contato. Portanto, o nome do conceito novo não comprova diferença: a V6 precisa mudar efetivamente a abertura e o modo de explorar/selecionar fotografias, não apenas rebatizar a galeria existente.

`docs/VALIDACAO.md` da V5 registra testes antigos por HTML/CSS/imagens embutidos com `page.set_content`, pois naquele ambiente `localhost` e `file://` foram bloqueados (`ERR_BLOCKED_BY_ADMINISTRATOR`). O documento ressalva que Maps e fontes externas não carregaram, e que as capturas não comprovam execução HTTP pelo Live Server. Essas são limitações **da validação anterior documentada**, não erros reproduzidos na sessão V6.

## 3. Backup e preservação

Backup completo da árvore de trabalho antes da V6, incluindo alterações locais:

`/home/murilo/Dev/andamento/srnavalha-pre-v6-20261016.zip`

- Existência conferida: **21.576.106 bytes**, **139 entradas**.
- Contém `GIT_STATUS_PRE_V6.txt` para distinguir alterações anteriores.
- Exclui `.git`, `node_modules` e caches selecionados.
- Está fora do repositório de propósito.
- Foi possível abrir o índice do ZIP. Isso não equivale a um teste de restauração completo.
- Na conclusão deste checkpoint, uma comparação byte a byte de todos os arquivos contidos no ZIP contra os caminhos atuais retornou **zero arquivos diferentes e zero ausentes**. Os arquivos novos de planejamento não fazem parte desse baseline.

Não usar `git diff` contra HEAD como se tudo ali fosse produzido nesta sessão. Para identificar mudanças da V6, comparar também com esse backup.

### Artefatos criados nesta sessão

- `.taste-skill/direction.json`: direção sorteada e selecionada pelo Taste, incluindo seed e ficha completa.
- `docs/V6_CHECKPOINT.md`: este checkpoint.
- O ZIP externo de segurança acima.
- Arquivos parciais de ferramentas fora do projeto, descritos na seção de ferramentas.

**Nenhum arquivo de produção do site foi intencionalmente modificado nesta sessão.** Os HTML/CSS/JS atuais e as exclusões locais preexistentes devem permanecer intactos. Não foi criada a área separada de implementação ainda.

## 4. Plugins: caminhos confirmados, leituras e aplicação

Os plugins foram encontrados no projeto, não apenas presumidos a partir de seus nomes. `AGENTS.md` exige seu uso e `.agents/plugins/marketplace.json` registra a instalação local.

### Taste Frontend

Instruções lidas em:

`plugins/taste-frontend-design/skills/design-taste-frontend/SKILL.md`

Scripts disponíveis em `plugins/taste-frontend-design/skills/design-taste-frontend/scripts/`:

- `draw.mjs`: **executado com sucesso**, três opções e depois ficha completa da direção escolhida.
- `lint.mjs`: **não executado**.
- `inspect.mjs`: **não executado**; depende de Chromium compatível.
- `lib/cdp.mjs`: cliente CDP sem dependências, lido; pode servir para testes com Node 22 e Chrome disponível. Node é ferramenta opcional de desenvolvimento, não requisito do site.

Diretrizes relevantes: composição ligada ao assunto real; fotografias autênticas; hierarquia por posição e escala; evitar cards genéricos, gradientes e decoração gratuita; textos legíveis; poucos tipos; conteúdo utilizável sem motion; inspeção real em desktop/tablet/mobile. O roteiro pede inventário específico do negócio e evidência para afirmações. Não inventar volume de portfólio, clientes, preços ou prêmios para cumprir uma ficha.

### Impeccable UI

Instruções lidas em:

`plugins/impeccable-ui/skills/impeccable/SKILL.md`

Referências consultadas: `reference/new-work.md`, `reference/init.md`, `reference/craft-floor.md`. O fluxo correto é **new-work/reconstrução**, não polish da V5.

- O launcher chamado diretamente falhou com **`Permission denied` (exit 126)**. Isso é falha de execução da ferramenta, não do JavaScript do site.
- A tentativa via `sh .../scripts/impeccable concept-seed --scope direction --mode experience` iniciou download do motor. **Não houve resultado confirmado do concept-seed.** Não afirmar que houve sorteio ou auditoria automatizada Impeccable.
- O usuário foi informado da limitação; as instruções locais foram usadas diretamente.
- Registrar futuramente contexto em `PRODUCT.md`, sistema com tokens em `DESIGN.md` e `.impeccable/design.json`. Esses arquivos **ainda não existem como entrega desta sessão**.
- Para a retomada, usar execução baseada em código e contrato de composição; o usuário solicitou implementação direta e seleção autônoma do conceito. Não exigir aprovação intermediária de mockups por inferência do skill.
- Fazer captura em lote, crítica contra o contrato, correções agrupadas e confirmação; evitar ciclos intermináveis de microajustes.
- O fluxo pede revisão final independente e documentação. Há instrução explícita no skill para agentes de revisão/documentação; nenhuma delegação aconteceu ainda. Se o harness permitir, respeitar a passagem de evidências reais. Não declarar revisão independente sem executá-la.
- `detect` e demais auditorias do motor **não rodaram**. Se o motor continuar indisponível, documentar a limitação e usar os arquivos locais; não recomeçar download sem autorização compatível com a nova instrução.

### Emil Design Engineering

Instruções lidas em:

`plugins/emil-design-engineering/skills/emil-design-eng/SKILL.md`

Aplicação planejada: resposta imediata; continuidade espacial; animações interrompíveis; transições de interface em torno de 150–250 ms; movimento de assinatura excepcional e curto; propriedades `transform`/`opacity`, máscaras limitadas; não esconder CTA durante entrada; separar transformações de hover/revelação; nunca depender exclusivamente de hover; foco e toque equivalentes; reduced motion inclusive quando a preferência mudar durante a sessão.

Documentar revisão com tabela **antes / depois / por quê**. Não animar tudo continuamente nem empilhar timelines concorrentes no mesmo elemento.

## 5. Pesquisa externa já realizada — não repetir agora

As páginas abaixo foram acessadas por Firecrawl, com leitura de conteúdo textual, metadados e links do catálogo. **Não houve reprodução confirmada das animações dos sites ao vivo nem inspeção visual completa das imagens de referência.** Distinguir elemento catalogado de comportamento observado no navegador.

### Cinco referências solicitadas

| Referência | Evidência obtida | Princípio aplicável, sem copiar a página |
|---|---|---|
| [Humbert & Poyet](https://www.awwwards.com/sites/humbert-poyet) | SOTD 07/08/2018; catálogo registra Scroll Portfolio e Interactive Hover Effect Menu; arquitetura/minimalismo | Ambiente como documento arquitetônico, com fotografia proporcional e navegação clara. Não transformar imagem pequena em background gigante. |
| [Invisible North](https://www.awwwards.com/sites/invisible-north) | HM 03/02/2023; Typography Scroll, Hero Gallery, Scrolling Animation, Project Interaction, Grid Transition | Relacionar índice, texto e fotografia ativa; transformação de composição com função, sem copiar efeitos em conjunto. |
| [Peak’n Film](https://www.awwwards.com/sites/peakn-film) | SOTD 20/06/2020; Portfolio Navigation Transition e Rollover Animated Variable Font; referência fotográfica | Navegação própria de portfólio, transição contínua e legenda ligada à seleção. Site indicado: <https://peaknfilm.com/>. |
| [Family Style](https://www.awwwards.com/sites/family-style) | HM 07/03/2025; Hero, Layout, Studio Scroll, Pop-up Reels | Ritmo entre fotografia, tipografia e interação; modal como continuação da exploração. Site indicado: <https://www.wearefamilystyle.com/>. |
| [DON BARBER & GROOM](https://www.awwwards.com/sites/don-barber-groom) | HM 15/03/2021; posicionamento de cuidado/luxo acessível; paleta do catálogo azul/cinza/branco | Marca premium não depende de preto/cobre e clichês de barbearia. Site indicado: <https://don-barber.gr/en>. |

### Referências complementares selecionadas

A listagem <https://www.awwwards.com/websites/> também foi consultada. Quatro páginas individuais recentes foram lidas:

| Referência | Catálogo consultado | Contribuição concreta |
|---|---|---|
| [LPAS](https://www.awwwards.com/sites/lpas) | SOTD 10/10/2026; Studio Naam; portfólio escalável, menu, contato e continuidade do footer; <https://lpas.com/> | Fechamento conectado ao percurso e organização arquitetônica do conteúdo. |
| [Maria Vasilyeva Portfolio](https://www.awwwards.com/sites/maria-vasilyeva-portfolio) | SOTD 09/10/2026; annotations, projetos, hover, about scroll, navigation; <https://www.mariavasilyeva.com/> | Anotações precisas e navegação do trabalho como identidade, sem adornos soltos. |
| [Odyssée](https://www.awwwards.com/sites/odyssee) | SOTD 08/10/2026; Nightjar; luxury/minimal/transitions/microinteraction; <https://www.odysseeclinic.com.au/> | Refinamento do cuidado por cor, hierarquia e movimentos de interface econômicos. |
| [Colonia Zacamil](https://www.awwwards.com/sites/colonia-zacamil) | SOTD 01/10/2026; Adoratorio/60fps; mapa, rotas, murais, passado/presente; <https://coloniazacamil.com/> | Navegação contextual ligada a conteúdo e lugar verdadeiros. Não importar WebGL ou controles desnecessários. |

Essas datas são as retornadas pelo catálogo consultado, não datas de visita presencial ou de verificação independente dos projetos.

### Material visual localizado, mas ainda não inspecionado

URLs de imagens retornadas pelo Awwwards, guardadas para uma retomada autorizada que necessite inspeção visual; **não baixar novamente nesta pausa**:

- Humbert & Poyet: `https://assets.awwwards.com/awards/sites_of_the_day/2018/08/humbert-poyet-interior.jpg`
- Invisible North: `https://assets.awwwards.com/awards/submissions/2023/01/63d005e941738142438767.png`
- Peak’n Film: `https://assets.awwwards.com/awards/sites_of_the_day/2020/06/peaknfilm-1.jpg`
- Family Style: `https://assets.awwwards.com/awards/submissions/2025/02/67b9077d61d13953794513.png`
- DON: `https://assets.awwwards.com/awards/submissions/2021/03/6042934aa94cf913800556.jpg`
- LPAS: `https://assets.awwwards.com/awards/submissions/2026/08/6a834ca95e78f943693095.jpg`
- Maria Vasilyeva: `https://assets.awwwards.com/awards/submissions/2026/08/6a87093710758900048487.png`
- Odyssée: `https://assets.awwwards.com/awards/submissions/2026/08/6a8299452ae29820569010.png`
- Colonia Zacamil: `https://assets.awwwards.com/awards/submissions/2026/08/6a8d9b30ca91e542486198.jpg`

### Pesquisa de movimento

Consultados <https://reactbits.dev/>, <https://gsap.com/> e <https://tympanus.net/codrops/>. Conclusão: extrair princípios de navegação fotográfica, timeline e continuidade; não adicionar React, WebGL ou efeitos de cursor apenas pela referência. A implementação pode usar APIs nativas/WAAPI; GSAP é opção, não obrigação. A V5 atual não carrega os arquivos GSAP que aparecem como excluídos no Git.

Foram localizados, mas **não lidos em profundidade**, artigos do Codrops como `https://tympanus.net/codrops/2026/10/09/architecture-studio-astro-gsap/` e `https://tympanus.net/codrops/2026/10/12/chasing-the-moment/`. Não atribuir conclusões específicas a artigos não examinados.

### Pesquisa de fontes reais

- Instagram oficial: <https://www.instagram.com/barbeariasrnavalha01/>. Tentativa de scrape falhou com `INVALID_ARGUMENT`. Não foram obtidos novos originais nem verificados direitos adicionais de reutilização.
- Página pública <https://sites.appbarber.com.br/srnavala-pqjj> foi lida; identidade e endereço correspondem ao negócio. Foram encontrados logo e imagens de serviços, porém não foram inspecionados visualmente nem comprovados como fotos documentais próprias. Não importar imagens possivelmente genéricas como clientes reais.
- Logo candidato da página oficial: `https://s3-sa-east-1.amazonaws.com/img-appbarber-appbeleza/srnavala-pqjj/srnavala-pqjj_68de7f84e7dd4.png`. Não baixado/validado como melhoria.
- Essa página contém a frase “onde o corte vira identidade”, útil como contexto de marca. Não inventar slogan oficial novo nem nomes de profissionais a partir de suposições.

## 6. Direção artística: decisão e adaptações necessárias

### Resultado real do Taste

Arquivo persistente: `.taste-skill/direction.json`.

- Seed: **882532839**.
- Direção: **`contact-sheet` / The contact sheet**.
- Setor: `studio-portfolio`; tom: `editorial`; imagens próprias (`imagery: own`).
- Três opções inicialmente retornadas: `uneven-photographs`, `contact-sheet`, `name-as-monument`.
- Comando inicial executado:

```sh
node plugins/taste-frontend-design/skills/design-taste-frontend/scripts/draw.mjs \
  --sector studio-portfolio \
  --brief 'Sr. Navalha em Gravatá: retratos reais pequenos, corte e ritual de cuidado, composição fotográfica sem upscale' \
  --sections work,list,about,testimonial,contact,faq,cta,footer \
  --tone editorial --have photography --options 3
```

Depois foi gerada a ficha completa da direção escolhida. **Não sortear de novo só para retomar contexto.**

### Ressalvas da ficha — resolver por adaptação, não por conteúdo falso

1. O arquétipo contact-sheet pede 24 ou mais quadros e alerta que poucos podem parecer insuficientes. Temos cinco fotos de trabalhos confirmadas, uma da equipe e uma do espaço. Logo, **não cabe executar literalmente uma parede densa de fotografias**.
2. A ficha geral sugere nome em display 6–9vw, mas o blueprint de hero sorteado diz texto todo a 16px. São prescrições conflitantes. O plano abaixo escolhe marca em escala editorial moderada e fotografias pequenas; não é cumprimento literal de ambas.
3. O set de fotos de textura sugerido pelo sorteio é irrelevante para a documentação da barbearia. Não usar Unsplash de outros lugares como se fosse Sr. Navalha.
4. Depoimentos com retratos, listas de clientes/prêmios e repetição de projetos presentes em modelos não se aplicam sem evidência.

### Três conceitos para a especificação final

Estas propostas fecham o planejamento; ainda não foram desenhadas nem comparadas visualmente no navegador.

| Conceito | Hero e tipografia | Paleta/fotografia | Componentes, movimento e mobile |
|---|---|---|---|
| **Ensaio de cuidado — escolhido** | Marca em faixa superior; pequeno conjunto fotográfico logo abaixo, no primeiro viewport; breve apresentação e CTA imediatamente utilizável. Uma grotesca, duas escalas principais. | Osso/chocolate/verde; retratos reais em proporções originais e escala controlada. | Índice de trabalhos com fotografia ativa; catálogo em faixas expansíveis; máscaras curtas e troca contínua. Mobile com dois quadros por linha e controles explícitos, sem hover obrigatório. |
| **Entre espelhos** | Composição central em díptico, texto em torno de dois enquadramentos pequenos; sem texto gigante à esquerda de uma foto larga. Tipografia sóbria com hierarquia por alinhamento. | Marfim, carvão, cobre discreto; fotos pequenas dentro de composição arquitetônica abstrata claramente gráfica. | Alternância entre atendimento e resultado, transição de abertura/fechamento como espelho. Mobile empilha os dois planos. Risco: linguagem gráfica superar a evidência fotográfica disponível. |
| **Caderno de atendimento** | Página de índice/registro, marca compacta, serviços e pedido integrados à abertura; grotesca mais condensada apenas se justificada. | Papel claro, tinta escura, um acento cobre; fotografias como registros inseridos entre blocos de texto. | Navegação por entradas, detalhes expansíveis e convite final como ficha de solicitação. Mobile linear e muito direto. Risco: ficar administrativo e dar menos protagonismo ao portfólio. |

**Decisão:** usar “Ensaio de cuidado”, uma interpretação compacta da folha de contato. É a direção que mais respeita a resolução real das fotos e permite mudar a composição sem fabricar um acervo. Não usar o endereço 349 como motivo decorativo principal. O conceito só estará comprovado depois da primeira captura comparada com a V5; não chamar a direção de aprovada visualmente antes disso.

### Tokens planejados pelo Taste

| Papel | Valor |
|---|---|
| Fundo osso | `#e5e1d8` |
| Superfície | `#dad5ca` |
| Texto chocolate | `#2a1d17` |
| Texto secundário | `#6b5b51` |
| Acento verde | `#456f3a` |
| Texto sobre acento | `#ffffff` |
| Fonte | Hanken Grotesk, pesos 400 e 500 |

Paleta é **planejada, não implementada**; contraste precisa ser medido. Verde deve ter um papel claro em ação/campo de fechamento, não salpicos decorativos. A identidade continua na marca original, nos trabalhos e no conteúdo real. Não introduzir automaticamente a paleta só porque foi sorteada caso a inspeção revele incompatibilidade.

Fonte Hanken ainda não foi baixada. Hospedar WOFF2 com licença documentada numa retomada autorizada. Alternativa disponível no histórico Git: fontes locais Manrope/Barlow anteriormente utilizadas, sem restaurar cegamente arquivos que o usuário excluiu. Não adicionar Google Fonts remoto como solução permanente.

Escala indicativa da ficha: corpo 17–19px, pequeno 13–14px, texto de destaque 20–26px, títulos 32–64px; nome do hero pode usar 6–9vw com limites. Ajustar para caber sem quebras ruins em 320px. Máximo de duas famílias; preferência por uma.

### Composição fechada para a próxima implementação

1. **Header:** marca original, navegação contextual e CTA. Menu móvel nativo/acessível, teclado e Escape. Não recriar a ornamentação Linha 349.
2. **Hero:** marca horizontal e faixa de informações breves, seguidas de poucos retratos reais em alturas/proporções controladas. Sem grande imagem de fundo, sem split texto-esquerda/foto-direita, sem gradiente para esconder falta de detalhe. CTA visível desde o início. A entrada organiza os quadros com máscara curta; layout final completo mesmo sem JavaScript.
3. **Serviços:** catálogo em faixas de largura ampla. Ao selecionar/expandir Corte, Barba ou Sobrancelha e acabamento, foto pequena e texto aparecem dentro da faixa ativa. Estrutura diferente do título lateral + seletor + preview da V5. Acesso por toque/teclado; fallback com conteúdo legível. Sem preços/durações inventados.
4. **Ambiente:** foto original 246 × 148 em escala controlada, acompanhada de legenda precisa, informação do lugar e composição de espaço negativo. Se houver SVG de espelho/enquadramento, deve ser gráfico abstrato, não planta ou representação documental falsa. Não aplicar blur/nitidez CSS para fingir detalhe.
5. **Equipe:** registro real de atendimento com texto curto; nenhum nome fictício. Não ampliar o retrato de 264 × 321 para ocupar meia tela.
6. **Portfólio:** índice de cinco trabalhos, miniaturas e enquadramento ativo em escala honesta; legenda acompanha a seleção. Transição de imagem contínua por máscara/opacidade; botões, teclado, swipe e arraste quando úteis. Lightbox com foco preso, Escape, retorno ao gatilho, clique fora e desbloqueio da rolagem. Não duplicar fotos para simular quantidade.
7. **Avaliações:** quatro depoimentos originais e links, esteira automática direita→esquerda sem setas, pausa progressiva no hover e controle explícito; toque permite leitura/rolagem manual; clones ocultos da acessibilidade; reduced motion estático.
8. **Localização:** Google Maps real preservado, proporção retangular, endereço e link sempre acessíveis. Ativação explícita para não capturar rolagem. O fallback é texto/link, nunca desenho falso de ruas.
9. **FAQ:** perguntas reais já presentes, `details/summary` ou equivalente acessível, sem dependência de animação para leitura.
10. **Encerramento:** convite compacto ligado à fotografia/registro de atendimento, com informação útil e ação. Pode assumir a forma de uma ficha editorial aberta em campo verde, sem imitar confirmação de reserva. Não usar outro slogan gigante centralizado sobre fundo vazio.
11. **Agendamento:** página direta em uma área principal, serviço, profissional opcional, dia/horário como preferências e nome apenas se útil. WhatsApp com texto codificado; nenhuma vaga ou reserva automaticamente confirmada. Formulário simples, sem cronômetro ou etapas.
12. **Rodapé:** identidade, contato, navegação e crédito de Murilo Gabriel preservado.

### Movimento planejado

- Assinatura 1: organização/revelação curta dos quadros do hero; CTA não espera timeline.
- Assinatura 2: continuidade entre índice e fotografia selecionada no portfólio; cancelamento/substituição de transição ao mudar rapidamente.
- Assinatura 3, somente se necessária: abertura de faixa de serviço ligando texto e foto; não adicionar efeito só para completar uma contagem.
- Interface: respostas rápidas, foco perceptível, hover discreto separado da transformação de entrada.
- Ambiente: no máximo um deslocamento fotográfico sutil e a esteira obrigatória de avaliações; sem página inteira em movimento.
- `prefers-reduced-motion` inicial **e alteração ao vivo** devem cancelar movimento e expor conteúdo imediatamente.

## 7. Fotografias — diagnóstico confirmado e limitações

Dimensões e bytes abaixo foram medidos nos arquivos atuais com `magick identify`.

| Caminho relativo a `assets/images/` | Dimensões | Bytes | Diagnóstico/uso planejado |
|---|---:|---:|---|
| `brand-logo.webp` | 119 × 53 | 2.974 | Marca pequena; não tratar como logo vetorial. Candidato oficial de maior resolução localizado, ainda não conferido. |
| `hero-corte-e-barba.webp` | 266 × 326 | 25.282 | Fotografia real recortada de captura; adequada a quadro pequeno, não hero largo. |
| `work-barba.webp` | 265 × 326 | 24.558 | Retrato real pequeno; preservar textura/rosto. |
| `work-corte-cacheado.webp` | 265 × 322 | 17.736 | Trabalho real, proporção ligeiramente diferente; não padronizar por distorção. |
| `work-corte-perfil.webp` | 265 × 326 | 16.360 | Trabalho real; escala controlada. |
| `work-barboterapia.webp` | 263 × 325 | 13.612 | Registro real; não gerar detalhes artificiais. |
| `team-atendimento.webp` | 264 × 321 | 17.596 | Atendimento/equipe, não inventar identidade do profissional. |
| `barbershop-ambiente.webp` | 246 × 148 | 11.748 | Ambiente real muito pequeno; evitar background de seção. |
| `hero-atendimento-cinematico.webp` | 1720 × 880 | 50.350 | Derivado de fonte pequena; dimensão não equivale a detalhe verdadeiro. Processo exato de composição ainda precisa ser conferido no script histórico. Não usar como prova de fotografia em alta resolução. |
| `barbershop-ambiente-cinematico.webp` | 1400 × 780 | 62.362 | Derivado; mesma ressalva. Retirar do protagonismo documental da V6 sem apagar a fonte existente. |

### Proveniência encontrada

No ZIP `backup/referencia-codigo-anterior-2026-10-15.zip`, o arquivo `srnavalha-redesign/docs/image-sources.md` documenta capturas do Instagram oficial, recortadas sem edição generativa e sem upscale na preparação inicial. Fontes citadas:

```text
/home/murilo/Imagens/Capturas de tela/Captura_de_tela_20261003_140525.png
/home/murilo/Imagens/Capturas de tela/Captura_de_tela_20261003_140539.png
/home/murilo/Imagens/Capturas de tela/Captura_de_tela_20261003_140551.png
/home/murilo/Imagens/Capturas de tela/Captura_de_tela_20261003_140610.png
/home/murilo/Imagens/Capturas de tela/Captura_de_tela_20261003_140624.png
```

Arquivos de captura correspondentes foram localizados. Não inspecionar capturas pessoais não relacionadas. `scripts/prepare-images.mjs` no histórico contém coordenadas de recorte, caso seja necessário confirmar a cadeia de origem. Captura maior do navegador não implica fotografia original maior dentro dela.

No histórico Git, `git show HEAD:docs/ASSETS_GERADOS.md` documenta:

- `assets/images/hero/atendimento-editorial-v2.webp`, cerca de 1672 × 941: reconstrução generativa a partir do derivado cinematográfico.
- `assets/images/barbershop/ambiente-editorial-v2.webp`, cerca de 1680 × 936: reconstrução generativa do ambiente.
- `assets/images/brand/logo-restaurada-v2.webp`, cerca de 720 × 300: restauração generativa.

Esses caminhos estão excluídos na árvore de trabalho atual. **Não restaurar por conveniência nem apresentar essas reconstruções como fotografias documentais fiéis.** Preservar a distinção entre captura real, derivado convencional e reconstrução generativa. O processo exato dos dois arquivos cinematográficos atuais não foi confirmado; não classificá-los como generativos apenas por associação.

### Estratégia de imagens

- Não foi encontrado/validado nenhum original de trabalho em resolução superior até aqui.
- Usar os WebP pequenos em tamanho honesto. Em DPR 2, uma foto de 265px contém detalhe nativo para aproximadamente 132 CSS px; a 265 CSS px já não terá nitidez nativa de alta densidade. Não prometer resolver essa limitação só com compressão.
- Preservar proporções, `width`/`height`, `object-fit` e enquadramentos; não ampliar para preencher áreas gigantes.
- Gerar variantes menores somente quando houver benefício; não criar `srcset` 640/1280 a partir de 265px para fingir resolução.
- Não aplicar tratamento uniforme ou edição generativa de rostos/cabelos/ambiente. Ajustes de exposição/cor exigem inspeção individual e preservação das fontes.
- Auditar visualmente foto por foto ainda é pendência; tabela de exposição/nitidez, tamanho renderizado e `currentSrc` não foi concluída.
- Direitos adicionais/licenças de imagens externas ainda não foram demonstrados. Trabalhar com o material local já fornecido pelo projeto; não presumir que disponibilidade pública equivale a licença aberta.

## 8. Dados e funcionalidades que não podem se perder

Fonte principal para transcrição é o `index.html` atual e o backup; copiar valores exatos, não reconstruir de memória.

- **Sr. Navalha Barbearia**.
- Av. Governador Agamenon Magalhães, 349 — Prado, Gravatá — PE, CEP 55642-210.
- Telefone/WhatsApp atual: **+55 81 99572-2396**; URL `https://wa.me/5581995722396`.
- Instagram: <https://www.instagram.com/barbeariasrnavalha01/>.
- Horários publicados na V5: segunda a sábado 08:30–18:30; domingo 09:30–14:00. Preservar como informação atual do projeto; disponibilidade de agenda não foi consultada.
- Place ID Google: `ChIJU15canBJqgcRARZqMshC8cA`.
- Link externo atual: `https://www.google.com/maps/place/?q=place_id:ChIJU15canBJqgcRARZqMshC8cA&hl=pt-BR`.
- O `iframe` existente tem URL `maps/embed?pb=...` com nome Sr. Navalha e coordenadas. **Copiar integralmente do HTML atual**, não inventar outra URL ou coordenadas. A página AppBarber também apontou aproximadamente -8.19959068, -35.56398773; isso não substitui validação visual do pin.
- Nota exibida de 5,0/466 avaliações é um registro datado, não consulta ao vivo. Manter data/contexto ou evitar fingir atualização automática.
- Crédito: **Murilo Gabriel**, <https://murilogabriel.com.br>.

### Quatro depoimentos a preservar literalmente

| Autor | Texto atual | Fonte Google (contrib ID) |
|---|---|---|
| Fernanda Santos | “Excelente! Todos os funcionários são muito profissionais e capacitados desde a recepção ao serviço prestado com excelência…” | `114895505051989083139` |
| João Neto | “Atendimento excepcional! A equipe é super atenciosa e prestativa. O atendimento faz toda a diferença aqui. Superaram as expectativas!” | `118341742729193053160` |
| Luís Gustavo Coelho | “Servico de qualidade e bom atendimento.” | `111783008765039420465` |
| Lucas Gabriel | “O atendimento foi top de linha e os cabeleireiros são muito profissionais” | `108814860750749521795` |

Formato dos links existentes: `https://www.google.com/maps/contrib/ID/reviews?hl=pt-BR`. Seleção indicada no site como verificada em 15/10/2026. A sessão V6 não refez essa verificação individual.

Agendamento deve enviar mensagem URL-encoded com preferências reais escolhidas, sem confirmação automática. Não enviar mensagens durante testes; interceptar o link gerado. Não pedir telefone do cliente desnecessariamente. Manter alternativa de contato sem JavaScript.

## 9. Ferramentas e execuções interrompidas

- Node 22.23.3, Python 3 e ImageMagick disponíveis.
- Firefox localizado em `/usr/bin/firefox`; **não foi testado**.
- Nenhum executável Chrome/Chromium foi confirmado. Não dizer que o projeto foi validado nesses navegadores.
- Não foram encontrados módulos Python `playwright`, `selenium` ou `PIL` na verificação realizada.
- Uma tentativa de Chrome for Testing deixou `/tmp/sr-v6-tools/chrome.zip` com **2.569.935 bytes**, parcial. Não é instalação utilizável/validada; não tentar extrair como download completo.
- O motor Impeccable deixou tentativa em `/home/murilo/.impeccable/bin/0.1.15/`, arquivo `.impeccable.part.12636`. Não foi validado como executável disponível.
- Ao receber o pedido de pausa, foram enviados sinais de término aos processos identificados de download/launcher (`12655`, `12636`) e à sequência antiga de descoberta que poderia executar outra consulta (`13818`). Não reiniciar esses trabalhos nesta pausa.
- Verificação posterior com `ps` confirmou que esses três PIDs não estavam mais presentes. O código de saída 1 dessa consulta significa ausência dos PIDs, não falha de validação do site.
- Falha antiga `exit 1` citada em mensagens anteriores não foi reproduzida nesta reconstrução. Não confundir com o `Permission denied` do launcher Impeccable e não inventar stack trace de navegador.
- Não há testes V6 aprovados. Checagens desta fase foram leitura/inventário/backup e execução do draw do Taste.

## 10. Plano técnico de retomada, sem refazer trabalho

### Primeira ação quando a implementação for novamente solicitada

1. Ler este checkpoint e `.taste-skill/direction.json` — não repetir sorteio, leitura integral de todos os plugins ou pesquisa Awwwards.
2. Conferir `git status --short` e mudanças feitas pelo usuário desde este checkpoint. Usar o ZIP como baseline; não restaurar arquivos antigos indiscriminadamente.
3. Criar área isolada, por exemplo `v6/`, com as páginas/estilos/scripts necessários. Ainda não criada. Não sobrepor a raiz antes de validar.
4. Usar conteúdo atual como fonte, transcrever dados reais e congelar um inventário de invariantes (quatro avaliações, contatos, links, endereço, crédito).
5. Produzir captura V5 com ferramenta já disponível se possível; se não houver navegador automatizável, registrar limitação e combinar execução posterior sem inventar resultados. Não baixar mais ferramentas sob a instrução atual.

### Implementação pendente

- Criar tokens e estrutura limpa; sugestão de responsabilidades: `css/tokens.css`, `css/base.css`, `css/site.css`, `css/motion.css`, `css/booking.css`; `js/site.js`, `js/portfolio.js`, `js/reviews.js`, `js/booking.js` e dados quando necessários. Os nomes são proposta, não arquivos criados.
- Usar HTML semântico como conteúdo/fallback; JS apenas melhora interações. Não esconder toda a página antes de o script executar.
- Construir hero, catálogo, ambiente/equipe, portfólio, avaliações, mapa, FAQ, encerramento, rodapé e agendamento estáticos antes do motion.
- Preservar arquivos originais; só criar variantes fotográficas justificadas. Centralizar metadados do portfólio sem duplicar conteúdo divergente entre scripts.
- Implementar lightbox e controles acessíveis; limitar listeners; cancelar animações ao trocar seleção rapidamente; restaurar foco/rolagem.
- Reconstruir esteira com ciclo medido, clones inacessíveis e pausas; suporte a alteração dinâmica de movimento reduzido.
- Integrar animações após a composição funcionar sem elas.

### Validação pendente

Larguras obrigatórias: **320, 375, 390, 768, 1024, 1366 e 1440 px**.

- Overflow, carregamento de imagens/fontes locais, dimensões, `srcset/sizes/currentSrc`, nitidez compatível com origem, layout shifts.
- Header/menu, foco/Tab/Escape, navegação contextual, toque e mouse.
- Galeria: seleção, abertura/fechamento, próximo/anterior, swipe/arraste, clique externo, restauração de foco, rolagem após fechar.
- Serviços: comprovar estados intermediários e finais das transições, seleção rápida, leitura dos três serviços, teclado/mobile.
- Rolagem lenta e rápida, voltar ao topo, recarregar no meio da página.
- Reduced motion inicial e mudança em sessão; conteúdo sem JavaScript.
- Esteira automática direita→esquerda, emenda, pausa/retomada, toque, clones, preservação dos depoimentos. Repetir apenas testes que a implementação nova realmente invalida.
- Google Maps: carregamento/pin/nome/endereço, zoom/rota, link externo, bloqueio do provedor/fallback, rolagem da página.
- Agendamento: campos/validação, data local válida, mensagem WhatsApp codificada, sem envio real e sem falsa confirmação.
- Console e falhas de rede relevantes. Chromium e Firefox se disponíveis; declarar indisponibilidade precisamente.
- Capturas antes/depois, estados em movimento e mapa. Abrir as imagens geradas e conferir se mostram o que o nome afirma.
- Executar `lint`/`inspect` do Taste quando possível; detector Impeccable apenas se motor disponível. Ferramentas opcionais não substituem inspeção visual e testes funcionais.

### Critério de aceitação estrutural

Comparar V5 × V6: hero diferente, serviços diferentes inclusive da lista lateral V5, ambiente documental pequeno, portfólio com navegação própria, convite final integrado. Se a diferença ficar restrita a cor, fonte, borda ou espaço, revisar a composição. Não declarar melhora da resolução real; a melhoria buscada é **uso adequado da fotografia existente**.

### Documentação e entrega pendentes

Ainda não criados como documentos V6 separados:

- `docs/PESQUISA_AWWWARDS_V6.md` — derivar da seção 5, sem repetir toda a pesquisa.
- `docs/DIRECAO_ARTISTICA_V6.md` — derivar da seção 6 e ajustar ao que realmente for construído.
- `docs/AUDITORIA_IMAGENS_V6.md` — completar a seção 7 com inspeção visual, medidas renderizadas, proveniência e bytes antes/depois.
- `docs/COMPONENTES_V6.md`.
- `docs/MOTION_V6.md`.
- `docs/TESTES_V6.md` — somente resultados executados e limitações.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json` conforme fluxo do plugin, com tokens efetivamente utilizados.

Depois da validação: integrar da área isolada para a raiz, retirar somente dependências de runtime obsoletas que a V6 substituiu, revisar diff contra o baseline e conferir invariantes. Gerar ZIP completo opcional excluindo `.git`, caches, ferramentas baixadas, temporários e `node_modules`. Não fazer commit/push.

## 11. Resumo de retomada em uma frase

**Auditoria inicial, backup, leitura dos três plugins, pesquisa textual e direção Taste estão feitos; a V6 ainda não começou a ser codificada. Retomar pela composição estática isolada do “Ensaio de cuidado”, usando poucos retratos reais em escala controlada, sem novos downloads/pesquisas enquanto persistir a restrição do usuário.**
