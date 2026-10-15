"use client";

import { InstagramIcon } from "@/components/brand/instagram-icon";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Menu, X, ArrowUpRight } from "lucide-react";
import { brand } from "@/config/brand";

const items = [
  { label: "Início", href: "/#hero" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Ambiente", href: "/#sobre" },
  { label: "Equipe", href: "/#profissionais" },
  { label: "Trabalhos", href: "/#trabalhos" },
  { label: "Localização", href: "/#localizacao" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("/#hero");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", escape);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/") return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) setActive(`/#${entry.target.id}`);
      }), { rootMargin: "-20% 0px -70% 0px" }
    );
    items.forEach(({ href }) => {
      const element = document.getElementById(href.slice(2));
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`sr-header ${scrolled ? "sr-header--scrolled" : ""}`}>
      <div className="sr-shell sr-header__inner">
        <Link href="/#hero" className="sr-header__logo" aria-label="Sr. Navalha Barbearia — início" onClick={() => setMenuOpen(false)}>
          <Image src={brand.logo.src} alt="Sr. Navalha Barbearia" width={160} height={71} priority className="sr-logo-img" />
        </Link>
        <nav className="sr-header__nav" aria-label="Menu principal">
          {items.map((item) => <Link href={item.href} key={item.href} className={active === item.href ? "is-active" : ""} onClick={() => setActive(item.href)}>{item.label}</Link>)}
        </nav>
        <Link href={brand.bookingPath} className="sr-btn sr-btn--filled sr-header__book">
          AGENDAR HORÁRIO <CalendarDays size={16} strokeWidth={1.8}/>
        </Link>
        <button className="sr-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="sr-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>
      <div className={`sr-mobile-nav ${menuOpen ? "is-open" : ""}`} id="sr-mobile-nav" aria-hidden={!menuOpen}>
        <nav aria-label="Menu para celular">
          {items.map((item) => <Link key={item.href} tabIndex={menuOpen ? 0 : -1} onClick={() => { setMenuOpen(false); setActive(item.href); }} href={item.href}>{item.label}<ArrowUpRight size={19} /></Link>)}
        </nav>
        <Link tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} className="sr-btn sr-btn--filled" href={brand.bookingPath}>AGENDAR HORÁRIO <CalendarDays size={17}/></Link>
        <a tabIndex={menuOpen ? 0 : -1} href={brand.instagram} rel="noopener noreferrer" target="_blank" className="sr-mobile-nav__social"><InstagramIcon size={17}/> {brand.instagramHandle}</a>
      </div>
    </header>
  );
}
