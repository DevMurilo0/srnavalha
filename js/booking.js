(() => {
  const form = document.querySelector('[data-booking-form]');
  if (!form) return;
  const error = form.querySelector('[data-booking-error]');
  const dateInput = form.elements.date;
  const summaries = {
    service: document.querySelector('[data-summary-service]'),
    professional: document.querySelector('[data-summary-professional]'),
    date: document.querySelector('[data-summary-date]'),
    time: document.querySelector('[data-summary-time]'),
  };
  const today = new Date();
  dateInput.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');

  const serviceValue = () => form.querySelector('input[name="service"]:checked')?.value || '';
  function dateLabel(value) {
    if (!value) return 'Escolha um dia';
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(year, month - 1, day));
  }
  function updateSummary() {
    summaries.service.textContent = serviceValue() || 'Escolha um serviço';
    summaries.professional.textContent = form.elements.professional.value;
    summaries.date.textContent = dateLabel(dateInput.value);
    summaries.time.textContent = form.elements.time.value || 'Escolha um horário';
  }
  form.addEventListener('input', () => { error.hidden = true; updateSummary(); });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      error.hidden = false;
      form.reportValidity();
      return;
    }
    const message = [
      `Olá! Meu nome é ${form.elements.name.value.trim()} e gostaria de solicitar um horário na Sr. Navalha.`, '',
      `Serviço: ${serviceValue()}`,
      `Profissional: ${form.elements.professional.value}`,
      `Dia de preferência: ${dateLabel(dateInput.value)}`,
      `Horário de preferência: ${form.elements.time.value}`, '',
      'Poderiam confirmar a disponibilidade?',
    ].join('\n');
    window.open(`https://wa.me/5581995722396?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
  updateSummary();
})();
