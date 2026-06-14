# SCROLL & MOTION — architecture reference

Everything about how the page is layered, what scrolls vs. what doesn't, and every animation on the site.

If you read one section, read § A (the Z-stack). Everything else assumes you understand it.

---

## A. The Z-stack — what's fixed vs. what scrolls

The page is a **layered cake**. Some layers scroll, some are pinned to the viewport. The interaction between them is what creates the "watermark visible mid-page through translucent sections" effect.

```
┌────────────────────────────────────────────────────────────────┐
│  z-[100]   OrderDrawer / CloverPaymentModal  (full overlay)    │  ← portals over everything
├────────────────────────────────────────────────────────────────┤
│  z-[60]    BrandTicker                       (sticky top)      │  ← marquee bar
├────────────────────────────────────────────────────────────────┤
│  z-[50]    EditorialNav                      (sticky top)      │  ← nav
├────────────────────────────────────────────────────────────────┤
│  z-10      Page content                      (SCROLLS)         │  ← Hero, Prologue, Story, Menu,
│            ↳ Hero (opaque bg-charcoal)                         │     Locations, Social, CTA, Footer
│            ↳ Glass sections (bg-charcoal/45 backdrop-blur-sm)  │
│            ↳ Solid cards (Prologue, Social) no blur            │
├────────────────────────────────────────────────────────────────┤
│  z-0       FixedBrandBackdrop                (FIXED)           │  ← watermark logo, full-viewport
└────────────────────────────────────────────────────────────────┘
```

### Visualization

```
                viewport edge
        ┌──────────────────────────────┐
z-60    │ ━━━━━ marquee ━━━━━━━━━━━━━━━│  stays put as you scroll
z-50    │ ┌──────── nav ──────────────┐│  stays put as you scroll
        │ │                            ││
z-10    │ │  Hero (opaque)            ││  scrolls up and out
        │ │  ▼                         ││
        │ │  Prologue (glass card)    ││  scrolls — watermark visible THROUGH it
        │ │  ▼                         ││
        │ │  Story (glass band)       ││  scrolls — watermark visible
        │ │                            ││
        │ │  Menu, Locations, etc.    ││
        │ └────────────────────────────┘│
        │                                │
z-0     │  [ logo watermark, FIXED ]    │  doesn't move
        └────────────────────────────────┘
```

### Why this layering matters

1. **Watermark stays put** — the logo backdrop is `position: fixed`, so it never scrolls. Content slides over it. This creates the "parallax-like" feel without any parallax JS.
2. **Hero is opaque** — `bg-charcoal` (solid), no blur. The watermark must NOT show through the hero — the slideshow images are the visual focus there.
3. **Glass sections reveal the watermark** — `bg-charcoal/45 backdrop-blur-sm` mid-page, so as you scroll you can see the watermark texture through them.
4. **Prologue uses NO blur on the card** — the card is solid (`bg-charcoal/92`), but the section wrapper around it is transparent, so the watermark is visible in the margins around the card.
5. **Nav + marquee are sticky** — they detach from page flow and pin to viewport top.

---

## B. The scroll model

There's only ONE scroll container: `<html>` / `<body>`. We don't use nested overflow scrolling.

Why this matters:
- IntersectionObserver works against the viewport, which is what we want.
- `scroll-behavior: smooth` on `<html>` handles anchor links page-wide.
- Mobile browsers handle their own hide-on-scroll URL bar correctly only on the root scroller.
- Sticky elements (`position: sticky`) reference the nearest scrolling ancestor — keeping it at `<html>` means nav + marquee stick to the actual viewport.

```css
/* in app/globals.css (existing, should not be removed) */
html { scroll-behavior: smooth; }
body { overflow-x: hidden; }  /* prevent horizontal scrollbar from marquee */
```

### Anchor link behavior

