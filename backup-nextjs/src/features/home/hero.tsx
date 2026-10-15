import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight, Crown, Scissors, Star } from "lucide-react";
import { brand } from "@/config/brand";

export function Hero() {
  return (
    <section className="sr-hero" id="hero" aria-labelledby="sr-hero-title">
      <div className="sr-hero__media" aria-hidden="true">
        <Image src="/images/hero/atendimento-cinematico.webp" fill priority sizes="(max-width: 720px) 100vw, 75vw" alt="" className="sr-hero__photograph" />
      </div>
      <div className="sr-hero__shade" aria-hidden="true" />
      <span className="sr-hero__etched sr-hero__etched--left" aria-hidden="true" />
      <div className="sr-shell sr-hero__inner">
        <div className="sr-hero__copy">
          <p className="sr-kicker sr-kicker--light">GRAVATÁ · PE</p>
          <h1 id="sr-hero-title">SEU CORTE.<br/><span>NO SEU<br/> TEMPO.</span></h1>
          <p className="sr-hero__lede">Estilo, precisão e o cuidado que você merece.<br className="sr-only-desktop"/> Na Sr. Navalha, cada corte é um momento seu.</p>
          <div className="sr-hero__actions">
            <Link className="sr-btn sr-btn--filled" href={brand.bookingPath}>AGENDAR HORÁRIO <CalendarDays size={17}/></Link>
            <a href="#servicos" className="sr-inline-link sr-inline-link--light">Ver nossos serviços <ArrowRight size={18}/></a>
          </div>
          <div className="sr-hero__features">
            <div><Scissors size={28}/><span>Profissionais<br/>especializados</span></div>
            <div><Crown size={30}/><span>Ambiente<br/>climatizado</span></div>
            <div><Star size={29}/><span>+{brand.rating.count} avaliações<br/>{brand.rating.value.toFixed(1)} no Google</span></div>
          </div>
        </div>
        <div className="sr-hero__manifesto" aria-hidden="true">MAIS<br/>QUE UM<br/>CORTE.<br/>É VOCÊ<br/>MELHOR.<span/></div>
      </div>
      <span className="sr-hero__scroll" aria-hidden="true">ROLE PARA CONHECER <span>↓</span></span>
    </section>
  );
}
