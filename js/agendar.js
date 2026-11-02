import services from './data/services.js';
import professionals from './data/professionals.js';
import { availableSlots, saveDemoBooking, BOOKING_STORAGE_KEY } from './booking-local.js';

const $ = selector => document.querySelector(selector);
const state = { service: null, professional: null, slot: null, filter: 'Destaques', slots: [], busy: false, step: 0, visited: 0 };
const featured = ['cortee', 'barba-simples', 'comb-cort-barb-simples'];
const qs = new URLSearchParams(location.search);
const tz = 'America/Recife';
let sharedMode=false;
let slotCheckToken=0;
const connectionReady=fetch('/api/health',{cache:'no-store'}).then(async r=>{
 if(!r.ok)return false;
 const data=await r.json();
 sharedMode=data.enabled===true;
 if(sharedMode){
  const heading=$('.bk-ticket-content h2');
  if(heading)heading.textContent='Seu agendamento.';
  const footnote=$('.bk-ticket-footnote');
  if(footnote)footnote.textContent='Os horários são verificados com a agenda compartilhada e a equipe entrará em contato para confirmar.';
  const consent=$('.bk-consent span');
  if(consent)consent.textContent='Autorizo o uso do meu nome e WhatsApp para contato da equipe Sr. Navalha sobre este agendamento.';
  const note=$('.bk-form-local-note');
  if(note)note.textContent='Seus dados serão usados somente para organizar este atendimento e enviar a mensagem de confirmação da barbearia.';
 }
 return sharedMode;
}).catch(()=>false);
let requestInFlight = false;
let stepAnimation;
const steps = [...document.querySelectorAll('.bk-step')];
const progressButtons = [...document.querySelectorAll('.bk-progress button')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function syncContact({focus = false} = {}) {
  const form = $('#bk-form'), heading = $('#bk-contact-heading');
  const reveal = state.step === 3 && Boolean(state.slot);
  const newlyVisible = reveal && form.hidden;
  form.hidden = !reveal;
  heading.hidden = !reveal;
  if (newlyVisible && focus) {
    requestAnimationFrame(() => {
      if (state.step !== 3 || !state.slot) return;
      form.scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'instant':'smooth'});
      $('#bk-name').focus({preventScroll:true});
    });
  }
}
function stepProblem(index) {
  if (index === 0 && !state.service) return 'Escolha um serviço para continuar.';
  if (index === 0 && state.service?.category === 'Assinantes') return 'Planos de assinatura não estão disponíveis neste teste. Escolha outro serviço.';
  if (index === 2 && !$('#bk-date').value) return 'Escolha uma data para ver os horários.';
  if (index === 2 && !$('#bk-date').checkValidity()) return 'Escolha uma data válida entre hoje e os próximos 30 dias.';
  if (index === 2 && new Date($('#bk-date').value+'T12:00:00Z').getUTCDay() === 0) return 'Escolha um dia de segunda a sábado.';
  return '';
}
function showStep(index, {focus = true, motion = false} = {}) {
  if (index < 0 || index > 3) return;
  stepAnimation?.cancel();
  state.step = index;
  state.visited = Math.max(state.visited,index);
  steps.forEach((step,i) => {step.hidden = i !== index});
  syncContact();
  if (index === 3) $('#bk-selected-day').textContent = 'Data: ' + readableDate($('#bk-date').value) + '. Escolha o horário e preencha os dados nesta mesma tela.';
  progressButtons.forEach((button,i) => {
    button.disabled = i > state.visited;
    button.classList.toggle('is-complete',i < index);
    if(i === index) button.setAttribute('aria-current','step');
    else button.removeAttribute('aria-current');
  });
  $('#bk-back').disabled = index === 0;
  $('#bk-next').hidden = index === 3;
  $('#bk-next').textContent = index === 2 ? 'Próximo: ver horários →' : index === 0 && state.service ? 'Continuar com ' + state.service.name + ' →' : 'Próximo →';
  $('#bk-submit').hidden = index !== 3;
  $('#bk-step-error').textContent = '';
  document.title = `${index+1} de 4 · ${['Serviço','Profissional','Data','Horário e dados'][index]} · Sr. Navalha`;
  const heading = steps[index].querySelector('h3');
  heading.tabIndex = -1;
  steps[index].scrollTop = 0;
  if(focus) heading.focus({preventScroll:true});
  if(motion && !reducedMotion.matches && steps[index].animate) {
    stepAnimation = steps[index].animate([{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:180,easing:'cubic-bezier(.22,1,.36,1)'});
    stepAnimation.finished.catch(()=>{});
  }
  updateSummary();
}
function navigateStep(index,event) {
  if(index > state.step){
    refreshSlots();
    for(let i=0;i<index;i++){
      const error=stepProblem(i);
      if(error){if(state.step!==i)showStep(i);$('#bk-step-error').textContent=error;return}
    }
  }
  showStep(index,{motion:event?.detail>0});
}


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
  submit.disabled = !canBook;
  submit.querySelector('.bk-submit-label').textContent = requestInFlight ? 'Salvando teste…' : 'Salvar teste local';
}
function formatHour(iso) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}
function setSelectionFeedback() {
  if (!state.service) showStatus('Escolha um serviço para testar a agenda.', 'neutral');
  else if (state.service.category === 'Assinantes') showStatus('Planos de assinatura ainda não estão disponíveis neste protótipo.', 'warning');
  else if (!state.slot) showStatus(sharedMode?'Escolha o horário desejado.':'Escolha um horário de demonstração.', 'neutral');
  else showStatus(sharedMode?'Preencha os dados para enviar a solicitação à barbearia.':'Horário de teste escolhido. Preencha os dados para salvar apenas neste navegador.', 'good');
  updateSummary();
}
function renderFilters() {
  const container = $('#bk-filters');
  const categories = ['Destaques', 'Todos', ...new Set(services.map(service => service.category))];
  container.replaceChildren(...categories.map(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category === 'Todos' ? 'Todos os serviços' : category === 'Destaques' ? 'Principais' : category;
    button.dataset.filter = category;
    button.setAttribute('aria-pressed', String(category === state.filter));
    button.addEventListener('click', () => {
      state.filter = category;
      $('#bk-search').value = '';
      container.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.filter === category)));
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
  ).sort((a,b)=> state.filter === 'Destaques' ? featured.indexOf(a.id)-featured.indexOf(b.id) : 0);
  const container = $('#bk-services');
  container.classList.toggle('is-featured', state.filter === 'Destaques' && !query);
  const fragment = document.createDocumentFragment();
  selected.forEach(service => {
    const pressed = state.service?.id === service.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bk-service' + (featured.includes(service.id) && state.filter === 'Destaques' ? ' bk-service-featured' : '') + (pressed ? ' is-selected' : '');
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
      for (const item of container.querySelectorAll('.bk-service')) {
        const active = item.dataset.id === service.id;
        item.classList.toggle('is-selected', active);
        item.setAttribute('aria-pressed', String(active));
        item.querySelector('.bk-service-check').textContent = active ? '✓' : '+';
      }
      refreshSlots();
      $('#bk-next').textContent = 'Continuar com ' + service.name + ' →';
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
  const focusedDay = wrapper.contains(document.activeElement) ? document.activeElement.dataset.day : null;
  wrapper.replaceChildren(...Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index);
    const button = document.createElement('button');
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z')).replace('.', '');
    button.type = 'button';
    button.className = 'bk-day';
    button.dataset.day = date;
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
  if(focusedDay) wrapper.querySelector(`[data-day="${focusedDay}"]`)?.focus({preventScroll:true});
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
      $('#bk-step-error').textContent = '';
      syncContact({focus:true});
    });
    fragment.append(button);
  }
  wrapper.replaceChildren(fragment);
}
function refreshSlots() {
  const previous = state.slot;
  state.slot = null;
  state.slots = [];
  syncContact();
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
  state.slots = availableSlots(state.service.id, day, state.professional?.id || null,sharedMode);
  state.slot = state.slots.find(slot => slot.slot_at === previous?.slot_at && slot.professional_id === previous?.professional_id) || null;
  renderSlots();
  setSelectionFeedback();
  syncContact();
  if(previous && !state.slot && state.step === 3){
    $('#bk-step-error').textContent = 'O horário de teste anterior não está mais disponível. Escolha outro horário aqui.';
  }
  $('#bk-slot-state').textContent = state.slots.length
    ? state.slots.length + (sharedMode?' horário(s) nesta data.':' horário(s) ilustrativo(s) nesta data — não são vagas reais.')
    : 'Nenhum horário disponível. Experimente outro dia ou profissional.';
  const token=++slotCheckToken;
  if(sharedMode){
    void fetch('/api/blocked?date='+encodeURIComponent(day),{cache:'no-store'}).then(async reply=>{
      if(!reply.ok)throw Error('Sem conexão com a agenda');
      const data=await reply.json();
      if(token!==slotCheckToken||$('#bk-date').value!==day)return;
      const duration=Number.parseInt(state.service.duration,10)*60000;
      state.slots=state.slots.filter(slot=>!data.busy.some(item=>{
        if(item.professional_id!==slot.professional_id)return false;
        const start=Date.parse(slot.slot_at);
        return start<Date.parse(item.ends_at)&&start+duration>Date.parse(item.starts_at);
      }));
      if(state.slot&&!state.slots.some(slot=>slot.slot_at===state.slot.slot_at&&slot.professional_id===state.slot.professional_id))state.slot=null;
      renderSlots();syncContact();setSelectionFeedback();
      $('#bk-slot-state').textContent=state.slots.length?state.slots.length+' horário(s) disponíveis nesta data.':'Nenhum horário disponível nessa data.';
    }).catch(()=>{if(token===slotCheckToken)$('#bk-slot-state').textContent='Não foi possível consultar a agenda. Tente atualizar a página.'});
  }
}
function validateFields() {
  if (!state.service) return 'Selecione o serviço.';
  if (!state.slot) return 'Selecione um horário disponível.';
  if (!$('#bk-name').checkValidity() || $('#bk-name').value.trim().length < 2) return 'Informe seu nome com pelo menos duas letras.';
  if (!normalizedPhone($('#bk-phone').value)) return 'Informe um WhatsApp com DDD válido.';
  if (!$('#bk-consent').checked) return 'Confirme que entendeu que os dados serão salvos apenas neste navegador.';
  return '';
}
async function submitBooking(event) {
  event.preventDefault();
  if (requestInFlight || state.step !== 3) return;
  const problem = validateFields();
  if (problem) {
    showStatus(problem, 'warning');
    $('#bk-form-error').textContent = problem;
    const invalid = !$('#bk-name').checkValidity() || $('#bk-name').value.trim().length<2 ? $('#bk-name') :
      !normalizedPhone($('#bk-phone').value) ? $('#bk-phone') : !$('#bk-consent').checked ? $('#bk-consent') : null;
    if(invalid){invalid.setAttribute('aria-invalid','true');invalid.focus()}
    return;
  }
  $('#bk-form-error').textContent = '';
  requestInFlight = true;
  updateSummary();
  try {
    await connectionReady;
    const input={
      serviceId:state.service.id,professionalId:state.slot.professional_id,
      slotAt:state.slot.slot_at,name:$('#bk-name').value.trim(),phone:normalizedPhone($('#bk-phone').value)
    };
    let entry;
    if(sharedMode){
      const result=await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),credentials:'same-origin'});
      const data=await result.json();
      if(!result.ok)throw Object.assign(new Error(data.error||'Falha ao registrar'),{code:result.status===409?'SLOT_TAKEN':'SHARED_ERROR'});
      entry=data.item;
    }else entry=saveDemoBooking(input);
    $('#bk-confirm-ref').textContent = entry.reference;
    $('#bk-confirm-date').textContent = readableDate($('#bk-date').value);
    $('#bk-confirm-hour').textContent = formatHour(entry.starts_at);
    $('#bk-confirm-service').textContent = entry.service_name;
    $('#bk-confirm-prof').textContent = entry.professional_name;
    $('#bk-confirm-name').textContent = $('#bk-name').value.trim();
    $('#bk-confirm-phone').textContent = $('#bk-phone').value.trim();
    $('#bk-confirm-state').textContent = sharedMode
      ? 'Solicitação registrada na agenda da barbearia. O contato de confirmação será feito pela equipe, sem envio automático neste momento.'
      : 'Demonstração local: nenhum horário real foi reservado e nenhuma mensagem foi enviada. A conexão da agenda compartilhada ainda não está ativa.';
    $('#escolhas').hidden = true;
    $('#bk-success').hidden = false;
    document.body.classList.add('bk-booked');
    $('#bk-success').scrollIntoView({ behavior: 'auto', block: 'start' });
    $('#bk-success-title').focus();
    
  } catch (error) {
    const messages = {
      SLOT_TAKEN: 'Este horário já foi utilizado nos testes locais. Escolha outro.',
      STORAGE_BLOCKED: 'Não foi possível salvar neste navegador. Verifique o armazenamento local.',
      INVALID_SELECTION: 'Selecione novamente o serviço, profissional e horário.',
      INVALID_CUSTOMER: 'Revise seu nome e número de WhatsApp.',
      SHARED_ERROR: 'Não foi possível registrar na agenda compartilhada. Tente novamente.'
    };
    const message = messages[error.code] || error.message || 'Não foi possível concluir o agendamento.';
    showStatus(message, 'warning');
    $('#bk-form-error').textContent = message;
    if (error.code === 'SLOT_TAKEN') refreshSlots();
  } finally {
    requestInFlight = false;
    updateSummary();
  }
}
const today = dateAtRecife();
$('#bk-date').min = today;
$('#bk-date').max = addDays(today, 30);
$('#bk-date').value = '';
const initialService = services.find(s => s.id === qs.get('servico'));
const initialPro = professionals.find(p => p.id === qs.get('profissional'));
if (initialService) {
  state.service = initialService;
  state.filter = featured.includes(initialService.id) ? 'Destaques' : 'Todos';
}
state.professional = initialPro || null;
renderFilters();
renderServices();
renderProfessionals();
renderDays();
refreshSlots();


