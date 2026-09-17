# PATCHES — files to modify in place

These are existing components I don't safely rewrite blindly (you have logic in them I haven't seen). Each section gives the **exact change** needed.

Use Cursor's "apply diff" or do them manually. Each patch is small.

---

## 1. `components/home/HomeView.tsx`

Add `BrandTicker` at the **very top**, before `EditorialNav`.

```tsx
import BrandTicker from "@/components/marquee/BrandTicker";
import EditorialNav from "@/components/nav/EditorialNav";
// ... rest of your existing imports

export default function HomeView() {
  return (
    <>
      <BrandTicker />        {/* ← NEW: top of the page, above nav */}
      <EditorialNav />
      <FixedBrandBackdrop />
      <Hero />
      <Prologue />
      <StorySection />
      <InteractiveMenu />
      <LocationsSection />
      <SocialPromoSection />
      <CateringSection />
      <FinalConversion />
      <SiteFooter />
      {/* OrderDrawer, CloverPaymentModal etc. — unchanged */}
    </>
  );
}
```

The ticker renders at `z-[60]`, above the watermark (z-0) but **below** the OrderDrawer overlay (z-60+). If you want it to sit under the nav instead of above it, swap the order and lower the ticker's z-index in `BrandTicker.tsx` to `z-10`.

---

## 2. `components/hero/Hero.tsx`

Three changes:

### 2a. Import the new pieces

```tsx
import HeroBadge from "@/components/hero/HeroBadge";
import HeroLeaves from "@/components/hero/HeroLeaves";
import { motion } from "framer-motion";
```

### 2b. Add ken-burns to your slideshow slides

On each slide div, add `animate-kenburns` to its className:

```tsx
<div
  className="absolute inset-0 bg-cover bg-center animate-kenburns"
  style={{ backgroundImage: `url(${slide.src})` }}
/>
```

Make sure the slide containers have `overflow-hidden` on a parent so the scale-up doesn't bleed out.

### 2c. Stagger the hero text + add the leaves and badge

Replace your hero's content block with a motion-driven version:

```tsx
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

// ...inside Hero JSX, AFTER your existing slideshow + veil layers:

<HeroLeaves />

<motion.div
  initial="hidden"
  animate="show"
  variants={heroContainer}
  className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-12 sm:pt-20 pb-20 sm:pb-28 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16 items-end"
>
  <div className="max-w-2xl">
    <motion.div variants={heroItem} className="inline-flex items-center gap-3 mb-7">
      <span className="block h-2 w-2 rounded-full bg-accent-green animate-ring-pulse" />
      <span className="t-kicker">Mexican food truck · Kansas City</span>
    </motion.div>

    <motion.h1 variants={heroItem} className="t-hero mb-6">
      Bold Tex-Mex flavor,<br />
      <em>served fresh</em> across<br />
      Kansas City.
    </motion.h1>

    <motion.p variants={heroItem} className="t-body-lg max-w-lg mb-9">
      Find Angie&apos;s near Linwood and all around KC. Follow today&apos;s pin,
      order from the window, or book the truck for your next event.
    </motion.p>

    <motion.div variants={heroItem} className="flex flex-wrap gap-3">
      {/* Your existing CTA buttons (See the menu / Where's the truck?) */}
    </motion.div>
  </div>

  <motion.div variants={heroItem} className="hidden lg:block justify-self-end self-end">
    <HeroBadge />
  </motion.div>
</motion.div>
```

The OPEN dot on the kicker uses `animate-ring-pulse` — same keyframe as `LocationPublicStatus`. Consistent across the site.

---

## 3. `components/nav/EditorialNav.tsx`

Typography pass only. The MENU pill keeps its `bg-angie-orange` styling.

Find and replace inside the nav links:

```tsx
// OLD:
className="text-[10-11px] uppercase tracking-editorial text-cream/70 hover:text-cream"

// NEW:
className="t-kicker text-cream/70 hover:text-cream transition-colors"
```

For the brand text next to the logo (if you display the wordmark in text), use italic Fraunces:

