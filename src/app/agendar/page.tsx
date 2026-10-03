import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Agendamento em breve",
  robots: { index: false, follow: true },
};

export default function BookingPreview() {
  return (
    <main id="conteudo" className="booking-page">
      <div className="container booking-layout">
        <div>
          <Link className="text-link booking-back" href="/">
            <ArrowLeft size={16} /> Voltar para o início
          </Link>
          <p className="eyebrow">UM NOVO JEITO DE MARCAR SEU HORÁRIO</p>
          <h1>
            SEU PRÓXIMO
            <br />
            CORTE ESTÁ
            <br />
            <span>MAIS PERTO.</span>
          </h1>
          <p className="booking-description">
            Estamos preparando uma experiência de agendamento simples, do seu
            jeito.
          </p>
          <p>
            O agendamento online ainda não está disponível. Para consultar o
            canal utilizado atualmente pela barbearia, acesse nosso Instagram.
          </p>
          <Button asChild>
            <a href={brand.instagram} target="_blank" rel="noopener noreferrer">
              Consultar no Instagram <ArrowUpRight size={19} />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </Button>
          <p className="content-note">
            Nenhum horário é reservado nesta página.
          </p>
        </div>
        <aside
          className="booking-preview"
          aria-label="Como será o futuro agendamento"
        >
          <p className="eyebrow">EM BREVE / SUA EXPERIÊNCIA</p>
          <ol>
            <li>
              <span>01</span>
              <div>
                Seu serviço<small>O cuidado que você procura.</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                Seu profissional<small>Escolha com quem se identifica.</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                Seu melhor horário<small>Um espaço na sua rotina.</small>
              </div>
            </li>
          </ol>
          <p>
            Simples de escolher.
            <br />
            Fácil de encaixar.
          </p>
        </aside>
      </div>
    </main>
  );
}