Internal nav links use hash anchors (`#story`, `#menu`, `#location`). With smooth scrolling enabled, these glide to the target. The sticky nav + marquee mean the **first 4.5rem + 2.5rem ≈ 7rem** is hidden behind the chrome. Add scroll-margin to target sections to fix:

```css
/* append to globals.css */
section[id],
[id^="section-"] {
  scroll-margin-top: 7rem; /* nav (4.5rem) + ticker (~2.5rem) */
}
```

This makes `#menu` scroll to a position where the menu's heading is below the sticky chrome, not behind it.

---

## C. Glass + watermark interaction (the visibility rule)

The watermark is **only visible** where:

1. The section has `bg-charcoal/45` (or lower) — less than full opacity.
2. The section has `backdrop-blur-sm` or less — backdrop-filter softens but doesn't hide.
3. There's no solid element in front of it.

The watermark is **invisible** where:

1. The hero — opaque `bg-charcoal`, slideshow images, dark veils.
2. Solid cards on transparent sections (e.g. Prologue card at `bg-charcoal/92`).
3. Footer — `bg-charcoal/70 backdrop-blur-md` (high enough opacity + blur to mostly hide it).

### The opacity contract

```
   Watermark VISIBLE         Watermark INVISIBLE
─────────────────────       ───────────────────────
 ≤ /45 background           ≥ /70 background
 backdrop-blur-sm or none   backdrop-blur-md or more
 Story, Menu, Locations,    Hero, Footer, Prologue card,
 Social, CTA bands          Modals, OrderDrawer
```

### Z-index of glass effects

Glass sections need:
```
position: relative;
z-index: 10;             /* above the watermark */
background: bg-charcoal/45;
backdrop-filter: blur(4px);  /* backdrop-blur-sm */
```

Without `z-index: 10`, the section sits at z-auto which can stack below the watermark in some flow contexts.

---

## D. PageShell — how it wires together

The root of `HomeView.tsx` (or wherever the home page assembles) should look like this:

```tsx
// components/home/PageShell.tsx — REFERENCE WIRING
import BrandTicker from "@/components/marquee/BrandTicker";
import EditorialNav from "@/components/nav/EditorialNav";
import FixedBrandBackdrop from "@/components/backdrop/FixedBrandBackdrop";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* z-0 — fixed watermark, never scrolls */}
      <FixedBrandBackdrop />

      {/* z-60 — top marquee, sticky to viewport */}
      <BrandTicker />

      {/* z-50 — nav, sticky to viewport (below marquee) */}
      <EditorialNav />

      {/* z-10 — page content, scrolls */}
      <main className="relative z-10">
        {children}
      </main>
    </>
  );
}
```

Every section underneath should manage its own `bg-charcoal/45 backdrop-blur-sm` (glass) or `bg-charcoal` (opaque) per the opacity contract in § C.

See `components/home/PageShell.tsx` in this handoff for the complete file.

---

## E. FixedBrandBackdrop — the watermark layer

The fixed layer that shows the brand logo behind everything.

Key rules:
- `position: fixed` — stays in viewport regardless of scroll
- `z-0` — below all content
- `pointer-events: none` — clicks pass through
- `inset-0` — fills the whole viewport
- Logo is centered, ~68vmin wide, 6% opacity

See `components/backdrop/FixedBrandBackdrop.tsx` in this handoff for the complete file.

---

## F. Motion catalog (the master table)

Every animation on the page. Use this as the index when debugging or refactoring.

### Continuous motions (always playing while in DOM)

