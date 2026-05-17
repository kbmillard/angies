"use client";

import Reveal from "@/components/ui/Reveal";
import { useOrder } from "@/context/OrderContext";
import { glassCtaAccent, glassCtaBase } from "@/components/ui/glass-cta";
import { cn } from "@/lib/utils/cn";

export function FinalConversion() {
  const { openOrderPanel, focusCatering, focusMenu } = useOrder();

  return (
    <section className="relative z-10 mt-10 border-t border-white/10 bg-charcoal/50 pt-20 pb-12 backdrop-blur-sm sm:mt-14 sm:pt-28 sm:pb-14">
      <Reveal as="div" className="mx-auto max-w-[1100px] px-5 text-center sm:px-8">
        <div className="t-kicker t-kicker-gold mb-6">Ready</div>

        <h2
          className="font-display text-cream mx-auto mb-10 max-w-[14ch]"
          style={{
            fontSize: "clamp(2.75rem, 8vw, 6rem)",
            fontWeight: 460,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            fontVariationSettings: '"SOFT" 50, "opsz" 144',
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

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          <button
            type="button"
            onClick={focusMenu}
            className={cn(glassCtaAccent, "group w-full px-8 py-4")}
          >
            Menu
            <span className="btn-arrow inline-block">→</span>
          </button>
          <button
            type="button"
            onClick={openOrderPanel}
            className={cn(glassCtaBase, "group w-full px-8 py-4")}
          >
            Checkout
            <span className="btn-arrow inline-block">→</span>
          </button>
          <button
            type="button"
            onClick={focusCatering}
            className={cn(glassCtaBase, "group w-full px-8 py-4")}
          >
            Truck &amp; catering request
            <span className="btn-arrow inline-block">→</span>
          </button>
        </div>

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
