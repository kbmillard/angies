# FIX-01 — observed bugs on `angieskc.com/redesign`

Three issues visible in the live shipped version. All three are patches on top of the original handoff — small surface area, drop-in safe.

---

## Bug A — cilantro leaves bunched at hero bottom

**Symptom:** Six green leaves visible in a row at the bottom edge of the hero, not drifting upward through the section.

**Root cause:** My original `HeroLeaves.tsx` set `transform: scale(N)` inline per-leaf. The `drift` keyframe also animated `transform: translateX + rotate`. CSS rule: inline `style` and keyframe values both target the same `transform` property, and the inline value won the resolution at the start of each cycle, so the translate/rotate stages of the keyframe didn't apply. Leaves stayed parked.

**Fix:** Rewrite the animation to use **only** `transform` (no `bottom`), drop the inline scale (size via width/height instead), expose per-leaf opacity via a CSS custom property so the keyframe can fade in/out without hardcoding.

### Apply

1. **Replace** `components/hero/HeroLeaves.tsx` with `fixes-01/HeroLeaves.tsx`.
2. **Update** the `drift` keyframe in `app/globals.css` — replace the existing `@keyframes drift { ... }` block with:

```css
@keyframes drift {
  0% {
    transform: translate3d(0, 100%, 0) rotate(0deg);
    opacity: 0;
  }
  8% {
    opacity: var(--leaf-opacity, 0.2);
  }
  50% {
    transform: translate3d(30px, -50vh, 0) rotate(180deg);
    opacity: var(--leaf-opacity, 0.2);
  }
  92% {
    opacity: var(--leaf-opacity, 0.2);
  }
  100% {
    transform: translate3d(-30px, calc(-100vh - 100%), 0) rotate(360deg);
    opacity: 0;
  }
}
```

3. **Update** the `drift` keyframe in `tailwind.config.ts` (under `theme.extend.keyframes`):

```ts
drift: {
  "0%":   { transform: "translate3d(0, 100%, 0) rotate(0deg)",                      opacity: "0" },
  "8%":   { opacity: "var(--leaf-opacity, 0.2)" },
  "50%":  { transform: "translate3d(30px, -50vh, 0) rotate(180deg)",                opacity: "var(--leaf-opacity, 0.2)" },
  "92%":  { opacity: "var(--leaf-opacity, 0.2)" },
  "100%": { transform: "translate3d(-30px, calc(-100vh - 100%), 0) rotate(360deg)", opacity: "0" },
},
```

The animation utility class `animate-drift` stays — only the keyframe body changes.

### Verify

After rebuild: 5 cilantro leaves at varied positions/sizes drift smoothly up through the hero, fading in on entry and out near the top. No clumping at the bottom edge.

---

## Bug B — spinning badge has a muddy dark ring

**Symptom:** The Angie's logo inside the spinning text circle is surrounded by a dark dirty ring rather than a clean halo.

**Root cause:** `drop-shadow(0 0 24px rgba(247, 84, 45, 0.35))` paints a 24px-radius orange shadow around every edge of the logo. Because the logo art has white outlines, the orange shadow lands on white edges against the dark charcoal background — the visual result is a muddy brown/orange smear, not the warm glow I intended.

**Fix:** Three changes:
1. Replace the orange drop-shadow with a clean **downward** dark shadow (depth, not glow).
2. Add a **soft warm radial gradient** behind the logo (cream→transparent) for actual halo warmth without smearing edges.
3. Add a **thin dashed gold inner ring** inside the orbiting text, giving the badge structure like a real "stamp" mark.

### Apply

1. **Replace** `components/hero/HeroBadge.tsx` with `fixes-01/HeroBadge.tsx`.

No CSS or Tailwind changes needed.

### Verify

The logo center looks anchored on a soft warm halo. A faint dashed gold ring sits just inside the orbiting text. No more dark orange ring around the logo edges.

---

## Bug C — hero primary MENU button is muted

**Symptom:** The "MENU →" button in the hero reads as a dark red, almost the same weight as the outlined "FIND THE TRUCK →" button next to it. Primary CTA isn't winning.

**Root cause:** Can't tell from the screenshot alone, but likely one of:
- The button is using `bg-salsa` (#b92b19) instead of `bg-angie-orange` (#f7542d)
- The button has an opacity reducer applied (e.g. `bg-angie-orange/70`)
- A backdrop-blur or border is desaturating it

**Fix:** Find the hero MENU button in `components/hero/Hero.tsx` and confirm the class string. It should look like this (matches the pattern in `FinalConversion.tsx` exactly):

```tsx
<Link
  href="#menu"
  className="group inline-flex items-center gap-2 rounded-full bg-angie-orange text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-lg shadow-angie-orange/40 transition-all duration-300 hover:bg-angie-orange/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-angie-orange/55"
>
  See the menu
  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
    →
  </span>
</Link>
```

Things to check:
- `bg-angie-orange` (no opacity modifier — no `/70`, `/80`, etc.)
- No `bg-salsa` anywhere
- `shadow-lg shadow-angie-orange/40` (this adds the orange glow under the button — part of why it pops)

The secondary "FIND THE TRUCK" button is correct as a `btn--ghost` style:

```tsx
<Link href="#location" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition hover:border-white/35 hover:bg-white/10">
  Where's the truck?
</Link>
```

### Verify

Primary MENU button is vibrant orange with a soft orange glow underneath. Secondary FIND THE TRUCK is outlined glass. Clear visual hierarchy.

---

## Summary — what to change

| File | Action |
|---|---|
| `components/hero/HeroLeaves.tsx` | Replace with `fixes-01/HeroLeaves.tsx` |
| `components/hero/HeroBadge.tsx` | Replace with `fixes-01/HeroBadge.tsx` |
| `app/globals.css` | Replace `@keyframes drift { ... }` block per Bug A |
| `tailwind.config.ts` | Replace `keyframes.drift` per Bug A |
| `components/hero/Hero.tsx` | Verify primary button uses `bg-angie-orange` (Bug C) |

Total: 2 file swaps, 1 keyframe patch in two places, 1 class verification. Should be a 5-minute change.

---

## Reduced-motion sanity check

After the keyframe change, please re-test with macOS / iOS "Reduce motion" enabled (System Settings → Accessibility → Display). All animations should still collapse to 0.01ms via the global guard in `globals.css`. If leaves still animate with reduce-motion on, the guard isn't being applied — check that the `@media (prefers-reduced-motion: reduce)` block at the bottom of `globals.css` is present and not been removed.
