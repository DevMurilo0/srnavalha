import services from './data/services.js';
import professionals from './data/professionals.js';
import { availableSlots, saveDemoBooking, readDemoBookings, removeDemoBooking, BOOKING_STORAGE_KEY } from './booking-local.js';

const $ = selector => document.querySelector(selector);
const state = { service: null, professional: null, slot: null, filter: 'Destaques', slots: [], busy: false };
const featured = ['cortee', 'comb-cort-barb-simples', 'barboterapia', 'barba-simples', 'corte-infantil', 'corte-exclusivo', 'sobrancelha', 'hidratacao'];
const qs = new URLSearchParams(location.search);
const tz = 'America/Recife';
let requestInFlight = false;
let flowStep = 1;

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
function invalidateRequest() { updateSummary(); }
function updateSummary() {
  $('#bk-recap-service').textContent = state.service?.name || 'A escolher';
  $('#bk-recap-price').textContent = state.service
    ? (state.service.fromPrice ? 'A partir de ' : '') + state.service.price + ' · ' + state.service.duration
    : 'Conforme o catálogo';
  $('#bk-recap-prof').textContent = state.slot?.professional_name || state.professional?.name || 'Sem preferência';
  $('#bk-recap-date').textContent = state.slot
    ? readableDate($('#bk-date').value) + ' às ' + formatHour(state.slot.slot_at)
    : readableDate($('#bk-date').value) + ' · horário a escolher';

  const canBook = Boolean(state.service && state.slot && !requestInFlight);
  const submit = $('#bk-submit');
  submit.disabled = !canBook || flowStep !== 4;
  updateFlowStatus();
  submit.querySelector('.bk-submit-label').textContent = requestInFlight ? 'Salvando teste…' : 'Salvar agendamento de teste';
}
// Progressive enhancement: with JS disabled the complete original form
// remains accessible. With JS, one stage is visible at a time.
const stageLabels=['Serviço','Profissional','Data e horário','Seus dados'];
function updateFlowStatus() {
  const flow=$('#bk-flow-selection');
  if (!flow) return;
  const summary=flowStep===1
    ? (state.service ? state.service.name : 'Escolha seu serviço para começar.')
    : flowStep===2
      ? (state.professional?.name || 'Sem preferência de profissional')
      : flowStep===3
        ? (state.slot ? readableDate($('#bk-date').value)+' · '+formatHour(state.slot.slot_at) : 'Escolha uma data e um horário.')
        : (state.service?.name || 'Serviço')+' · '+(state.slot ? formatHour(state.slot.slot_at) : 'Horário pendente');
  flow.textContent=summary;
}
function flowError(message) {
  const node=$('#bk-flow-error');
  node.textContent=message;
  node.hidden=!message;
}
function showStep(next,{focus=true}={}) {
  flowStep=Math.min(4,Math.max(1,next));
  const wrapper=$('#escolhas');
  wrapper.dataset.step=String(flowStep);
  for (const panel of document.querySelectorAll('.bk-step[data-step]')) {
    const active=Number(panel.dataset.step)===flowStep;
    panel.hidden=!active;
    panel.classList.toggle('is-active',active);
    if(active) panel.scrollTop=0;
  }
  for (const indicator of document.querySelectorAll('[data-progress]')) {
    const number=Number(indicator.dataset.progress);
    indicator.classList.toggle('is-current',number===flowStep);
    indicator.classList.toggle('is-complete',number<flowStep);
    if(number===flowStep) indicator.setAttribute('aria-current','step');
    else indicator.removeAttribute('aria-current');
  }
  $('#bk-flow-prev').disabled=flowStep===1;
  const nextButton=$('#bk-flow-next');
  nextButton.innerHTML=flowStep===4
    ? 'Salvar teste <span aria-hidden="true">→</span>'
    : 'Próximo <span aria-hidden="true">→</span>';
  $('#bk-workflow-step-label').textContent='ETAPA '+String(flowStep).padStart(2,'0')+' / 04 · '+stageLabels[flowStep-1];
  flowError('');
  updateSummary();
  if(focus) {
    const title=wrapper.querySelector('.bk-step.is-active h3');
    title?.setAttribute('tabindex','-1');
    title?.focus({preventScroll:true});
  }
}
function advanceStep() {
  if(requestInFlight) return;
  if(flowStep===1 && !state.service) return flowError('Selecione um serviço para continuar.');
  if(flowStep===1 && state.service.category==='Assinantes') return flowError('Escolha um serviço disponível para demonstração, fora dos planos de assinatura.');
  if(flowStep===3 && !state.slot) return flowError('Escolha uma data e um horário de demonstração antes de continuar.');
  if(flowStep===4) {
    const problem=validateFields();
    if(problem) {
      flowError(problem);
      $('#bk-form-error').textContent=problem;
      const firstInvalid=[!$('#bk-name').value.trim()||$('#bk-name').value.trim().length<2?'#bk-name':null,
        !normalizedPhone($('#bk-phone').value)?'#bk-phone':null,
        !$('#bk-consent').checked?'#bk-consent':null].find(Boolean);
      if(firstInvalid) $(firstInvalid).focus({preventScroll:true});
      return;
    }
    $('#bk-form').requestSubmit();
    return;
  }
  showStep(flowStep+1);
}

