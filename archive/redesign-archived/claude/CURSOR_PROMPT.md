# Angie's Food Truck — Full Redesign Implementation Prompt
**Paste this entire document into Cursor as a single prompt.**

---

## Project Context

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19
- **Language:** TypeScript (`.tsx` / `.ts`)
- **Styling:** Tailwind CSS 3 + `app/redesign/redesign-globals.css`
- **Motion:** Framer Motion (hero entrance + nav overlay only) + CSS keyframes (all continuous motion)
- **Target route:** `/redesign` → `app/redesign/page.tsx` → `components/redesign/RedesignHomePage.tsx` → `components/redesign/RedesignHomeView.tsx`
- **Project root:** `/Users/kyle/Desktop/foodtruck/angies/`
- **Reference implementations:** `/Users/kyle/Desktop/foodtruck/angies/claude/instructions/` (read these files — they are the design source of truth)

Your job is to implement (or verify and patch) every element listed below across the `/redesign` route. Compare each file against the reference implementation in `claude/instructions/` and apply any missing pieces. Do not touch files outside `components/redesign/`, `components/order/OrderDrawer.tsx`, `components/ui/`, `app/redesign/`, `tailwind.config.ts`, or `lib/`.

---

## 1. Foundation — Do These First

### 1a. Font loading — `app/redesign/layout.tsx`
Four fonts, strict roles:
- **Fraunces** — `axes: ["opsz", "SOFT"]` — every headline and section title
- **DM Sans** — body, UI labels, kickers, button text, nav links
- **Caveat** — weight 500 + 600 — **used in exactly 2 places only**: the `Prologue.tsx` "¡Bienvenidos!" greeting and the `SiteFooter.tsx` "Hecho con cariño" line
- **JetBrains Mono** — weight 400 + 500 — prices, hours, tabular figures

All four set as CSS variables: `--font-display`, `--font-sans`, `--font-script`, `--font-mono`.

Reference: `claude/instructions/layout.tsx`

### 1b. CSS additions — `app/redesign/redesign-globals.css`
Append the full contents of `claude/instructions/globals-additions.css`. Key blocks:

**Type roles** (must all be present):
```css
.t-kicker       { font-sans 11px, uppercase, tracking-editorial, text-cream/60 }
.t-kicker-gold  { text-gold }
.t-kicker-orange { text-angie-orange }
.t-hero         { font-display, 5xl–7xl, SOFT 50, opsz 144, line-height 0.98 }
.t-hero em      { italic, SOFT 100, text-angie-orange }
.t-section      { font-display, 4xl–5xl, SOFT 50, opsz 96, line-height 1.02 }
.t-section em   { italic, SOFT 100, text-gold }
.t-quote        { font-display, italic, 2xl–4xl, SOFT 100, line-height 1.25 }
.t-script       { font-script, text-angie-orange, weight 500 }
.t-body         { font-sans, 1rem, text-cream/80, line-height 1.6 }
.t-body-lg      { font-sans, 1.125rem, text-cream/80, line-height 1.55 }
.t-micro        { font-mono, 11px, text-cream/55, letter-spacing 0.05em }
.t-price-mono   { font-mono, 15px, text-cream, weight 500 }
.t-hours-mono   { font-mono, 13px, text-cream/60 }
```

**Keyframe animations** (all must be registered here AND in tailwind.config.ts):
`marquee`, `kenburns`, `spin28`, `bob`, `ringPulse`, `radarPing`, `shadowPulse`, `drift`, `rise`

**Critical: drift keyframe** must use translate3d only — no `bottom` property — with `--leaf-opacity` custom property:
```css
@keyframes drift {
  0%   { transform: translate3d(0, 100%, 0) rotate(0deg); opacity: 0; }
  8%   { opacity: var(--leaf-opacity, 0.2); }
  50%  { transform: translate3d(30px, -50vh, 0) rotate(180deg); opacity: var(--leaf-opacity, 0.2); }
  92%  { opacity: var(--leaf-opacity, 0.2); }
  100% { transform: translate3d(-30px, calc(-100vh - 100%), 0) rotate(360deg); opacity: 0; }
}
```

**Reveal utilities:**
```css
.reveal-init { opacity: 0; transform: translateY(28px); transition: opacity 0.9s, transform 0.9s cubic-bezier(0.16,1,0.3,1); }
.reveal-in   { opacity: 1; transform: translateY(0); }
[data-stagger].reveal-in > *:nth-child(N) { transition-delay: N*0.08s; } /* up to 8 children */
```

**Typography spacing (prevent bunching):**
```css
.t-body + .t-body, .t-body-lg + .t-body, p + p { margin-top: 1.25em; }
.prose-stack > * + *                            { margin-top: 1.25rem; }
.t-section + .t-body, h2 + p, h3 + p           { margin-top: 0.75rem; }
```

**Reduced-motion guard** (must be at bottom of file):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

