import Link from "next/link";
import { ArrowUpRight, MapPin, Plus } from "lucide-react";
import { brand } from "@/config/brand";
import { PhotoFrame } from "@/components/brand/photo-frame";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { faqs, photos, serviceReferences } from "./content";

export function Services() {
  return (
    <section id="servicos" className="section services">
      <div className="container">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / O QUE FAZEMOS</p>
              <h2>
                O DETALHE
                <br />
                FAZ O ESTILO.
              </h2>
            </div>
            <p className="section-intro">
              Do primeiro traço ao acabamento.
              <br />
              Um espaço para encontrar a sua versão.
            </p>
          </div>
          <div className="services-composition">
            <PhotoFrame
              photo={photos.service}
              label="O cuidado de perto"
              index="SR"
              className="service-photo"
            />
            <div className="service-list">
              {serviceReferences.map((service) => (
                <div className="service-row" key={service.number}>
                  <span className="service-number">{service.number}</span>
                  <h3>{service.name}</h3>
                  <p>{service.detail}</p>
                  <span className="service-tag">Referência editorial</span>
                </div>
              ))}
            </div>
          </div>
          <p className="content-note">
            Conteúdo provisório · Serviços, valores e durações precisam ser
            confirmados com o proprietário.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="sobre" className="section about">
      <div className="container about-grid">
        <Reveal className="about-image">
          <PhotoFrame
            photo={photos.space}
            label={`Dentro da ${brand.name}`}
            index="02 / ESPAÇO"
          />
        </Reveal>
        <Reveal className="about-copy">
          <p className="eyebrow">02 / A BARBEARIA</p>
          <h2>
            MAIS QUE
            <br />
            UM CORTE.
            <br />
            <span>
              UM MOMENTO
              <br />
              SEU.
            </span>
          </h2>
          <p>
            A proposta é simples: abrir espaço na rotina para cuidar de você.
            Com personalidade, atenção aos detalhes e um olhar para o que faz
            seu estilo ser seu.
          </p>
          <p className="content-note">
            Texto institucional provisório, sujeito à aprovação.
          </p>
          <div className="about-signature">
            <span>{brand.name}</span>
            <span>
              {brand.address.city} / {brand.address.state}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Professionals() {
  return (
    <section id="profissionais" className="section professionals">
      <div className="container">
        <Reveal className="team-grid">
          <div>
            <p className="eyebrow">03 / QUEM FAZ ACONTECER</p>
            <h2>
              MÃOS PRECISAS.
              <br />
              ESTILOS ÚNICOS.
            </h2>
            <p className="section-intro">
              Por trás de cada corte, um profissional.
              <br />
              Um registro real de quem faz o cuidado acontecer.
            </p>
            <p className="content-note">
              Nomes, especialidades e composição da equipe
              <br />a confirmar com o proprietário.
            </p>
          </div>
          <PhotoFrame
            photo={photos.team}
            label="Profissionais em atendimento"
            index="03 / PESSOAS"
          />
        </Reveal>
      </div>
    </section>
  );
}

export function Gallery() {
  return (
    <section id="trabalhos" className="section gallery">
      <div className="container">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">04 / NOSSO OLHAR</p>
              <h2>
                O ESTILO ESTÁ
                <br />
                NOS DETALHES.
              </h2>
            </div>
            <a
              className="text-link"
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore no Instagram <ArrowUpRight size={18} />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </Reveal>
        <div className="gallery-grid">
          <Reveal className="gallery-main">
            <PhotoFrame
              photo={photos.work1}
              label="Forma & identidade"
              index="I"
            />
          </Reveal>
          <Reveal>
            <PhotoFrame
              photo={photos.work2}
              label="Precisão no acabamento"
              index="II"
            />
          </Reveal>
          <Reveal>
            <PhotoFrame
              photo={photos.work3}
              label="Novas perspectivas"
              index="III"
            />
          </Reveal>
        </div>
        <p className="content-note">
          Registros reais da barbearia. Mais trabalhos no nosso Instagram.
        </p>
      </div>
    </section>
  );
}

export function SocialProof() {
  return (
    <section className="social-proof">
      <div className="container social-grid">
        <p className="eyebrow">
          QUEM SENTA NA CADEIRA
          <br />
          TEM HISTÓRIA PARA CONTAR.
        </p>
        <div>
          <h2>
            A PRÓXIMA HISTÓRIA
            <br />
            PODE SER A SUA.
          </h2>
          <p>
            Este espaço receberá avaliações reais e verificadas.
            <br />
            Enquanto isso, acompanhe a barbearia pelo Instagram.
          </p>
        </div>
        <a
          className="round-link"
          href={brand.instagram}
          aria-label={`Conhecer ${brand.name} no Instagram (nova aba)`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowUpRight size={28} />
        </a>
      </div>
    </section>
  );
}

export function Location() {
  return (
    <section id="localizacao" className="section location">
      <div className="container">
        <Reveal>
          <p className="eyebrow">05 / NOS ENCONTRAMOS AQUI</p>
          <div className="location-grid">
            <div>
              <h2>
                SEU PRÓXIMO
                <br />
                DESTINO.
              </h2>
              <address>
                {brand.address.street}
                <br />
                {brand.address.city} — {brand.address.state}
              </address>
              <a
                className="text-link"
                href={brand.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Traçar rota <ArrowUpRight size={18} />
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
              <div className="hours">
                <h3>Horários de funcionamento</h3>
                <p>Em breve, os horários oficiais por aqui.</p>
                <span className="content-note">
                  Precisamos confirmar com o proprietário.
                </span>
              </div>
              <p className="location-phone">
                Contato informado:{" "}
                <a href={`tel:${brand.phone.e164}`}>{brand.phone.display}</a>
              </p>
              <p className="content-note">{brand.detailsStatus}</p>
            </div>
            <div className="location-panel">
              <MapPin size={30} strokeWidth={1.3} />
              <span className="eyebrow">{brand.address.stateName}</span>
              <span className="location-city">
                {brand.address.city.toUpperCase()}
                <span>.</span>
              </span>
              <div className="location-panel-bottom">
                <span>
                  Um endereço.
                  <br />
                  Muitas possibilidades.
                </span>
                <span>
                  {brand.address.state} / {brand.address.country}
                </span>
              </div>
              <span className="location-panel-lines" aria-hidden="true" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FAQ() {
  return (
    <section className="section faq" id="duvidas">
      <div className="container faq-grid">
        <div>
          <p className="eyebrow">06 / ANTES DE CHEGAR</p>
          <h2>
            SEM
            <br />
            DÚVIDAS.
          </h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question}>
              <summary>
                <span className="faq-number">0{index + 1}</span>
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
    <section className="final-cta">
      <div className="container">
        <Reveal>
          <p className="eyebrow">SEU ESTILO NÃO PRECISA ESPERAR.</p>
          <div className="final-cta-row">
            <h2>
              VAMOS DAR
              <br />O PRÓXIMO <span>CORTE?</span>
            </h2>
            <div>
              <Button variant="light" asChild>
                <Link href={brand.bookingPath}>
                  Agendar horário <ArrowUpRight size={20} />
                </Link>
              </Button>
              <p>Agendamento online em preparação.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