function formatHour(iso) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}
function setSelectionFeedback() {
  if (!state.service) showStatus('Escolha um serviço para testar a agenda.', 'neutral');
  else if (state.service.category === 'Assinantes') showStatus('Planos de assinatura ainda não estão disponíveis neste protótipo.', 'warning');
  else if (!state.slot) showStatus('Escolha um horário de demonstração.', 'neutral');
  else showStatus('Horário de teste escolhido. Preencha os dados para salvar apenas neste navegador.', 'good');
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
      for (const item of container.querySelectorAll('.bk-prof')) item.setAttribute('aria-pressed', String(item === button));
      refreshSlots();
    });
    fragment.append(button);
  });
  container.replaceChildren(fragment);
}
function renderDays() {
  const wrapper = $('#bk-days');
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
      for (const item of wrapper.querySelectorAll('.bk-slot')) item.setAttribute('aria-pressed', String(item === button));
      setSelectionFeedback();
    });
    fragment.append(button);
  }
  wrapper.replaceChildren(fragment);
}
function refreshSlots() {
  state.slot = null;
  state.slots = [];
  $('#bk-slots').replaceChildren();
  $('#bk-slot-error').hidden = true;
  setSelectionFeedback();
  if (!state.service) {
    $('#bk-slot-state').textContent = 'Escolha o serviço para visualizar horários ilustrativos.';
    return;
  }
  if (state.service.category === 'Assinantes') {
    $('#bk-slot-state').textContent = 'Assinaturas ainda não fazem parte da demonstração.';
    return;
  }
  const day = $('#bk-date').value;
  if (!day || day < dateAtRecife() || day > addDays(dateAtRecife(), 30)) {
    $('#bk-slot-state').textContent = 'Escolha uma data entre hoje e os próximos 30 dias.';
    return;
  }
  state.slots = availableSlots(state.service.id, day, state.professional?.id || null);
  renderSlots();
  $('#bk-slot-state').textContent = state.slots.length
    ? state.slots.length + ' horário(s) ilustrativo(s) nesta data — não são vagas reais.'
    : 'Nenhum horário de teste disponível. Experimente outro dia ou profissional.';
}
function validateFields() {
  if (!state.service) return 'Selecione o serviço.';
  if (!state.slot) return 'Selecione um horário disponível.';
  if (!$('#bk-name').value.trim() || $('#bk-name').value.trim().length < 2) return 'Informe seu nome com pelo menos duas letras.';
  if (!normalizedPhone($('#bk-phone').value)) return 'Informe um WhatsApp com DDD válido.';
  if (!$('#bk-consent').checked) return 'Confirme que concorda com o uso dos dados para seu agendamento.';
  return '';
}
function submitBooking(event) {
  event.preventDefault();
  if (requestInFlight) return;
  const problem = validateFields();
  if (problem) {
    showStep(4);
    showStatus(problem, 'warning');
    $('#bk-form-error').textContent = problem;
    flowError(problem);
    return;
  }
  $('#bk-form-error').textContent = '';
  requestInFlight = true;
  updateSummary();
  try {
    const entry = saveDemoBooking({
      serviceId: state.service.id,
      professionalId: state.slot.professional_id,
      slotAt: state.slot.slot_at,
      name: $('#bk-name').value.trim(),
      phone: normalizedPhone($('#bk-phone').value)
    });
    $('#bk-confirm-ref').textContent = entry.reference;
    $('#bk-confirm-detail').textContent = entry.service_name + ' · ' + entry.professional_name +
      ' · ' + readableDate($('#bk-date').value) + ', às ' + formatHour(entry.starts_at);
    $('#bk-confirm-state').textContent = 'Teste salvo apenas neste navegador. Este horário NÃO foi enviado à barbearia.';
    $('#escolhas').hidden = true;
    document.body.classList.remove('bk-wizard-ready');
    $('#bk-success').hidden = false;
    document.body.classList.add('bk-booked');
    $('#bk-success').scrollIntoView({ behavior: 'auto', block: 'start' });
    $('#bk-success-title').focus();
    renderSavedBookings();
  } catch (error) {
    const messages = {
      SLOT_TAKEN: 'Este horário já foi utilizado nos testes locais. Escolha outro.',
      STORAGE_BLOCKED: 'Não foi possível salvar neste navegador. Verifique o armazenamento local.',
      INVALID_SELECTION: 'Selecione novamente o serviço, profissional e horário.',
      INVALID_CUSTOMER: 'Revise seu nome e número de WhatsApp.'
    };
    const message = messages[error.code] || 'O teste não pôde ser salvo. Tente novamente.';
    showStatus(message, 'warning');
    $('#bk-form-error').textContent = message;
    if (error.code === 'SLOT_TAKEN') refreshSlots();
  } finally {
    requestInFlight = false;
    updateSummary();
  }
}
function renderSavedBookings() {
  const container = $('#bk-saved-list');
  const bookings = readDemoBookings()
    .filter(item => item.status === 'demo')
    .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)));
  container.replaceChildren();
  if (!bookings.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Nenhum teste salvo neste navegador.';
    container.append(empty);
    return;
  }
  for (const entry of bookings) {
    const row = document.createElement('div');
    row.className = 'bk-saved-row';
    const info = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = entry.service_name || 'Serviço';
    const small = document.createElement('small');
    const day = dateAtRecife(new Date(entry.starts_at));
    small.textContent = (entry.professional_name || 'Profissional') + ' · ' +
      formatHour(entry.starts_at) + ' · ' + readableDate(day);
    info.append(strong, small);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Excluir teste';
    button.setAttribute('aria-label', 'Excluir teste de ' + strong.textContent);
    button.addEventListener('click', () => {
      try {
        removeDemoBooking(entry.id);
        $('#bk-saved-error').textContent = '';
        renderSavedBookings();
        if (!$('#escolhas').hidden) refreshSlots();
      } catch {
        $('#bk-saved-error').textContent = 'Não foi possível excluir este registro local.';
      }
    });
    row.append(info, button);
    container.append(row);
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
refreshSlots();
renderSavedBookings();

// Activate the stepper only after all service, date and professional controls exist.
document.body.classList.add('bk-wizard-ready');
showStep(1,{focus:false});
$('#bk-flow-prev').addEventListener('click',()=>showStep(flowStep-1));
$('#bk-flow-next').addEventListener('click',advanceStep);

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
  renderDays();
  refreshSlots();
});
$('#bk-slot-retry').addEventListener('click', refreshSlots);
for (const input of ['#bk-name','#bk-phone','#bk-consent']) $(input).addEventListener('input', invalidateRequest);
$('#bk-form').addEventListener('submit', submitBooking);
$('#bk-new-booking').addEventListener('click', () => location.assign('agendar.html'));
window.addEventListener('storage', e => { if (e.key === BOOKING_STORAGE_KEY) { renderSavedBookings(); if (!$('#escolhas').hidden) refreshSlots(); } });
window.addEventListener('pageshow', event => { if (event.persisted) { refreshSlots(); renderSavedBookings(); } });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !$('#bk-success').hidden) return;
  if (document.visibilityState === 'visible' && !requestInFlight) refreshSlots();
});
