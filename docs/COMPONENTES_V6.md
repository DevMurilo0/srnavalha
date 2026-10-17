# Componentes V6

- **Folha de retratos:** quatro enquadramentos reais, legendas e acesso ao lightbox. O espelho SVG é linguagem gráfica, não fotografia documental.
- **Catálogo em faixas:** `details/summary`, foto/texto locais, instrumentos em SVG e links para serviço no agendamento. Conteúdo acessível sem JS; transições progressivas.
- **Ensaio do espaço:** foto246×148 em moldura editorial e registro separado da equipe. Sem background ampliado.
- **Índice fotográfico:** os cinco links `[data-work]` do HTML contêm arquivo, descrição, legenda e dimensões. Para adicionar foto, incluir um link com esses metadados; navegação/contagem são calculadas pelo JS.
- **Lightbox:** `dialog`, foco contido, Escape, anterior/próximo, teclado, gesto horizontal, retorno de foco e desbloqueio da rolagem. Sem JS os links abrem os originais.
- **Navegação contextual:** seção ativa e menu móvel nativo, fechamento por Escape, seleção, clique externo ou saída do foco.
- **Depoimentos:** quatro originais e grupo visual `inert`/`aria-hidden`, sem setas; pausa por controle, hover, teclado e toque; reduced motion estático.
- **Mapa:** iframe Google preservado, ativação de interação e endereço/link sempre disponíveis.
- **Convite final:** ficha editorial verde, espelho e ação; aviso de confirmação separado do botão.
- **Agendamento:** serviço, profissional/nome opcionais, data/hora como preferências; URL WhatsApp codificada, sem envio automático ou confirmação de reserva.

Tokens/base compartilhados; estilos de Home/agendamento separados; scripts defer sem imports ou dependências externas, compatíveis com Live Server.