**Scroll margin** for anchor links:
```css
section[id], [id^="section-"] { scroll-margin-top: calc(var(--nav-h) + var(--ticker-h) + 1rem); }
```

### 1c. Tailwind config — `tailwind.config.ts`
Merge the contents of `claude/instructions/tailwind.config-additions.ts`. Key additions:

```ts
fontFamily: {
  display: ["var(--font-display)", "Georgia", "serif"],
  sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
  script:  ["var(--font-script)", "Brush Script MT", "cursive"],
  mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
},
letterSpacing: { editorial: "0.35em" },
keyframes: {
  marquee:   { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
  kenburns:  { from: { transform: "scale(1.06) translate(0,0)" }, to: { transform: "scale(1.15) translate(-1.5%,1%)" } },
  spin28:    { to: { transform: "rotate(360deg)" } },
  bob:       { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
  ringPulse: { "0%": { boxShadow: "0 0 0 0 rgba(69,184,46,0.55)" }, "70%": { boxShadow: "0 0 0 14px rgba(69,184,46,0)" }, "100%": { boxShadow: "0 0 0 0 rgba(69,184,46,0)" } },
  radarPing: { "0%": { width: "0px", height: "0px", opacity: "0.6" }, "100%": { width: "220px", height: "220px", opacity: "0" } },
  rise:      { from: { opacity: "0", transform: "translateY(28px)" }, to: { opacity: "1", transform: "translateY(0)" } },
  drift: {
    "0%":   { transform: "translate3d(0, 100%, 0) rotate(0deg)", opacity: "0" },
    "8%":   { opacity: "var(--leaf-opacity, 0.2)" },
    "50%":  { transform: "translate3d(30px, -50vh, 0) rotate(180deg)", opacity: "var(--leaf-opacity, 0.2)" },
    "92%":  { opacity: "var(--leaf-opacity, 0.2)" },
    "100%": { transform: "translate3d(-30px, calc(-100vh - 100%), 0) rotate(360deg)", opacity: "0" },
  },
},
animation: {
  marquee:    "marquee 38s linear infinite",
  kenburns:   "kenburns 24s ease-in-out infinite alternate",
  spin28:     "spin28 28s linear infinite",
  bob:        "bob 6s ease-in-out infinite",
  "ring-pulse": "ringPulse 2s ease-out infinite",
  "radar-ping": "radarPing 3s ease-out infinite",
  drift:      "drift 20s linear infinite",
  rise:       "rise 0.9s cubic-bezier(0.16,1,0.3,1) both",
},
```

---

## 2. Z-Stack Architecture

The page uses a fixed z-layer contract. **Do not change z-index values.**

| z-index | Layer | Component | Position |
|---------|-------|-----------|----------|
| 0 | Watermark | `FixedBrandBackdrop` | `position: fixed` |
| 10 | Page content | All sections inside `<main>` | static (scrolls) |
| 50 | Navigation | `EditorialNav` | `position: sticky` |
| 60 | Ticker | `BrandTicker` | `position: sticky`, above nav |
| 100+ | Overlays | `OrderDrawer`, `CloverPaymentModal` | `position: fixed` |

**Glass contract:**
- Standard section: `bg-charcoal/45 backdrop-blur-sm` → watermark visible through
- Opaque section (hero): `bg-charcoal` → no blur, watermark hidden
- Footer: `bg-charcoal/70 backdrop-blur-md` → watermark mostly hidden
- Form cards: `bg-charcoal/85 backdrop-blur-md` → fully opaque, form reads clean

Reference: `claude/instructions/PageShell.tsx`, `claude/instructions/SCROLL-AND-MOTION.md`

---

## 3. Components — Implement in This Order

### 3a. `components/redesign/prologue/FixedBrandBackdrop.tsx`
Fixed z-0 watermark. `position: fixed`, `pointer-events-none`, `z-0`, opacity ~6%, single instance per page. Reference: `claude/instructions/FixedBrandBackdrop.tsx`

### 3b. `components/redesign/marquee/BrandTicker.tsx`
Orange top bar. Sticky at top, `z-[60]`, height `--ticker-h` (2.5rem). Scrolls "Fresh tacos · Birria · Burritos · Aguas frescas · Daily specials · Kansas City local ·" continuously at 38s linear. Duplicate the text string so the loop is seamless. Respects `prefers-reduced-motion` (pauses on `reduce`). Reference: `claude/instructions/BrandTicker.tsx`

### 3c. `components/redesign/nav/EditorialNav.tsx`
**Balanced three-column layout** — logo must be mathematically centered:
```
[flex-1 justify-start]  [logo mx-6]  [flex-1 justify-end]
  Story · Menu · Location             Catering · Contact · [MENU pill]
```

