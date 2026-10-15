import Image from "next/image";
import type { ReactNode } from "react";
import { ParallaxFrame } from "@/components/ui/parallax-frame";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, Clock3, MapPin, Phone, Scissors, Star } from "lucide-react";
import { brand } from "@/config/brand";
import { Reveal } from "@/components/ui/reveal";
import { faqs } from "./content";
import { GalleryCarousel } from "./gallery-carousel";

const services = [
  {
    title: "CORTE",
    description: "Degradê, social, moderno ou no seu estilo.",
    image: "/images/work/corte-perfil.webp",
    alt: "Corte masculino com cabelo alto penteado e degradê lateral",
  },
  {
    title: "BARBA",
    description: "Cuidados que valorizam o seu visual.",
    image: "/images/work/barba.webp",
    alt: "Barboterapia em cliente com barba grisalha",
  },
  {
    title: "SOBRANCELHA E ACABAMENTO",
    description: "Mais personalidade nos detalhes.",
    image: "/images/work/corte-cacheado.webp",
    alt: "Corte com cachos e laterais cuidadosamente finalizadas",
  },
];

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`sr-kicker ${light ? "sr-kicker--light" : ""}`}>{children}</p>;
}

export function Services() {
  return <section className="sr-services sr-paper sr-paper--grain" id="servicos" aria-labelledby="sr-services-title">
    <div className="sr-shell">
      <Reveal>
        <div className="sr-services__heading">
          <div className="sr-services__titlewrap sr-title-rule">
            <Eyebrow>NOSSOS SERVIÇOS</Eyebrow>
            <h2 id="sr-services-title">DETALHES<br/>QUE FAZEM<br/>A DIFERENÇA.</h2>
          </div>
          <p className="sr-services__intro">Do corte clássico ao estilo mais moderno,<br/>aqui você encontra o serviço ideal para<br/>a sua rotina e personalidade.</p>
          <a href="#trabalhos" className="sr-inline-link">VER TODOS OS SERVIÇOS <ArrowRight size={17}/></a>
        </div>
      </Reveal>
      <div className="sr-services__grid">
        {services.map((service, idx) => <Reveal key={service.title} className="sr-service__reveal">
          <Link href={brand.bookingPath} className="sr-service" aria-label={`${service.title}. Explorar agendamento demonstrativo`}>
            <div className="sr-service__image"><Image src={service.image} alt={service.alt} fill sizes="(max-width: 700px) 90vw, 32vw"/></div>
            <div className="sr-service__bottom">
              <div><h3>{service.title}</h3><p>{service.description}</p></div>
              <span className="sr-circle-arrow"><ArrowRight size={19} aria-hidden="true"/></span>
            </div>
          </Link>
        </Reveal>)}
      </div>
    </div>
  </section>;
}

export function About() {
  return <section id="sobre" className="sr-about" aria-labelledby="sr-about-title">
    <div className="sr-about__photo"><ParallaxFrame><Image src="/images/barbershop/ambiente-cinematico.webp" alt="Interior da Sr. Navalha com cadeiras de barbeiro, espelhos e bancadas" fill sizes="(max-width: 720px) 100vw, 60vw"/></ParallaxFrame></div>
    <div className="sr-about__copy">
      <div className="sr-about__corner" aria-hidden="true"/>
      <Reveal>
        <Eyebrow light>NOSSO ESPAÇO</Eyebrow>
        <h2 id="sr-about-title">UM AMBIENTE<br/>FEITO PARA VOCÊ.</h2>
        <p>Conforto, boa música e um time que entende de estilo. A Sr. Navalha é mais que uma barbearia, é um ponto de encontro em Gravatá.</p>
        <a href={brand.instagram} target="_blank" rel="noopener noreferrer" className="sr-btn sr-btn--outline">CONHECER O ESPAÇO <ArrowRight size={20}/></a>
      </Reveal>
      <div className="sr-seal" aria-hidden="true"><span className="sr-seal__top">SR. NAVALHA · GRAVATÁ</span><Scissors size={35} strokeWidth={1.2}/><span className="sr-seal__bottom">ESTILO EM CADA DETALHE</span></div>
    </div>
  </section>;
}

export function Gallery() {
  return <section className="sr-gallery sr-paper sr-paper--grain" id="trabalhos" aria-labelledby="sr-gallery-title">
    <div className="sr-shell sr-gallery__layout">
      <Reveal className="sr-gallery__heading">
        <Eyebrow>RESULTADOS REAIS</Eyebrow>
        <h2 id="sr-gallery-title">ESTILO EM<br/>CADA DETALHE.</h2>
        <p>Cortes, barbas e acabamentos que valorizam o seu estilo na vida real.</p>
        <a className="sr-btn sr-btn--ghost" href={brand.instagram} target="_blank" rel="noopener noreferrer">VER MAIS TRABALHOS <ArrowRight size={19}/></a>
      </Reveal>
      <Reveal className="sr-gallery__photos"><GalleryCarousel/></Reveal>
    </div>
  </section>;
}

