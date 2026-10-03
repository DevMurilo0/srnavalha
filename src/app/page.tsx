import type { Metadata } from "next";
import { Hero } from "@/features/home/hero";
import {
  About,
  FAQ,
  FinalCTA,
  Gallery,
  Location,
  Professionals,
  Services,
  SocialProof,
} from "@/features/home/sections";
import { ScissorScroll } from "@/components/brand/scissor-scroll";
import { MobileBooking } from "@/components/layout/mobile-booking";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  alternates: brand.siteUrl ? { canonical: "/" } : undefined,
};

export default function Home() {
  return (
    <>
      <main id="conteudo">
        <Hero />
        <Services />
        <ScissorScroll />
        <About />
        <Professionals />
        <Gallery />
        <SocialProof />
        <Location />
        <FAQ />
        <FinalCTA />
      </main>
      <MobileBooking />
    </>
  );
}
