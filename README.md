# Sr. Navalha V6 — Ensaio de cuidado

Site estático da Sr. Navalha Barbearia, Gravatá–PE. **A V6 está na raiz**, em HTML, CSS e JavaScript. Não exige npm, build ou backend.

## Abrir

Abra a pasta no VS Code e use **Open with Live Server** em `index.html`. O agendamento está em `agendar.html`. Alternativa: `python3 -m http.server 8016` e `http://localhost:8016/`.

## Experiência

- Hero editorial com retratos reais em escala controlada.
- Serviços em faixas expansíveis, com fotos e links para solicitar cada cuidado.
- Ambiente/equipe com fotografias originais, sem fundos ampliados artificialmente.
- Portfólio de cinco registros: seleção, teclado, arraste/swipe e lightbox acessível.
- Quatro avaliações originais em esteira da direita para a esquerda, aproximadamente30px/s. Pausa no mouse, botão, teclado e toque; lista estática com movimento reduzido.
- Google Maps real com ativação da interação, endereço e link independente.
- FAQ, Instagram oficial, telefone e crédito de Murilo Gabriel preservados.
- Agendamento direto por WhatsApp. Dia/hora são preferências: **a equipe precisa confirmar a disponibilidade**. Nenhuma reserva é criada automaticamente.

## Arquitetura

```text
index.html / agendar.html   Home e solicitação V6
css/tokens.css             Paleta, fonte local e escalas
css/base.css               Base, foco e estilos compartilhados
css/site.css               Home e responsividade
css/motion.css             Complementos de interação
css/booking.css            Formulário
js/site.js                 Menu, catálogo, mapa e motion nativo
js/portfolio.js            Seleção, lightbox e gestos
js/reviews.js              Esteira, clones e pausas
js/booking.js              Validação e mensagem WhatsApp
assets/fonts/              Manrope local e licença
assets/images/             Fotografias WebP preservadas
scripts/                   Testes opcionais, sem pacotes npm
capturas/v6/               Antes, etapa isolada e versão integrada
docs/                      Direção, imagens, motion e resultados
```

`.v6-stage/` conserva a implementação isolada e não é necessária para servir o site. Documentos V5 permanecem como histórico; a documentação vigente tem sufixo `V6`.

## Imagens e dados

As fotos têm aproximadamente265×326px; o ambiente246×148px. A V6 respeita isso pela composição e tamanho de exibição. Não foram gerados clientes, cortes ou detalhes artificiais. Não existem originais melhores confirmados. Derivados cinematográficos antigos foram preservados nos assets, mas não são usados pela V6 nem incluídos no pacote de execução.

Manrope é servida localmente. Google Maps é o único conteúdo incorporado externo; Instagram, Google e WhatsApp dependem de rede e dos respectivos serviços.

Endereço, telefone, horários e registro de466 avaliações foram preservados. A nota é um instantâneo de15/10/2026, não uma consulta automática. Não há disponibilidade, preços ou nomes de profissionais inventados.

## Testes e manutenção

Veja [testes](docs/TESTES_V6.md), [imagens](docs/AUDITORIA_IMAGENS_V6.md), [componentes](docs/COMPONENTES_V6.md) e [motion](docs/MOTION_V6.md). Os testes usam Firefox instalado, servidor HTTP e Node22 como ferramentas opcionais; não são dependências do site publicado.

Backup anterior: `/home/murilo/Dev/andamento/srnavalha-pre-v6-20261016.zip`. Alterações locais preexistentes preservadas. Nenhum commit ou push.
