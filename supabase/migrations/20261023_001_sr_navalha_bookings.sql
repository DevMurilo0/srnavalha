-- SR. NAVALHA · Core de agendamentos v1
-- Executar no SQL Editor de um projeto Supabase próprio.
-- Nenhum serviço nem profissional é autorizado a receber agendamentos sem expediente real cadastrado.
create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.sr_services (
  id text primary key,
  name text not null,
  duration_minutes integer not null check (duration_minutes between 15 and 240 and duration_minutes % 15 = 0),
  price_label text not null,
  bookable boolean not null default true,
  active boolean not null default true
);
create table if not exists public.sr_professionals (
  id text primary key,
  name text not null,
  active boolean not null default true
);
create table if not exists public.sr_open_hours (
  id bigint generated always as identity primary key,
  professional_id text not null references public.sr_professionals(id),
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time without time zone not null,
  closes_at time without time zone not null,
  check (closes_at > opens_at),
  unique (professional_id, weekday, opens_at, closes_at)
);
create table if not exists public.sr_time_off (
  id bigint generated always as identity primary key,
  professional_id text not null references public.sr_professionals(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  check (ends_at > starts_at)
);
create table if not exists public.sr_appointments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  service_id text not null references public.sr_services(id),
  professional_id text not null references public.sr_professionals(id),
  customer_name text not null,
  customer_phone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'requested' check(status in ('requested', 'confirmed', 'cancelled', 'completed', 'no_show')),
  created_at timestamptz not null default now(),
  consent_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (length(customer_name) between 2 and 70),
  check (customer_phone ~ '^55[0-9]{10,11}$')
);
-- Restrição no banco, atômica, que impede duas reservas sobrepostas para a mesma cadeira.
alter table public.sr_appointments drop constraint if exists sr_no_overlapping_appointments;
alter table public.sr_appointments
  add constraint sr_no_overlapping_appointments
  exclude using gist (professional_id with =, tstzrange(starts_at, ends_at, '[)') with &&)
  where (status in ('requested', 'confirmed'));
create index if not exists sr_appointments_customer_phone_idx
  on public.sr_appointments (customer_phone, starts_at) where status in ('requested', 'confirmed');
create index if not exists sr_appointments_professional_date_idx
  on public.sr_appointments (professional_id, starts_at) where status in ('requested', 'confirmed');

-- Preencher o catálogo real identificado no projeto; serviços de ASSINANTES ficam bloqueados
-- até serem vinculados a uma assinatura verificada pelo futuro módulo administrativo.
insert into public.sr_professionals(id,name,active) values
  ('damiao', 'Damião', true),
  ('eduardo', 'Eduardo', true),
  ('kaua', 'Kauã', true),
  ('rafael', 'Rafael', true),
  ('yan', 'Yan', true)
on conflict (id) do update set name = excluded.name;

