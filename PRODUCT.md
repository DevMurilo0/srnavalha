# Sr. Navalha

## Platform
Web estática: HTML5, CSS3 e módulos JavaScript, sem build ou servidor de aplicação obrigatório. Abrir `index.html` com Live Server. Node/Python são somente ferramentas opcionais de desenvolvimento.

## Users
Pessoas que desejam conhecer a barbearia do Prado, em Gravatá–PE, escolher um cuidado, reconhecer a equipe e solicitar agendamento no sistema próprio.

## Product Purpose
Apresentar uma barbearia real com experiência editorial e fotográfica; tornar o agendamento muito fácil de encontrar. Agendamento próprio: /agendar.html (dependente de ativação do backend Supabase). WhatsApp: https://wa.me/5581995722396.

## Capabilities and Constraints
Catálogo de 42 serviços com preço, duração, descrição, condições e valores variáveis; três planos mensais separados; cinco profissionais; 22 produtos; seis fotografias de catálogo no Álbum de Estilos; quatro depoimentos reais; mapa verdadeiro e contatos. Backend de reservas preparado (Supabase + Edge Function + Turnstile), mas não conectado à produção. Nenhum checkout, simulação de horários ou antes/depois fictício. Conteúdo comercial confirmado no AppBarber em 22/10/2026. Nota e total de avaliações mantêm datas de coleta próprias.

## Brand Commitments
A arte do ritual: enquadramentos retangulares, fotografias oficiais, marca original, matérias claras e escuras, carvão, marfim, tabaco e cobre. Sora e Manrope locais com licenças OFL. Protagonismo do estabelecimento; nenhuma biografia inventada. Desenvolvido por Murilo Gabriel, com link para https://murilogabriel.com.br.

## Evidence on Hand
`js/data/` preserva os registros comerciais; `docs/ritual/appbarber-confirmacao.json` contém a consulta pública atual e `conteudo-verificado.json` registra 69 comparações. Fachada, ambiente e instrumentos vêm do Reel colaborativo de 08/10/2026, vídeo original preservado. A grade pública e os destaques do Instagram têm acesso parcial. Nenhum material restrito foi obtido. A ficha específica do Google confirmou endereço, telefone e nota 5,0. Uma consulta posterior ao mapa incorporado exibiu 474 avaliações, registradas com data 22/10/2026; a captura e o diagnóstico da ficha estão em docs/ritual/mapa-diagnostico.*.

## Accessibility & Inclusion
Navegação e conteúdo essenciais funcionam sem JavaScript. Detalhes nativos para catálogo/FAQ, links de fotografia e destinos externos reais. Seletores com estados acessíveis; lightbox com Escape, setas, swipe e retorno do foco. Movimento reduzido inicial e dinâmico, pausa específica da esteira por botão/foco/ponteiro e movimentos ambientais pausados fora de vista. Não há controle global de movimento na interface. Nenhum conteúdo fica permanentemente escondido por animação.

## Implementation
Fonte canônica do HTML: `templates/v17/`, dados comerciais em `js/data/`; montagem opcional por `scripts/render-site.mjs` produz `index.html`, já entregue pronto. Templates antigos são históricos. Estilos ativos exclusivamente em `css/ritual.css` e `css/ritual/`; interações exclusivamente em `js/ritual/`. Os registros antigos e alterações locais são preservados em seus arquivos ou backups. Branch de desenvolvimento `reconstruction/arte-do-ritual`; a solicitação V17 autoriza commit e push nessa branch, sem merge nem publicação na main.

## Agendamento próprio — atualização de 23/10/2026

A interface de reservas foi integrada ao site e o fluxo antigo de agendamento externo foi removido da navegação pública. Estado técnico: código entregue, publicação transacional bloqueada até autenticar o projeto Supabase, aplicar as duas migrações, configurar expediente verdadeiro, Turnstile e domínio. Sem banco ativo a página informa a indisponibilidade, sem oferecer horários falsos. Solicitações ficam em `sr_appointments` no status `requested`, sem ler informações pessoais publicamente. Administração e notificações serão discutidas numa etapa futura. Veja `docs/AGENDAMENTO_PROPRIO.md`.