- Nav links: `t-kicker` class, `text-cream/70 hover:text-cream transition-colors`
- Logo: `next/image` with `priority`, links to `#hero`
- **MENU pill**: `bg-angie-orange text-cream`, `inline-flex items-center gap-2`, pulsing dot before label:
  ```tsx
  <span className="block h-1.5 w-1.5 rounded-full bg-cream animate-ring-pulse" />
  Order menu
  ```
- Mobile (< 768px): hamburger button stays; links slide in from side via Framer Motion; MENU pill always visible, never hidden
- Sticky `top-0`, `z-[50]`, `height: var(--nav-h)` (4.5rem)
- Escape key closes mobile menu; body scroll locked while open

Reference: `claude/instructions/EditorialNav.tsx`

### 3d. `components/redesign/home/PageShell.tsx`
Root layout wiring. Renders in this order:
1. `<FixedBrandBackdrop />` (z-0, fixed)
2. `<BrandTicker />` (z-60, sticky)
3. `<EditorialNav />` (z-50, sticky)
4. `<main className="relative z-10">` — all page sections as children

Reference: `claude/instructions/PageShell.tsx`

### 3e. `components/redesign/hero/Hero.tsx`
Hero section. `relative z-10`, min-height `calc(100svh - var(--nav-h))`, `bg-charcoal`, `overflow-hidden`.

**Slideshow (ken-burns):**
- Crossfade slides every 5500ms via Framer Motion `animate={{ opacity }}`
- Active slide: `className="animate-kenburns"` (slow zoom/drift, 24s)
- Slide container needs `overflow-hidden` parent so scale doesn't bleed
- Opacity at 0.55 (dark veil overlay sits on top)

**Veil overlay** (after slides, z-[1]):
```
radial-gradient(80% 60% at 20% 30%, rgba(247,84,45,0.18), transparent 60%),
radial-gradient(60% 50% at 85% 80%, rgba(246,162,26,0.15), transparent 60%),
linear-gradient(180deg, rgba(16,17,20,0.55) 0%, rgba(16,17,20,0.85) 60%, rgba(16,17,20,0.95) 100%)
```

**HeroLeaves** — render AFTER the slides/veil, BEFORE the motion content. See § 3f.

**Staggered text entrance** (Framer Motion, staggerChildren 0.15s, delayChildren 0.1s):
Each child: `hidden: { opacity:0, y:28 }` → `show: { opacity:1, y:0, duration:0.9, ease:[0.16,1,0.3,1] }`

Content layout — two-column on lg: text left, `HeroBadge` right:
```tsx
<motion.div /* stagger container */ className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-12 sm:pt-20 pb-20 sm:pb-28 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16 items-end">
  <div className="max-w-2xl">
    {/* 1. Kicker with OPEN ring */}
    <motion.div variants={heroItem} className="inline-flex items-center gap-3 mb-7">
      <span className="block h-2 w-2 rounded-full bg-accent-green animate-ring-pulse" />
      <span className="t-kicker">Mexican food truck · Kansas City</span>
    </motion.div>

    {/* 2. Hero headline */}
    <motion.h1 variants={heroItem} className="t-hero mb-6">
      Bold Tex-Mex flavor,<br />
      <em>served fresh</em> across<br />
      Kansas City.
    </motion.h1>

    {/* 3. Body copy */}
    <motion.p variants={heroItem} className="t-body-lg max-w-lg mb-9">
      Find Angie's near Linwood and all around KC. Follow today's pin,
      order from the window, or book the truck for your next event.
    </motion.p>

    {/* 4. CTAs — SEE BUG C BELOW */}
    <motion.div variants={heroItem} className="flex flex-wrap gap-3">
      {/* Primary — MUST be bg-angie-orange */}
      <button onClick={() => scrollToSection("menu")}
        className="group inline-flex items-center gap-2 rounded-full bg-angie-orange text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-lg shadow-angie-orange/40 transition-all duration-300 hover:bg-angie-orange/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-angie-orange/55">
        See the menu
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
      {/* Secondary — ghost glass */}
      <button onClick={() => scrollToSection("locations")}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition hover:border-white/35 hover:bg-white/10">
        Where's the truck?
      </button>
    </motion.div>
  </div>

  {/* Badge — desktop only */}
  <motion.div variants={heroItem} className="hidden lg:block justify-self-end self-end">
    <HeroBadge />
  </motion.div>
</motion.div>
```

**⚠️ Bug C:** If the primary button currently uses `bg-salsa`, `bg-angie-orange/70`, or any opacity modifier — fix it to `bg-angie-orange` (no modifier). It must also have `shadow-lg shadow-angie-orange/40` so it reads as primary above the ghost button.

### 3f. `components/redesign/hero/HeroLeaves.tsx`
5 drifting cilantro leaves. **⚠️ Bug A fix already applied** — verify:
- No inline `transform: scale()` (size via `width`/`height` only)
- `--leaf-opacity` CSS custom property set per leaf via `style`
- `animationDuration` and `animationDelay` on the `<span>` wrapper
- `animate-drift` class on the span
- `will-change: "transform, opacity"` on each span

