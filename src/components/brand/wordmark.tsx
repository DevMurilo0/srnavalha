import Link from "next/link";
import Image from "next/image";
import { brand } from "@/config/brand";

export function Wordmark() {
  return (
    <Link
      className="wordmark"
      href="/"
      aria-label={`${brand.fullName} — início`}
    >
      <Image
        src={brand.logo.src}
        alt={brand.logo.alt}
        width={brand.logo.width}
        height={brand.logo.height}
        sizes="119px"
        className="brand-logo"
      />
    </Link>
  );
}
