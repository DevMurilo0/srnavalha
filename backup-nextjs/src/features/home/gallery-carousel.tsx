"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

const images = [
  { src: "/images/hero/corte-e-barba.webp", alt: "Corte com acabamento na barba e volume no cabelo" },
  { src: "/images/work/barba.webp", alt: "Barboterapia e cuidados com a barba" },
  { src: "/images/work/corte-cacheado.webp", alt: "Corte de cabelo cacheado com degradê" },
  { src: "/images/work/corte-perfil.webp", alt: "Corte masculino com topete modelado" },
  { src: "/images/work/barboterapia.webp", alt: "Detalhe do atendimento de barboterapia" },
];

export function GalleryCarousel() {
  const [offset, setOffset] = useState(0);
  const change = (step: number) => setOffset(current => (current + step + images.length) % images.length);
  const ordered = [...images.slice(offset), ...images.slice(0, offset)];
  return <div className="sr-gallery__viewport">
    <div className="sr-gallery__track" aria-live="polite">
      {ordered.slice(0, 4).map((item, i) => (
        <div className="sr-gallery__image" key={`${offset}-${i}`}>
          <Image src={item.src} alt={item.alt} fill sizes="(max-width: 600px) 62vw, (max-width: 1000px) 26vw, 19vw" />
        </div>
      ))}
    </div>
    <div className="sr-gallery__controls">
      <span className="sr-gallery__line" aria-hidden="true" />
      <button onClick={() => change(-1)} aria-label="Ver trabalhos anteriores"><ArrowLeft size={21} /></button>
      <button onClick={() => change(1)} aria-label="Ver próximos trabalhos"><ArrowRight size={21} /></button>
    </div>
  </div>;
}