```tsx
const LEAVES = [
  { leftPct: 10, duration: 22, delay:   0, size: 22, opacity: 0.22, blur: 0   },
  { leftPct: 28, duration: 28, delay:  -7, size: 14, opacity: 0.16, blur: 1.5 },
  { leftPct: 46, duration: 19, delay: -13, size: 26, opacity: 0.24, blur: 0   },
  { leftPct: 66, duration: 25, delay:  -3, size: 16, opacity: 0.18, blur: 1   },
  { leftPct: 85, duration: 21, delay: -16, size: 20, opacity: 0.20, blur: 0   },
];
```

Container: `pointer-events-none absolute inset-0 z-[2] overflow-hidden`  
Each leaf span: `absolute bottom-0 animate-drift`

Reference: `claude/instructions/HeroLeaves.tsx`

### 3g. `components/redesign/hero/HeroBadge.tsx`
Spinning circular badge with logo center. **⚠️ Bug B fix already applied** — verify all three layers:

1. **Warm radial halo** (behind logo, inside `inset-[15%]`):
   ```
   background: radial-gradient(circle, rgba(246,162,26,0.10), rgba(247,84,45,0.05), transparent)
   ```

2. **Dashed gold ring** (SVG, `r=74`, `stroke: rgba(246,162,26,0.22)`, `strokeDasharray="2 5"`)

3. **Logo** — `inset-[20%]`, `animate-bob` (6s float), `filter: drop-shadow(0 6px 14px rgba(0,0,0,0.45))` — dark shadow only, **no orange shadow**

Spinning text SVG: `animate-spin28`, `willChange: "transform"`, `textPath` at r=85, font-sans 9px 600 0.32em letter-spacing, `fill: var(--gold, #f6a21a)`

Entire badge wrapper: `animate-rise` with `animationDelay: "0.7s"`, `animationFillMode: "forwards"`, `opacity-0` initially.

Reference: `claude/instructions/HeroBadge.tsx`

### 3h. `components/redesign/prologue/Prologue.tsx`
Welcome card. `bg-charcoal/92` (opaque card, no blur — script font must be legible). Gold-top flourish border. 

Script font ("¡Bienvenidos!") — **approved location #1 of 2**:
```tsx
<p className="t-script text-4xl sm:text-5xl mb-4">¡Bienvenidos!</p>
```

Kicker above, section-style heading, body paragraph. The card should feel like a warm invitation, not a section header.

Reference: `claude/instructions/Prologue.tsx`

### 3i. `components/redesign/story/StorySection.tsx`
Two-column on ≥880px: text+quote left, animated image slideshow right.

**Left side:**
- `<SectionHeading>` component: kicker "Our story", title with `<em>` for italic gold highlight
- `<blockquote className="story-quote">` pattern:
  ```tsx
  <div className="story-quote-mark" aria-hidden>&ldquo;</div>
  <p className="t-quote">&ldquo;{quote}&rdquo;</p>
  <footer className="t-micro mt-6 normal-case">{quoteFooter}</footer>
  ```
  (`story-quote` = `relative border-l-2 border-gold/55 pl-6`)

**Right side — image slideshow:**
- `aspect-[4/5]`, `rounded-[20px]`, `overflow-hidden`, `border border-white/10`
- Auto-advance every 5000ms
- Framer Motion crossfade between images (opacity transition, 1.15s duration)
- Slow zoom-out on active slide via `key`-triggered CSS animation
- `story-image-tag` badge over bottom-left of image:
  ```tsx
  className="story-image-tag"
  /* = absolute bottom-5 left-5 z-[2] rounded-full border border-white/10 bg-black/50 px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-sm */
  ```
- Previous/next dot indicators below

Wrap both sides in `<Reveal>` for scroll-triggered fade-up.

Reference: `claude/instructions/StorySection.tsx` (check current file — patterns likely already match)

### 3j. `components/redesign/menu/InteractiveMenu.tsx`
Full menu section. Uses `MenuCatalogContext` for live data. Uses `menuDisplay` from `lib/menu/menu-display.ts` for display ordering and photos.

**Tab row** — numbered italic Fraunces numerals:
```tsx
<button className={cn(
  "flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300",
  active ? "bg-cream/10 text-cream" : "text-cream/50 hover:text-cream/80"
)}>
  <span className="font-display italic text-lg" style={{ color: active ? accentColor : undefined, fontVariationSettings: '"SOFT" 100' }}>
    {String(index + 1).padStart(2, "0")}
  </span>
  {category.name}
</button>
```

**Tagline strip** under tabs: category tagline in `t-body text-cream/55`

**Card grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap-6. Cards stagger in on category change — 70ms per card.

**Footnote grid** at bottom: meat upcharge prices from `formatVariantNote`, in `t-micro`.

