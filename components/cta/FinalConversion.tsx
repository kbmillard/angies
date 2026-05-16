"use client";

import { useOrder } from "@/context/OrderContext";
import { glassCtaAccent, glassCtaBase } from "@/components/ui/glass-cta";
import { cn } from "@/lib/utils/cn";

export function FinalConversion() {
  const { openOrderPanel, focusCatering, focusMenu } = useOrder();

  return (
    <section className="relative z-10 mt-10 border-t border-white/10 bg-charcoal/50 pt-20 pb-12 backdrop-blur-sm sm:mt-14 sm:pt-28 sm:pb-14">
      <div className="mx-auto max-w-[1100px] px-5 text-center sm:px-8">
        <p className="text-xs uppercase tracking-editorial text-cream/70">Ready</p>
        <h2 className="mt-3 font-display text-5xl text-cream sm:text-6xl">READY TO EAT?</h2>
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          <button type="button" onClick={focusMenu} className={cn(glassCtaAccent, "w-full px-8 py-4")}>
            Menu
          </button>
          <button
            type="button"
            onClick={openOrderPanel}
            className={cn(glassCtaBase, "w-full px-8 py-4")}
          >
            Checkout
          </button>
          <button
            type="button"
            onClick={focusCatering}
            className={cn(glassCtaBase, "w-full px-8 py-4")}
          >
            Truck &amp; catering request
          </button>
        </div>
      </div>
    </section>
  );
}
