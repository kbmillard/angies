/**
 * Generates PNG/WebP/ICO in public/icons from the same raster logo used in-app
 * (`public/images/brand/prologue-logo.webp`). Falls back to `brand-source.svg` if missing.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");
const svgPath = path.join(__dirname, "brand-source.svg");
const rasterLogoPath = path.join(root, "public", "images", "brand", "prologue-logo.webp");

const sizes = [16, 32, 48, 64, 96, 128, 152, 180, 192, 256, 384, 512, 1024];

/** Square output, transparent letterboxing so circular marks stay crisp in tabs. */
function sourcePipeline(buf) {
  return sharp(buf);
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  let input;
  try {
    await fs.access(rasterLogoPath);
    input = await fs.readFile(rasterLogoPath);
  } catch {
    console.warn("generate-brand-icons: using brand-source.svg (prologue-logo.webp not found)");
    input = await fs.readFile(svgPath);
  }

  const pngBuffers = [];
  for (const s of [16, 32, 48]) {
    pngBuffers.push(
      await sourcePipeline(input)
        .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
    );
  }
  const ico = await toIco(pngBuffers);
  await fs.writeFile(path.join(outDir, "favicon.ico"), ico);

  for (const s of sizes) {
    const buf = await sourcePipeline(input)
      .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await fs.writeFile(
      path.join(outDir, `la-hamburguesa-loca-logo-${s}x${s}.png`),
      buf,
    );
  }

  for (const s of [256, 512, 1024]) {
    const buf = await sourcePipeline(input)
      .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer();
    await fs.writeFile(
      path.join(outDir, `la-hamburguesa-loca-logo-${s}x${s}.webp`),
      buf,
    );
  }

  const manifest = {
    name: "La Hamburguesa Loca",
    short_name: "LHL",
    icons: [
      {
        src: "/icons/la-hamburguesa-loca-logo-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/la-hamburguesa-loca-logo-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#c41e1e",
    background_color: "#1a1a1a",
    display: "standalone",
  };
  await fs.writeFile(
    path.join(outDir, "site.webmanifest"),
    JSON.stringify(manifest, null, 2),
  );

  console.log("Wrote brand icons to public/icons");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
