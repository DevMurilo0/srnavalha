export type ProfessionalId = "any" | "pro-1" | "pro-2";

export const mockProfessionals = [
  {
    id: "any" as const,
    name: "Qualquer profissional",
    note: "Quero o primeiro horário disponível.",
    image: null,
  },
  {
    id: "pro-1" as const,
    name: "Profissional 01",
    note: "Identificação provisória.",
    image: "/images/team/atendimento.webp",
    position: "25% center",
  },
  {
    id: "pro-2" as const,
    name: "Profissional 02",
    note: "Identificação provisória.",
    image: "/images/team/atendimento.webp",
    position: "78% center",
  },
];

const slots = [
  "08:30",
  "09:10",
  "09:50",
  "10:30",
  "11:10",
  "13:30",
  "14:10",
  "14:50",
  "15:30",
  "16:10",
  "16:50",
  "17:30",
];

// FRONTEND MOCK: substituir pelas consultas reais de disponibilidade na fase de backend.
export function getMockAvailability(date: Date, professional: ProfessionalId) {
  if (date.getDay() === 0) return [];
  const seed =
    date.getDate() + date.getMonth() * 3 + (professional === "pro-2" ? 2 : 0);
  return slots.filter((_, index) => (index + seed) % 4 !== 0);
}

export function isMockDayAvailable(date: Date) {
  return date.getDay() !== 0;
}

// FRONTEND MOCK: futuramente o servidor retornará expires_at.
export const MOCK_HOLD_SECONDS = 7 * 60;
