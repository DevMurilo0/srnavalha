# Sr. Navalha · V8

Site estático da Sr. Navalha Barbearia, no Prado, Gravatá–PE. HTML, CSS e JavaScript, compatível com Live Server, sem npm ou etapa de build para visualizar ou hospedar.

## Abrir

Abra a pasta no VS Code e use **Open with Live Server** em `index.html`. Alternativa: `python -m http.server 8018`, acessando `http://localhost:8018`. Use HTTP local para módulos JavaScript; o HTML essencial também existe sem JS. `agendar.html` oferece acesso ao AppBarber oficial.

## V8 implementada

- Logo original recuperada do AppBarber e favicon derivado da própria marca.
- Paleta carvão/marfim/cobre com Manrope e Young Serif locais.
- Catálogo de 42 serviços, preços fixos, iniciais e sob consulta, durações e filtros.
- Damião, Eduardo, Kauã, Rafael e Yan com retratos reais e seleção por toque, hover e teclado.
- 22 produtos, 18 fotos oficiais, preços e consulta no WhatsApp; sem checkout fictício.
- Assinaturas mensais, pagamentos, comodidades cadastradas, endereço e horários com fonte.
- Google: 5,0 e 467 avaliações, conferidos em 17/10/2026. Depoimentos preservados com data própria.
- Fotografia que atravessa a abertura, máscaras de retratos, entrada tipográfica, produtos em camadas, galeria horizontal, lightbox espacial e esteira com pausa.
- Conteúdo essencial em HTML, foco visível e suporte a movimento reduzido inicial e dinâmico.

## Atualizar o conteúdo

Fonte de dados: `js/data/services.js`, `professionals.js`, `products.js`, `reviews.js`. São snapshots, não sincronização automática. Serviços preservam o nome do sistema em `sourceName`; categorias são editoriais. Após editar os dados, execute opcionalmente `node scripts/build-v8.mjs` para gerar `index.html` e `agendar.html` prontos. O visitante nunca precisa desse comando. Não edite valores também no HTML: gere novamente a partir dos módulos.

Tokens em `css/tokens.css`, apresentação em `css/site.css`, movimento em `css/motion.css` e comportamento em `js/site.js`. Arquivos de calendário demonstrativo e estilos não utilizados foram removidos. V6/V7 permanecem no histórico do Git e documentação anterior.

## Fontes e imagens

[AppBarber oficial](https://sites.appbarber.com.br/srnavala-pqjj) · [Google Maps](https://www.google.com/maps/place/?q=place_id:ChIJU15canBJqgcRARZqMshC8cA) · [Instagram](https://www.instagram.com/barbeariasrnavalha01/).

Originais oficiais em `assets/originals/v8/`; WebP limitados à resolução original em `assets/images/v8/`. A marca não foi redesenhada. Fotografias do catálogo não implicam comprovação de local/autoria de captura. Instagram bloqueou coleta automatizada; a pequena foto de ambiente anterior permanece em escala reduzida. Não houve reconstrução generativa de pessoas ou lugar.

## Pesquisa e validação

- `docs/PESQUISA_SR_NAVALHA_V8.md`
- `docs/CONTEUDO_VERIFICADO_V8.md`
- `docs/IMAGENS_V8.md`
- `docs/IDENTIDADE_VISUAL_V8.md`
- `docs/REFERENCIAS_AWWWARDS_V8.md`
- `docs/MOTION_REFERENCIAS_V8.md`
- `docs/MOTION_V8.md`
- `docs/TESTES_V8.md`

Capturas antes/depois e estados intermediários em `capturas/v8/`. Evidências automatizadas em `docs/V8_*.json`. Scripts de navegador são ferramentas de desenvolvimento opcionais; alguns usam um Chromium local (`CHROME_PATH`) ou Playwright instalado fora do projeto. Não integram as dependências do site.

## Limites

Agendamento e contratação ocorrem no AppBarber; estoque é consultado no WhatsApp. Valores e nota Google podem mudar após a data indicada. Biografias e especialidades não foram inventadas. Quatro produtos não têm foto no catálogo; o site usa texto. Necessários do proprietário para avançar a fotografia do espaço: originais em alta resolução e vídeos autorizados. Sem commit ou push nesta entrega.
