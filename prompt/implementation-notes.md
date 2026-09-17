# Implementation notes

## Architecture

- **Framework:** Next.js App Router (`app/layout.tsx`, `app/page.tsx`), TypeScript, Tailwind CSS, Framer Motion, Lucide.
- **State:** `OrderProvider` in `context/OrderContext.tsx` wraps the homepage in `app/page.tsx`. Cart, fulfillment, customer fields, tips, totals, drawer/modals, and `submitOrder` live here.
- **Payments:** Clover SDK is loaded dynamically in `lib/clover/loadClover.ts` and mounted in `components/clover/CloverPaymentModal.tsx`. If public env keys are missing, the modal uses a **demo token** path that still exercises `POST /api/orders`.
- **Orders API:** `app/api/orders/route.ts` validates payload shape and returns a mock `{ ok, orderId }`. Replace this handler with your real backend (kitchen, POS, Clover charge API, etc.).

## Homepage section map (single page)

1. `EditorialNav` — fixed nav; anchors + order drawer.
2. `Hero` (`#hero`) — full-viewport hero + CTAs.
3. `Prologue` (`#prologue`) — brand thesis + stats.
4. `InteractiveMenu` (`#menu`, `#menu-panel`) — numbered categories + items.
5. `EssenceSection` (`#essence`) — expandable essence cards.
6. `ServicesSection` (`#services`) — numbered services with inline panels.
7. `LocationsSection` (`#locations`, `#hours`) — data from **`GET /api/locations`** (Google Sheet CSV + `lib/locations/local-locations.ts` fallback); maps use `embedUrl`, lat/lng, or address placeholder; `CONTACT` fills tel/mailto when a row omits phone/email.
8. `PopularOrders` (`#popular`) — grid + in-page detail overlay.
9. `StorySection` (`#story`) — family story.
10. `CateringSection` (`#catering`, `#catering-form`) — copy + inquiry form (on-page confirmation; email/phone for firm booking).
11. `GallerySection` (`#gallery`) — masonry-style gallery.
12. `FinalConversion` — closing CTAs.
13. `SiteFooter` (`#contact`) — visit block and hours from **`LocationsCatalogContext`** (same `/api/locations` pipeline as the locations section); hardcoded fallbacks in `lib/locations/footer-visit-fallbacks.ts` when the catalog is empty or the fetch fails; **`CONTACT`** for social URL and tel/mailto fallbacks.

## Order / cart flow

- **Menu source:** Client loads `GET /api/menu` via `MenuCatalogProvider`. Server tries `MENU_CSV_URL` / `NEXT_PUBLIC_MENU_CSV_URL` with `fetch(..., { next: { revalidate: 300 } })`, then falls back to `lib/menu/local-menu.ts`.
- **Add items:** `addItem(id, { quantity, selectedMeat })` — meat picker opens from `MeatChoiceModal` when `meatChoiceRequired` is true.
- **Drawer:** `components/order/OrderDrawer.tsx` — pickup location (restaurant vs truck), Price TBD copy, **Send Order Request** when any line has `unitPriceCents: null`, otherwise **Pay with card (Clover)**.
- **Validation:** `canSendOrderRequest` for requests; `canOpenPayment` when every line has a numeric price (Clover path).
- **Pay / request:** `submitOrder` → `POST /api/orders` with `paymentMode: "clover"` + Clover token. `submitOrderRequest` → `paymentMode: "request"` (no token). Legacy body field `mode: "payment"` is still accepted server-side as `clover`.

## Clover integration points

- **Env:** `NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX`, `NEXT_PUBLIC_CLOVER_MERCHANT_ID_SANDBOX`, `NEXT_PUBLIC_CLOVER_ENV` (see `.env.example`).
- **Code:** `lib/clover/*`, `components/clover/CloverPaymentModal.tsx`.
- **Sandbox vs production:** Swap env vars and `NEXT_PUBLIC_CLOVER_ENV` when moving live; keep the integration isolated behind `loadCloverSdk` / `createCloverClient`.

## Replacing the mock order API

1. Implement your server route (or external service) with the same validation rules or stricter ones.
2. Map `cloverToken` to Clover’s charge/pay endpoints on the server (never expose secret keys to the browser).
3. Replace `fetch("/api/orders")` in `OrderContext` with your endpoint or server action once stable.