| ID | File | Technique | Duration | Notes |
|---|---|---|---|---|
| Marquee scroll | `BrandTicker.tsx` | CSS keyframe `marquee` | 38s linear infinite | Two identical track copies, shifted -50% |
| Hero ken-burns | `Hero.tsx` (slides) | CSS keyframe `kenburns` | 24s ease-in-out alternate | Only on active slide |
| Spinning badge | `HeroBadge.tsx` | CSS keyframe `spin28` on SVG | 28s linear infinite | Rotates the textPath ring |
| Badge bob | `HeroBadge.tsx` (inner) | CSS keyframe `bob` | 6s ease-in-out infinite | Logo center floats up/down |
| Cilantro drift | `HeroLeaves.tsx` (×6) | CSS keyframe `drift` | 14–22s linear infinite | Each leaf has staggered delay |
| OPEN ring pulse | `LocationPublicStatus.tsx` | CSS keyframe `ringPulse` | 2s ease-out infinite | Box-shadow expanding ring |
| Status dot pulse | Nav CTA + hero kicker | CSS keyframe `ringPulse` | 2s ease-out infinite | Same keyframe as above |
| Map pin radar | `MapPinRadar.tsx` (×3) | CSS keyframe `radarPing` | 3s ease-out infinite | Three rings, delays 0s/1s/2s |
| Map pin bob | `MapPinRadar.tsx` | CSS keyframe `bob` | 2s ease-in-out infinite | Faster than badge bob |
| Map pin shadow | `MapPinRadar.tsx` | CSS keyframe `shadowPulse` | 2s ease-in-out infinite | Ground-shadow scale/opacity |

### On-load motions (fire once when component mounts)

| ID | File | Technique | Trigger | Duration |
|---|---|---|---|---|
| Hero entrance stagger | `Hero.tsx` | Framer Motion `staggerChildren` | mount | 900ms per child, 150ms apart |

### On-scroll motions (fire when entering viewport)

| ID | File | Technique | Trigger | Duration |
|---|---|---|---|---|
| Section reveal fade-up | `Reveal.tsx` + `useReveal.ts` | IntersectionObserver + CSS transition | 12% visible, -8% rootMargin | 900ms cubic-bezier(0.16, 1, 0.3, 1) |
| Stagger reveal | `Reveal.tsx` `stagger` prop | Same + `[data-stagger]` CSS | Same as above | 80ms apart per child, 800ms per child |

### Interaction motions (fire on user input)

| ID | Where | Technique | Trigger | Duration |
|---|---|---|---|---|
| Nav link underline | `EditorialNav.tsx` | CSS `::after` scaleX transform | hover | 350ms cubic-bezier(0.4, 0, 0.2, 1) |
| Nav CTA lift | `EditorialNav.tsx` | CSS `transform: translateY + scale` | hover | 250ms bezier spring |
| Primary button lift | `glass-cta.ts` | CSS `translateY(-2px)` | hover | 250ms |
| Button arrow slide | `glass-cta.ts` | CSS `translateX(4px)` on `.btn-arrow` | hover (parent) | 300ms |
| Menu card tilt | `InteractiveMenu.tsx` cards | CSS `translateY + rotate` | hover | 400ms |
| Menu card accent stripe | `InteractiveMenu.tsx` cards | CSS `scaleX` on `::before` | hover | 500ms |
| Menu tab switch | `InteractiveMenu.tsx` | JS-controlled opacity + transform | click | 250ms each direction |
| Hero slide dots | `Hero.tsx` | CSS opacity + width transition | active state | 400ms |
| Hero slide change | `Hero.tsx` | CSS opacity crossfade | timer (5.5s) + dot click | 1600ms |
| Story image zoom | `StorySection.tsx` | CSS `scale(1.05)` on image | hover on wrapper | 700ms |
| Social pill lift | `SocialPromoSection.tsx` | CSS `translateY(-2px) + border tint` | hover | 300ms |

---

## G. Scroll-triggered motions in detail

How the `Reveal` system works:

### The hook

`lib/hooks/useReveal.ts` exposes a simple API:

```ts
const [ref, inView] = useReveal<HTMLDivElement>({
  threshold: 0.12,        // 12% of element visible to trigger
  rootMargin: "0px 0px -8% 0px",  // trigger 8% before reaching viewport bottom
  repeat: false,          // single-shot (default)
});
```

