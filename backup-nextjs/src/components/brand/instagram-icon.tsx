import type { SVGProps } from "react";

/** Vetor local do ícone do Instagram: não depende dos ícones de marcas do Lucide. */
export function InstagramIcon({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5.6" />
      <circle cx="12" cy="12" r="4.15" />
      <circle cx="17.8" cy="6.4" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}
