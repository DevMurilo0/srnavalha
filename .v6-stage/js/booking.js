(() => {
  'use strict';
  const form = document.querySelector('#booking-form');
  if (!form) return;
  form.noValidate = true;
  const day = form.elements.dia;
  const time = form.elements.horario;
  const error = document.querySelector('#form-error');
  const localDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  day.min = localDate();
  const preference = new URLSearchParams(location.search).get('servico');
  if (preference) [...form.elements.servico].find(input => input.value.toLowerCase() === preference.toLowerCase())?.click();
  [day, time].forEach(input => input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    document.getElementById(input.getAttribute('aria-describedby')).textContent = '';
    error.hidden = true;
    document.querySelector('#booking-feedback').hidden = true;
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    day.min = localDate();
    error.hidden = true;
    [day, time].forEach(input => { input.removeAttribute('aria-invalid'); document.getElementById(input.getAttribute('aria-describedby')).textContent = ''; });
    const failures = [];
    if (!day.value || !day.validity.valid || day.value < day.min) failures.push([day, 'Escolha um dia a partir de hoje.']);
    if (!time.value || !time.validity.valid) failures.push([time, 'Informe seu horário de preferência.']);
    if (failures.length) {
      failures.forEach(([input, message]) => { input.setAttribute('aria-invalid', 'true'); document.getElementById(input.getAttribute('aria-describedby')).textContent = message; });
      error.textContent = 'Confira o dia e o horário para continuar.';
      error.hidden = false;
      failures[0][0].focus();
      return;
    }
    const [year, month, date] = day.value.split('-');
    const name = form.elements.nome.value.trim();
    const message = `Olá! Gostaria de solicitar um horário na Sr. Navalha.${name ? '\n\nMeu nome: ' + name : ''}\n\nServiço: ${form.elements.servico.value}\nProfissional: ${form.elements.profissional.value}\nDia de preferência: ${date}/${month}/${year}\nHorário de preferência: ${time.value}\n\nPoderiam confirmar a disponibilidade?`;
    const url = 'https://wa.me/5581995722396?text=' + encodeURIComponent(message);
    const retry = document.querySelector('#booking-retry');
    retry.href = url;
    // A direct user gesture opens the conversation. No message is sent by this site.
    const link = document.createElement('a');
    Object.assign(link, { href: url, target: '_blank', rel: 'noopener noreferrer' });
    document.body.append(link); link.click(); link.remove();
    document.querySelector('#booking-feedback').hidden = false;
  });
})();
