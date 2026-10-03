import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource-variable/manrope";
import "./globals.css";
import { brand } from "@/config/brand";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  metadataBase: brand.siteUrl ? new URL(brand.siteUrl) : undefined,
  title: {
    default: `${brand.fullName} | Seu próximo corte começa aqui`,
    template: `%s | ${brand.name}`,
  },
  description: `Conheça a ${brand.fullName}, em ${brand.address.city} — ${brand.address.state}. Estilo, cuidado e personalidade. Uma nova experiência de agendamento está chegando.`,
  robots: { index: Boolean(brand.siteUrl), follow: Boolean(brand.siteUrl) },
  openGraph: {
    title: brand.fullName,
    description: "Seu próximo corte começa aqui.",
    locale: "pt_BR",
    type: "website",
    siteName: brand.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0D0E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body id="top">
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
