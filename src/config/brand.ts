const instagram = "https://www.instagram.com/barbeariasrnavalha01/";

export const brand = {
  name: "SR Navalha",
  fullName: "Sr. Navalha Barbearia",
  descriptor: "Barbearia",
  logo: {
    src: "/images/brand/logo.webp",
    width: 119,
    height: 53,
    alt: "Logo original da Sr. Navalha Barbearia",
  },
  instagram,
  instagramHandle: "@barbeariasrnavalha01",
  phone: { display: "(81) 99572-2396", e164: "+5581995722396" },
  address: {
    street: "Avenida Agamenon Magalhães, Nº 349",
    city: "Gravatá",
    state: "PE",
    stateName: "Pernambuco",
    country: "BR",
  },
  timezone: "America/Recife",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Avenida Agamenon Magalhães, 349, Gravatá, PE"),
  bookingPath: "/agendar",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  detailsStatus: "Informações de contato a confirmar com o proprietário.",
} as const;

export const navigation = [
  { label: "Serviços", href: "/#servicos" },
  { label: "A barbearia", href: "/#sobre" },
  { label: "Trabalhos", href: "/#trabalhos" },
  { label: "Onde estamos", href: "/#localizacao" },
];