Internally it uses `IntersectionObserver`. Single-shot mode unobserves after the first intersection — efficient, and prevents re-firing when scrolling back up.

### The wrapper

`components/ui/Reveal.tsx` wraps any block:

```tsx
<Reveal as="section" className="my-class">
  <h2>Heading</h2>
  <p>Body</p>
</Reveal>
```

It applies `reveal-init` (opacity 0, translateY 28px) on mount, then swaps to `reveal-in` (opacity 1, translateY 0) when the IntersectionObserver fires.

### Stagger mode

```tsx
<Reveal stagger>
  <div>First — animates at 0ms</div>
  <div>Second — animates at 80ms</div>
  <div>Third — animates at 160ms</div>
  ...
</Reveal>
```

The CSS in `globals-additions.css` selects `[data-stagger].reveal-in > *:nth-child(N)` and adds 80ms delays per child. Works up to 8 children — past that, extend the `nth-child` rules.

### The CSS

```css
.reveal-init {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-in {
  opacity: 1;
  transform: translateY(0);
}
```

The easing `cubic-bezier(0.16, 1, 0.3, 1)` is an "ease-out-quint" — fast at the start, gentle settle at the end. Reads as "confident arrival" instead of "drifting in."

### Why not Framer Motion for this?

We use IntersectionObserver + CSS because:
1. **Lighter** — no per-element Framer Motion instance for every section.
2. **No layout shift** — pure transform/opacity, no layout thrash.
3. **Works across server/client boundaries** — the wrapper is the only client component needed; sections themselves can stay server-rendered.

Framer Motion is reserved for the hero entrance, where we want orchestrated stagger with explicit control. Everywhere else, IntersectionObserver wins.

---

## H. Continuous motions — performance notes

All continuous motions use only `transform`, `opacity`, and `box-shadow`. None animate layout-affecting properties (`width`, `height`, `top`, `left`). This means:

- They run on the compositor thread (GPU), not the main thread.
- They don't trigger layout reflow.
- They don't cause jank on scroll.

### will-change

Apply `will-change` only where motion is heavy or constant:

```tsx
// Marquee track — constant horizontal animation
style={{ willChange: "transform" }}

// Spinning badge — constant rotation
style={{ willChange: "transform" }}

// Drifting leaves — constant transform + opacity
style={{ willChange: "transform, opacity, bottom" }}
```

Do **not** apply `will-change` to:
- Reveal elements (single-shot, no need for permanent compositor layer)
- Hover-only effects (only active during interaction)
- Menu cards (only animate on hover)

Permanent `will-change` on too many elements eats memory. The handoff already places it only where genuinely needed.

### Ken-burns and overflow

Ken-burns uses `transform: scale(1.06 → 1.15)`. Without `overflow: hidden` on the slide container, the scaled image bleeds past the hero edges. Make sure your `Hero.tsx` slide wrappers have `overflow-hidden`.

### Drift animation and `bottom`

The cilantro drift animates `bottom` (a layout property) as well as transform. This is technically less performant than pure transform-based motion, but the leaves are small and few (6 total), so the cost is negligible. If you ever scale this up (e.g. 40 leaves for a snowfall effect), refactor to use `transform: translateY` instead of `bottom`.

---

## I. Reduced motion handling

The global guard in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This collapses every animation to 0.01ms and disables smooth scrolling. Result: the page looks identical at rest, just without any movement.

Framer Motion **also** respects `prefers-reduced-motion` by default. No manual guard needed in `Hero.tsx`.

### What if a user wants partial motion?

The current guard is binary (all-or-nothing). If you want a "calm mode" toggle in the UI (some clients want this), add a `data-motion="calm"` attribute on `<html>` and scope the disable rules to it:

