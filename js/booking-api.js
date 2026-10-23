import { BOOKING_BACKEND } from './booking-config.js';

const rawURL = BOOKING_BACKEND.url.trim().replace(/\/$/, '');
const publicKey = BOOKING_BACKEND.publishableKey.trim();
export const bookingEnabled = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(rawURL) &&
  publicKey.length >= 15 && !/service_role|sb_secret_/i.test(publicKey);

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

export function requestBooking({ requestId, serviceId, professionalId, slotAt, name, phone }) {
  return rpc('sr_request_booking', {
    p_request_id: requestId,
    p_service_id: serviceId,
    p_professional_id: professionalId,
    p_slot_at: slotAt,
    p_customer_name: name,
    p_customer_phone: phone,
    p_consent: true
  });
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
  ERRO_SERVIDOR: 'Não foi possível concluir o pedido. Tente novamente mais tarde.'
})[code] || 'Não foi possível completar a solicitação. Tente novamente.';
