# Angie’s site — assets used

Only **Angie’s logo pack** and **repo `gallery/`** images are referenced by the live UI (per product rules).

## Logo / icons (`angies_fresh_food_logo_web_assets/` → `public/icons/` and `public/images/brand/`)

| Asset | Site usage |
| --- | --- |
| `logo-width-640.webp` | `public/images/brand/site-logo.webp` (nav `BrandLogo`) |
| `logo-width-320.webp` | `public/images/brand/prologue-logo.webp` (prologue backdrop) |
| `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png` | `public/icons/` + metadata |
| `apple-touch-icon.png` | Apple touch icon |
| `logo-192x192.png`, `logo-512x512.png`, `logo-180x180.png` | PWA / OG / manifest |

## Gallery — truck (`filename` contains `truck`)

Used in hero slideshow (`lib/data/hero-slides.ts`) and story slideshow (`components/story/StorySection.tsx`):

- `truck.png`, `truck1.jpg`, `truck2.png`, `truck3.jpg`, `truck4.jpg`

## Gallery — food / drinks (`food*` and `drink*`)

Used in food masonry gallery (`components/gallery/GallerySection.tsx`) — all files whose names include `food`:

- `food.png` … `food24.jpg` (full set listed in `GallerySection.tsx`)

Used in menu fallback (`lib/menu/local-menu.ts`) and optional featured tiles:

- Food: e.g. `food7.jpg`, `food8.jpg`, `food10.jpg`, `food11.jpg`, `food12.jpg`, `food3.jpg`, `food15.jpg`, `food16.png`
- Drinks (aguas): `drink.jpg`, `drink1.jpg`, `drink2.png`

## Essence / services (unused components)

`lib/data/essence.ts` uses only `/gallery/*` paths for future `EssenceSection` use.