**Section heading** via `<SectionHeading>` component. Wrap in `<Reveal>`.

Reference: `claude/instructions/InteractiveMenu.tsx`

### 3k. `components/redesign/menu/MenuItemCard.tsx`
Photo-led card. Full reference at `claude/instructions/MenuItemCard.tsx`. Verify all of:

- `aspect-[4/3]` image, `fill` layout, `object-cover`
- Bottom-up gradient fade over image: `bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent`
- Category tag badge: `absolute bottom-3 left-3`, `bg-black/55`, colored text using `accent`
- **Hover animations:**
  - Card: `hover:-translate-y-1 hover:-rotate-[0.4deg]` (`transition-all duration-[400ms]`)
  - Image: `group-hover:scale-[1.04]` (`transition-transform duration-700`)
  - Accent stripe: `absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`
- Price: `<span className="t-price-mono">{formatDisplayPrice(item)}</span>`
- Variant footnote: `font-mono text-[10px] text-cream/45`
- Add button: `hover:bg-angie-orange hover:border-angie-orange`

### 3l. `components/redesign/locations/LocationsSection.tsx`
Map + hours + status section.

**Map** — use existing `GoogleMapGreedy` or `GoogleMapClientResolved` depending on API key + coords availability. Overlay `MapPinRadar` decoratively if map loads (or use as standalone if no map).

**LocationPublicStatus** — pulsing ring when OPEN:
```tsx
{isOpen && <span className="block h-2.5 w-2.5 rounded-full bg-accent-green animate-ring-pulse" />}
```

**Hours list** — mono treatment:
```tsx
<li className="flex justify-between items-baseline py-2">
  <span className="text-cream/78">Mon — Tue</span>
  <span className="t-hours-mono">10:00 AM — 2:00 PM</span>
</li>
```
Use em-dash (`—`) not hyphen in time ranges.

**MapPinRadar** (`components/locations/MapPinRadar.tsx`) — 3 concentric `animate-radar-ping` rings, 1s apart via `animationDelay`. Reference: `claude/instructions/MapPinRadar.tsx`

**Section heading** via `<SectionHeading>`.

### 3m. `components/redesign/social/SocialPromoSection.tsx`
Navy gradient card (`bg-gradient-to-br from-navy/70 to-charcoal`), gold border (`border-gold/25`).

**Atmospheric `@`** — positioned top-right, 14rem Fraunces italic at 8% opacity:
```tsx
<span aria-hidden className="pointer-events-none absolute -top-8 right-8 font-display italic leading-none select-none"
  style={{ fontSize: "14rem", color: "rgba(246,162,26,0.08)", fontVariationSettings: '"SOFT" 100' }}>
  @
</span>
```

**Kicker**: `<div className="t-kicker t-kicker-gold mb-4">Follow along</div>`
**Heading**: `<h2 className="t-section max-w-[18ch]">Follow the truck — <em>same-day</em> updates.</h2>`
**Body**: `t-body-lg` paragraph, `max-w-[34rem]`

Social pills: ghost glass style, hover to gold border.
Wrap in `<Reveal>`.

### 3n. `components/redesign/catering/CateringSection.tsx`
**Two-layer glass surface** — critical for readability over watermark:
- Section wrapper: `bg-charcoal/45 backdrop-blur-sm` (standard glass)
- Form card inner: `bg-charcoal/85 backdrop-blur-md border border-white/12` — fully opaque so watermark logo doesn't bleed behind form fields

**Left column:**
- Kicker: `t-kicker t-kicker-gold`
- Heading: `t-section` with `<em>` for italic gold on key phrase
- Body paragraphs: `t-body-lg` (lead) + `t-body` (follow-ups), inside `prose-stack` div
- Phone numbers: `<a href="tel:...">` links with `t-price-mono` class and phone icon (tap-to-call on mobile), `hover:text-angie-orange` transition
- Remove "OPEN REQUEST FORM" button — form is always visible on desktop

**Right column — form card:**
All inputs share shared constants (ideally from `lib/ui/form-field-styles.ts`):
```ts
FORM_INPUT_CLASS = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 backdrop-blur-sm transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 hover:border-white/25"
FORM_LABEL_CLASS = "block text-[11px] font-medium uppercase tracking-[0.2em] text-cream/55 mb-1.5"
```

Fields: name (required), phone (required, `type="tel"`, `inputMode="numeric"`), email (required, `type="email"`), event date (`type="date"`), event type (select), guest count (`type="number"`, `inputMode="numeric"`), location, message (textarea).

Submit button: orange primary style, `disabled` during sending.
Status feedback: `idle | sending | sent | error` state shows inline micro-copy next to button.

Wrap in `<Reveal>`.
Reference: `claude/instructions/CateringSection.tsx`

