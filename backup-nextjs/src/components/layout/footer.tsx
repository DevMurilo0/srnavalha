import { InstagramIcon } from "@/components/brand/instagram-icon";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, MessageCircle } from "lucide-react";
import { brand } from "@/config/brand";

const links = [
  ["Início", "/#hero"], ["Serviços", "/#servicos"],
  ["Ambiente", "/#sobre"], ["Equipe", "/#profissionais"],
  ["Trabalhos", "/#trabalhos"], ["Localização", "/#localizacao"],
];

export function Footer() {
  return <footer className="sr-footer">
    <div className="sr-shell sr-footer__main">
      <Link href="/#hero" aria-label="Voltar à página inicial" className="sr-footer__logo">
        <Image src={brand.logo.src} alt="Sr. Navalha Barbearia" width={155} height={69}/>
      </Link>
      <nav aria-label="Navegação do rodapé" className="sr-footer__nav">
        {links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
      </nav>
      <div className="sr-footer__social">
        <a href={brand.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Sr. Navalha"><InstagramIcon size={22}/></a>
        <a href={`https://wa.me/${brand.phone.e164.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Sr. Navalha no WhatsApp"><MessageCircle size={22}/></a>
        <a href="#top" aria-label="Voltar ao topo"><ArrowUp size={20}/></a>
      </div>
    </div>
    <div className="sr-shell sr-footer__bottom">
      <span>© {new Date().getFullYear()} Sr. Navalha Barbearia. Todos os direitos reservados.</span>
      <span>Gravatá · PE</span>
    </div>
  </footer>;
}