```tsx
<span
  className="font-display italic font-medium text-base text-cream tracking-tight"
  style={{ fontVariationSettings: '"SOFT" 100' }}
>
  Angie&apos;s
</span>
```

The MENU pill: add a small pulsing dot before the label for "live truck" feel (optional):

```tsx
<Link href="/menu" className="...your existing classes... inline-flex items-center gap-2">
  <span className="block h-1.5 w-1.5 rounded-full bg-cream animate-ring-pulse" />
  Order menu
</Link>
```

---

## 4. `components/menu/InteractiveMenu.tsx`

Three small changes:

### 4a. Use the type roles on the section header

Replace the current `font-display text-4xl` heading + kicker pair with `<SectionHeading>` (already updated to emit the new classes).

### 4b. Mono prices

On each menu item price element:

```tsx
// OLD:
<span className="text-cream/85">{price}</span>

// NEW:
<span className="t-price-mono">{price}</span>
```

### 4c. Hover tilt on item cards

On the item card className, add the hover tilt:

```tsx
className="... transition-all duration-400 ease-out hover:-translate-y-1 hover:-rotate-[0.4deg] hover:border-white/20 hover:bg-charcoal/70"
```

(The `400` duration class doesn't exist by default — use `duration-[400ms]` if your Tailwind doesn't have it extended.)

### 4d. Category accent stripe (optional but recommended)

Add a `::before` pseudo via a wrapper div on each card, scaled-X on hover. Easiest with inline style:

```tsx
<div
  className="menu-card group ..."
  style={{ "--accent": accentHexForCategory } as React.CSSProperties}
>
  <span
    className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
    style={{ background: "var(--accent)" }}
    aria-hidden
  />
  {/* card body */}
</div>
```

Where `accentHexForCategory` comes from your existing `lib/menu/category-styles.ts` map.

---

## 5. `components/locations/LocationsSection.tsx`

Two changes:

### 5a. Use `MapPinRadar` instead of the placeholder

```tsx
import MapPinRadar from "@/components/locations/MapPinRadar";

// In the JSX, replace the existing map placeholder block with:
<MapPinRadar />
```

If you later wire up a real map iframe, render the iframe and overlay `MapPinRadar` on top with `pointer-events-none` — the pin+ring is decorative either way.

### 5b. Mono hours

```tsx
// OLD:
<li>
  <span>Monday & Tuesday</span>
  <span>10:00 AM to 2:00 PM</span>
</li>

// NEW:
<li className="flex justify-between items-baseline py-2">
  <span className="text-cream/78">Mon — Tue</span>
  <span className="t-hours-mono">10:00 AM — 2:00 PM</span>
</li>
```

Use the em-dash form (`Mon — Tue`, `10:00 AM — 2:00 PM`) — reads cleaner with the mono numbers.

### 5c. Truck name uses the type role

```tsx
// OLD:
<h3 className="font-display text-3xl sm:text-4xl text-cream">Angie's Food Truck</h3>

// NEW:
<h3 className="t-section text-3xl sm:text-4xl">Angie&apos;s Food Truck</h3>
```

Override the section size since the truck name should be smaller than the page-section heading.

---

## 6. `components/social/SocialPromoSection.tsx`

