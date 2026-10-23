import services from './data/services.js';
import professionals from './data/professionals.js';
import { bookingEnabled, bookingReady, availableSlots, requestBooking, bookingErrorMessage } from './booking-api.js';
import { BOOKING_BACKEND } from './booking-config.js';

const $ = selector => document.querySelector(selector);
const state = { service: null, professional: null, slot: null, filter: 'Destaques', slots: [], busy: false };
const featured = ['cortee', 'comb-cort-barb-simples', 'barboterapia', 'barba-simples', 'corte-infantil', 'corte-exclusivo', 'sobrancelha', 'hidratacao'];
const qs = new URLSearchParams(location.search);
const tz = 'America/Recife';
let pendingSlots = null;
let requestSequence = 0;
let pendingRequestId = null;
let pendingFingerprint = '';
let requestInFlight = false;
let captchaToken = null;
let captchaWidget = null;

function dateAtRecife(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
  const find = type => parts.find(part => part.type === type)?.value;
  return find('year') + '-' + find('month') + '-' + find('day');
}
function addDays(day, count) {
  const date = new Date(day + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
function readableDate(value) {
  if (!value) return 'A escolher';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(new Date(value + 'T12:00:00Z'));
}
function showStatus(message, type = 'neutral') {
  $('#bk-status').textContent = message;
  $('#bk-status').dataset.type = type;
}
const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
function normalizedPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (/^\d{10,11}$/.test(digits)) return '55' + digits;
  if (/^55\d{10,11}$/.test(digits)) return digits;
  return null;
}
function bookingFingerprint() {
  return JSON.stringify([state.service?.id, state.slot?.professional_id, state.slot?.slot_at,
    $('#bk-name').value.trim(), normalizedPhone($('#bk-phone').value)]);
}
function invalidateRequest() {
  if (!requestInFlight) pendingRequestId = null;
  updateSummary();
}
function updateSummary() {
  $('#bk-recap-service').textContent = state.service?.name || 'A escolher';
  $('#bk-recap-price').textContent = state.service
    ? (state.service.fromPrice ? 'A partir de ' : '') + state.service.price + ' · ' + state.service.duration
    : 'Conforme o catálogo';
  $('#bk-recap-prof').textContent = state.slot?.professional_name || state.professional?.name || 'Sem preferência';
  $('#bk-recap-date').textContent = state.slot
    ? readableDate($('#bk-date').value) + ' às ' + formatHour(state.slot.slot_at)
    : readableDate($('#bk-date').value) + ' · horário a escolher';

  const canBook = bookingReady && captchaToken && state.service && state.slot && !requestInFlight;
  const submit = $('#bk-submit');
  submit.disabled = !canBook;
  submit.querySelector('.bk-submit-label').textContent = requestInFlight ? 'Registrando pedido…' : 'Solicitar agendamento';
}
function formatHour(iso) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}
function setSelectionFeedback() {
  if (!bookingReady) {
    showStatus(bookingErrorMessage('NAO_CONFIGURADO'), 'warning');
  } else if (!state.service) {
    showStatus('Escolha um serviço para consultar os horários.', 'neutral');
  } else if (state.service.category === 'Assinantes') {
    showStatus('Planos de assinantes precisam de validação pela equipe antes do agendamento.', 'warning');
  } else if (!state.slot) {
    showStatus('Escolha um horário livre para continuar.', 'neutral');
  } else {
    showStatus('Horário selecionado. Informe seus dados e registre sua solicitação.', 'good');
  }
  updateSummary();
}
function renderFilters() {
  const container = $('#bk-filters');
  const categories = ['Destaques', 'Todos', ...new Set(services.map(service => service.category))];
  container.replaceChildren(...categories.map(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category === 'Todos' ? 'Todos os serviços' : category;
    button.dataset.filter = category;
    button.setAttribute('aria-pressed', String(category === state.filter));
    button.addEventListener('click', () => {
      state.filter = category;
      $('#bk-search').value = '';
      renderFilters();
      renderServices();
    });
    return button;
  }));
}
function renderServices() {
  const query = fold($('#bk-search').value.trim());
  const selected = services.filter(service =>
    (state.filter === 'Todos' || (state.filter === 'Destaques'
      ? featured.includes(service.id) : service.category === state.filter)) &&
    (!query || fold(service.name + ' ' + service.category + ' ' + service.description).includes(query))
  );
  const container = $('#bk-services');
  const fragment = document.createDocumentFragment();
  selected.forEach(service => {
    const pressed = state.service?.id === service.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bk-service' + (pressed ? ' is-selected' : '');
    button.dataset.id = service.id;
    button.setAttribute('aria-pressed', String(pressed));
    const info = document.createElement('span');
    info.className = 'bk-service-info';
    const small = document.createElement('small');
    small.textContent = service.category + ' / ' + service.duration;
    const strong = document.createElement('strong');
    strong.textContent = service.name;
    info.append(small, strong);
    const price = document.createElement('span');
    price.className = 'bk-service-meta';
    price.textContent = (service.fromPrice ? 'A partir de ' : '') + service.price;
    const check = document.createElement('span');
    check.className = 'bk-service-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = pressed ? '✓' : '+';
    button.append(info, price, check);
    button.addEventListener('click', () => {
      if (requestInFlight) return;
      state.service = service;
      state.slot = null;
      pendingRequestId = null;
      for (const item of container.querySelectorAll('.bk-service')) {
        const active = item.dataset.id === service.id;
        item.classList.toggle('is-selected', active);
        item.setAttribute('aria-pressed', String(active));
        item.querySelector('.bk-service-check').textContent = active ? '✓' : '+';
      }
      refreshSlots();
    });
    fragment.append(button);
  });
  container.replaceChildren(fragment);
  $('#bk-empty').hidden = !!selected.length;
}
function renderProfessionals() {
  const container = $('#bk-professionals');
  const fragment = document.createDocumentFragment();
  [null, ...professionals].forEach(pro => {
    const pressed = state.professional?.id === pro?.id || (!pro && !state.professional);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bk-prof';
    button.setAttribute('aria-pressed', String(pressed));
    if (pro) {
      const img = document.createElement('img');
      img.src = pro.image;
      img.alt = '';
      img.loading = 'lazy';
      img.width = 92;
      img.height = 92;
      button.append(img);
    } else {
      const symbol = document.createElement('span');
      symbol.className = 'bk-prof-symbol';
      symbol.setAttribute('aria-hidden', 'true');
      symbol.textContent = '✳';
      button.append(symbol);
    }
    const name = document.createElement('span');
    name.textContent = pro?.name || 'Sem preferência';
    button.append(name);
    button.addEventListener('click', () => {
      if (requestInFlight) return;
      state.professional = pro;
      state.slot = null;
      pendingRequestId = null;
      for (const item of container.querySelectorAll('.bk-prof')) item.setAttribute('aria-pressed', String(item === button));
      refreshSlots();
    });
    fragment.append(button);
  });
  container.replaceChildren(fragment);
}
function renderDays() {
  const wrapper = $('#bk-days');
  function loadCaptcha() {
  const container = $('#bk-challenge');
  if (!bookingReady) {
    container.textContent = 'A verificação ficará disponível quando o sistema de agendamento for ativado.';
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.addEventListener('load', () => {
    if (!window.turnstile) return;
    container.replaceChildren();
    captchaWidget = window.turnstile.render(container, {
      sitekey: BOOKING_BACKEND.turnstileSiteKey.trim(),
      theme: 'light',
      callback: token => { captchaToken = token; updateSummary(); },
      'expired-callback': () => { captchaToken = null; updateSummary(); },
      'error-callback': () => {
        captchaToken = null;
        updateSummary();
        showStatus('Não foi possível validar a segurança. Tente atualizar a página.', 'warning');
      }
    });
  });
  script.addEventListener('error', () => {
    container.textContent = 'Não foi possível carregar a verificação. Verifique a conexão e atualize a página.';
    showStatus('A verificação de segurança não carregou.', 'warning');
  });
  document.head.append(script);
}

const today = dateAtRecife();
  const chosen = $('#bk-date').value;
  wrapper.replaceChildren(...Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index);
    const button = document.createElement('button');
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z')).replace('.', '');
    button.type = 'button';
    button.className = 'bk-day';
    button.setAttribute('aria-pressed', String(date === chosen));
    button.setAttribute('aria-label', readableDate(date));
    const heading = document.createElement('span');
    heading.textContent = index === 0 ? 'HOJE' : weekday.toUpperCase();
    const number = document.createElement('strong');
    number.textContent = date.slice(-2);
    button.append(heading, number);
    button.addEventListener('click', () => {
      if (requestInFlight) return;
      $('#bk-date').value = date;
      pendingRequestId = null;
      renderDays();
      refreshSlots();
    });
    return button;
  }));
}
function renderSlots() {
  const wrapper = $('#bk-slots');
  const fragment = document.createDocumentFragment();
  for (const slot of state.slots) {
    const active = state.slot?.slot_at === slot.slot_at && state.slot?.professional_id === slot.professional_id;
    const button = document.createElement('button');
    button.className = 'bk-slot';
    button.type = 'button';
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', formatHour(slot.slot_at) + ' com ' + slot.professional_name);
    const hour = document.createElement('strong');
    hour.textContent = formatHour(slot.slot_at);
    const person = document.createElement('small');
    person.textContent = slot.professional_name;
    button.append(hour, person);
    button.addEventListener('click', () => {
      if (requestInFlight) return;
      state.slot = slot;
      pendingRequestId = null;
      for (const item of wrapper.querySelectorAll('.bk-slot')) item.setAttribute('aria-pressed', String(item === button));
      setSelectionFeedback();
    });
    fragment.append(button);
  }
  wrapper.replaceChildren(fragment);
}
async function refreshSlots() {
  pendingSlots?.abort();
  pendingSlots = null;
  requestSequence += 1;
  const sequence = requestSequence;
  state.slot = null;
  state.slots = [];
  $('#bk-slots').replaceChildren();
  $('#bk-slot-error').hidden = true;
  setSelectionFeedback();

  if (!bookingEnabled) {
    $('#bk-slot-state').textContent = bookingErrorMessage('NAO_CONFIGURADO');
    return;
  }
  if (!state.service) {
    $('#bk-slot-state').textContent = 'Selecione primeiro um serviço.';
    return;
  }
  if (state.service.category === 'Assinantes') {
    $('#bk-slot-state').textContent = 'Agendamentos para assinantes serão liberados após a validação do plano.';
    return;
  }
  const day = $('#bk-date').value;
  if (!day || day < dateAtRecife() || day > addDays(dateAtRecife(), 30)) {
    $('#bk-slot-state').textContent = 'Escolha uma data entre hoje e os próximos 30 dias.';
    return;
  }
  const controller = new AbortController();
  pendingSlots = controller;
  $('#bk-slot-state').textContent = 'Consultando os horários disponíveis…';
  try {
    const results = await availableSlots(state.service.id, day, state.professional?.id || null, controller.signal);
    if (sequence !== requestSequence) return;
    state.slots = Array.isArray(results) ? results : [];
    renderSlots();
    $('#bk-slot-state').textContent = state.slots.length
      ? state.slots.length + ' horário(s) disponível(is) para ' + readableDate(day) + '.'
      : 'Nenhum horário livre nessa data. Experimente outro dia ou profissional.';
  } catch (error) {
    if (sequence !== requestSequence || error.code === 'CANCELADO') return;
    $('#bk-slot-state').textContent = bookingErrorMessage(error.code);
    $('#bk-slot-error').hidden = false;
    showStatus(bookingErrorMessage(error.code), 'warning');
  } finally {
    if (pendingSlots === controller) pendingSlots = null;
  }
}
function validateFields() {
  if (!state.service) return 'Selecione o serviço.';
  if (!state.slot) return 'Selecione um horário disponível.';
  if (!$('#bk-name').value.trim() || $('#bk-name').value.trim().length < 2) return 'Informe seu nome com pelo menos duas letras.';
  if (!normalizedPhone($('#bk-phone').value)) return 'Informe um WhatsApp com DDD válido.';
  if (!$('#bk-consent').checked) return 'Confirme que concorda com o uso dos dados para seu agendamento.';
  return '';
}
async function submitBooking(event) {
  event.preventDefault();
  if (requestInFlight) return;
  const problem = validateFields();
  if (problem) {
    showStatus(problem, 'warning');
    $('#bk-form-error').textContent = problem;
    return;
  }
  if ($('#bk-trap').value) return;
  $('#bk-form-error').textContent = '';
  if (!bookingReady || !captchaToken) {
    showStatus('Conclua a verificação de segurança para solicitar seu horário.', 'warning');
    return;
  }
  requestInFlight = true;
  const fingerprint = bookingFingerprint();
  if (!pendingRequestId || fingerprint !== pendingFingerprint) {
    pendingFingerprint = fingerprint;
    pendingRequestId = crypto.randomUUID();
  }
  updateSummary();
  showStatus('Registrando sua solicitação com segurança…');
  try {
    const response = await requestBooking({
      requestId: pendingRequestId,
      serviceId: state.service.id,
      professionalId: state.slot.professional_id,
      slotAt: state.slot.slot_at,
      name: $('#bk-name').value.trim(),
      phone: normalizedPhone($('#bk-phone').value),
      captchaToken
    });
    if (response?.status !== 'requested' && response?.status !== 'confirmed') throw new Error('INVALID_RESPONSE');
    const ref = String(response.reference || '').replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase();
    $('#bk-confirm-ref').textContent = ref || 'Registrado';
    $('#bk-confirm-detail').textContent = state.service.name + ' · ' +
      (state.slot.professional_name || state.professional?.name) + ' · ' +
      readableDate($('#bk-date').value) + ', às ' + formatHour(state.slot.slot_at);
    $('#bk-confirm-state').textContent = response.status === 'confirmed'
      ? 'Agendamento confirmado no sistema.'
      : 'Sua solicitação foi registrada e o horário foi reservado, aguardando confirmação da barbearia.';
    $('#escolhas').hidden = true;
    $('#bk-success').hidden = false;
    $('#bk-success').scrollIntoView({ behavior: 'auto', block: 'start' });
    document.body.classList.add('bk-booked');
    $('#bk-success-title').focus();
    pendingRequestId = null;
  } catch (error) {
    const message = bookingErrorMessage(error.code);
    showStatus(message, 'warning');
    $('#bk-form-error').textContent = message;
    if (['HORARIO_INDISPONIVEL','HORARIO_OCUPADO','SERVICO_INDISPONIVEL'].includes(error.code)) {
      pendingRequestId = null;
      refreshSlots();
    }
  } finally {
    requestInFlight = false;
    captchaToken = null;
    if (captchaWidget !== null && window.turnstile) window.turnstile.reset(captchaWidget);
    updateSummary();
  }
}

