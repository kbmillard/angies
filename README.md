# Angie’s Food Truck — one-page site

Next.js App Router site modeled on the **Gringos Cubanos** food-truck codebase: one-page layout, Google Sheets CSV pipelines (menu, locations, schedule), embedded Google Maps with fallbacks, interactive menu + order drawer, schedule and message boards, gallery, and mobile nav/scroll polish.

## Brand assets

- **Logos / icons:** `angies_fresh_food_logo_web_assets/` (copied into `public/icons/` and `public/images/brand/`).
- **Photos:** only `gallery/` → synced to `public/gallery/` for Next.js. See `prompt/angies-assets-used.md` for the exact files referenced.

## Updating content

### Admin — hosted menu photo URLs

- On production: **`https://angieskc.com/admin`** redirects to **`/admin/photos`** (same for any domain pointed at this Vercel project).
- Set **`ADMIN_PHOTOS_PASSWORD`** (required). For production uploads, add **`BLOB_READ_WRITE_TOKEN`** (Vercel Blob) and **`DATABASE_URL`** (Postgres) for durable storage; see `.env.example`.

### Menu

1. Edit the published CSV (Google Sheets → Publish to web → CSV) or use `prompt/google-sheet-menu-template.csv` as a template.
2. Set **`MENU_CSV_URL`** or **`NEXT_PUBLIC_MENU_CSV_URL`** to the CSV URL.
3. Headers must match `lib/menu/google-sheet-menu.ts` (see template): `id`, `active`, `category`, `section`, `sortOrder`, `name`, `englishName`, `description`, `price`, `includesFries`, `meatChoiceRequired`, `featured`, `imageUrl`, `imageAlt`, `availabilityLabel`, `optionGroupsJson`.
4. Use **`/gallery/...`** paths for local images, or Google-hosted URLs allowlisted in `next.config.ts`.

### Current truck location

1. Use `prompt/google-sheet-locations-template.csv` as a row shape reference.
2. Set **`LOCATIONS_CSV_URL`** or **`NEXT_PUBLIC_LOCATIONS_CSV_URL`**.
3. **`messageBoard`** appears as **Today’s truck note** next to the current location card.
4. **`weeklyHoursJson`** drives open/closed; raw `status=Open` from the sheet is **not** trusted alone (see `lib/locations/hours.ts`).
5. **`lat` / `lng`** power the embedded map; if blank, the client geocodes address/place when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set, otherwise a classic Google **iframe** embed is used so the map is never empty.

### Schedule

1. Template: `prompt/google-sheet-schedule-template.csv`.
2. Set **`SCHEDULE_CSV_URL`** or **`NEXT_PUBLIC_SCHEDULE_CSV_URL`**.
3. Empty sheet → polished “schedule coming soon” message with Facebook + Instagram links.

## Maps / env vars

| Variable | Purpose |
| --- | --- |
| **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`** | Maps JavaScript API in the browser (embed + geocoder). Enough for embedded map + pin behavior. Restrict by HTTP referrer in Google Cloud. |
| **`GOOGLE_MAPS_SERVER_KEY`** | Optional server-side geocoding (`lib/locations/google-geocode.ts`) — not required for the default iframe + client geocode path. |
| **`NEXT_PUBLIC_SITE_URL`** | Canonical URL for metadata + JSON-LD (production: `https://angieskc.com`). |

Without a browser key, the location board still shows a **working** classic Google Maps iframe when an address exists (`lib/locations/helpers.ts`, `GoogleMapClientResolved`).

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run validate:sheets   # when tmp CSVs exist
```

## GitHub remote

Target remote: **`https://github.com/kbmillard/angies.git`** — always verify with `git remote -v` before pushing.

## Owner checklist

See `prompt/owner-info-needed.md`.

## Hours TODO

Demo hours in fallback data: **Wed–Sat 10:00 AM – 5:00 PM**, Sun–Tue closed, **`America/Chicago`**. **TODO:** confirm final public hours with the owner (see prompt).
