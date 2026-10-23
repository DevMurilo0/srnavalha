import services from './data/services.js';
import professionals from './data/professionals.js';

const official = 'https://sites.appbarber.com.br/srnavala-pqjj';
const $ = selector => document.querySelector(selector);
const state = { service: null, professional: null, filter: 'Destaques' };
const featured = ['cortee', 'comb-cort-barb-simples', 'barboterapia', 'barba-simples', 'corte-infantil', 'corte-exclusivo', 'sobrancelha', 'hidratacao'];
const qs = new URLSearchParams(location.search);
const accentless = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const labelDate = value => {
  if (!value) return 'A combinar';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day));
};
const today = new Date();
const localToday = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
$('#bk-date').min = localToday;

function updateSummary() {
  $('#bk-recap-service').textContent = state.service?.name || 'A escolher';
  $('#bk-recap-price').textContent = state.service ? (state.service.fromPrice ? 'A partir de ' : '') + state.service.price + ' · ' + state.service.duration : 'Conforme o catálogo';
  $('#bk-recap-prof').textContent = state.professional?.name || 'Sem preferência';
  const chosenDate = $('#bk-date').value;
  const chosenTime = $('#bk-time').value;
  $('#bk-recap-date').textContent = chosenDate ? labelDate(chosenDate) + (chosenTime ? ', às ' + chosenTime : '') : chosenTime ? 'Horário preferido: ' + chosenTime : 'A combinar';

  const whatsapp = ['Olá, equipe da Sr. Navalha! Gostaria de consultar um agendamento.',
    'Serviço: ' + (state.service?.name || 'a definir'),
    'Profissional: ' + (state.professional?.name || 'sem preferência'),
    'Dia desejado: ' + (chosenDate ? labelDate(chosenDate) : 'a combinar'),
    'Horário desejado: ' + (chosenTime || 'a combinar'),
    ...($('#bk-name').value.trim() ? ['Meu nome: ' + $('#bk-name').value.trim()] : []),
    'Se possível, podem me informar a disponibilidade? Entendo que o horário ainda não está confirmado.'];
  $('#bk-whatsapp').href = 'https://wa.me/5581995722396?text=' + encodeURIComponent(whatsapp.join('\n'));
  $('#bk-status').textContent = 'Para garantir seu horário, consulte a disponibilidade e confirme no AppBarber.';
}

function renderFilters() {
  const filters = ['Destaques', 'Todos', ...new Set(services.map(s => s.category))];
  const container = $('#bk-filters');
  container.replaceChildren(...filters.map(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category === 'Todos' ? 'Todos os serviços' : category;
    button.dataset.filter = category;
    button.setAttribute('aria-pressed', String(state.filter === category));
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
  const query = accentless($('#bk-search').value.trim());
  const filtered = services.filter(service =>
    (state.filter === 'Todos' || (state.filter === 'Destaques' ? featured.includes(service.id) : service.category === state.filter)) &&
    (!query || accentless(service.name + ' ' + service.category + ' ' + service.description).includes(query))
  );
  const container = $('#bk-services');
  const fragment = document.createDocumentFragment();
  filtered.forEach(service => {
    const selected = state.service?.id === service.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bk-service' + (selected ? ' is-selected' : '');
    button.dataset.id = service.id;
    button.setAttribute('aria-pressed', String(selected));
    const text = document.createElement('span');
    text.className = 'bk-service-info';
    const category = document.createElement('small');
    category.textContent = service.category + ' / ' + service.duration;
    const title = document.createElement('strong');
    title.textContent = service.name;
    text.append(category, title);
    const meta = document.createElement('span');
    meta.className = 'bk-service-meta';
    meta.textContent = (service.fromPrice ? 'A partir de ' : '') + service.price;
    const check = document.createElement('span');
    check.className = 'bk-service-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = selected ? '✓' : '+';
    button.append(text, meta, check);
    button.addEventListener('click', () => {
      state.service = service;
      updateSummary();
      renderServices();
    });
    fragment.append(button);
  });
  container.replaceChildren(fragment);
  $('#bk-empty').hidden = filtered.length > 0;
}

function renderProfessionals() {
  const container = $('#bk-professionals');
  const fragment = document.createDocumentFragment();
  [null, ...professionals].forEach(pro => {
    const selected = state.professional?.id === pro?.id || (!pro && !state.professional);
    const button = document.createElement('button');
    button.className = 'bk-prof';
    button.type = 'button';
    button.setAttribute('aria-pressed', String(selected));
    if (pro) {
      const img = document.createElement('img');
      img.src = pro.image;
      img.alt = '';
      img.width = 92;
      img.height = 92;
      img.loading = 'lazy';
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
      state.professional = pro;
      renderProfessionals();
      updateSummary();
    });
    fragment.append(button);
  });
  container.replaceChildren(fragment);
}

const wantedService = qs.get('servico');
const wantedProfessional = qs.get('profissional');
const chosenService = services.find(service => service.id === wantedService);
if (chosenService) {
  state.service = chosenService;
  state.filter = 'Todos';
}
state.professional = professionals.find(p => p.id === wantedProfessional) || null;
renderFilters();
renderServices();
renderProfessionals();
updateSummary();
$('#bk-search').addEventListener('input', () => {
  if ($('#bk-search').value.trim() && state.filter === 'Destaques') {
    state.filter = 'Todos';
    renderFilters();
  }
  renderServices();
});
for (const input of ['#bk-date', '#bk-time', '#bk-name']) {
  $(input).addEventListener('input', updateSummary);
}
$('#bk-date').addEventListener('change', () => {
  if ($('#bk-date').value && $('#bk-date').value < localToday) {
    $('#bk-date').value = localToday;
  }
  updateSummary();
});
for (const element of document.querySelectorAll('a[href="' + official + '"]')) {
  element.setAttribute('aria-label', 'Abrir a agenda oficial da Sr. Navalha no AppBarber (nova aba)');
}
