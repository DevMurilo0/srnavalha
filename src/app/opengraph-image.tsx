import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
import sharp from "sharp";
import path from "node:path";
import { photos } from "@/features/home/content";

export const alt = `${brand.fullName} — Seu próximo corte começa aqui.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [logo, hero] = await Promise.all([
    sharp(path.join(process.cwd(), "public", brand.logo.src)).png().toBuffer(),
    sharp(path.join(process.cwd(), "public", photos.hero!.src)).png().toBuffer(),
  ]);
  // ImageResponse renderiza imagens incorporadas, não componentes next/image.
  return new ImageResponse(
    <div
      style={{
        background: "#0B0D0E",
        color: "#F2F0EB",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 55,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 25,
        }}
      >
        <img
          src={`data:image/png;base64,${logo.toString("base64")}`}
          alt={brand.logo.alt}
          width={119}
          height={53}
        />
        <span>
          {brand.address.city} / {brand.address.state}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.05,
        }}
      >
        <span>SEU PRÓXIMO</span>
        <span>CORTE COMEÇA</span>
        <span style={{ color: "#B98B68" }}>AQUI.</span>
      </div>
      <span style={{ fontSize: 18 }}>ESTILO PRÓPRIO. PRESENÇA REAL.</span>
      <img
        src={`data:image/png;base64,${hero.toString("base64")}`}
        alt="Corte e barba na SR Navalha"
        width={350}
        height={429}
        style={{ position: "absolute", right: 55, top: 145 }}
      />
    </div>,
    size,
  );
}
