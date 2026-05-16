"use client";

import { useOrder } from "@/context/OrderContext";

export function FinalConversion() {
  const { openOrderPanel, focusCatering, focusMenu } = useOrder();

  return (
    <section className="relative z-10 border-t border-white/10 bg-charcoal/50 py-24 backdrop-blur-sm">
      <div className="mx-auto max-w-[900px] px-5 text-center sm:px-8">
        <p className="text-xs uppercase tracking-editorial text-cream/70">Ready</p>
        <h2 className="mt-3 font-display text-5xl text-cream sm:text-6xl">READY TO EAT?</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-cream/80">
          Find the truck for tacos, birria, and burritos — round it out with aguas frescas. Catering
          and private events stay one scroll away.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <button
            type="button"
            onClick={focusMenu}
            className="w-full rounded-full bg-angie-orange px-8 py-3 text-xs font-semibold uppercase tracking-editorial text-cream shadow-lg transition hover:bg-angie-orange/90 sm:w-auto"
          >
            Menu
          </button>
          <button
            type="button"
            onClick={openOrderPanel}
            className="w-full rounded-full bg-cream px-8 py-3 text-xs font-semibold uppercase tracking-editorial text-charcoal sm:w-auto"
          >
            Checkout
          </button>
          <button
            type="button"
            onClick={focusCatering}
            className="w-full rounded-full border border-cream/40 px-8 py-3 text-xs font-semibold uppercase tracking-editorial text-cream sm:w-auto"
          >
            {"Truck & catering request"}
          </button>
        </div>
      </div>
    </section>
  );
}
