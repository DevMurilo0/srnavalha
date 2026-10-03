import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { photos } from "./content";

export function Hero() {
  const mainPhoto = photos.team;
  const detailPhoto = photos.hero;

  if (!mainPhoto || !detailPhoto) return null;

  return (
    <section className="hero-v2" id="hero" aria-labelledby="hero-title">
      <div className="container hero-v2-grid">
        <div className="hero-v2-copy">
          <p className="eyebrow hero-v2-kicker">
            Barbearia em {brand.address.city} · {brand.address.state}
          </p>

          <h1 id="hero-title">
            SEU CORTE.
            <br />
            <span>NO SEU TEMPO.</span>
          </h1>

          <p className="hero-v2-description">
            Cortes, barba e cuidado em um espaço feito para atender bem.
            Escolha seu horário e venha para a cadeira.
          </p>

          <div className="hero-v2-actions">
            <Button asChild>
              <Link href={brand.bookingPath}>
                Agendar horário <ArrowUpRight size={19} />
              </Link>
            </Button>
            <a className="hero-v2-link" href="#trabalhos">
              Ver trabalhos <ArrowDown size={17} />
            </a>
          </div>

          <div className="hero-v2-proof" aria-label="Avaliação no Google">
            <span className="hero-v2-rating">
              <Star size={16} fill="currentColor" aria-hidden="true" />
              {brand.rating.value.toFixed(1)}
            </span>
            <span>
              {brand.rating.count} avaliações no {brand.rating.source}
            </span>
          </div>
        </div>

        <div className="hero-v2-visual">
          <div className="hero-v2-main-photo">
            <Image
              src={mainPhoto.src}
              alt={mainPhoto.alt}
              fill
              priority
              sizes="(max-width: 767px) calc(100vw - 40px), 440px"
              className="object-cover"
              style={{ objectPosition: "70% center" }}
            />
          </div>

          <div className="hero-v2-detail-photo">
            <Image
              src={detailPhoto.src}
              alt={detailPhoto.alt}
              fill
              sizes="(max-width: 767px) 44vw, 230px"
              className="object-cover"
            />
          </div>

          <div className="hero-v2-mark" aria-hidden="true">
            <span>SR</span>
            <small>NAVALHA</small>
          </div>

          <div className="hero-v2-location">
            <span>{brand.address.district}</span>
            <span>{brand.address.city}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