$('#bk-search').addEventListener('input', () => {
  if ($('#bk-search').value.trim() && state.filter !== 'Todos') {
    state.filter = 'Todos';
    renderFilters();
  }
  renderServices();
});
$('#bk-date').addEventListener('change', () => {
  renderDays();
  refreshSlots();
});
$('#bk-slot-retry').addEventListener('click', refreshSlots);
for (const input of ['#bk-name','#bk-phone','#bk-consent']) $(input).addEventListener('input', () => {$(input).removeAttribute('aria-invalid');$('#bk-form-error').textContent='';invalidateRequest()});
$('#bk-form').addEventListener('submit', submitBooking);
$('#bk-new-booking').addEventListener('click', () => location.assign('agendar.html'));
window.addEventListener('storage', e => {
  if (e.key === BOOKING_STORAGE_KEY && !$('#escolhas').hidden) refreshSlots();
});
window.addEventListener('pageshow', event => {
  if (event.persisted) refreshSlots();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !$('#bk-success').hidden) return;
  if (document.visibilityState === 'visible' && !requestInFlight) refreshSlots();
});

// One summary node: persistent desktop aside, review inside step four on mobile.
const summary = $('.bk-summary');
const compact = matchMedia('(max-width:760px)');
function placeSummary(){
  if(compact.matches) steps[3].append(summary);
  else $('.bk-workshop-grid').append(summary);
}
compact.addEventListener('change',placeSummary);placeSummary();
$('#escolhas').classList.add('bk-wizard');
showStep(0,{focus:false});
$('#bk-next').addEventListener('click',event=>navigateStep(state.step+1,event));
$('#bk-back').addEventListener('click',event=>navigateStep(state.step-1,event));
progressButtons.forEach((button,i)=>button.addEventListener('click',event=>navigateStep(i,event)));
reducedMotion.addEventListener('change',()=>stepAnimation?.cancel());