export function Professionals() {
  return <section className="sr-team" id="profissionais" aria-labelledby="sr-team-title">
    <div className="sr-team__texture" aria-hidden="true" />
    <div className="sr-shell sr-team__inner">
      <Reveal className="sr-team__copy">
        <Eyebrow light>NOSSA EQUIPE</Eyebrow>
        <h2 id="sr-team-title">PROFISSIONAIS<br/>QUE FAZEM A DIFERENÇA.</h2>
        <p>Experiência, técnica e paixão pelo que fazem. Aqui você é atendido por um time que realmente se importa com o seu visual.</p>
        <a href={brand.instagram} target="_blank" rel="noopener noreferrer" className="sr-btn sr-btn--outline">CONHECER NOSSA EQUIPE <ArrowRight size={19}/></a>
      </Reveal>
      <div className="sr-team__image"><ParallaxFrame distance={15}><Image src="/images/hero/atendimento-cinematico.webp" alt="Equipe da barbearia Sr. Navalha em atendimento" fill sizes="(max-width: 720px) 100vw, 54vw"/></ParallaxFrame></div>
      <p className="sr-team__signature" aria-hidden="true">Profissionais<br/>de verdade.<br/>Resultados reais.</p>
    </div>
  </section>;
}

export function SocialProof() {
  return <section className="sr-reviews sr-paper sr-paper--grain" aria-label="Avaliações dos clientes">
    <div className="sr-shell sr-reviews__inner">
      <Reveal className="sr-reviews__numbers">
        <Eyebrow>O QUE NOSSOS CLIENTES DIZEM</Eyebrow>
        <div className="sr-reviews__scorebox"><strong>{brand.rating.value.toFixed(1)}</strong>
          <div><span className="sr-stars" aria-label="Cinco estrelas"><Star/><Star/><Star/><Star/><Star/></span><h2>+{brand.rating.count} AVALIAÇÕES</h2><p>Clientes que confiam, recomendam<br/>e sempre voltam.</p></div>
        </div>
      </Reveal>
      <Reveal className="sr-reviews__card-container">
        <a className="sr-reviews__card" href={brand.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Consultar avaliações da Sr. Navalha no Google Maps">
          <div className="sr-reviews__avatar"><Scissors size={27}/></div>
          <div className="sr-reviews__cardcopy"><span className="sr-stars"><Star/><Star/><Star/><Star/><Star/></span><p>Conheça as avaliações dos nossos clientes e descubra por que a Sr. Navalha faz parte de tantos momentos especiais.</p><small>AVALIAÇÕES NO GOOGLE <ArrowUpRight size={13}/></small></div>
          <span className="sr-google" aria-label="Google">G</span>
        </a>
        <a className="sr-reviews__arrow" href={brand.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver avaliações no Google"><ArrowRight size={21}/></a>
      </Reveal>
    </div>
  </section>;
}

export function Location() {
  return <section id="localizacao" className="sr-location sr-paper sr-paper--grain" aria-label="Localização e dúvidas frequentes">
    <div className="sr-shell sr-location__grid">
      <Reveal className="sr-location__details">
        <Eyebrow>NOSSA LOCALIZAÇÃO</Eyebrow>
        <h2>É AQUI EM<br/>GRAVATÁ.</h2>
        <p>Fácil de chegar, no coração da cidade.<br/>Venha conhecer a Sr. Navalha.</p>
        <ul>
          <li><MapPin size={18}/><span>{brand.address.street}<br/>{brand.address.district}, {brand.address.city} · {brand.address.state}</span></li>
          <li><Clock3 size={18}/><span>Segunda a sábado: {brand.openingHours[0].value}<br/>Domingo: {brand.openingHours[1].value}</span></li>
          <li><Phone size={18}/><a href={`tel:${brand.phone.e164}`}>{brand.phone.display}</a></li>
        </ul>
        <a className="sr-btn sr-btn--ghost" href={brand.mapsUrl} target="_blank" rel="noopener noreferrer">VER NO MAPA <ArrowRight size={17}/></a>
      </Reveal>
      <Reveal className="sr-location__map">
        <a href={brand.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir localização da Sr. Navalha no Google Maps">
          <Image src="/images/decor/mapa-gravata.svg" alt="Representação estilizada do mapa urbano de Gravatá com marcador da Sr. Navalha" fill sizes="(max-width: 720px) 90vw, 33vw"/>
          <span className="sr-map-pin"><MapPin size={29} fill="currentColor"/><strong>SR. NAVALHA</strong><small>BARBEARIA</small></span>
        </a>
      </Reveal>
      <Reveal className="sr-location__faq" >
        <Eyebrow>DÚVIDAS FREQUENTES</Eyebrow>
        <h2>ANTES DE SENTAR<br/>NA CADEIRA.</h2>
        <div className="sr-faq-list">
          {faqs.map(item => <details key={item.question} className="sr-faq-item"><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}
        </div>
      </Reveal>
    </div>
  </section>;
}

/** Kept as a named export to preserve the original home component contract. */
export function FAQ() { return null; }

export function FinalCTA() {
  return <section className="sr-cta" aria-labelledby="sr-cta-title">
    <div className="sr-cta__backdrop" aria-hidden="true" />
    <div className="sr-shell sr-cta__inner">
      <div className="sr-cta__picture" aria-hidden="true"><Image src="/images/barbershop/ambiente-cinematico.webp" fill sizes="40vw" alt=""/></div>
      <Reveal className="sr-cta__copy">
        <Eyebrow light>SEU PRÓXIMO CORTE</Eyebrow>
        <h2 id="sr-cta-title">TE ESPERA.</h2>
        <p>Agende agora e viva a experiência<br/>Sr. Navalha Barbearia.</p>
      </Reveal>
      <Link href={brand.bookingPath} className="sr-btn sr-btn--filled">AGENDAR HORÁRIO <ChevronRight size={18}/></Link>
    </div>
  </section>;
}
