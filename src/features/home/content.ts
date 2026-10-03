import type { PhotoAsset } from "@/components/brand/photo-frame";

export const photos: Record<
  "hero" | "space" | "team" | "service" | "work1" | "work2" | "work3",
  PhotoAsset
> = {
  hero: {
    src: "/images/hero/corte-e-barba.webp",
    alt: "Resultado de corte com volume no topo e barba com contornos definidos",
    width: 266,
    height: 326,
    sizes: "(max-width: 639px) 44vw, 250px",
  },
  space: {
    src: "/images/barbershop/ambiente.webp",
    alt: "Interior da SR Navalha com cadeiras pretas, bancada amadeirada, espelhos e iluminação linear",
    width: 246,
    height: 148,
    sizes: "(max-width: 639px) calc(100vw - 40px), 420px",
  },
  team: {
    src: "/images/team/atendimento.webp",
    alt: "Profissionais da SR Navalha trabalhando em atendimentos na barbearia",
    width: 264,
    height: 321,
    sizes: "(max-width: 639px) calc(100vw - 40px), 360px",
  },
  service: {
    src: "/images/work/barboterapia.webp",
    alt: "Atendimento de barboterapia com proteção dos olhos e aplicação de produto",
    width: 263,
    height: 325,
    sizes: "(max-width: 639px) calc(100vw - 40px), 320px",
  },
  work1: {
    src: "/images/work/corte-perfil.webp",
    alt: "Corte masculino visto de perfil, com volume e acabamento na lateral",
    width: 265,
    height: 326,
    sizes: "(max-width: 639px) calc(100vw - 40px), 330px",
  },
  work2: {
    src: "/images/work/barba.webp",
    alt: "Barba grisalha com acabamento definido após atendimento",
    width: 265,
    height: 326,
    sizes: "(max-width: 639px) calc(100vw - 40px), 330px",
  },
  work3: {
    src: "/images/work/corte-cacheado.webp",
    alt: "Cabelo cacheado com degradê na lateral e acabamento na nuca",
    width: 265,
    height: 322,
    sizes: "(max-width: 639px) calc(100vw - 40px), 330px",
  },
};

export const serviceHighlights = [
  {
    name: "Cortes",
    detail: "Do clássico ao fade, com acabamento limpo e atenção ao formato.",
    photo: photos.work1,
  },
  {
    name: "Barba",
    detail: "Desenho, contorno e cuidado para manter o visual alinhado.",
    photo: photos.work2,
  },
  {
    name: "Identidade",
    detail: "Textura, riscos e detalhes para sair do comum sem perder precisão.",
    photo: photos.work3,
  },
];

export const teamMoments = [
  {
    title: "Equipe SR Navalha",
    detail: "Profissionais em atendimento.",
    photo: photos.team
      ? { ...photos.team, objectPosition: "34% center" }
      : photos.team,
  },
  {
    title: "Na cadeira",
    detail: "Atendimento de perto.",
    photo: photos.team
      ? { ...photos.team, objectPosition: "78% center" }
      : photos.team,
  },
  {
    title: "Cuidado no detalhe",
    detail: "Técnica durante o atendimento.",
    photo: photos.service,
  },
];

export const faqs = [
  {
    question: "Como posso agendar um horário?",
    answer:
      "O novo agendamento online está sendo preparado. Até lá, o Instagram da SR Navalha continua sendo o canal mais direto para consultar o atendimento.",
  },
  {
    question: "Posso escolher o profissional?",
    answer:
      "Sim. O novo sistema está sendo estruturado para permitir a escolha do profissional disponível para o serviço e horário desejados.",
  },
  {
    question: "A barbearia atende crianças?",
    answer:
      "O perfil da SR Navalha mostra atendimentos infantis. Para confirmar serviço, idade e disponibilidade, fale diretamente com a equipe.",
  },
  {
    question: "Como vão funcionar cancelamentos e remarcações?",
    answer:
      "As regras definitivas serão exibidas no próprio fluxo de agendamento antes da confirmação do horário.",
  },
];
