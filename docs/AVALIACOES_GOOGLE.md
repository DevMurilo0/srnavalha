# Avaliações Google — verificação V4

Conferência: **15/10/2026**. Dados estáticos; não são atualização em tempo real. Revisar manualmente antes de futuras publicações. Esta conferência substitui o status pendente descrito no documento histórico `AVALIACOES.md`.

## Estabelecimento correto

[Ficha pública consultada diretamente no Google Maps](https://www.google.com/maps/place/?q=place_id:ChIJU15canBJqgcRARZqMshC8cA&hl=pt-BR).

- Nome: **Sr. Navalha Barbearia**.
- Endereço: Av. Gov. Agamenon Magalhães, 349 — Prado, Gravatá — PE, 55642-210.
- Telefone: **+55 81 99572-2396**, igual ao telefone/WhatsApp existente no projeto.
- Place ID: `ChIJU15canBJqgcRARZqMshC8cA`.
- Coordenadas da ficha: -8.199591, -35.5639875.
- Nota observada: **5,0**, com **466 avaliações**. Não foram reutilizados os antigos 446 ou 460.
- Instagram fornecido pelo proprietário: [@barbeariasrnavalha01](https://www.instagram.com/barbeariasrnavalha01/). A ficha mostra site AppBarber; não foi presumido que o Instagram estava vinculado na ficha. Nome/endereço/telefone correspondem ao conteúdo do projeto.

## Método e limites

A leitura web inicial do Maps falhou. O navegador local recebeu uma visão limitada. A consulta direta com Firecrawl, sem cache (`maxAge: 0`), disponibilizou a ficha e três avaliações; uma sessão interativa, somente leitura, abriu a área de avaliações e confirmou também um quarto autor. Foram obtidos os atributos reais `data-review-id`, perfis públicos, texto e rótulos de estrelas/data. A sessão foi encerrada ao concluir. Não houve login, publicação, voto, API privada ou chave inserida no site.

Evidência mínima e identificadores públicos em `AVALIACOES_GOOGLE_EVIDENCIAS.json`. Não foram salvos tokens de sessão, imagens de perfil, dados de usuários adicionais ou HTML bruto do Google. Os links dos cards abrem os **perfis públicos de avaliações**, não são descritos como permalinks individuais. Os IDs de avaliação também foram registrados para reconferência. A ficha completa é uma segunda referência para cada depoimento.

As datas são os rótulos relativos observados nessa consulta; não foram convertidas em datas exatas inventadas. A interface informa a data de conferência. A primeira avaliação é um trecho, identificado como tal; as outras são curtas e reproduzidas sem adicionar elogios.

## Seleção publicada

### Fernanda Santos

- **5 estrelas**, “6 meses atrás”.
- Trecho original publicado: “Excelente! Todos os funcionários são muito profissionais e capacitados desde a recepção ao serviço prestado com excelência…”
- O texto completo, lido na fonte, também comenta cuidado e intenção de retornar. Publicado apenas o trecho acima, com reticências, sem acrescentar afirmações.
- [Perfil público e avaliações](https://www.google.com/maps/contrib/114895505051989083139/reviews?hl=pt-BR).

### João Neto

- **5 estrelas**, “Editado 5 meses atrás”.
- Original: “Atendimento excepcional! A equipe é super atenciosa e prestativa. O atendimento faz toda a diferença aqui. Superaram as expectativas!”
- [Perfil público e avaliações](https://www.google.com/maps/contrib/118341742729193053160/reviews?hl=pt-BR).

### Luís Gustavo Coelho

- **5 estrelas**, “4 meses atrás”.
- Original: “Servico de qualidade e bom atendimento.” A grafia original foi preservada.
- [Perfil público e avaliações](https://www.google.com/maps/contrib/111783008765039420465/reviews?hl=pt-BR).

### Lucas Gabriel

- **5 estrelas**, “3 meses atrás”.
- Original: “O atendimento foi top de linha e os cabeleireiros são muito profissionais”.
- [Perfil público e avaliações](https://www.google.com/maps/contrib/108814860750749521795/reviews?hl=pt-BR).

## Dados e manutenção

`js/reviews-data.js` é a fonte dos quatro registros, com autor, texto publicado, estrelas, período, origem, perfil público, ID e data de verificação. Ao atualizar dados, executar **opcionalmente para manutenção** `python3 scripts/sync-reviews.py` para sincronizar os artigos HTML acessíveis sem JavaScript. Esse script não é necessário para visualizar o site pelo Live Server. Não há chamada à API do Google no navegador.

Atribuição textual “Google”, links externos e data de consulta permanecem visíveis. Não foi criado um logotipo imitativo nem se afirma parceria, certificação ou aprovação do Google. A seleção não representa todas as opiniões; o link permite conferir a fonte completa.

Atualização de comportamento: as mesmas quatro avaliações agora aparecem em uma esteira horizontal contínua a 30 px/s. O visitante pode pausar pelo controle Pausar/Reproduzir, por foco, mouse ou toque; a leitura pausada admite rolagem horizontal nativa. Em movimento reduzido ou sem JavaScript, são quatro artigos em lista horizontal manual, sem clones. Fontes, textos e data da verificação permanecem os mesmos. Implementação e testes em [MARQUEE_AVALIACOES.md](MARQUEE_AVALIACOES.md).
