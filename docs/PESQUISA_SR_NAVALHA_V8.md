# Pesquisa Sr. Navalha V8

Conferência em 17/10/2026. A auditoria começou em `main`, árvore limpa. Nenhum commit ou push realizado.

## Fontes e método

- [AppBarber oficial](https://sites.appbarber.com.br/srnavala-pqjj): Firecrawl scrape e navegação real com Chromium/CDP. Foram clicadas as abas Serviços, Profissionais, Produtos, Pacotes e Assinaturas. Uma segunda visita aguardou o carregamento dos produtos e abriu Wi-Fi, estacionamento, acessibilidade e atendimento infantil. Evidências: `fontes-v8/appbarber.json`, `appbarber-details.json` e `assets.json`.
- [Instagram oficial](https://www.instagram.com/barbeariasrnavalha01/): acesso automatizado bloqueado por robots. Sem contorno de autenticação. Acervo anterior identificado como recortes do Instagram no histórico V6; não foi alegada coleta de novos posts.
- [Google Maps, ficha exata](https://www.google.com/maps/place/?q=place_id:ChIJU15canBJqgcRARZqMshC8cA): Firecrawl retornou nome, endereço e telefone correspondentes, nota **5,0 e 467 avaliações**, além dos horários. O total anterior de 446 não foi reutilizado. Consulta sem cache segundo metadados do provedor. Snapshot textual em `fontes-v8/google-maps.md`.

## Resultado comercial

42 entradas de serviços, incluindo preços fixos, “a partir de”, sob consulta e atendimentos para assinantes. A entrada `SELGEM (M)` foi preservada separadamente de `SELAGEM (M)`: o catálogo contém ambas, e não se presume que sejam duplicatas operacionais. Ajustes de grafia de apresentação são registrados por `sourceName`; não alteram valores.

Cinco profissionais: Damião, Eduardo, Kauã, Rafael e Yan. Todos com fotografia oficial e descrição “Sem observação”. Não foram inventadas biografias, qualificações ou especialidades.

22 produtos, quatro sem fotografia real. Não há descrição comercial detalhada publicada nesses itens. Não foram acrescentados ingredientes, benefícios, estoque ou marcas inferidas a partir do nome.

Assinaturas: corte R$ 79,90/mês; barba R$ 89,90/mês; cabelo + barba R$ 149,90/mês. A aba Pacotes mostra três ofertas com valores correspondentes. Não se converteu o preço dos serviços reservados a assinantes em mensalidade. Condições de uso e itens são remetidos ao sistema oficial.

Endereço: Avenida Governador Agamenon Magalhães, 349, Prado, Gravatá–PE, 55642-210. WhatsApp (81) 99572-2396. Dinheiro, crédito, débito e Pix. Os quatro modais de comodidades retornam somente “Sim”; não se afirma número de vagas, rampa específica ou estrutura não descrita.

Google publica segunda a sábado 8h30–18h30 e domingo 9h30–14h. AppBarber exibe horário “Não informado”; o site atribui os horários ao Google e recomenda conferir a agenda em feriados.

## Agendamento e limites

Abas e botões usam estado da aplicação. Não foi verificado permalink estável e público para pré-selecionar serviço/profissional; todos os agendamentos apontam para a página oficial. A tentativa automatizada inicial de agendar ocorreu com modais de comodidades abertos e não serve como evidência de um deep link. Não há autenticação contornada, pedido enviado ou compra realizada.

O WhatsApp abre uma consulta nomeando o produto; não existe checkout, disponibilidade em tempo real ou calendário demonstrativo no site. `agendar.html` mantém uma página de acesso ao sistema oficial.

## Avaliações

Nota do Google e nota do AppBarber são fontes distintas. Somente a primeira aparece como reputação Google. Os quatro depoimentos existentes foram preservados com atribuição, links e data de 15/10/2026. A consulta atual reconfirmou Fernanda Santos na visão limitada (texto traduzido pelo Google); os outros três textos não foram reconferidos individualmente nesta visita e mantêm a data anterior. Não foram criados depoimentos novos.

## Ferramentas e restrições

Lidos os SKILL.md reais de Taste, Impeccable e Emil presentes em `plugins/` e nas instalações do Codex. Taste draw, lint e inspect foram executados. O launcher Impeccable direto falhou por permissão; via `sh`, concept-seed executou. A direção explicitada pelo usuário prevaleceu sobre sorteios e fluxos de aprovação de mockups: implementação direta autorizada. Revisão independente e documentação do sistema foram delegadas conforme instrução explícita do Impeccable.

Firecrawl interact inicial navegou nas abas, mas retornou muita saída. Uma tentativa de reutilização empregou parâmetro incorreto; outra terminou por conexão fechada. A coleta completa foi concluída no browser local. A pesquisa de Codrops/GSAP via Firecrawl atingiu limite de requisições; leitura pública pelo navegador web confirmou as fontes, sem alegar execução dos seus exemplos.
