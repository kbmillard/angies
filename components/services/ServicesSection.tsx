"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SERVICE_ROWS } from "@/lib/data/services";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useOrder } from "@/context/OrderContext";

export function ServicesSection() {
  const [open, setOpen] = useState<string | null>(SERVICE_ROWS[0]?.id ?? null);
  const { openOrderPanel, scrollToSection, focusCatering } = useOrder();

  return (
    <section id="services" className="bg-charcoal py-24">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <SectionHeading
          kicker="Services"
          title="Pickup, truck, catering — one house."
          align="center"
          subtitle="Tap a row to see how we show up for Kansas City — from Southwest Blvd plates to Independence Ave nights."
        />

        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {SERVICE_ROWS.map((row) => {
            const isOpen = open === row.id;
            return (
              <div key={row.id} className="rounded-2xl border border-white/10 bg-charcoal/70">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : row.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-3xl text-cream/80">{row.number}</span>
                    <span className="text-sm uppercase tracking-editorial text-cream">
                      {row.title}
                    </span>
                  </div>
                  <span className="text-xs text-cream/50">{isOpen ? "−" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="space-y-4 px-5 py-5 text-sm leading-relaxed text-cream/80">
                        <p>{row.summary}</p>
                        <p>{row.detail}</p>
                        <div className="flex flex-wrap gap-2">
                          {row.ctas.map((cta) => (
                            <button
                              key={cta.label}
                              type="button"
                              className="rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
                              onClick={() => {
                                if (cta.action === "order") openOrderPanel();
                                if (cta.action === "catering") focusCatering();
                                if (cta.action === "scroll" && cta.target)
                                  scrollToSection(cta.target);
                              }}
                            >
                              {cta.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
