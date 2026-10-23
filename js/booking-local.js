// Protótipo 100% frontend da Sr. Navalha. Não usa servidor, API ou reserva real.
// Os horários abaixo são FICTÍCIOS e servem apenas para testar a interface.
// A futura agenda administrativa definirá o expediente verdadeiro dos profissionais.
import services from './data/services.js';
import professionals from './data/professionals.js';

export const BOOKING_STORAGE_KEY = 'srnavalha:agendamentos-demo:v1';
export const DEMO_SCHEDULE = Object.freeze({
  weekdays: [1, 2, 3, 4, 5, 6], // 0 = domingo (sem horários na demonstração)
  ranges: [['09:00', '12:00'], ['14:00', '19:00']],
  stepMinutes: 30,
  daysAhead: 30
});
export class LocalBookingError extends Error {
  constructor(code) {
    super(code);
    this.name = 'LocalBookingError';
    this.code = code;
  }
}

const TZ = '-03:00'; // Horário local de Gravatá / Recife, usado só na demonstração.
const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const stamp = (day, minute) => new Date(
  day + 'T' + String(Math.floor(minute / 60)).padStart(2, '0') + ':' +
  String(minute % 60).padStart(2, '0') + ':00' + TZ
).toISOString();
const isSameSlot = (a, b) => a.professional_id === b.professional_id &&
  new Date(a.starts_at).getTime() < new Date(b.ends_at).getTime() &&
  new Date(a.ends_at).getTime() > new Date(b.starts_at).getTime();

export function readDemoBookings() {
  try {
    const data = JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data.filter(value => value && typeof value === 'object') : [];
  } catch {
    return [];
  }
}
function store(bookings) {
  try {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    throw new LocalBookingError('STORAGE_BLOCKED');
  }
}
export function removeDemoBooking(id) {
  const current = readDemoBookings();
  store(current.filter(booking => booking.id !== id));
}
export function clearDemoBookings() {
  store([]);
}
function localeDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Recife', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const get = kind => parts.find(part => part.type === kind)?.value;
  return [get('year'), get('month'), get('day')].join('-');
}
function addDays(day, n) {
  const d = new Date(day + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function validDay(day) {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    day >= localeDay() && day <= addDays(localeDay(), DEMO_SCHEDULE.daysAhead);
}

export function availableSlots(serviceId, day, professionalId = null) {
  const service = services.find(s => s.id === serviceId);
  if (!service || service.category === 'Assinantes' || !validDay(day)) return [];
  const duration = Number.parseInt(service.duration, 10);
  if (!Number.isFinite(duration) || duration <= 0) return [];

  const weekday = new Date(day + 'T12:00:00Z').getUTCDay();
  if (!DEMO_SCHEDULE.weekdays.includes(weekday)) return [];

  const team = professionalId
    ? professionals.filter(pro => pro.id === professionalId)
    : professionals;
  const bookings = readDemoBookings();
  const earliest = Date.now() + 30 * 60 * 1000;
  const list = [];

  for (const pro of team) {
    for (const [opens, closes] of DEMO_SCHEDULE.ranges) {
      for (let time = minutes(opens); time + duration <= minutes(closes); time += DEMO_SCHEDULE.stepMinutes) {
        const slot_at = stamp(day, time);
        const start = Date.parse(slot_at);
        if (start < earliest) continue;
        const end = new Date(start + duration * 60 * 1000).toISOString();
        const candidate = { professional_id: pro.id, starts_at: slot_at, ends_at: end };
        if (bookings.some(item => item.status === 'demo' && isSameSlot(item, candidate))) continue;
        list.push({ slot_at, professional_id: pro.id, professional_name: pro.name });
      }
    }
  }
  return list.sort((a, b) => a.slot_at.localeCompare(b.slot_at) || a.professional_name.localeCompare(b.professional_name, 'pt-BR'));
}

export function saveDemoBooking({ serviceId, professionalId, slotAt, name, phone }) {
  const service = services.find(s => s.id === serviceId && s.category !== 'Assinantes');
  const pro = professionals.find(p => p.id === professionalId);
  if (!service || !pro) throw new LocalBookingError('INVALID_SELECTION');
  const cleanName = String(name || '').trim();
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (cleanName.length < 2 || cleanName.length > 70 || !/^55\d{10,11}$/.test(cleanPhone)) {
    throw new LocalBookingError('INVALID_CUSTOMER');
  }
  // Recalcular no momento do salvamento para impedir horário obsoleto neste navegador.
  const day = localeDay(new Date(slotAt));
  const available = availableSlots(serviceId, day, professionalId);
  if (!available.some(slot => slot.slot_at === slotAt && slot.professional_id === professionalId)) {
    throw new LocalBookingError('SLOT_TAKEN');
  }
  const current = readDemoBookings();
  const duration = Number.parseInt(service.duration, 10);
  const id = crypto.randomUUID();
  const entry = {
    id, reference: id.slice(0, 8).toUpperCase(),
    status: 'demo', service_id: serviceId, service_name: service.name,
    professional_id: professionalId, professional_name: pro.name,
    starts_at: slotAt, ends_at: new Date(Date.parse(slotAt) + duration * 60000).toISOString(),
    customer_name: cleanName, customer_phone: cleanPhone, created_at: new Date().toISOString()
  };
  store([...current, entry]);
  return entry;
}
