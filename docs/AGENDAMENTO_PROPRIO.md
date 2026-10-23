# Agendamento Sr. Navalha — protótipo local

Estado: **somente frontend**, sem Supabase, API, autenticação, servidor de aplicação ou painel administrativo.

## Abrir

Use **Live Server** em \`index.html\` e clique em **Agendar horário**; ou abra diretamente \`agendar.html\` pelo Live Server. Também funciona em um servidor HTTP estático, como \`python3 -m http.server 8047\`. Não usar \`file://\` por causa dos módulos JavaScript.

## Recursos

- Os 42 serviços e cinco profissionais vêm dos módulos de dados reais em \`js/data/\`, sem alterar o catálogo.
- Escolha opcional de profissional; sem preferência mostra opções de todos.
- Seleção de dia com faixa móvel de 30 dias, horários calculados por duração de serviço e bloqueio local de sobreposições.
- Formulário para nome e telefone de exemplo, com aviso de privacidade.
- Salvamento em \`localStorage\` sob a chave \`srnavalha:agendamentos-demo:v1\`.
- Comprovante com código **somente ilustrativo** e lista de registros locais com botão para excluir cada teste.
- Ao excluir um teste, a vaga ilustrativa volta a aparecer na mesma origem/navegador.

**NÃO é uma ferramenta de reservas reais.** Nenhuma informação é recebida pela barbearia, sincronizada entre dispositivos ou disponibilizada a um admin. Duas pessoas em navegadores diferentes podem escolher o mesmo horário sem qualquer controle conjunto. Não há notificações, pagamentos nem garantia de vaga.

## Expediente ilustrativo

Para permitir experimentar a interface, o arquivo \`js/booking-local.js\` contém parâmetros explicitamente fictícios: segunda a sábado, das 9h às 12h e das 14h às 19h, a cada 30 minutos. A duração de cada serviço é respeitada; os serviços de assinatura permanecem bloqueados nesta fase. Domingo não apresenta horários. Esse expediente **não deve ser interpretado como horário real da Sr. Navalha**.

## Dados e privacidade

Os registros de teste são gravados apenas no **armazenamento local daquele navegador e daquela origem**; o usuário deve usar nome e número **fictícios**. Os dados podem ser apagados na própria lista de testes ou limpando os dados do site no navegador. Modo privado, políticas do browser e limpeza de cache/dados podem apagar as simulações. No mesmo dispositivo, outra pessoa com acesso ao perfil do navegador poderá visualizar o conteúdo armazenado.

Para uso real serão necessários backend, autenticação, controle de concorrência, confirmação de expediente, consentimento e retenção de dados conforme LGPD. **Não publicar o protótipo como ferramenta de reservas reais**.

## Organização

- \`agendar.html\`: toda a tela, avisos de demonstração e comprovante;
- \`css/agendar.css\`: direção visual da Sr. Navalha + estados de teste;
- \`js/agendar.js\`: filtros, seleção, formulário, resumo, sucesso e lista local;
- \`js/booking-local.js\`: horários fictícios, prevenção local de choque e \`localStorage\`;
- \`js/data/services.js\` e \`js/data/professionals.js\`: informações de referência.

## Futura página admin

Ainda não existe. Quando definirmos o painel, migraremos a experiência para um backend real com expediente configurável, bloqueios, autenticação de equipe e estado da reserva. **Os registros de \`localStorage\` não são uma fila administrativa e não devem ser importados como reservas reais.**
