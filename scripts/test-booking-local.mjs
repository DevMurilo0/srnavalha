// Execute: node --experimental-default-type=module scripts/test-booking-local.mjs
// Testes sem servidor, usando uma simulação isolada de localStorage.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
globalThis.crypto ??= { randomUUID };
const mock = new Map();
globalThis.localStorage = {
  getItem(key) { return mock.has(key) ? mock.get(key) : null; },
  setItem(key, value) { mock.set(key, value); },
  removeItem(key) { mock.delete(key); },
  clear() { mock.clear(); }
};
const { default: services } = await import('../js/data/services.js');
const { default: professionals } = await import('../js/data/professionals.js');
const { availableSlots, saveDemoBooking, readDemoBookings, removeDemoBooking } =
  await import('../js/booking-local.js');

const nextDay = offset => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Recife', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const get = name => parts.find(item => item.type === name).value;
  const base = new Date([get('year'), get('month'), get('day')].join('-') + 'T12:00:00Z');
  base.setUTCDate(base.getUTCDate() + offset);
  return base.toISOString().slice(0, 10);
};
const testDate = Array.from({ length: 7 }, (_, index) => nextDay(index + 1))
  .find(day => new Date(day + 'T12:00:00Z').getUTCDay() !== 0);

assert.equal(services.length, 42, 'catálogo completo');
assert.equal(professionals.length, 5, 'equipe completa');
const [professional, other] = professionals;
const initial = availableSlots('cortee', testDate, professional.id);
assert.ok(initial.length > 0, 'horários ilustrativos disponíveis');
const first = initial[0];
assert.ok(availableSlots('cortee', testDate, other.id).some(slot => slot.slot_at === first.slot_at),
  'outro profissional com horário independente');
const saved = saveDemoBooking({
  serviceId: 'cortee', professionalId: professional.id, slotAt: first.slot_at,
  name: 'Cliente de Teste', phone: '5581999999999'
});
assert.equal(readDemoBookings().length, 1, 'persistência local');
assert.ok(!availableSlots('cortee', testDate, professional.id).some(slot => slot.slot_at === first.slot_at),
  'mesmo horário bloqueado no browser');
assert.throws(() => saveDemoBooking({
  serviceId: 'cortee', professionalId: professional.id, slotAt: first.slot_at,
  name: 'Outro de Teste', phone: '5581999999999'
}), { code: 'SLOT_TAKEN' }, 'colisão local recusada');
removeDemoBooking(saved.id);
assert.equal(readDemoBookings().length, 0, 'teste excluído');
assert.ok(availableSlots('cortee', testDate, professional.id).some(slot => slot.slot_at === first.slot_at),
  'horário restaurado após exclusão');
const sunday = Array.from({ length: 7 }, (_, i) => nextDay(i + 1))
  .find(day => new Date(day + 'T12:00:00Z').getUTCDay() === 0);
assert.equal(availableSlots('cortee', sunday, professional.id).length, 0, 'domingo ilustrativo sem agenda');
assert.equal(availableSlots('assinatura-corte', testDate, professional.id).length, 0, 'assinatura desabilitada');
console.log('Agendamento frontend local: 10 verificações concluídas.');