const today = dateAtRecife();
$('#bk-date').min = today;
$('#bk-date').max = addDays(today, 30);
$('#bk-date').value = today;
const initialService = services.find(s => s.id === qs.get('servico'));
const initialPro = professionals.find(p => p.id === qs.get('profissional'));
if (initialService) {
  state.service = initialService;
  state.filter = 'Todos';
}
state.professional = initialPro || null;
renderFilters();
renderServices();
renderProfessionals();
renderDays();
loadCaptcha();
refreshSlots();

$('#bk-search').addEventListener('input', () => {
  if ($('#bk-search').value.trim() && state.filter !== 'Todos') {
    state.filter = 'Todos';
    renderFilters();
  }
  renderServices();
});
$('#bk-date').addEventListener('change', () => {
  const value = $('#bk-date').value;
  if (value && (value < dateAtRecife() || value > addDays(dateAtRecife(), 30))) {
    $('#bk-date').value = dateAtRecife();
  }
  pendingRequestId = null;
  renderDays();
  refreshSlots();
});
$('#bk-slot-retry').addEventListener('click', refreshSlots);
for (const input of ['#bk-name','#bk-phone','#bk-consent']) $(input).addEventListener('input', invalidateRequest);
$('#bk-form').addEventListener('submit', submitBooking);
$('#bk-new-booking').addEventListener('click', () => location.assign('agendar.html'));
window.addEventListener('pageshow', event => { if (event.persisted) refreshSlots(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !$('#bk-success').hidden) return;
  if (document.visibilityState === 'visible' && !requestInFlight) refreshSlots();
});
