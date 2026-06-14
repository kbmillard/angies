// components/cta/FinalConversion.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REPLACE existing file.
//
// Glass-wash section + giant headline + three action buttons.
//
// Preserves spec contract:
//   - border-t border-white/10 bg-charcoal/50 backdrop-blur-sm
//   - Primary CTA uses angie-orange (Menu)
//   - Secondary CTAs use ghost style (Checkout, Catering)
//
// NEW:
//   - Reveal wrapper for scroll fade-up
//   - Italic gold "eat?" emphasis (via .t-section em rule)
//   - Subtle SVG flourish below the buttons
// ──────────────────────────────────────────────────────────────────────────────

import Reveal from "@/components/ui/Reveal";
import Link from "next/link";

export default function FinalConversion() {
  return (
    <section className="relative z-10 border-t border-white/10 bg-charcoal/50 backdrop-blur-sm px-5 sm:px-8 py-24 sm:py-32 text-center">
      <Reveal as="div" className="max-w-3xl mx-auto">
        <div className="t-kicker t-kicker-gold mb-6">Ready</div>

        <h2
          className="font-display text-cream"
          style={{
            fontSize: "clamp(2.75rem, 8vw, 6rem)",
            fontWeight: 460,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            fontVariationSettings: '"SOFT" 50, "opsz" 144',
            margin: "0 auto 2.5rem",
            maxWidth: "14ch",
          }}
        >
          Ready to{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--angie-orange, #f7542d)",
              fontVariationSettings: '"SOFT" 100, "opsz" 144',
            }}
          >
            eat
          </em>
          ?
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="#menu"
            className="inline-flex items-center gap-2 rounded-full bg-angie-orange text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-lg shadow-angie-orange/40 transition hover:bg-angie-orange/90 hover:-translate-y-0.5"
          >
            See the menu
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition hover:border-white/35 hover:bg-white/10"
          >
            Checkout
          </button>
          <Link
            href="#catering"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition hover:border-white/35 hover:bg-white/10"
          >
            Catering request
          </Link>
        </div>

        {/* Decorative gold flourish under the buttons */}
        <div className="mt-16 opacity-50" aria-hidden="true">
          <svg
            width="120"
            height="24"
            viewBox="0 0 120 24"
            fill="none"
            stroke="rgba(246, 162, 26, 0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="mx-auto"
          >
            <path d="M2 12 Q 30 2, 60 12 T 118 12" />
          </svg>
        </div>
      </Reveal>
    </section>
  );
}
