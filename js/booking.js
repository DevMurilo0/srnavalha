(() => {
  const content = document.querySelector('[data-booking-content]');
  if (!content) return;
  const progress = document.querySelector('[data-booking-progress]');
  const layout = document.querySelector('[data-booking-layout]');
  const success = document.querySelector('[data-booking-success]');
  const backButton = document.querySelector('[data-booking-back]');
  const nextButton = document.querySelector('[data-booking-next]');
  const steps = [
    { id: 'professional', label: 'Profissional' },
    { id: 'datetime', label: 'Data e horário' },
    { id: 'details', label: 'Seus dados' },
    { id: 'review', label: 'Revisão' },
  ];
  const professionals = [
    { id: 'any', name: 'Qualquer profissional', note: 'Quero o primeiro horário disponível.', image: null },
    { id: 'pro-1', name: 'Profissional 01', note: 'Identificação provisória.', image: 'assets/images/hero/atendimento-editorial-v2.webp', position: '52% center' },
    { id: 'pro-2', name: 'Profissional 02', note: 'Identificação provisória.', image: 'assets/images/hero/atendimento-editorial-v2.webp', position: '76% center' },
  ];
  const slots = ['08:30','09:10','09:50','10:30','11:10','13:30','14:10','14:50','15:30','16:10','16:50','17:30'];
  const today = dayStart(new Date());
  const state = { step: 0, professional: null, date: null, time: null, name: '', phone: '', month: new Date(today.getFullYear(), today.getMonth(), 1), seconds: 420, timer: null };
  const icon = {
    users: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.7L7 10a16 16 0 0 0 7 7l1.8-1.9a2 2 0 0 1 1.7-.6l2.8.4a2 2 0 0 1 1.7 2Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  };
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[character]);
  function dayStart(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
  function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
  function dateLabel(date, options = { weekday:'long', day:'numeric', month:'long' }) { return date ? new Intl.DateTimeFormat('pt-BR', options).format(date) : '—'; }
  function monthLabel(date) { return new Intl.DateTimeFormat('pt-BR', { month:'long', year:'numeric' }).format(date).toUpperCase(); }
  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : '';
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  }
  function selectedProfessional() { return professionals.find((item) => item.id === state.professional) || null; }
  function getSlots(date, professional) {
    if (date.getDay() === 0) return [];
    const seed = date.getDate() + date.getMonth() * 3 + (professional === 'pro-2' ? 2 : 0);
    return slots.filter((_, index) => (index + seed) % 4 !== 0);
  }
  function calendarDays(month) {
    const year = month.getFullYear(), monthIndex = month.getMonth();
    const leading = new Date(year, monthIndex, 1).getDay();
    const count = new Date(year, monthIndex + 1, 0).getDate();
    return [...Array(leading).fill(null), ...Array.from({ length:count }, (_, index) => new Date(year, monthIndex, index + 1))];
  }
  function canContinue() {
    if (state.step === 0) return Boolean(state.professional);
    if (state.step === 1) return Boolean(state.date && state.time);
    if (state.step === 2) return state.name.trim().length >= 2 && state.phone.replace(/\D/g, '').length >= 10;
    return true;
  }
  function timerLabel() { return `${String(Math.floor(state.seconds / 60)).padStart(2,'0')}:${String(state.seconds % 60).padStart(2,'0')}`; }
  function startTimer() {
    clearInterval(state.timer);
    state.seconds = 420;
    state.timer = setInterval(() => {
      state.seconds -= 1;
      if (state.seconds <= 0) {
        clearInterval(state.timer);
        state.time = null;
        state.seconds = 420;
        if (state.step === 1) render();
      }
      updateSummary();
      updateActions();
    }, 1000);
  }
  function renderProgress() {
    progress.innerHTML = steps.map((item, index) => {
      const active = index === state.step, done = index < state.step;
      return `<button type="button" data-step-index="${index}" class="${active ? 'active' : done ? 'done' : ''}" ${index > state.step ? 'disabled' : ''} ${active ? 'aria-current="step"' : ''}><span>${done ? '✓' : ''}</span>${item.label}</button>`;
    }).join('');
    progress.querySelectorAll('[data-step-index]').forEach((button) => button.addEventListener('click', () => {
      const index = Number(button.dataset.stepIndex);
      if (index <= state.step) changeStep(index);
    }));
  }
  function heading(leading, eyebrow, title) {
    return `<div class="booking-step-heading" tabindex="-1" data-step-heading>${icon[leading]}<div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div></div>`;
  }
  function renderProfessional() {
    return `<div class="booking-enter">${heading('users','ESCOLHA O PROFISSIONAL','COM QUEM<br>VOCÊ QUER CORTAR?')}<div class="booking-professional-grid">${professionals.map((item) => `<button type="button" class="booking-professional-card ${state.professional === item.id ? 'selected' : ''} ${item.id === 'any' ? 'booking-professional-any' : ''}" data-professional="${item.id}" aria-pressed="${state.professional === item.id}">${item.image ? `<span class="booking-professional-photo"><img src="${item.image}" alt="Profissionais da Sr. Navalha em atendimento" style="object-position:${item.position}" loading="lazy"></span>` : `<span class="booking-any-icon">${icon.users}</span>`}<span><strong>${item.name}</strong><small>${item.note}</small></span><span class="booking-select-indicator">${state.professional === item.id ? '✓' : ''}</span></button>`).join('')}</div><p class="booking-demo-note">Nomes e fotos individuais serão atualizados após a confirmação oficial da equipe.</p></div>`;
  }
  function renderDateTime() {
    const current = state.month.getFullYear() === today.getFullYear() && state.month.getMonth() === today.getMonth();
    const weekdays = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
    const cells = calendarDays(state.month).map((date, index) => {
      if (!date) return `<span aria-hidden="true" class="booking-calendar-empty" data-cell-index="${index}"></span>`;
      const available = date >= today && date.getDay() !== 0;
      const selected = state.date && dateKey(date) === dateKey(state.date);
      const isToday = dateKey(date) === dateKey(today);
      return `<button type="button" data-date="${dateKey(date)}" ${available ? '' : 'disabled'} class="${selected ? 'selected' : ''} ${isToday ? 'today' : ''}" aria-label="${dateLabel(date)}${available ? '' : ', indisponível'}" aria-pressed="${Boolean(selected)}"><span>${date.getDate()}</span>${isToday ? '<small>Hoje</small>' : ''}</button>`;
    }).join('');
    const times = state.date && state.professional ? getSlots(state.date, state.professional) : [];
    const dateBody = state.date ? `<div class="booking-times">${times.map((time) => `<button type="button" data-time="${time}" class="${state.time === time ? 'selected' : ''}" aria-pressed="${state.time === time}">${time}</button>`).join('')}</div>${state.time ? `<div class="booking-inline-hold"><span>HORÁRIO ESCOLHIDO PARA A DEMONSTRAÇÃO</span><strong>${icon.clock} ${timerLabel()}</strong></div>` : ''}<p class="booking-demo-note">Horários e contagem de 7 minutos são simulados no navegador. Nenhuma reserva é feita.</p>` : '<div class="booking-empty-state">Escolha um dia disponível para ver os horários de demonstração.</div>';
    return `<div class="booking-enter">${heading('calendar','DATA E HORÁRIO','QUANDO VOCÊ QUER IR?')}<div class="booking-calendar-layout"><div class="booking-calendar"><div class="booking-calendar-head"><button type="button" aria-label="Mês anterior" data-month-prev ${current ? 'disabled' : ''}><span aria-hidden="true">‹</span></button><strong aria-live="polite">${monthLabel(state.month)}</strong><button type="button" aria-label="Mês seguinte" data-month-next><span aria-hidden="true">›</span></button></div><div class="booking-weekdays" aria-hidden="true">${weekdays.map((day) => `<span>${day}</span>`).join('')}</div><div class="booking-month-grid">${cells}</div></div><div class="booking-time-panel"><div class="booking-times-heading"><div><p class="eyebrow">HORÁRIOS DISPONÍVEIS</p><p>${state.date ? dateLabel(state.date) : 'Selecione um dia no calendário.'}</p></div></div>${dateBody}</div></div></div>`;
  }
  function renderDetails() {
    return `<form class="booking-enter" data-details-form novalidate>${heading('phone','SEUS DADOS','COMO A GENTE FALA COM VOCÊ?')}<div class="booking-form-grid"><label><span>Nome</span><input name="name" data-name required minlength="2" autocomplete="name" value="${escapeHTML(state.name)}" placeholder="Seu nome"></label><label><span>WhatsApp</span><input name="phone" data-phone required autocomplete="tel" inputmode="tel" maxlength="15" value="${escapeHTML(state.phone)}" placeholder="(81) 99999-9999"></label></div><p class="booking-form-error" data-form-error role="alert" hidden>Informe seu nome e um número de WhatsApp válido para continuar.</p><div class="booking-whatsapp-preview"><span class="booking-whatsapp-icon" aria-hidden="true">WA</span><div><strong>O telefone é usado somente nesta demonstração local.</strong><p>A confirmação por WhatsApp não está conectada. Nada será enviado.</p></div></div></form>`;
  }
  function renderReview() {
    const person = selectedProfessional();
    return `<div class="booking-enter">${heading('check','REVISE A SIMULAÇÃO','SEU HORÁRIO.')}<div class="booking-review"><div><span>Profissional</span><strong>${escapeHTML(person?.name || '—')}</strong></div><div><span>Data</span><strong>${escapeHTML(dateLabel(state.date))}</strong></div><div><span>Horário de demonstração</span><strong>${escapeHTML(state.time || '—')}</strong></div><div><span>Cliente</span><strong>${escapeHTML(state.name)}</strong></div><div><span>WhatsApp informado</span><strong>${escapeHTML(state.phone)}</strong></div></div><div class="booking-warning"><strong>Somente uma demonstração</strong><p>Finalizar não cria, bloqueia ou reserva horário. Os dados ficam apenas nesta página enquanto ela estiver aberta.</p></div></div>`;
  }
  function updateSummary() {
    document.querySelector('[data-summary-professional]').textContent = selectedProfessional()?.name || 'Escolha um profissional';
    document.querySelector('[data-summary-date]').textContent = state.date ? dateLabel(state.date) : 'Escolha uma data';
    document.querySelector('[data-summary-time]').textContent = state.time || 'Escolha um horário';
    const nameRow = document.querySelector('[data-summary-name-row]');
    nameRow.hidden = !state.name;
    document.querySelector('[data-summary-name]').textContent = state.name;
    const timerWrap = document.querySelector('[data-summary-timer-wrap]');
    timerWrap.hidden = !state.time;
    document.querySelector('[data-summary-timer]').textContent = timerLabel();
    const inlineTimer = content.querySelector('.booking-inline-hold strong');
    if (inlineTimer) inlineTimer.innerHTML = `${icon.clock} ${timerLabel()}`;
  }
  function updateActions() {
    backButton.disabled = state.step === 0;
    nextButton.disabled = !canContinue();
    nextButton.innerHTML = state.step === 3 ? 'Finalizar simulação <span aria-hidden="true">✓</span>' : 'Continuar <span aria-hidden="true">→</span>';
  }
  function render() {
    renderProgress();
    content.innerHTML = [renderProfessional, renderDateTime, renderDetails, renderReview][state.step]();
    updateSummary();
    updateActions();
    bindStep();
    if (state.step > 0) requestAnimationFrame(() => content.querySelector('[data-step-heading]')?.focus({ preventScroll:true }));
  }
  function bindStep() {
    content.querySelectorAll('[data-professional]').forEach((button) => button.addEventListener('click', () => {
      state.professional = button.dataset.professional;
      state.date = null; state.time = null; clearInterval(state.timer);
      render();
    }));
    content.querySelectorAll('[data-date]').forEach((button) => button.addEventListener('click', () => {
      const [year, month, day] = button.dataset.date.split('-').map(Number);
      state.date = new Date(year, month - 1, day); state.time = null; clearInterval(state.timer);
      render();
    }));
    content.querySelectorAll('[data-time]').forEach((button) => button.addEventListener('click', () => {
      state.time = button.dataset.time; startTimer(); render();
    }));
    content.querySelector('[data-month-prev]')?.addEventListener('click', () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); render(); });
    content.querySelector('[data-month-next]')?.addEventListener('click', () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); render(); });
    const name = content.querySelector('[data-name]');
    const phone = content.querySelector('[data-phone]');
    const error = content.querySelector('[data-form-error]');
    name?.addEventListener('input', () => { state.name = name.value; error.hidden = true; updateSummary(); updateActions(); });
    phone?.addEventListener('input', () => { state.phone = formatPhone(phone.value); phone.value = state.phone; error.hidden = true; updateSummary(); updateActions(); });
    content.querySelector('[data-details-form]')?.addEventListener('submit', (event) => { event.preventDefault(); goNext(); });
  }
  function changeStep(index) {
    state.step = Math.max(0, Math.min(3, index));
    render();
    scrollTo({ top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function goNext() {
    if (!canContinue()) {
      const error = content.querySelector('[data-form-error]');
      if (error) { error.hidden = false; content.querySelector('[data-name]')?.focus(); }
      return;
    }
    if (state.step < 3) changeStep(state.step + 1);
    else finishDemo();
  }
  function finishDemo() {
    clearInterval(state.timer);
    layout.hidden = true; progress.hidden = true;
    success.hidden = false;
    success.innerHTML = `<div class="booking-success-icon">${icon.check}</div><p class="eyebrow">DEMONSTRAÇÃO CONCLUÍDA</p><h1>SIMULAÇÃO<br><span>FINALIZADA.</span></h1><p class="booking-success-lead">Nenhum horário foi reservado e nenhum dado foi enviado ou salvo.</p><div class="booking-success-card"><span>${escapeHTML(selectedProfessional()?.name || '')}</span><strong>${escapeHTML(dateLabel(state.date))}</strong><strong>${escapeHTML(state.time || '')}</strong><span>${escapeHTML(state.name)}</span></div><div class="booking-success-actions"><button type="button" class="button button-primary" data-booking-reset>Testar novamente <span aria-hidden="true">↻</span></button><a class="sr-inline-link" href="index.html">Voltar para o site</a></div>`;
    success.querySelector('[data-booking-reset]').addEventListener('click', reset);
    scrollTo({ top:0, behavior:'auto' });
    success.querySelector('h1')?.focus({ preventScroll:true });
  }
  function reset() {
    clearInterval(state.timer);
    Object.assign(state, { step:0, professional:null, date:null, time:null, name:'', phone:'', month:new Date(today.getFullYear(), today.getMonth(), 1), seconds:420, timer:null });
    layout.hidden = false; progress.hidden = false; success.hidden = true;
    render();
  }
  backButton.addEventListener('click', () => { if (state.step > 0) changeStep(state.step - 1); });
  nextButton.addEventListener('click', goNext);
  render();
})();
