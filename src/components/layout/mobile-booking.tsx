"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";

export function MobileBooking() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0),
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  return visible ? (
    <div className="mobile-booking">
      <Button asChild>
        <Link href={brand.bookingPath}>
          Agendar horário <ArrowUpRight size={18} />
        </Link>
      </Button>
    </div>
  ) : null;
}