insert into public.sr_services(id,name,duration_minutes,price_label,bookable,active) values
  ('acabamento-com-navalha', 'Acabamento com navalha', 15, 'R$ 10,00', true, true),
  ('adicional-barba', 'Adicional barba', 15, 'R$ 10,00', true, true),
  ('alisamento', 'Alisamento', 30, 'R$ 30,00', true, true),
  ('assinatura-barba', 'Assinatura barba', 30, 'R$ 30,00', false, true),
  ('assinatura-corte', 'Assinatura corte', 30, 'R$ 30,00', false, true),
  ('assinatura-corte-barba', 'Assinatura corte&barba', 45, 'R$ 55,00', false, true),
  ('barba-pigmentada', 'Barba pigmentada', 30, 'R$ 40,00', true, true),
  ('barba-premium', 'Barba premium', 30, 'R$ 45,00', true, true),
  ('barba-simples', 'Barba simples', 30, 'R$ 20,00', true, true),
  ('barboterapia', 'Barboterapia', 45, 'R$ 30,00', true, true),
  ('camuflagem-barba', 'Camuflagem barba', 30, 'R$ 25,00', true, true),
  ('camuflagem-capilar', 'Camuflagem capilar', 30, 'Sob consulta', true, true),
  ('comb-corte-barboterapia', 'Corte + barboterapia', 45, 'R$ 55,00', true, true),
  ('comb-cort-barb-simples', 'Corte + barba simples', 45, 'R$ 50,00', true, true),
  ('corte-atipico', 'Corte atípico', 45, 'R$ 40,00', true, true),
  ('corte-exclusivo', 'Corte exclusivo', 45, 'R$ 50,00', true, true),
  ('corte-infantil', 'Corte infantil', 45, 'R$ 40,00', true, true),
  ('cortee', 'Corte', 30, 'R$ 30,00', true, true),
  ('cristalisacao', 'Cristalização', 30, 'R$ 50,00', true, true),
  ('depilacao-naris', 'Depilação de nariz', 15, 'R$ 20,00', true, true),
  ('depilacao-orelha', 'Depilação de orelha', 15, 'R$ 20,00', true, true),
  ('hidratacao', 'Hidratação', 30, 'R$ 25,00', true, true),
  ('lavagem-capilar', 'Lavagem capilar', 15, 'R$ 10,00', true, true),
  ('limpeza-de-pele', 'Limpeza de pele', 30, 'R$ 30,00', true, true),
  ('luzes', 'Luzes', 45, 'R$ 80,00', true, true),
  ('mascara-black', 'Máscara Black', 15, 'R$ 20,00', true, true),
  ('massagem-desportiva', 'Massagem desportiva', 30, 'R$ 60,00', true, true),
  ('massagem-relaxante', 'Massagem relaxante', 30, 'R$ 60,00', true, true),
  ('pigmentacao-capilar', 'Pigmentação capilar', 45, 'R$ 55,00', true, true),
  ('platinado', 'Platinado', 45, 'R$ 120,00', true, true),
  ('primeiro-corte', 'Primeiro corte', 45, 'R$ 50,00', true, true),
  ('remocao-de-cravos', 'Remoção de cravos', 15, 'R$ 40,00', true, true),
  ('selagem-g', 'Selagem (g)', 90, 'R$ 100,00', true, true),
  ('selagem-gg', 'Selagem (gg)', 120, 'R$ 130,00', true, true),
  ('selagem-m', 'Selagem (m)', 90, 'R$ 80,00', true, true),
  ('selagem-p', 'Selagem (p)', 90, 'R$ 70,00', true, true),
  ('selgem-m', 'Selgem (m)', 90, 'R$ 80,00', true, true),
  ('sobrancelha', 'Sobrancelha', 15, 'R$ 10,00', true, true),
  ('sobrancelha-cera', 'Sobrancelha com cera', 15, 'R$ 20,00', true, true),
  ('sobrancelha-lavagem', 'Sobrancelha + lavagem', 30, 'R$ 25,00', true, true),
  ('sobranselha-hidratacao', 'Sobrancelha + hidratação', 30, 'R$ 30,00', true, true),
  ('ventosaterapia-1hr', 'Ventosaterapia 1hr', 60, 'R$ 120,00', true, true)
on conflict (id) do update set name = excluded.name, duration_minutes = excluded.duration_minutes, price_label = excluded.price_label;

-- Dados pessoais e agendas NÃO são visíveis por queries públicas nem via "select" do client.
alter table public.sr_services enable row level security;
alter table public.sr_professionals enable row level security;
alter table public.sr_open_hours enable row level security;
alter table public.sr_time_off enable row level security;
alter table public.sr_appointments enable row level security;
revoke all on public.sr_services, public.sr_professionals, public.sr_open_hours, public.sr_time_off, public.sr_appointments from anon, authenticated;
revoke all on public.sr_appointments from public;

-- Horários calculados exclusivamente no servidor, com fuso fixado em America/Recife.
create or replace function public.sr_available_slots(
  p_service_id text, p_day date, p_professional_id text default null
)
returns table (slot_at timestamptz, professional_id text, professional_name text)
language plpgsql security definer set search_path = ''
as $function$
begin
  if p_day is null
    or p_day < (now() at time zone 'America/Recife')::date
    or p_day > (now() at time zone 'America/Recife')::date + 30
    or not exists (select 1 from public.sr_services where id = p_service_id and active and bookable)
    then return; end if;
  return query
  with candidate as (
    select
      (p_day + h.opens_at + (g.step * interval '15 minute')) at time zone 'America/Recife' as start_time,
      s.duration_minutes as duration,
      p.id as staff_id, p.name as staff_name
    from public.sr_open_hours h
    join public.sr_professionals p on p.id = h.professional_id and p.active
    join public.sr_services s on s.id = p_service_id and s.active and s.bookable
    cross join lateral generate_series(0, floor(extract(epoch from (h.closes_at - h.opens_at)) / 900)::int) as g(step)
    where h.weekday = extract(dow from p_day)::int
      and (p_professional_id is null or p.id = p_professional_id)
      and h.opens_at + g.step * interval '15 minute' + s.duration_minutes * interval '1 minute' <= h.closes_at
  )
  select distinct c.start_time, c.staff_id, c.staff_name
  from candidate c
  where c.start_time >= now() + interval '30 minutes'
    and not exists (
      select 1 from public.sr_time_off off
      where off.professional_id = c.staff_id
        and off.starts_at < c.start_time + c.duration * interval '1 minute'
        and off.ends_at > c.start_time
    )
    and not exists (
      select 1 from public.sr_appointments a
      where a.professional_id = c.staff_id
        and a.status in ('requested', 'confirmed')
        and a.starts_at < c.start_time + c.duration * interval '1 minute'
        and a.ends_at > c.start_time
    )
  order by 1, 3;
