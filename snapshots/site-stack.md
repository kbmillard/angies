# Angie’s site — stack & visible page map

Reference for what the **live homepage** is built from. Not marketing copy.

## Languages & stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Language | TypeScript (`.tsx` / `.ts`) |
| Styling | Tailwind CSS 3 + `app/globals.css` |
| Animation | Framer Motion |
| Icons | Lucide React |
| Fonts | DM Sans (body), Playfair Display (headings) |
| Hosting | Vercel |
| Database (when configured) | Postgres (`postgres` package) |
| Admin uploads | Vercel Blob |
| Maps | Google Maps JavaScript API |

The public site is **not** plain HTML. `snapshots/homepage-static.html` is an optional offline snapshot only.

## Homepage entry

```
app/page.tsx
  → providers (site settings, menu, locations, schedule, order)
  → components/home/HomeView.tsx
```

## Visible sections (top → bottom)

| # | On screen | Component |
|---|-----------|-----------|
| 1 | Nav + orange Menu | `components/nav/EditorialNav.tsx` |
| 2 | Fixed watermark logo | `components/prologue/FixedBrandBackdrop.tsx` |
| 3 | Hero slideshow + CTAs | `components/hero/Hero.tsx` |
| 4 | Welcome card | `components/prologue/Prologue.tsx` |
| 5 | Story + quotes | `components/story/StorySection.tsx` |
| 6 | Menu (categories, items, Add/Checkout) | `components/menu/InteractiveMenu.tsx` |
| 7 | Location, map, schedule embed | `components/locations/LocationsSection.tsx` |
| 8 | Social links | `components/social/SocialPromoSection.tsx` |
| 9 | Catering form | `components/catering/CateringSection.tsx` |
| 10 | READY TO EAT? CTAs | `components/cta/FinalConversion.tsx` |
| 11 | Footer Visit + Hours | `components/footer/SiteFooter.tsx` |

**Overlays (not in scroll order)**

| UI | Component |
|----|-----------|
| Cart / checkout drawer | `components/order/OrderDrawer.tsx` |
| Clover payment modal | `components/clover/CloverPaymentModal.tsx` |

**Global shell:** `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`

## Where content comes from

| Content | Source |
|---------|--------|
| Hero, prologue, story, catering, social copy | `lib/site-settings/defaults.ts` + admin DB via `lib/site-settings/load.ts` |
| Menu items & prices | `public/menu/menu.json` → `app/api/menu/route.ts` |
| Footer hours | `lib/data/locations.ts` (`PUBLIC_HOURS_LINES`) |
| Truck hours logic | `lib/locations/angies-truck-hours.ts` |
| Location / map / open-closed | `app/api/locations/route.ts` (Postgres, Google Sheet CSV, or `lib/locations/local-locations.ts`) |
| Schedule | `app/api/schedule/route.ts` |
| Contact / social URLs | `lib/data/locations.ts`, `lib/data/social.ts` |
| Menu category labels & kickers | `lib/menu/category-meta.ts` |

## Admin (not on public homepage)

- `app/admin/page.tsx` — unified admin portal
- `app/api/admin/*` — catalog, photos, site settings, import

## URL for this doc

After deploy: **https://angieskc.com/site-stack** (noindex reference page)
