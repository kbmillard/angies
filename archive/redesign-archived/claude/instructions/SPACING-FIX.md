# SPACING FIX — eliminate text bunching

**Problem:** Body text throughout the page has lines too close together (tight leading) and adjacent paragraphs run together without breathing room. Most visible in the catering section, hero body, and story quote areas.

**Root cause:** No explicit `line-height` set on `.t-body` / `.t-body-lg` classes, so browser default (`normal` ≈ 1.2) is used. That's too tight for comfortable reading — standard is 1.5–1.7. Also missing `p + p` or `.t-body + .t-body` margin rules, so paragraphs touch.

---

## CSS additions

**Append to `app/globals-additions.css`** (after the type role definitions, before the keyframes):

```css
/* ═══════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY SPACING — line-height + paragraph stacking
   ═══════════════════════════════════════════════════════════════════════════ */

/* Body text leading (line-height).
   Standard: 1.6 for most body, 1.55 for slightly larger lead paragraphs.
   This replaces the browser's default `normal` (~1.2) which is too tight. */
.t-body {
  line-height: 1.6;
}

.t-body-lg {
  line-height: 1.55;
}

/* Paragraph stacking — add breathing room between adjacent paragraphs.
   Applies to consecutive <p> tags or consecutive .t-body* elements. */
.t-body + .t-body,
.t-body-lg + .t-body-lg,
.t-body + .t-body-lg,
.t-body-lg + .t-body,
p + p {
  margin-top: 1.25em; /* 1.25× the element's font-size */
}

/* Section internal prose spacing — apply .prose-stack to any container
   with multiple text children (paragraphs, lists, blockquotes). */
.prose-stack > * + * {
  margin-top: 1.25rem;
}

/* Headings followed by body text — tighten the gap slightly so the heading
   feels attached to its paragraph, not floating. */
.t-section + .t-body,
.t-section + .t-body-lg,
h2 + p,
h3 + p {
  margin-top: 0.75rem;
}
```

No Tailwind config changes needed — this is pure CSS.

---

## Usage in components

Most sections will auto-fix once the CSS is added because they already use `.t-body` / `.t-body-lg` classes. But some sections with **multiple consecutive paragraphs** should wrap them in a spacing container for clarity.

### Example: Catering section (current bunched state)

```tsx
<p className="t-body-lg mb-5">
  Festivals, office lunches, birthdays...
</p>

<p className="t-body mb-5">
  When you book Angie's, you are booking...
</p>

<p className="t-body mb-8">
  Tell us your crowd size, date, time...
</p>
```

The `mb-5` / `mb-8` are fighting with the new `p + p` rule. **Replace with a wrapper + `space-y-5`:**

```tsx
<div className="space-y-5">
  <p className="t-body-lg">
    Festivals, office lunches, birthdays...
  </p>

  <p className="t-body">
    When you book Angie's, you are booking...
  </p>

  <p className="t-body">
    Tell us your crowd size, date, time...
  </p>
</div>
```

Or use `.prose-stack` (defined in the CSS above):

```tsx
<div className="prose-stack">
  <p className="t-body-lg">...</p>
  <p className="t-body">...</p>
  <p className="t-body">...</p>
</div>
```

Both patterns work — `space-y-*` is Tailwind-native, `.prose-stack` is semantic.

---

## Sections to audit

After adding the CSS, these sections will immediately improve (no component changes needed):

- ✅ **Hero body text** — "Find Angie's Food Truck near Linwood..."
- ✅ **Story quote** — "You will experience bold Tex-Mex flavor..."
- ✅ **Menu tagline** — "Everything is built at the window..."
- ✅ **Social body** — "Facebook and Instagram carry the live pin..."
- ✅ **Footer microcopy** — any small print

These sections have **multiple paragraphs** and should be wrapped in `space-y-5` or `.prose-stack`:

- 🔧 **Catering** — 3 paragraphs describing the offering
- 🔧 **Story section** — if it has body paragraphs after the quote
- 🔧 **Prologue** — the welcome card body (if it has multiple paragraphs)

### Quick grep targets

```bash
# Find sections with multiple consecutive <p className="t-body
rg '<p className="t-body' --after-context=2 | grep -A1 '</p>'
```

Any section showing `</p>` followed by `<p className="t-body` within 2 lines should get the wrapper.

---

## Before/after visual check

**Before (tight):**
```
Line one sits here and the next line
is so close it feels cramped and hard
to parse visually.

The next paragraph starts immediately
with no breathing room separating it
from the one above.
```

**After (spacious):**
```
Line one sits here and the next line
has comfortable space below it so
the eye can track easily.

The next paragraph has 1.25em of
vertical space above it, creating
clear separation and rhythm.
```

Line-height goes from ~1.2 → 1.6 (33% more space between lines).  
Paragraph spacing goes from 0 → 1.25em (~20px at 16px font-size).

---

## Testing

1. Add the CSS block to `globals-additions.css`.
2. Rebuild (`npm run dev` or `npm run build`).
3. Check these pages:
   - `/redesign` (home) — hero, story, catering, social sections
   - Any other pages with body text blocks

**Visual test:** Open the catering section. The three paragraphs should now have visible vertical space between them (~20px gap), and each line within a paragraph should have comfortable leading (not cramped).

**Regression test:** Make sure headings + body still feel attached (the `.t-section + .t-body` rule tightens that gap to 0.75rem so headings don't float away from their content).

---

## Optional: Tailwind line-height utilities

If you want to control line-height via utility classes in addition to the `.t-body` defaults, add this to `tailwind.config.ts`:

```ts
theme: {
  extend: {
    lineHeight: {
      'body': '1.6',
      'body-relaxed': '1.7',
      'body-tight': '1.5',
    }
  }
}
```

Then use as `leading-body`, `leading-body-relaxed`, `leading-body-tight` on any text element. Useful for one-off overrides without creating new type classes.

---

## Summary

| Issue | Fix |
|---|---|
| Lines too close together | `line-height: 1.6` on `.t-body` |
| Paragraphs bunched | `p + p { margin-top: 1.25em; }` |
| Multi-paragraph sections | Wrap in `<div className="space-y-5">` |
| Headings floating away from body | `.t-section + .t-body { margin-top: 0.75rem; }` |

Total CSS added: ~30 lines. No component logic changes needed (just wrapping some multi-paragraph blocks in spacing containers).
