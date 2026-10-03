import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// Recortes determinísticos dos prints reais. Sem geração, retoque ou ampliação.
// Uso: node scripts/prepare-images.mjs "/pasta/com/as/capturas"
const sourceDirectory = process.argv[2];
if (!sourceDirectory)
  throw new Error("Informe a pasta das capturas originais.");
const assets = [
  ["140525", "brand/logo.webp", { left: 217, top: 64, width: 119, height: 53 }],
  [
    "140539",
    "hero/corte-e-barba.webp",
    { left: 535, top: 26, width: 266, height: 326 },
  ],
  ["140539", "work/barba.webp", { left: 0, top: 26, width: 265, height: 326 }],
  [
    "140539",
    "work/corte-perfil.webp",
    { left: 268, top: 26, width: 265, height: 326 },
  ],
  [
    "140551",
    "barbershop/ambiente.webp",
    { left: 552, top: 100, width: 246, height: 148 },
  ],
  [
    "140610",
    "work/corte-cacheado.webp",
    { left: 269, top: 28, width: 265, height: 322 },
  ],
  [
    "140610",
    "team/atendimento.webp",
    { left: 538, top: 29, width: 264, height: 321 },
  ],
  [
    "140624",
    "work/barboterapia.webp",
    { left: 270, top: 29, width: 263, height: 325 },
  ],
];
for (const [capture, target, crop] of assets) {
  const output = path.join("public/images", target);
  await mkdir(path.dirname(output), { recursive: true });
  await sharp(
    path.join(sourceDirectory, `Captura_de_tela_20261003_${capture}.png`),
  )
    .extract(crop)
    .webp({ quality: 90 })
    .toFile(output);
  console.log(output);
}
