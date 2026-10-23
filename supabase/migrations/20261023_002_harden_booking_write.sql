-- Endurecimento da escrita: o navegador nunca recebe permissão para criar reservas diretamente.
-- A função de criação só poderá ser chamada pela Edge Function autenticada com credencial privada.
revoke execute on function public.sr_request_booking(uuid,text,text,timestamptz,text,text,boolean) from public, anon, authenticated;
grant execute on function public.sr_request_booking(uuid,text,text,timestamptz,text,text,boolean) to service_role;
-- A leitura de vagas continua pública e não revela dados pessoais.
grant execute on function public.sr_available_slots(text,date,text) to anon, authenticated;
