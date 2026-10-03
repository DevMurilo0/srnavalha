import Link from "next/link";
import { ArrowUpRight, MapPin, Plus, Star } from "lucide-react";
import { brand } from "@/config/brand";
import { PhotoFrame } from "@/components/brand/photo-frame";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { faqs, photos, serviceHighlights, teamMoments } from "./content";

export function Services() {
  return (
    <section id="servicos" className="section services-v2">
      <div className="container">
        <Reveal>
          <div className="section-heading services-v2-heading">
            <div>
              <p className="eyebrow">SERVIÇOS</p>
              <h2>
                O QUE VOCÊ
                <br />
                QUER FAZER HOJE?
              </h2>
            </div>
            <p className="section-intro">
              Cortes, barba e estilos que aparecem no dia a dia da barbearia.
              Escolha o que combina com você e veja os resultados reais.
            </p>
          </div>
        </Reveal>

        <div className="service-cards">
          {serviceHighlights.map((service) => (
            <Reveal key={service.name} className="service-card-reveal">
              <article className="service-card-v2">
                <PhotoFrame photo={service.photo} label={service.name} />
                <div className="service-card-copy">
                  <h3>{service.name}</h3>
                  <p>{service.detail}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="sobre" className="section about-v2">
      <div className="container about-v2-grid">
        <Reveal className="about-v2-media">
          <PhotoFrame photo={photos.space} label={"Dentro da " + brand.name} />
        </Reveal>

        <Reveal className="about-v2-copy">
          <p className="eyebrow">A BARBEARIA</p>
          <h2>
            UM ESPAÇO FEITO
            <br />
            PARA CORTAR BEM.
          </h2>
          <p>
            Ambiente claro, estrutura confortável e uma equipe focada no
            atendimento. Um espaço para chegar, sentar e sair com o visual
            alinhado do seu jeito.
          </p>
          <div className="about-v2-meta">
            <span>{brand.address.district}</span>
            <span>
              {brand.address.city} · {brand.address.state}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Professionals() {
  return (
    <section id="profissionais" className="section team-v2">
      <div className="container">
        <Reveal>
          <div className="team-v2-heading">
            <div>
              <p className="eyebrow">EQUIPE</p>
              <h2>
                QUEM ESTÁ
                <br />
                ATRÁS DA CADEIRA.
              </h2>
            </div>
            <p>
              Quem faz a SR Navalha acontecer no dia a dia. Profissionais
              trabalhando lado a lado, com atenção ao corte e ao acabamento.
            </p>
          </div>
        </Reveal>

        <div className="team-v2-grid">
          {teamMoments.map((item, index) => (
            <Reveal
              key={item.title}
              className={
                index === 0 ? "team-v2-card team-v2-card-main" : "team-v2-card"
              }
            >
              <PhotoFrame photo={item.photo} label={item.title} />
              <p>{item.detail}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  return (
    <section id="trabalhos" className="section gallery-v2">
      <div className="container">
        <Reveal>
          <div className="section-heading gallery-v2-heading">
            <div>
              <p className="eyebrow">TRABALHOS</p>
              <h2>
                RESULTADO
                <br />
                SEM FILTRO.
              </h2>
            </div>
            <a
              className="text-link"
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver mais no Instagram <ArrowUpRight size={18} />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </Reveal>

        <div className="gallery-v2-grid">
          <Reveal className="gallery-v2-main">
            <PhotoFrame photo={photos.work1} label="Corte e forma" />
          </Reveal>
          <Reveal>
            <PhotoFrame photo={photos.work2} label="Barba e acabamento" />
          </Reveal>
          <Reveal>
            <PhotoFrame photo={photos.work3} label="Textura e degradê" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function SocialProof() {
  return (
    <section className="proof-v2">
      <div className="container proof-v2-grid">
        <div className="proof-v2-score">
          <Star size={24} fill="currentColor" aria-hidden="true" />
          <strong>{brand.rating.value.toFixed(1)}</strong>
        </div>
        <div>
          <p className="eyebrow">NO GOOGLE</p>
          <h2>{brand.rating.count} AVALIAÇÕES.</h2>
          <p>
            Quem já passou pela cadeira ajuda a contar a experiência. A ficha
            da SR Navalha no Google reúne centenas de avaliações.
          </p>
        </div>
        <a
          className="round-link"
          href={brand.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir SR Navalha no Google Maps"
        >
          <ArrowUpRight size={28} />
        </a>
      </div>
    </section>
  );
}

export function Location() {
  return (
    <section id="localizacao" className="section location-v2">
      <div className="container">
        <Reveal>
          <div className="location-v2-heading">
            <div>
              <p className="eyebrow">LOCALIZAÇÃO</p>
              <h2>
                É AQUI EM
                <br />
                GRAVATÁ.
              </h2>
            </div>
            <p>{brand.address.full}</p>
          </div>
        </Reveal>

        <Reveal className="map-v2-shell">
          <iframe
            src={brand.mapsEmbedUrl}
            title="Mapa da SR Navalha Barbearia em Gravatá"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </Reveal>

        <div className="location-v2-info">
          <Reveal>
            <div className="location-v2-block">
              <MapPin size={22} aria-hidden="true" />
              <div>
                <span className="eyebrow">ENDEREÇO</span>
                <p>{brand.address.street}</p>
                <p>
                  {brand.address.district} · {brand.address.city} ·{" "}
                  {brand.address.state}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="location-v2-block">
              <span className="location-v2-icon">↗</span>
              <div>
                <span className="eyebrow">HORÁRIOS NO MAPS</span>
                {brand.openingHours.map((item) => (
                  <p key={item.label}>
                    {item.label}: <strong>{item.value}</strong>
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="location-v2-actions">
              <a
                className="text-link"
                href={brand.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Traçar rota <ArrowUpRight size={18} />
              </a>
              <a className="text-link" href={"tel:" + brand.phone.e164}>
                {brand.phone.display}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  return (
    <section className="section faq faq-v2" id="duvidas">
      <div className="container faq-grid">
        <div>
          <p className="eyebrow">DÚVIDAS</p>
          <h2>
            ANTES DE
            <br />
            SENTAR NA CADEIRA.
          </h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                <span>{faq.question}</span>
                <Plus size={18} aria-hidden="true" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="final-cta final-cta-v2">
      <div className="container">
        <Reveal>
          <div className="final-cta-v2-row">
            <div>
              <p className="eyebrow">PRÓXIMO PASSO</p>
              <h2>
                PRONTO PARA
                <br />
                MARCAR?
              </h2>
            </div>
            <div className="final-cta-v2-action">
              <Button variant="light" asChild>
                <Link href={brand.bookingPath}>
                  Agendar horário <ArrowUpRight size={20} />
                </Link>
              </Button>
              <a
                href={brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                ou fale com a SR Navalha no Instagram
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
