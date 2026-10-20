# Hero · A experiência começa na porta

Intervenção de 19/10/2026 restrita ao hero, abertura e passagem para a apresentação da casa. Fonte canônica atualizada em `scripts/build-v9.mjs`; o alias `build-v8.mjs` continua encaminhando ao gerador vigente. Funciona em servidor estático/Live Server.

## Fotografia escolhida e identificação

Fonte: [Reel de 8 de outubro de 2026](https://www.instagram.com/bocadedidi/reel/DePNevYxDML/), publicado por **@bocadedidi em colaboração com @barbeariasrnavalha01**. A colaboração consta no conteúdo público da publicação, e o Reel também aparece na aba Reels do perfil oficial. Metadados públicos registram `taken_at=1791471883`; identificação resumida em `fontes-hero/FONTE_ESCOLHIDA.json`.

O perfil oficial consultado informa Avenida Agamenon Magalhães, 349 e telefone 81 99572-2396. O letreiro e o próprio handle aparecem na fachada do vídeo. São os mesmos estabelecimento e identidade do AppBarber e da ficha do Prado, Gravatá, não uma barbearia homônima.

Foram selecionados dois frames do **mesmo vídeo documental**, disponível em 720×1280:

- **58,32 s:** letreiro e entrada de vidro, sem o apresentador em primeiro plano. Protagonista do hero.
- **6,50 s:** vista ao longo do salão, com espelhos, bancada e atendimentos. Aparece na passagem para a casa; não é apresentado como retrato de um profissional.

O registro de 08/10 é posterior à publicação de obra [DdhNWzMyWNQ](https://www.instagram.com/reel/DdhNWzMyWNQ/), de setembro. A fachada aparece em funcionamento, com letreiro instalado e entrada acabada. É o enquadramento recente que conseguimos verificar publicamente; isso não certifica que nenhuma alteração tenha ocorrido depois de 08/10.

## Pesquisa executada

- Instagram: perfil oficial, grade pública, aba Reels, publicações fixadas de novembro/2025 e maio/2026, Reel da obra, colaboração de 08/10 e publicação da área Kids de 12/10.
- Destaque “Localização”: o acesso público terminou em exigência de cadastro. Não foi contornado.
- Google Maps: identidade/endereço conferidos; galeria pública limitada. A imagem principal encontrada era um atendimento individual, inadequado ao conceito.
- AppBarber: marca, endereço e galeria conferidos. A galeria do espaço oferece imagem padrão, não uma nova foto documental de fachada.
- Facebook: não foi encontrada uma página oficial confirmada pelas fontes consultadas; imagens de homônimos não foram usadas.
- Assets e histórico: inventário V8/V9, fotografia pequena do interior e `backup/referencia-codigo-anterior-2026-10-15.zip`. O interior antigo tinha 246×148 px e não foi ampliado para este hero.

A ferramenta Firecrawl não recuperou o Instagram; o navegador Chromium conseguiu abrir as publicações públicas e os recursos presentes no HTML da própria página, sem autenticação. O destaque restrito foi respeitado. As buscas por imagem também retornaram outras barbearias, descartadas.

## Tratamento e resolução

Originais preservados em `assets/originals/hero-redesign/`: vídeo integral e dois frames PNG. A versão 720×1280 é a maior representação do vídeo exposta na publicação consultada; o manifesto público também oferecia 360×640. Não houve upscale.

Variantes em `assets/images/hero-redesign/`: fachada e interior em larguras 320, 480 e 720 px. Recortes de 720×1060: fachada a partir de y=90; interior a partir de y=150. Contraste discreto, nitidez conservadora na fachada, WebP q90 na variante maior e q88 nas menores. Sem geração de detalhes, alteração do letreiro, retirada artificial de pessoas ou reconstrução arquitetônica.

O `srcset`, os atributos width/height e o preload do hero foram atualizados juntos. A imagem principal tem fetchpriority alto; o interior é carregado secundariamente e não bloqueia a abertura. A imagem maior pesa aproximadamente 94 KB; as seis variantes somam cerca de 280 KB. A resolução vem de vídeo e conserva compressão/movimento de origem: não equivale a uma fotografia arquitetônica original em alta resolução.

## Direção artística e composição

O estabelecimento é o protagonista. Damião foi removido da imagem e das legendas do hero e continua intacto na seção Equipe, ao lado dos outros quatro profissionais. A segunda fotografia solta foi retirada.

O campo desktop fica limitado a 1120 px e centralizado na página. Tipografia e convite compartilham um eixo à esquerda, próximo da fachada à direita. As duas linhas do título permanecem juntas, sem atravessar o letreiro. O CTA cobre ocupa o mesmo grupo de leitura e leva ao AppBarber oficial. Uma moldura arquitetônica com cantos SVG, endereço e indicação de scroll completam a composição.

No mobile, título, fachada e CTA formam uma composição central própria. A foto mantém o letreiro legível e não é coberta pelo título. O CTA inicial permanece visível em 320/375/390×844 nos testes. O retrato individual e o mosaico não participam mais da abertura.

Carvão, marfim, cobre, logo original, Manrope e Young Serif foram mantidos. Os princípios do Salomé — fotografia coordenada, máscara, pinagem curta e progresso único — foram revisitados no navegador, inclusive o início do scroll. Não foram copiados código, ornamentos, fotografia ou paleta de gastronomia.

Taste `draw` foi executado; o dispositivo `page-is-the-object` foi interpretado como o vão/entrada real, com suas proporções e sua marca. O brief específico prevaleceu sobre qualquer ficha que exigisse fotografia horizontal inexistente ou uma reconstrução do site inteiro. Impeccable orientou hierarquia, alvos, foco e fallback; Emil orientou wrappers separados, interrupção, timing e continuidade.

## Entrada e scroll

- A abertura existente mantém logo, filete e dois painéis. O movimento principal dura 930 ms, após 430 ms de preparação; a cortina sai em até 1,4 s, com timeout independente e fallback CSS.
- Uma máscara arquitetônica revela a foto, enquanto as duas linhas entram em sequência. O reenquadramento inicial foi reduzido de 13% para 4,5%, respeitando o frame disponível.
- `hero.js` é o único dono do progresso 0–1. Entrada e scroll animam wrappers diferentes.
- No desktop, o quadro cresce no máximo **6,5%**, com deslocamento discreto. No mobile, **2,5%**; a janela se recolhe para liberar a apresentação.
- Entre 32% e 87% do percurso, uma máscara lateral revela a fotografia do salão. Trata-se de **corte editorial entre perspectivas**, não de uma travessia simulada pela porta.
- O título e o convite inicial cedem à apresentação “Entre. Sinta-se da casa.” e a outro acesso à agenda. Sem fade preto ou suavizador de scroll externo.
- O percurso é reversível. Controles que desapareceram ficam inert; links da apresentação entram no Tab apenas quando legíveis.
- Com movimento reduzido ou sem JavaScript, fachada e apresentação permanecem em fluxo. Sem JS, não é criado preloader.

Os estilos antigos específicos do hero foram retirados de `site.css`; o novo `css/hero.css` contém a composição e suas adaptações. Não foi deixado um conjunto antigo de regras responsivas competindo com o novo. Os demais componentes mantêm seus estilos e módulos.

## Verificação

| Teste | Resultado e evidência |
|---|---|
| Chromium · 320, 375, 390, 768, 1024, 1366, 1440 | Estados inicial/intermediários/final, retorno, rolagem rápida, CTA e ausência de overflow. `HERO_TESTES_CHROMIUM.json` |
| Firefox · mesmas sete larguras | Foto carregada, máscara de interior, apresentação, retorno e console. `HERO_TESTES_FIREFOX.json` |
| Abertura real | Capturas inicial, logo, painéis em andamento e final em 1440, 390 e 320. `capturas/hero-redesign/abertura-*` |
| Scroll real | Amostras 15%, 35%, 55%, 75%, 100%, retorno 50% e 0%; capturas de aproximação, corte e apresentação. |
| Movimento reduzido | Emulação inicial e dinâmica: sem abertura/pinagem; controles e leitura restaurados. |
| Sem JavaScript | Composição e apresentação em fluxo; verificação adicional com preferência normal em `HERO_ACESSIBILIDADE.json`. |
| Falha de recurso | Fotografias bloqueadas: abertura termina e agendamento continua acessível. |
| Acessibilidade automática | Axe-core 4.10.3 no hero em 390/1440 e progresso 0/1: zero violações detectadas. Não substitui teste com leitor de tela real. |
| Preservação | HTML a partir de Serviços idêntico ao backup prévio; 42 serviços, cinco profissionais e 22 produtos mantidos. |
| Gerador | Execução repetida produz HTML idêntico; alias V8 preserva a fonte V9. |

Capturas antes/depois e todas as etapas solicitadas estão em `capturas/hero-redesign/`. Scripts de teste usam servidor HTTP estático temporário, sem dependência de build ou de um processo de Live Server já aberto.

### Revisão visual

Primeira inspeção: fachada e título formam duas massas legíveis; mobile tem um eixo próprio. Foram corrigidos fundo residual da moldura que cobria a apresentação, afastamento do texto no mobile e legendas abaixo de 13px. A confirmação olha os estados intermediários, não apenas o estado final.

Taste lint dos arquivos novos: zero FAIL, com aviso sobre contorno do indicador de scroll. O inspector de página completa ainda registra ressalvas herdadas de catálogos/avaliações, mistura de fontes e paleta solicitadas, além de classificações geométricas em regiões sticky/mascaradas. As fotos e o texto foram conferidos em capturas e por limites visíveis da máscara; não se declara aprovação integral do detector estilístico. O detector Impeccable foi executado e seus avisos de escala tipográfica estão em `HERO_IMPECCABLE_DETECT.json`.

## Limites

Sem teste físico em telefone, Safari/iOS ou leitor de tela manual. A reprodução usa emulação de viewport/toque e navegadores desktop reais. O frame da fachada é nítido o suficiente na escala adotada, mas continua limitado a 720 px e ao vídeo de origem; uma foto arquitetônica original maior permitiria uma composição mais ampla. O acesso a destaques e publicações antigas do Instagram é parcial. Não foi obtida confirmação do proprietário sobre eventuais alterações posteriores à publicação de 08/10.

Nenhuma imagem de outra barbearia, fachada artificial ou fonte de estoque foi usada. Sem commit ou push. Backups anteriores preservados; arquivos da intervenção anterior ficam também em `backup/hero-redesign-preflight/`.


## Finalização da entrega

A revisão final das capturas de 1440, 390 e 320 px, incluindo abertura e estados intermediários da máscara, não identificou um problema concreto que justificasse alterar a composição. Foram aproveitados os resultados existentes: **28/28 verificações Chromium e 22/22 Firefox**. Nenhuma mudança posterior de interface invalidou esses resultados.

A conferência final confirmou a assinatura SHA-256 do vídeo original, seis WebPs sem ampliação acima de 720 px, sintaxe JavaScript, ausência de caminhos locais ausentes nos dois HTMLs e geração de `index.html` sem diferença de bytes. O conteúdo a partir de Serviços permanece idêntico ao backup. Evidência: `HERO_VALIDACAO_FINAL.json`.

Arquivos de execução alterados: `index.html`, `css/site.css`, novo `css/hero.css`, `js/motion/hero.js`, `js/motion/opening.js` e `scripts/build-v9.mjs`. Documentação e contexto: `README.md`, `DESIGN.md`, `PRODUCT.md`, configurações dos plugins, relatórios `docs/HERO*`, fontes em `docs/fontes-hero/`, fotografias em `assets/images/hero-redesign/`, originais e capturas comparativas. As demais seções e `agendar.html` foram preservados.

Foram removidos apenas quatro scripts descartáveis já substituídos por evidências e testes finais: `research-hero-instagram.mjs`, `research-hero-more.mjs`, `research-hero.mjs` e `inspect-hero-redesign.mjs`. Permanecem os originais, backups, capturas e testes. O teste de acessibilidade aceita `AXE_PATH` com uma cópia local do axe-core 4.10.3; por padrão procura `/tmp/sr-v9-axe.js`. Os testes de navegador exigem Chromium/Firefox instalados; o teste Firefox usa o endpoint BiDi indicado em seu script. Os relatórios dos plugins são preservados; executar novamente o inspector completo requer o plugin instalado.

Pacote: `entrega/srnavalha-hero-redesign-completo.zip`, gerado por `python3 scripts/package-hero-redesign.py`. Inclui site estático, variantes, originais selecionados, documentação, capturas, backup e auxiliares de teste; exclui node_modules, caches e arquivos ZIP anteriores. Para visualizar, extraia e abra `index.html` pelo Live Server. O gerador é opcional: execute `node scripts/build-v9.mjs` na raiz.

O ZIP foi extraído em diretório temporário: integridade CRC aprovada, gerador executado com HTML idêntico e recursos CSS locais presentes. Nenhum teste novo de navegador foi necessário nesta finalização, pois não houve alteração visual ou de motion.
