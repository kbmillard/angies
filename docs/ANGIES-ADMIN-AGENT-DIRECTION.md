# Angie’s admin simplification — agent direction

**Source:** `angies_admin_agent_direction.txt` (owner direction, May 2026)  
**Companion docs:** [ADMIN-PORTAL.md](./ADMIN-PORTAL.md) (current state) · [UNIFIED-ADMIN-PLAN.md](./UNIFIED-ADMIN-PLAN.md) (implementation plan)

---

## Core message (read this first)

> All you have to do is **clone the public page into admin**, make the content editable, and **API it back to the homepage data sources**.
>
> The homepage already exists. The database already exists. Most admin APIs already exist. The work is to **align the admin UI with the homepage** and fill the few API gaps — especially **relational menu editing** and **site_settings for social/catering**.

**Do not** build a separate CMS. **Do not** keep tabs as the main UX. **Do not** require JSON or manual image paths for everyday edits.

---

## Main realization

The admin does not need to become a complicated new product.

```
Public homepage section  →  Admin editable section  →  Save API  →  Database / Blob  →  Homepage reads updated content
```

---

## Verified repo state

| Finding | Path |
|---------|------|
| Admin renders tabbed shell | [`app/admin/page.tsx`](../app/admin/page.tsx) → `PhotosAdminClient` + `?tab=` |
| Public one-pager | [`components/home/HomeView.tsx`](../components/home/HomeView.tsx) |
| Homepage settings editor | [`SiteSettingsTab.tsx`](../components/admin/SiteSettingsTab.tsx) |
| Menu form blocked in prod | [`app/api/admin/menu/[id]/route.ts`](../app/api/admin/menu/[id]/route.ts) → 409 when relational |
| Site settings API | [`app/api/admin/site-settings/route.ts`](../app/api/admin/site-settings/route.ts) |
| Photo upload API | [`app/api/admin/photos/route.ts`](../app/api/admin/photos/route.ts) |
| Hardcoded public copy | [`CateringSection.tsx`](../components/catering/CateringSection.tsx), [`SocialPromoSection.tsx`](../components/social/SocialPromoSection.tsx) |

**Public `HomeView` section order (source of truth):**

1. Hero  
2. Prologue  
3. Story  
4. Menu (`InteractiveMenu`)  
5. Locations (includes schedule block)  
6. Social  
7. Catering  
8. FinalConversion (footer CTA — optional admin v2)  
9. SiteFooter  

**Admin scroll order (match closely; modifiers + schedule as edit surfaces):**

1. `#hero` — Hero editor  
2. `#prologue` — Prologue editor  
3. `#story` — Story editor  
4. `#menu` — Menu editor  
5. `#modifiers` — Meats / sides / toppings + per-item meat overrides  
6. `#locations` — Locations editor  
7. `#schedule` — Schedule editor  
8. `#social` — Social editor  
9. `#catering` — Catering editor  
10. `#photos` — Photos library + advanced tools  

---

## What to build

### 1. Replace tab shell → `SiteAdminClient`

- New: [`components/admin/SiteAdminClient.tsx`](../components/admin/SiteAdminClient.tsx)  
- [`app/admin/page.tsx`](../app/admin/page.tsx) renders `SiteAdminClient` instead of `PhotosAdminClient`  
- Login gate, env/status banner, sticky anchor nav, one scrollable page  

**Legacy redirects:**

| Old URL | New |
|---------|-----|
| `/admin?tab=site` | `/admin#hero` |
| `/admin?tab=menu` | `/admin#menu` |
| `/admin?tab=locations` | `/admin#locations` |
| `/admin?tab=schedule` | `/admin#schedule` |
| `/admin?tab=photos` | `/admin#photos` |

### 2. `ImageAttachField` everywhere

New: [`components/admin/ImageAttachField.tsx`](../components/admin/ImageAttachField.tsx)

- Thumbnail, upload via `POST /api/admin/photos`, pick via `GET /api/admin/photos`, `onChange(url)`  
- Use on: hero slides, story slides, menu item photos  

```ts
type ImageAttachFieldProps = {
  label?: string;
  value: string;
  alt?: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
};
```

