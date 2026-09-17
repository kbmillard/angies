# Asset map

## Source folder

`/Users/kyle/Desktop/foodtruck/la_hamburguesa_loca_web_assets` is the **intended** source of truth for final logo exports (`README.md`, `html-head-snippet.html`, `site.webmanifest`). If you add the full PNG/WebP/ICO pack there, copy or overwrite the matching files under `public/icons/` (same filenames as the snippet) and re-run production checks.

## Generated runtime icons (repo default)

Until the full pack is present in the asset folder, `npm run icons` runs `scripts/generate-brand-icons.mjs`, which rasterizes `scripts/brand-source.svg` into:

- `public/icons/favicon.ico`
- `public/icons/la-hamburguesa-loca-logo-{16..1024}x{16..1024}.png` (selected sizes from script)
- `public/icons/la-hamburguesa-loca-logo-{256,512,1024}x{size}.webp`
- `public/icons/site.webmanifest`

## Where assets are wired

| Asset / path | Usage |
| --- | --- |
| `/icons/la-hamburguesa-loca-logo-256x256.webp` | `components/ui/BrandLogo.tsx` (nav, footer, order drawer) |
| `/icons/favicon.ico`, PNG sizes, Apple touch | `app/layout.tsx` `metadata.icons` |
| `/icons/site.webmanifest` | `metadata.manifest` in `app/layout.tsx` |
| `la_hamburguesa_loca_web_assets/html-head-snippet.html` | Reference only — equivalent links implemented in `app/layout.tsx` |

## Metadata / social

- Open Graph and Twitter metadata use `HOME_TITLE` / `HOME_DESCRIPTION` from `lib/seo.ts` in `app/layout.tsx`.
- JSON-LD `Restaurant` schema is embedded in `app/layout.tsx`; `image` is set to `{NEXT_PUBLIC_SITE_URL}/icons/la-hamburguesa-loca-logo-1024x1024.png`.

## Replacing with final brand art

1. Export logos per `la_hamburguesa_loca_web_assets/README.md`.
2. Copy into `public/icons/` preserving filenames expected by `html-head-snippet.html`.
3. Optionally delete or archive `scripts/brand-source.svg` once marketing-approved art is in place.
