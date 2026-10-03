"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { brand, navigation } from "@/config/brand";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Wordmark />
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="small" className="header-book">
          <Link href={brand.bookingPath}>
            Agendar horário <ArrowUpRight size={16} />
          </Link>
        </Button>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="menu-trigger" aria-label="Abrir menu">
            <Menu size={24} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="menu-overlay" />
            <Dialog.Content
              className="mobile-menu"
              aria-describedby={undefined}
            >
              <div className="menu-heading">
                <Dialog.Title>Explore</Dialog.Title>
                <Dialog.Close aria-label="Fechar menu" className="icon-button">
                  <X />
                </Dialog.Close>
              </div>
              <nav aria-label="Navegação mobile">
                {navigation.map((item, index) => (
                  <Link
                    onClick={() => setOpen(false)}
                    key={item.href}
                    href={item.href}
                  >
                    <span>0{index + 1}</span>
                    {item.label}
                    <ArrowUpRight size={22} />
                  </Link>
                ))}
              </nav>
              <Button asChild>
                <Link onClick={() => setOpen(false)} href={brand.bookingPath}>
                  Agendar horário <ArrowUpRight size={18} />
                </Link>
              </Button>
              <p className="eyebrow">
                {brand.address.city} · {brand.address.state}
              </p>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