### 3o. `components/redesign/cta/FinalConversion.tsx`
Full-width CTA band. Orange-accented headline, two buttons using `glassCtaBase` and `glassCtaAccent` from `components/ui/glass-cta.ts`. Arrow `→` inside `<span className="btn-arrow">` for the hover translate effect.

Reference: `claude/instructions/FinalConversion.tsx`

### 3p. `components/order/OrderDrawer.tsx`
Full slide-out cart. Already has real cart state from `useOrder()` context — **do not replace the cart state logic**. Verify or add the visual/motion treatment:

- Backdrop: `bg-black/70 backdrop-blur-md`, fade in via Framer Motion `opacity`
- Drawer panel: slides in from right (`translateX`), `z-[100]`, `role="dialog"`, `aria-modal="true"`
- Escape key closes, body scroll locked while open
- **Empty state:** Script font callout "¡Empieza!" (`t-script`) with menu browse prompt
- **Cart lines:** Each line has thumbnail image, item name, option line, qty stepper (`-` / `+` buttons), line total. Lines stagger in 60ms apart when drawer opens.
- **Qty stepper buttons:** `active:scale-95` press animation
- **Pickup form** (when cart has items): name, phone, notes — uses same `FORM_INPUT_CLASS` as catering form
- **Sticky footer:** subtotal / tax (use `NEXT_PUBLIC_TAX_RATE` env or default 8.35% for KC) / total, "Place order" button

Accessibility: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap on open, Escape closes.

Reference: `claude/instructions/OrderDrawer.tsx` (for visual layer — keep existing cart state)

### 3q. `components/redesign/footer/SiteFooter.tsx`
Footer glass: `bg-charcoal/70 backdrop-blur-md`. Four-column grid (brand + 3 info columns).

Column labels: `t-kicker` class (e.g. `<p className="t-kicker mb-3">Visit</p>`)
Hours lines: `t-hours-mono` class
Phone links: `<a href="tel:...">` with hover transition

**Bottom row** — script font, **approved location #2 of 2**:
```tsx
<div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-cream/55 sm:flex-row">
  <span>© {year} Angie's Food Truck · Kansas City</span>
  <span className="t-script text-lg text-gold sm:text-xl" style={{ transform: "rotate(-2deg)" }}>
    Hecho con cariño
  </span>
</div>
```

