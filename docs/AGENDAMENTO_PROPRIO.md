# Agendamento próprio Sr. Navalha — implementação e ativação

**Status:** código integrado à branch `reconstruction/arte-do-ritual`. **Não está em produção.**
A estrutura visual funciona com Live Server, mas reservas reais requerem o banco, a função segura, o domínio e os expedientes verdadeiros.

## Como funciona

1. Visitante escolhe serviço (42 itens de referência; planos de assinante não podem ser reservados publicamente).
2. Escolhe profissional ou "Sem preferência". No segundo caso, escolhe um horário oferecido para um profissional real.
3. O site chama `sr_available_slots` para obter somente horários que cabem no expediente, não colidem com outra reserva e respeitam bloqueios/folgas.
4. Informa nome, WhatsApp e aceita uso desses dados para a reserva.
5. Resolve desafio Cloudflare Turnstile e envia à Edge Function `request-booking`, que valida o desafio **no servidor**.
6. O banco grava a reserva em estado `requested` (solicitada), e bloqueia esse intervalo. Uma restrição PostgreSQL impede sobreposição, mesmo que dois clientes enviem no mesmo instante.
7. O site apresenta protocolo e avisa que a confirmação final da barbearia ainda será necessária.

Não há AppBarber no fluxo público. Não há horários artificiais, salvamento só no navegador ou reservas enviadas automaticamente por WhatsApp.

## 1. Criar a infraestrutura

Recomenda-se Supabase (Postgres + Edge Functions) com projeto próprio da barbearia. Execute, **nesta ordem**, as migrações em `supabase/migrations/`:

- `20261023_001_sr_navalha_bookings.sql` cria dados, restrições, função de consulta e inserção;
- `20261023_002_harden_booking_write.sql` revoga a chamada pública de inserção e a restringe à função no servidor.

**Aplique as duas antes de usar o sistema publicamente.**

A tabela `sr_appointments` tem nome, telefone, serviço, profissional, horário, protocolo (UUID completo de referência interna), consentimento, status e datas de criação. **Não há políticas de leitura pública dessas informações.** O admin futuro terá autenticação, perfis e RLS próprios.

## 2. Cadastrar os expedientes verdadeiros

A tabela `sr_open_hours` começa **vazia de propósito**, pois não conhecemos a escala dos cinco profissionais. Sem expediente, nenhum horário fica disponível.

Cada linha precisa do ID do profissional, dia da semana (0=domingo; 1=segunda; ...; 6=sábado), hora de início e fim. Quando houver intervalo para almoço, use **duas linhas** no dia. Exemplo **ilustrativo, NÃO aplicar sem confirmação da barbearia**:

```sql
-- Exemplo de formato APENAS. Horários abaixo são fictícios.
insert into public.sr_open_hours(professional_id, weekday, opens_at, closes_at)
values ('damiao', 1, '09:00', '12:00');
```

Substitua pelos expedientes reais de Damião, Eduardo, Kauã, Rafael e Yan. A tabela `sr_time_off` bloqueia férias, ausência e outros intervalos.

O agendamento é oferecido para os próximos 30 dias, em intervalos de 15 minutos, com antecedência mínima de 30 minutos e duração obtida do registro real do serviço. Os preços são **referências do catálogo**: não é realizado pagamento no site.

## 3. Proteger criação de agendamento

Crie um widget Cloudflare Turnstile para o domínio do site, com os hostnames legítimos configurados. Configure no Supabase:

- `TURNSTILE_SECRET_KEY`: secret privada do Turnstile (Edge Function apenas).
- `BOOKING_ALLOWED_ORIGINS`: lista de origens completas separadas por vírgula, ex.: `https://seu-dominio.com.br,https://www.seu-dominio.com.br`.
- `SUPABASE_URL` e `SUPABASE_SECRET_KEY`: variáveis de servidor; nos projetos que mantêm `SUPABASE_SERVICE_ROLE_KEY`, há fallback para a chave legada. **Nunca inclua chaves secretas em arquivos públicos.**

Faça o deploy da função `supabase/functions/request-booking/index.ts` com a verificação JWT da função desativada (**`--no-verify-jwt`**). O endpoint é público para clientes anônimos, mas só grava depois de validar o Turnstile e a origem autorizada. Os tokens são verificados no servidor; a chave secreta não aparece no frontend.

Com CLI (onde já houver projeto vinculado):

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
supabase secrets set TURNSTILE_SECRET_KEY="SEU_SEGREDO" BOOKING_ALLOWED_ORIGINS="https://SEU_DOMINIO"
supabase functions deploy request-booking --no-verify-jwt
```

O bloqueio de gravações públicas da migração 002 é **obrigatório**: nenhuma chamada direta do navegador pode inserir reservas.

## 4. Ativar no frontend

Preencha `js/booking-config.js`:

```js
export const BOOKING_BACKEND = {
  url: 'https://SEU_PROJECT_REF.supabase.co',
  publishableKey: 'sb_publishable_SUA_CHAVE_PUBLICA',
  turnstileSiteKey: 'SUA_SITE_KEY_PUBLICA'
};
```

A URL, a chave **publishable** e a site key do Turnstile são públicas por natureza. A **secret key** do Supabase e a **Turnstile secret** nunca vão ao frontend. Libere a origem do domínio no Turnstile e nas configurações de origem autorizada da função.

## 5. Validar antes de publicar

- Conferir expedientes **reais** de todos os profissionais e restrições de cada serviço.
- Verificar slot de hoje (mínimo 30 minutos), domingo sem expediente, feriados, bloqueios e duração de serviço.
- Criar duas reservas concorrentes para mesma cadeira/hora: a segunda deve falhar.
- Criar duas reservas para profissionais distintos na mesma hora: deve funcionar.
- Testar reenvio com o mesmo `request_id` após timeout: não pode duplicar.
- Testar cadastro com dados inválidos, falta de consentimento, expiração de Turnstile e falha de rede.
- Testar celular 320/375/390px, tablet 768px e desktop 1440px; teclado, foco, leitor de tela e movimento reduzido.
- Confirmar que o operador consulta diariamente a tabela `sr_appointments`, porque **a página admin e as notificações automáticas ainda não foram implementadas**.
- Verificar domínio HTTPS, rate limiting no gateway e proteção de dados pessoais, inclusive política de privacidade e política de retenção adequadas à LGPD.

**Para evitar desencontro com clientes, não abra o agendamento ao público enquanto não existir uma rotina de recebimento e resposta da equipe.**

## O que fica para a futura página admin

- Login seguro da equipe e permissões separadas;
- fila `requested`, confirmação/rejeição e notificações;
- calendário diário/semanal e remarcação/cancelamento;
- expedientes, pausas, folgas, feriados e bloqueios;
- manutenção de serviços, duração, preço, profissionais e elegibilidade de assinantes;
- auditoria, proteção de dados e retenção.

Não criar contas administrativas públicas ou endpoints de leitura de clientes enquanto essas regras não estiverem definidas.