Keep the navy gradient card (it's the one approved exception). Add a background `@` flourish:

```tsx
<div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-navy/60 to-charcoal p-10 sm:p-14">
  {/* Atmospheric @ in the corner */}
  <span
    aria-hidden
    className="pointer-events-none absolute -top-8 right-8 font-display italic leading-none select-none"
    style={{
      fontSize: "14rem",
      color: "rgba(246, 162, 26, 0.08)",
      fontVariationSettings: '"SOFT" 100',
    }}
  >
    @
  </span>

  {/* existing kicker + heading + body — switch to type roles */}
  <div className="t-kicker t-kicker-gold mb-4">Follow along</div>
  <h2 className="t-section max-w-[18ch]">
    Follow the truck — <em>same-day</em> updates.
  </h2>
  <p className="t-body-lg max-w-xl mt-6">
    Facebook and Instagram carry the live pin, specials, and catering
    highlights. Tag us when you order — we love resharing KC neighborhoods
    enjoying Angie&apos;s.
  </p>
  {/* existing social pills */}
</div>
```

---

## 7. `components/story/StorySection.tsx`

Type roles + image hover scale.

### 7a. Quote

```tsx
// OLD:
<blockquote className="border-l-2 border-gold/55 text-cream/85 italic">
  ...
</blockquote>

// NEW:
<blockquote className="relative pl-6 border-l-2 border-gold">
  <span className="font-display text-6xl leading-[0.5] text-gold block mb-2">"</span>
  <p className="t-quote">You will experience bold Tex-Mex flavor without leaving Kansas City…</p>
  <div className="t-micro mt-6">— Local business owner · KC Crossroads</div>
</blockquote>
```

### 7b. Image hover scale

On the image wrapper:

```tsx
<div className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10">
  <Image
    src="/gallery/truck1.jpg"
    alt="Angie's Food Truck"
    fill
    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
  <div className="absolute bottom-5 left-5">
    <span className="t-kicker t-kicker-gold inline-block rounded-full border border-white/15 bg-black/40 backdrop-blur px-3 py-1.5">
      Bright truck · fresh masa
    </span>
  </div>
</div>
```

---

## 8. `components/footer/SiteFooter.tsx`

Add the script line in the footer bottom row. APPROVED LOCATION #2 of 2 for the script font.

```tsx
<div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-between gap-4 text-xs text-cream/40">
  <span>© {new Date().getFullYear()} Angie&apos;s Food Truck · Kansas City</span>
  <span
    className="t-script text-base text-gold inline-block"
    style={{ transform: "rotate(-2deg)" }}
  >
    Hecho con cariño
  </span>
</div>
```

For column labels, swap to `t-kicker`:

```tsx
<div className="t-kicker mb-4">Visit</div>
```

---

## 9. `components/ui/glass-cta.ts`

Add the arrow slide transition.

```ts
// glassCtaBase — APPEND to the class string:
"... transition-all duration-300 ease-out hover:-translate-y-0.5 [&_.btn-arrow]:transition-transform hover:[&_.btn-arrow]:translate-x-1"

// glassCtaAccent — same arrow hover, but use angie-orange tones:
"... hover:border-angie-orange/60 hover:bg-angie-orange/25 transition-all duration-300 hover:-translate-y-0.5 [&_.btn-arrow]:transition-transform hover:[&_.btn-arrow]:translate-x-1"
```

Then in any usage that should have the arrow:

```tsx
<Link href="#menu" className={glassCtaAccent}>
  See the menu
  <span className="btn-arrow inline-block">→</span>
</Link>
```

The `[&_.btn-arrow]` Tailwind arbitrary variant targets the inner `.btn-arrow` span. Works in Tailwind 3.x.

---

## 10. Grep cleanup pass

After the above patches land, run these greps to catch any remaining old class strings:

```bash
# Find old heading strings
rg "font-display text-(4|5|6|7)xl" components/

# Find old kicker strings
rg "text-xs uppercase tracking-editorial" components/

# Find prices not yet on mono
rg 'text-cream/85.*\$' components/

# Find any new uses of Playfair (should be zero after layout.tsx swap)
rg -i "playfair" .
```

Replace per the table in `README.md` § "Grep targets."

---

## What's NOT changed by these patches

- Color tokens (`tailwind.config.ts` colors block): untouched
- `:root` CSS variables in `globals.css`: untouched
- Z-order: untouched
- `FixedBrandBackdrop.tsx`: untouched
- Glass-section opacity rule (`bg-charcoal/45 backdrop-blur-sm`): untouched
- Footer glass (`bg-charcoal/70 backdrop-blur-md`): untouched
- Prologue card opacity rule (`bg-charcoal/92`, no blur on the card): untouched
- `OrderDrawer.tsx`, `CloverPaymentModal.tsx`: untouched
- `CateringSection.tsx`: untouched (apply type role classes if you want, but not required for the typography+motion pass)
- Menu category accent color mapping (`lib/menu/category-styles.ts`): untouched
- Hero opaque `bg-charcoal` base: untouched
- `/admin/*` routes: untouched (excluded from the production redesign)