Reference: `claude/instructions/SiteFooter.tsx` (may need reconciling with current footer's data sources)

---

## 4. UI Utilities

### `components/ui/Reveal.tsx`
IntersectionObserver scroll-reveal wrapper. `threshold: 0.12`, `rootMargin: "-8% 0px"`, single-shot (unobserve after first intersection). Applies `reveal-init` on mount, `reveal-in` on intersection. Supports `data-stagger` attribute for child-stagger delays.

Reference: `claude/instructions/Reveal.tsx` + `claude/instructions/useReveal.ts`

### `components/ui/SectionHeading.tsx`
Standard kicker + heading + optional subtitle pattern. Emits:
```tsx
<div className={cn("", className)}>
  {kicker && <div className="t-kicker t-kicker-gold mb-4">{kicker}</div>}
  <h2 className="t-section">{title}</h2>   {/* title can include <em> for italic gold */}
  {subtitle && <p className="t-body-lg mt-6 max-w-[34rem] text-cream/70">{subtitle}</p>}
</div>
```

### `components/ui/glass-cta.ts`
```ts
export const glassCtaBase =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-editorial text-cream backdrop-blur-sm transition-all duration-300 hover:border-white/35 hover:bg-white/10 hover:-translate-y-0.5 [&_.btn-arrow]:transition-transform hover:[&_.btn-arrow]:translate-x-1";

export const glassCtaAccent =
  "inline-flex items-center justify-center gap-2 rounded-full border border-angie-orange/45 bg-angie-orange/15 px-6 py-3 text-xs font-semibold uppercase tracking-editorial text-cream backdrop-blur-sm transition-all duration-300 hover:border-angie-orange/60 hover:bg-angie-orange/25 hover:-translate-y-0.5 [&_.btn-arrow]:transition-transform hover:[&_.btn-arrow]:translate-x-1";
```

---

## 5. Menu Photos

Place 11 PNG images in `public/menu/` with slug-matched filenames:
```
tacos-de-birria.png
quesabirria.png
birria-ramen.png
california-burrito.png
birria-burrito.png
bean-cheese-burrito.png
birria-quesadilla.png
cheese-quesadilla.png
breakfast-burrito.png
torta.png
tacos-dorados.png
```

These are served via `next/image` with `fill` layout. Next.js will auto-optimize to WebP/AVIF. `MenuItemCard` references `item.image` (e.g. `"/menu/tacos-de-birria.png"`) from the menu display data.

If photos aren't available yet, ensure `MenuItemCard` handles a missing image gracefully (fallback placeholder or `objectFit: "cover"` with a `bg-charcoal` background).

Reference: `claude/instructions/menu.ts` for the full `menuDisplay` data structure with image paths and alt text.

---

## 6. Motion Catalog

All 11 animations in the design. Every continuous animation must use `transform` or `opacity` only (no layout properties).

| ID | Component | Duration | Trigger | CSS class / hook |
|----|-----------|----------|---------|-----------------|
| Marquee | `BrandTicker` | 38s linear | Continuous on render | `animate-marquee` |
| Ken-burns | `Hero` slides | 24s ease alternate | Continuous, active slide only | `animate-kenburns` |
| Spinning badge text | `HeroBadge` | 28s linear | Continuous | `animate-spin28` |
| Badge bob | `HeroBadge` logo | 6s ease-in-out | Continuous | `animate-bob` |
| Cilantro drift | `HeroLeaves` (×5) | 14–22s linear | Continuous, staggered delays | `animate-drift` |
| OPEN ring pulse | `LocationPublicStatus` | 2s ease-out | When status = open | `animate-ring-pulse` |
| Nav pill pulse | `EditorialNav` dot | 2s ease-out | Continuous | `animate-ring-pulse` |
| Hero OPEN dot | `Hero` kicker | 2s ease-out | Continuous | `animate-ring-pulse` |
| Map radar rings | `MapPinRadar` (×3) | 3s ease-out | Continuous, 1s apart | `animate-radar-ping` |
| Scroll reveals | `<Reveal>` wrapper | 900ms | On 12% visible | IntersectionObserver |
| Hero entrance stagger | `Hero` content | 700ms total | On mount | Framer Motion |

**Performance rules:**
- Add `style={{ willChange: "transform" }}` only on: marquee track, HeroBadge SVG, each leaf span
- No `will-change` on scroll-reveal elements
- All ken-burns containers need `overflow-hidden` on a parent

---

## 7. Three Confirmed Bug Fixes

### Bug A — Cilantro leaves bunched at bottom (**verify fixed**)
**Root cause:** Inline `transform: scale(N)` per leaf competed with the keyframe's `transform: translate + rotate`. Inline won; leaves didn't drift up.  
**Fix:** No inline transform (size via `width`/`height`). Drift keyframe uses `translate3d` only. `--leaf-opacity` custom property per leaf.  
**Verify:** Leaves drift smoothly upward through hero, fade in and out, no clumping.

### Bug B — Spinning badge has muddy dark ring (**verify fixed**)
**Root cause:** `drop-shadow(0 0 24px rgba(247,84,45,0.35))` painted an orange shadow around white logo edges → muddy brown ring on dark background.  
**Fix:** (1) Replace orange shadow with dark downward shadow. (2) Add warm radial halo behind logo as `background:radial-gradient(...)`. (3) Add thin dashed gold SVG ring at r=74.  
**Verify:** Logo has clean warm halo, no ring, dashed gold stamp-ring visible inside orbiting text.

### Bug C — Hero primary button is muted dark-red (**fix if needed**)
**Root cause:** Button using `bg-salsa` or `bg-angie-orange/70` instead of `bg-angie-orange`.  
**Fix:** Primary CTA must be exactly `bg-angie-orange` (no opacity modifier) with `shadow-lg shadow-angie-orange/40`.  
**Verify:** Primary "See the menu" button is vibrant orange with orange glow. Secondary "Where's the truck?" is ghost glass. Clear hierarchy.

---

## 8. Typography Rules (Non-Negotiable)

1. **Fraunces only for headlines** — `t-hero`, `t-section`, `t-quote`, numbered menu tab numerals
2. **DM Sans for everything else** — body, labels, kickers, nav, buttons
3. **Caveat (script) in exactly 2 places** — `Prologue.tsx` "¡Bienvenidos!" + `SiteFooter.tsx` "Hecho con cariño". Never use elsewhere.
4. **JetBrains Mono for prices and times** — `t-price-mono`, `t-hours-mono`, `t-micro`
5. **Gold italic emphasis** — inside headings, use `<em>` which maps to `font-style: italic; color: var(--gold); font-variation-settings: "SOFT" 100`
6. **Orange italic emphasis** — same but `t-hero em` is orange (for hero headline only)
7. **Line-height** — `t-body`: 1.6, `t-body-lg`: 1.55, never browser default (~1.2)
8. **Adjacent paragraphs** — `.t-body + .t-body` gets `margin-top: 1.25em` — no more bunched text blocks

---

## 9. Accessibility Checklist

- All form inputs have `<label htmlFor>` + `aria-required` on required fields
- `CateringSection` form: `aria-labelledby="catering-heading"`
- `OrderDrawer`: `role="dialog"`, `aria-modal="true"`, focus trap, Escape closes
- `HeroLeaves`, `HeroBadge`: `aria-hidden`
- `BrandTicker`: `aria-hidden` (decorative)
- Mobile nav overlay: `role="dialog"`, `aria-labelledby`, close on Escape, focus returns to trigger
- Input types correct for mobile keyboards: `type="tel"`, `type="email"`, `type="date"`, `type="number"` with `inputMode="numeric"`
- `LocationPublicStatus`: status announced (`aria-live` or role)

---

## 10. Verification Checklist

Run in order after implementation:

```bash
# 1. Build passes cleanly
npm run build

# 2. No old Playfair references
grep -r "Playfair" . --include="*.tsx" --include="*.ts" --include="*.css"

# 3. No old heading class strings (should be t-section now)
grep -r "font-display text-[45678]xl" components/ --include="*.tsx"

# 4. No old kicker strings
grep -r "text-xs uppercase tracking-editorial" components/ --include="*.tsx"

# 5. No unmonospaced prices
grep -r 'text-cream/85.*\$\|>\$[0-9]' components/ --include="*.tsx"

# 6. Script font used in exactly 2 places
grep -r "font-script\|t-script\|Caveat\|font-caveat" components/ --include="*.tsx" | grep -v "layout\|SiteFooter\|Prologue"
# ^ should return 0 results
```

**Visual checks (open `/redesign` in browser):**
- [ ] BrandTicker scrolls continuously across the top
- [ ] Nav logo is mathematically centered, equal link groups left/right
- [ ] Hero: stagger animation plays on load, all 5 leaves drift upward, badge spins + bobs cleanly
- [ ] Hero primary CTA is vibrant orange, secondary is ghost glass
- [ ] Every section heading uses Fraunces, `<em>` highlights render gold
- [ ] Menu tabs switch with stagger, card hover shows tilt + accent stripe + image scale
- [ ] Catering form inputs read cleanly (no watermark behind them)
- [ ] Footer bottom row shows "Hecho con cariño" in Caveat, rotated -2deg
- [ ] Enable macOS/iOS Reduce Motion → ALL animations collapse to instant (no drifting leaves, no spinning badge, no marquee scroll)
- [ ] Mobile: nav links collapse to hamburger, MENU pill remains visible

---

## File Map — Quick Reference

| Reference file (claude/instructions/) | Target file in repo | Action |
|---------------------------------------|---------------------|--------|
| `layout.tsx` | `app/redesign/layout.tsx` | Verify/replace |
| `globals-additions.css` | `app/redesign/redesign-globals.css` | Append / merge |
| `tailwind.config-additions.ts` | `tailwind.config.ts` | Merge keyframes + animation blocks |
| `PageShell.tsx` | `components/redesign/home/PageShell.tsx` | Verify/replace |
| `FixedBrandBackdrop.tsx` | `components/redesign/prologue/FixedBrandBackdrop.tsx` | Verify/replace |
| `BrandTicker.tsx` | `components/redesign/marquee/BrandTicker.tsx` | Verify/replace |
| `EditorialNav.tsx` | `components/redesign/nav/EditorialNav.tsx` | Verify/replace |
| `HeroBadge.tsx` | `components/redesign/hero/HeroBadge.tsx` | Verify bugs B fixed |
| `HeroLeaves.tsx` | `components/redesign/hero/HeroLeaves.tsx` | Verify bug A fixed |
| `Prologue.tsx` | `components/redesign/prologue/Prologue.tsx` | Verify/replace |
| `SectionHeading.tsx` | `components/redesign/ui/SectionHeading.tsx` | Verify/replace |
| `Reveal.tsx` | `components/ui/Reveal.tsx` | Verify/replace |
| `useReveal.ts` | `lib/hooks/useReveal.ts` | Verify/replace |
| `InteractiveMenu.tsx` | `components/redesign/menu/InteractiveMenu.tsx` | Verify/replace |
| `MenuItemCard.tsx` | `components/redesign/menu/MenuItemCard.tsx` | Verify/replace |
| `LocationPublicStatus.tsx` | `components/locations/LocationPublicStatus.tsx` | Verify/replace |
| `MapPinRadar.tsx` | `components/locations/MapPinRadar.tsx` | Verify/replace |
| `CateringSection.tsx` | `components/redesign/catering/CateringSection.tsx` | Verify/replace |
| `FinalConversion.tsx` | `components/redesign/cta/FinalConversion.tsx` | Verify/replace |
| `OrderDrawer.tsx` | `components/order/OrderDrawer.tsx` | Visual layer only — keep cart state |
| `Prologue.tsx` | `components/redesign/footer/SiteFooter.tsx` | Verify script line in bottom row |
| `menu.ts` | `lib/menu/menu-display.ts` (or equivalent) | Verify display data + helpers |

---

*This prompt covers everything from the Angie's redesign conversation: typography system, 11-animation motion system, z-stack/scroll architecture, all 16 components, 3 bug fixes, menu photos, accessibility, and verification. Implement top-to-bottom. Foundation → Architecture → Components → Verify.*
