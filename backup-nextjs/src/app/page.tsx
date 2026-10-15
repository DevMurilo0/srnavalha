import type { Metadata } from "next";
import { Hero } from "@/features/home/hero";
import { Services, About, Gallery, Professionals, SocialProof, Location, FinalCTA } from "@/features/home/sections";
import { MobileBooking } from "@/components/layout/mobile-booking";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Sr. Navalha Barbearia | Seu corte. No seu tempo.",
  alternates: brand.siteUrl ? { canonical: "/" } : undefined,
};

export default function Home() {
  return <>
    <main id="conteudo" className="sr-home">
      <Hero />
      <Services />
      <About />
      <Gallery />
      <Professionals />
      <SocialProof />
      <Location />
      <FinalCTA />
    </main>
    <MobileBooking />
  </>;
}
