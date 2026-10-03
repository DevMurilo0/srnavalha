import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { brand, navigation } from "@/config/brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Wordmark />
          <p>
            Seu estilo.
            <br />
            Nosso próximo encontro.
          </p>
          <a href={brand.instagram} target="_blank" rel="noopener noreferrer">
            Instagram <ArrowUpRight size={17} />
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
        <nav className="footer-nav" aria-label="Navegação do rodapé">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href={brand.bookingPath}>Agendar horário</Link>
        </nav>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {brand.fullName}
          </span>
          <span>
            {brand.address.city}, {brand.address.state} · Feito para o seu
            tempo.
          </span>
          <a href="#top">Voltar ao topo ↑</a>
        </div>
      </div>
    </footer>
  );
}