```css
[data-motion="calm"] .animate-marquee,
[data-motion="calm"] .animate-spin28,
[data-motion="calm"] .animate-drift {
  animation: none;
}
/* Keep reveals and interaction motions — only kill ambient continuous loops */
```

Out of scope for this handoff, but here's the hook if you want it later.

---

## J. The Z-index registry (don't ad-hoc this)

If you add a new layer, register it here:

| z-index | Layer | Position | File |
|---|---|---|---|
| 0 | Watermark backdrop | fixed | `FixedBrandBackdrop.tsx` |
| 1–9 | _reserved_ | — | — |
| 10 | Page content | static | All sections |
| 20–49 | _reserved for in-section overlays_ | — | — |
| 50 | Editorial nav | sticky | `EditorialNav.tsx` |
| 60 | Brand ticker | sticky | `BrandTicker.tsx` |
| 70–99 | _reserved for cookie banners, toasts_ | — | — |
| 100 | OrderDrawer overlay | fixed | `OrderDrawer.tsx` |
| 110 | Modal backdrop | fixed | `CloverPaymentModal.tsx` |
| 120 | Modal content | fixed | `CloverPaymentModal.tsx` |

If you find yourself reaching for `z-[999]`, stop. That means the registry is wrong and needs updating.

---

## K. Browser quirks to know

### Safari `backdrop-filter`
- Glass sections (`backdrop-blur-sm`) work on Safari 14+. Older Safari renders them as opaque — fine, just less interesting.
- Mobile Safari sometimes drops backdrop-filter under heavy scroll. The opacity contract still makes the page readable, so this degrades gracefully.

### iOS Safari fixed elements during scroll
- Fixed elements on iOS Safari momentarily disappear during overscroll bounce. Watermark + nav are both affected. There's no clean fix — the current design is robust to this because the watermark is decorative, not informational.

### Reduced motion on Windows
- Windows respects `prefers-reduced-motion` only when the user sets "Show animations in Windows" to off. Many users don't. We can't auto-detect this; trust the media query.

### Scrollbar gutter
- We use `overflow-x: hidden` on `<body>` to prevent the marquee from causing horizontal scroll. This can shift content slightly on scrollbar-present browsers (Windows). If layout shifts annoy you:
  ```css
  html { scrollbar-gutter: stable; }
  ```
  Modern browsers only; degrades silently on older ones.

---

## L. Adding a new motion piece — the checklist

If you add a new animation later, follow this:

```
[ ] Animates only transform / opacity / box-shadow (no layout properties)
[ ] Keyframe declared in BOTH globals.css and tailwind.config.ts
[ ] Reduced-motion guard handles it (verify by setting OS preference)
[ ] If continuous, will-change set ONLY if motion is constant
[ ] If on-scroll, uses Reveal wrapper or useReveal hook (don't ad-hoc IntersectionObserver)
[ ] If interaction-driven, lives in CSS hover, not JS state
[ ] Z-index documented in § J registry if it introduces a new layer
[ ] Test on Safari, iOS Safari, Firefox, Chrome
[ ] Test with prefers-reduced-motion enabled — page should be readable and complete at rest
```

---

## M. Companion files in this handoff

- `components/backdrop/FixedBrandBackdrop.tsx` — reference watermark implementation
- `components/home/PageShell.tsx` — root layout wiring (watermark + ticker + nav + content)
- `components/marquee/BrandTicker.tsx` — top marquee
- `components/hero/HeroBadge.tsx` — spinning circular text
- `components/hero/HeroLeaves.tsx` — drifting cilantro
- `components/locations/MapPinRadar.tsx` — animated map pin
- `components/locations/LocationPublicStatus.tsx` — OPEN ring pulse
- `components/ui/Reveal.tsx` — scroll reveal wrapper
- `lib/hooks/useReveal.ts` — IntersectionObserver hook
- `app/globals-additions.css` — keyframes + reveal CSS + reduced-motion guard
- `tailwind.config-additions.ts` — animation utility classes