### 3. Extend `site_settings` (Social + Catering)

Add to [`lib/site-settings/types.ts`](../lib/site-settings/types.ts):

```ts
catering: {
  kicker: string;
  title: string;
  subtitle: string;
  body?: string;
};

social: {
  kicker: string;
  title: string;
  subtitle: string;
  body?: string;
  instagramHandle?: string;
  facebookHandle?: string;
};
```

Update: `coalesce.ts`, defaults, `CateringSection`, `SocialPromoSection` → `useSiteSettings()` with hardcoded fallback.

### 4. Relational menu PATCH (required)

**Do not** use JSON import for normal edits.

New routes:

- `PATCH /api/admin/catalog-menu/items/[slug]`  
- `PATCH /api/admin/catalog-menu/modifiers/[id]`  
- `PUT /api/admin/catalog-menu/items/[slug]/meat-prices`  

DB helpers in [`menu-relational-db.ts`](../lib/catalog-db/menu-relational-db.ts):

- `dbUpdateCatalogMenuItem(slug, patch)`  
- `dbUpdateCatalogModifier(id, patch)`  
- `dbUpsertItemMeatPrice(...)`  
- `dbDeleteItemMeatPrice(...)`  

**Menu item fields:** name, description, basePrice, imageUrl, imageAlt, requiresMeatSelection, active, featured, sortOrder  

**Modifier fields:** name, amount, active, sortOrder  

### 5. Reuse existing forms (do not rebuild from scratch)

| Lift from | Into |
|-----------|------|
| `SiteSettingsTab` | `HeroSectionEditor`, `PrologueSectionEditor`, `StorySectionEditor` |
| `MenuCatalogTab` | `MenuSectionEditor` (no JSON textarea as main flow) |
| `LocationsCatalogTab` | `#locations` section |
| `ScheduleCatalogTab` | `#schedule` section |
| `PhotosAdminClient` upload | `ImageAttachField` + `PhotosLibrarySection` |

### 6. JSON import → Advanced only

Under `#menu`:

- Menu editor  
- Modifiers editor  
- **Advanced: Import menu JSON** (collapsed)  

### 7. Save targets (same as public reads)

| Content | Admin save | Public read |
|---------|------------|---------------|
| Hero, Prologue, Story, Social, Catering | `PUT /api/admin/site-settings` | `GET /api/site-settings` |
| Menu items / modifiers | New `catalog-menu/*` PATCH/PUT | `GET /api/menu` |
| Locations | `/api/admin/locations` | `GET /api/locations` |
| Schedule | `/api/admin/schedule` | `GET /api/schedule` |
| Photos | `/api/admin/photos` | Blob URLs in settings/menu |

After saves: `revalidatePublicCatalog()` / `revalidatePath("/", "layout")`.

---

## What NOT to do

- Keep tabs as the main admin UX  
- Build a separate CMS  
- Require JSON for everyday menu updates  
- Require pasted image URLs  
- Live WYSIWYG iframe in v1  
- Delete all existing admin code (reuse forms + APIs)  
- Store admin-only data separate from what the homepage reads  

---

## MVP checklist (15 steps)

1. [ ] Add `SiteAdminClient`  
2. [ ] Point `app/admin/page.tsx` to `SiteAdminClient`  
3. [ ] Render sections in `HomeView` order (see above)  
4. [ ] Add sticky anchor nav  
5. [ ] Add `ImageAttachField`  
6. [ ] Refactor homepage settings into section editors  
7. [ ] Extend `site_settings` with social + catering  
8. [ ] Wire `SocialPromoSection` + `CateringSection` to `site_settings`  
9. [ ] Add relational menu PATCH APIs  
10. [ ] Add `MenuSectionEditor` (normal fields)  
11. [ ] Add `ModifiersSectionEditor`  
12. [ ] Move JSON import to Advanced  
13. [ ] Embed Locations + Schedule editors  
14. [ ] Keep Photos library at bottom  
15. [ ] Verify public APIs update after admin saves  

---

## Note on AI Gateway

The attached Vercel AI Gateway skill is **not used** for this admin work. This project has no LLM features in the admin portal; implementation is standard Next.js forms + Postgres + Blob.
