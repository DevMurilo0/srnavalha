// Sr. Navalha: gateway de reserva. Deploy com verify_jwt=false.
// Validação Turnstile no servidor + RPC privada; nunca envie chaves secretas ao browser.
const allowedOrigins = (Deno.env.get('BOOKING_ALLOWED_ORIGINS') || '')
  .split(',').map(origin => origin.trim()).filter(Boolean);
const secret = Deno.env.get('TURNSTILE_SECRET_KEY') || '';
const supabaseURL = Deno.env.get('SUPABASE_URL') || '';
const privateKey = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

function respond(status: number, value: Record<string, unknown>, origin: string | null) {
  return new Response(status === 204 ? null : JSON.stringify(value), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
      ...(origin && allowedOrigins.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

Deno.serve(async request => {
  const origin = request.headers.get('origin');
  if (!origin || !allowedOrigins.includes(origin)) {
    return respond(403, { code: 'ORIGEM_NAO_AUTORIZADA' }, null);
  }
  if (request.method === 'OPTIONS') return respond(204, {}, origin);
  if (request.method !== 'POST') return respond(405, { code: 'METODO_INVALIDO' }, origin);
  if (!secret || !supabaseURL || !privateKey) {
    return respond(503, { code: 'NAO_CONFIGURADO' }, origin);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return respond(415, { code: 'DADOS_INVALIDOS' }, origin);
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('body');
  } catch {
    return respond(400, { code: 'DADOS_INVALIDOS' }, origin);
  }
  const { captchaToken, requestId, serviceId, professionalId, slotAt, name, phone, consent } = body;
  if (
    typeof captchaToken !== 'string' || captchaToken.length > 2048 || captchaToken.length < 10 ||
    typeof requestId !== 'string' || !/^[\da-f-]{36}$/i.test(requestId) ||
    typeof serviceId !== 'string' || serviceId.length > 120 ||
    typeof professionalId !== 'string' || professionalId.length > 120 ||
    typeof slotAt !== 'string' || Number.isNaN(Date.parse(slotAt)) ||
    typeof name !== 'string' || name.trim().length < 2 || name.length > 70 ||
    typeof phone !== 'string' || !/^55\d{10,11}$/.test(phone) ||
    consent !== true
  ) return respond(400, { code: 'DADOS_INVALIDOS' }, origin);

  try {
    const challenge = new URLSearchParams();
    challenge.set('secret', secret);
    challenge.set('response', captchaToken);
    const clientIP = request.headers.get('cf-connecting-ip');
    if (clientIP) challenge.set('remoteip', clientIP);
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: challenge,
      signal: AbortSignal.timeout(10000)
    });
    if (!result.ok) return respond(503, { code: 'VERIFICACAO_INDISPONIVEL' }, origin);
    const verdict = await result.json();
    const allowedHostname = new URL(origin).hostname;
    if (verdict.success !== true || verdict.hostname !== allowedHostname) {
      return respond(403, { code: 'VERIFICACAO_FALHOU' }, origin);
    }

    const db = await fetch(supabaseURL.replace(/\/$/, '') + '/rest/v1/rpc/sr_request_booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: privateKey,
        ...(privateKey.startsWith('sb_secret_') ? {} : { Authorization: 'Bearer ' + privateKey })
      },
      body: JSON.stringify({
        p_request_id: requestId,
        p_service_id: serviceId,
        p_professional_id: professionalId,
        p_slot_at: slotAt,
        p_customer_name: name.trim(),
        p_customer_phone: phone,
        p_consent: true
      }),
      signal: AbortSignal.timeout(12000)
    });
    const resultData = await db.json().catch(() => null);
    if (!db.ok) {
      const message = resultData?.message || 'ERRO_SERVIDOR';
      const known = ['HORARIO_INDISPONIVEL', 'HORARIO_OCUPADO', 'SERVICO_INDISPONIVEL',
        'LIMITE_ATINGIDO', 'DADOS_INVALIDOS', 'REQUISICAO_DUPLICADA', 'REQUISICAO_EM_PROCESSAMENTO'];
      return respond(409, { code: known.includes(message) ? message : 'ERRO_SERVIDOR' }, origin);
    }
    return respond(201, {
      status: resultData.status,
      reference: resultData.reference
    }, origin);
  } catch {
    return respond(503, { code: 'SEM_CONEXAO' }, origin);
  }
});
