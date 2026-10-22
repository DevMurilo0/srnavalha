# Arquitetura entregue

O site já está pronto em `index.html`; abrir com Live Server é suficiente. Não executa Node, React, framework, bundler ou chamada para gerar conteúdo.

| Responsabilidade | Fonte |
|---|---|
| Conteúdo comercial | `js/data/services.js`, `products.js`, `professionals.js`, `reviews.js` |
| Fonte canônica de estrutura e geração opcional | `scripts/render-site.mjs` |
| Seções geradas para consulta | `templates/ritual/*.html` |
| Documento pronto | `index.html` |
| Design tokens e fontes | `css/ritual/tokens.css` |
| Base e acessibilidade | `css/ritual/base.css` |
| Cabeçalho/menu | `css/ritual/header.css`, `js/ritual/app.js` |
| Hero/casa | `css/ritual/hero.css`, `js/ritual/motion.js` |
| Componentes | `css/ritual/sections.css`, módulos JS por responsabilidade |
| Núcleo de movimento e carregamento | `js/ritual/core.js` |
| Estilos de movimento/fallback | `css/ritual/motion.css` |
| Validação comercial | `scripts/validate-content.mjs` |
| Testes | `scripts/test-ritual.mjs`, `test-ritual-firefox.mjs` |
| Inventário | `scripts/inventory-images.py`, `docs/ritual/inventario-imagens.json` |

Para editar a estrutura com geração reproduzível, altere o gerador e execute `node scripts/render-site.mjs`. As seções em templates e o HTML são saídas geradas. Dados continuam legíveis sem JavaScript porque a geração já foi executada e o HTML faz parte da entrega.

CSS ativo importa somente os seis módulos novos. O documento importa somente `js/ritual/app.js` e seus módulos novos. Os geradores V6–V11 e patches antigos foram arquivados em `backup/legacy-tools/`; o runtime anterior fica em `backup/legacy-runtime/`. `backup/ritual-preflight/` preserva HTML, estilos, JavaScript, templates e documentação antes da reconstrução. Backups são registros históricos; caminhos internos de ferramentas arquivadas podem precisar ser restaurados à posição original para execução. Não existem dois heros concorrentes no runtime entregue.

As alterações locais encontradas no começo — imagens hero-ambiente, capturas em preview e demais arquivos sem commit — não foram sobrescritas. A branch anterior e o histórico Git não foram reescritos. Nenhum commit, merge, push ou publicação foi realizado.