end;
$function$;

-- Cria reserva pendente, sem autorizar preço/duração/agenda vindos do navegador.
-- O request_id possibilita recuperar retries da mesma operação.
create or replace function public.sr_request_booking(
  p_request_id uuid,
  p_service_id text,
  p_professional_id text,
  p_slot_at timestamptz,
  p_customer_name text,
  p_customer_phone text,
  p_consent boolean
)
returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  v_service public.sr_services%rowtype;
  v_name text := btrim(coalesce(p_customer_name, ''));
  v_phone text := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g');
  v_appointment uuid;
  v_existing public.sr_appointments%rowtype;
begin
  if p_request_id is null then
    raise exception using message = 'REQUISICAO_INVALIDA';
  end if;
  select * into v_existing from public.sr_appointments where request_id = p_request_id;
  if found then
    if v_existing.service_id = p_service_id and v_existing.professional_id = p_professional_id
       and v_existing.starts_at = p_slot_at and v_existing.customer_phone = v_phone then
      return jsonb_build_object('reference', substring(v_existing.id::text from 1 for 8), 'status', v_existing.status);
    end if;
    raise exception using message = 'REQUISICAO_DUPLICADA';
  end if;
  if p_consent is distinct from true or char_length(v_name) < 2 or char_length(v_name) > 70
    or v_phone !~ '^55[0-9]{10,11}$' then
    raise exception using message = 'DADOS_INVALIDOS';
  end if;
  select * into v_service from public.sr_services
    where id = p_service_id and active and bookable;
  if not found then raise exception using message = 'SERVICO_INDISPONIVEL'; end if;

  -- Pequeno limite por telefone contra enganos e abusos simples.
  if (select count(*) from public.sr_appointments
        where customer_phone = v_phone
          and status in ('requested','confirmed')
          and starts_at > now()) >= 3
  then raise exception using message = 'LIMITE_ATINGIDO'; end if;

  if not exists(
    select 1 from public.sr_available_slots(
      p_service_id,
      (p_slot_at at time zone 'America/Recife')::date,
      p_professional_id
    ) slot
    where slot.slot_at = p_slot_at and slot.professional_id = p_professional_id
  ) then raise exception using message = 'HORARIO_INDISPONIVEL'; end if;

  insert into public.sr_appointments(
    request_id, service_id, professional_id, starts_at, ends_at,
    customer_name, customer_phone, status
  ) values (
    p_request_id, p_service_id, p_professional_id, p_slot_at,
    p_slot_at + v_service.duration_minutes * interval '1 minute',
    v_name, v_phone, 'requested'
  ) returning id into v_appointment;
  return jsonb_build_object('reference', substring(v_appointment::text from 1 for 8), 'status', 'requested');
exception
  when exclusion_violation then
    raise exception using message = 'HORARIO_OCUPADO';
  when unique_violation then
    raise exception using message = 'REQUISICAO_EM_PROCESSAMENTO';
end;
$function$;

revoke execute on function public.sr_available_slots(text,date,text) from public;
revoke execute on function public.sr_request_booking(uuid,text,text,timestamptz,text,text,boolean) from public;
grant execute on function public.sr_available_slots(text,date,text) to anon, authenticated;
grant execute on function public.sr_request_booking(uuid,text,text,timestamptz,text,text,boolean) to anon, authenticated;

-- IMPORTANTE: sem inserir expediente real em sr_open_hours, nenhuma data aparecerá como livre.
-- Não cadastre expedientes fictícios para colocar o site em produção.
