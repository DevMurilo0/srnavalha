import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { brand } from "@/config/brand";
import { PhotoFrame } from "@/components/brand/photo-frame";
import { Button } from "@/components/ui/button";
import { photos } from "./content";

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-topline">
          <span className="eyebrow">
            <i className="status-dot" /> {brand.address.city} /{" "}
            {brand.address.state}
          </span>
          <span className="eyebrow hero-edition">
            ESTILO PRÓPRIO. PRESENÇA REAL.
          </span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">
              SEU PRÓXIMO
              <br />
              CORTE COMEÇA
              <br />
              <span>AQUI.</span>
            </h1>
            <p>
              Um tempo para você.
              <br />
              Um corte com a sua identidade.
            </p>
            <Button asChild>
              <Link href={brand.bookingPath}>
                Agendar horário <ArrowUpRight size={20} />
              </Link>
            </Button>
            <span className="hero-note">
              Uma nova experiência de agendamento. Em breve.
            </span>
          </div>
          <div className="hero-image">
            <PhotoFrame
              photo={photos.hero}
              priority
              label="Corte & barba. Identidade em cada detalhe."
              index="01 / SR"
            />
            <span className="image-side-note">
              {brand.name} — O SEU PONTO DE ENCONTRO
            </span>
          </div>
        </div>
        <div className="hero-bottom">
          <span>PRECISÃO NO CORTE. PERSONALIDADE NO RESULTADO.</span>
          <a href="#servicos">
            Conheça a barbearia <ArrowDown size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
