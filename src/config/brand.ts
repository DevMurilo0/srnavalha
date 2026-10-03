const instagram = "https://www.instagram.com/barbeariasrnavalha01/";

const addressLabel =
  "Av. Governador Agamenon Magalhães, 349 - Prado, Gravatá - PE, 55642-210";

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
    street: "Av. Governador Agamenon Magalhães, 349",
    district: "Prado",
    postalCode: "55642-210",
    city: "Gravatá",
    state: "PE",
    stateName: "Pernambuco",
    country: "BR",
    full: addressLabel,
  },
  timezone: "America/Recife",
  rating: {
    value: 5.0,
    count: 460,
    source: "Google",
  },
  openingHours: [
    { label: "Segunda a sábado", value: "08:30 — 18:30" },
    { label: "Domingo", value: "09:30 — 14:00" },
  ],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(addressLabel),
  mapsEmbedUrl:
    "https://www.google.com/maps?q=" +
    encodeURIComponent(addressLabel) +
    "&output=embed",
  bookingPath: "/agendar",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || undefined,
} as const;

export const navigation = [
  { label: "Serviços", href: "/#servicos" },
  { label: "A barbearia", href: "/#sobre" },
  { label: "Equipe", href: "/#profissionais" },
  { label: "Trabalhos", href: "/#trabalhos" },
  { label: "Localização", href: "/#localizacao" },
];
