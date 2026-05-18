// components/prologue/Prologue.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REPLACE existing file.
//
// Preserves the critical opacity/blur contract from the original spec:
//   - Section wrapper: NO background (watermark visible around the card)
//   - Card: bg-charcoal/92, NO backdrop-blur (solid tint on top of watermark)
//   - Subtle gold "top edge" gradient bar
//
// NEW:
//   - "¡Bienvenidos!" script callout (Caveat) — one of two approved
//     script locations on the site.
//   - Reveal wrapper for scroll fade-up
// ──────────────────────────────────────────────────────────────────────────────

import Reveal from "@/components/ui/Reveal";

export default function Prologue() {
  return (
    <section className="relative z-10 px-5 sm:px-8 py-24 sm:py-32">
      <Reveal
        as="div"
        className="relative mx-auto max-w-3xl rounded-3xl border border-white/10 bg-charcoal/92 p-10 sm:p-14 text-center"
      >
        {/* Top edge gold gradient bar — frames the card without
            adding backdrop-blur (which would break watermark visibility). */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--gold, #f6a21a) 50%, transparent 100%)",
          }}
        />

        {/* Script accent — APPROVED LOCATION #1 of 2 for the script font. */}
        <span
          className="t-script inline-block text-3xl sm:text-4xl leading-none mb-2"
          style={{ transform: "rotate(-3deg)" }}
        >
          ¡Bienvenidos!
        </span>

        <div className="t-kicker t-kicker-gold mt-1 mb-4">A warm welcome</div>

        <h2 className="t-section mb-5">
          Welcome to <em>Angie&apos;s Food Truck.</em>
        </h2>

        <p className="t-body-lg max-w-xl mx-auto">
          Fresh Mexican plates from the window — tacos, birria, burritos,
          aguas frescas, and daily specials. Follow the pin for today&apos;s
          stop, or book us for your next event.
        </p>
      </Reveal>
    </section>
  );
}
