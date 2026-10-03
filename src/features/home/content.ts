import type { PhotoAsset } from "@/components/brand/photo-frame";

// Recortes reais dos prints fornecidos no ambiente. Origem em docs/image-sources.md.
// Preserve width/height originais ao substituir; sizes descreve a largura no layout.
export const photos: Record<
  "hero" | "space" | "team" | "service" | "work1" | "work2" | "work3",
  PhotoAsset
> = {
  hero: {
    src: "/images/hero/corte-e-barba.webp",
    alt: "Corte com volume no topo e barba com contornos definidos, em perfil",
    width: 266,
    height: 326,
    sizes:
      "(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 42vw, 430px",
  },
  space: {
    src: "/images/barbershop/ambiente.webp",
    alt: "Interior da SR Navalha com cadeiras pretas, bancada amadeirada, espelhos e iluminação linear",
    width: 246,
    height: 148,
    sizes: "(max-width: 639px) calc(100vw - 40px), 360px",
  },
  team: {
    src: "/images/team/atendimento.webp",
    alt: "Profissionais trabalhando em atendimentos na barbearia",
    width: 264,
    height: 321,
    sizes: "(max-width: 639px) calc(100vw - 40px), 340px",
  },
  service: {
    src: "/images/work/barboterapia.webp",
    alt: "Detalhe de atendimento com aplicação de produto no rosto e proteção dos olhos",
    width: 263,
    height: 325,
    sizes: "(max-width: 639px) 180px, 230px",
  },
  work1: {
    src: "/images/work/corte-perfil.webp",
    alt: "Corte masculino visto de perfil, com volume e acabamento na lateral",
    width: 265,
    height: 326,
    sizes: "(max-width: 639px) calc(100vw - 40px), 40vw",
  },
  work2: {
    src: "/images/work/barba.webp",
    alt: "Barba grisalha com acabamento definido após atendimento",
    width: 265,
    height: 326,
    sizes:
      "(max-width: 359px) calc(100vw - 40px), (max-width: 639px) 43vw, 27vw",
  },
  work3: {
    src: "/images/work/corte-cacheado.webp",
    alt: "Cabelo cacheado com degradê na lateral e acabamento na nuca",
    width: 265,
    height: 322,
    sizes:
      "(max-width: 359px) calc(100vw - 40px), (max-width: 639px) 43vw, 27vw",
  },
};

export const serviceReferences = [
  { number: "01", name: "Cortes", detail: "Estilos, formas e acabamentos." },
  {
    number: "02",
    name: "Barba",
    detail: "Contornos e cuidado em cada detalhe.",
  },
  {
    number: "03",
    name: "Identidade",
    detail: "Cor, riscos e novas possibilidades.",
  },
];

export const faqs = [
  {
    question: "Como posso agendar um horário?",
    answer:
      "O agendamento online está em preparação. Por enquanto, acesse o Instagram da barbearia para consultar o canal de agendamento utilizado atualmente.",
  },
  {
    question: "Onde encontro os serviços e os valores?",
    answer:
      "A tabela oficial de serviços, preços e durações será publicada após confirmação com o proprietário. As categorias apresentadas nesta página são referências de conteúdo, não um catálogo disponível para reserva.",
  },
  {
    question: "Posso escolher meu profissional?",
    answer:
      "A escolha do profissional está prevista no novo agendamento. A equipe e os serviços realizados por cada profissional ainda precisam ser confirmados.",
  },
  {
    question: "A barbearia atende crianças?",
    answer:
      "Há referências a atendimento infantil no conteúdo da marca. Faixas etárias, serviços e regras de agendamento pelo responsável precisam ser confirmados diretamente com a barbearia.",
  },
  {
    question: "Como funcionarão cancelamentos e remarcações?",
    answer:
      "A política será publicada junto com o sistema de agendamento, após aprovação do proprietário. Para um horário marcado pelo canal atual, consulte a barbearia por esse mesmo canal.",
  },
];
