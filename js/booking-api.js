import { BOOKING_BACKEND } from './booking-config.js';

const rawURL = BOOKING_BACKEND.url.trim().replace(/\/$/, '');
const publicKey = BOOKING_BACKEND.publishableKey.trim();
export const bookingEnabled = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(rawURL) &&
  publicKey.length >= 15 && !/service_role|sb_secret_/i.test(publicKey);

export const bookingReady = bookingEnabled && BOOKING_BACKEND.turnstileSiteKey.trim().length >= 10;

export class BookingAPIError extends Error {
  constructor(code, detail = '') {
    super(code);
    this.name = 'BookingAPIError';
    this.code = code;
    this.detail = detail;
  }
}

async function rpc(method, body, { signal } = {}) {
  if (!bookingEnabled) throw new BookingAPIError('NAO_CONFIGURADO');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });
  try {
    const response = await fetch(rawURL + '/rest/v1/rpc/' + method, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        apikey: publicKey,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    let data = null;
    try { data = await response.json(); } catch { /* corpo inválido */ }
    if (!response.ok) {
      const code = data?.message || data?.code || 'ERRO_SERVIDOR';
      throw new BookingAPIError(code, data?.details || '');
    }
    return data;
  } catch (error) {
    if (error instanceof BookingAPIError) throw error;
    if (error.name === 'AbortError') throw new BookingAPIError(signal?.aborted ? 'CANCELADO' : 'TEMPO_ESGOTADO');
    throw new BookingAPIError('SEM_CONEXAO');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

export function availableSlots(serviceId, day, professionalId, signal) {
  return rpc('sr_available_slots', {
    p_service_id: serviceId,
    p_day: day,
    p_professional_id: professionalId
  }, { signal });
}

export async function requestBooking({ requestId, serviceId, professionalId, slotAt, name, phone, captchaToken }) {
  if (!bookingReady) throw new BookingAPIError('NAO_CONFIGURADO');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(rawURL + '/functions/v1/request-booking', {
      method: 'POST',
      cache: 'no-store',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json', apikey: publicKey },
      body: JSON.stringify({
        requestId, serviceId, professionalId, slotAt,
        name, phone, captchaToken, consent: true
      }),
      signal: controller.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new BookingAPIError(data.code || 'ERRO_SERVIDOR');
    return data;
  } catch (error) {
    if (error instanceof BookingAPIError) throw error;
    throw new BookingAPIError(error.name === 'AbortError' ? 'TEMPO_ESGOTADO' : 'SEM_CONEXAO');
  } finally {
    clearTimeout(timer);
  }
}

export const bookingErrorMessage = code => ({
  NAO_CONFIGURADO: 'A agenda própria ainda está sendo ativada. Não é possível registrar pedidos agora.',
  SEM_CONEXAO: 'Não foi possível conectar à agenda. Verifique sua internet e tente novamente.',
  TEMPO_ESGOTADO: 'A agenda demorou a responder. Confira sua conexão e tente novamente.',
  HORARIO_INDISPONIVEL: 'Esse horário não está mais disponível. Escolha outro.',
  HORARIO_OCUPADO: 'Esse horário acabou de ser reservado. Escolha outro.',
  SERVICO_INDISPONIVEL: 'Esse serviço não está disponível para agendamento on-line.',
  DADOS_INVALIDOS: 'Revise seu nome, WhatsApp e aceite o uso dos dados para o agendamento.',
  LIMITE_ATINGIDO: 'Já existem três agendamentos futuros para este telefone. Entre em contato com a barbearia.',
  REQUISICAO_DUPLICADA: 'Esse pedido já foi recebido com outros dados. Atualize e tente novamente.',
  REQUISICAO_EM_PROCESSAMENTO: 'Seu pedido está em processamento. Espere alguns instantes antes de tentar novamente.',
  VERIFICACAO_FALHOU: 'A verificação de segurança não foi concluída. Tente novamente.',
  VERIFICACAO_INDISPONIVEL: 'A verificação está temporariamente indisponível. Tente novamente.',
  ORIGEM_NAO_AUTORIZADA: 'Este endereço ainda não foi autorizado a receber agendamentos.',
  ERRO_SERVIDOR: 'Não foi possível concluir o pedido. Tente novamente mais tarde.'
})[code] || 'Não foi possível completar a solicitação. Tente novamente.';
