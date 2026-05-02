"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ESSENCE_CARDS } from "@/lib/data/essence";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils/cn";

export function EssenceSection() {
  const [openId, setOpenId] = useState(ESSENCE_CARDS[0]?.id ?? "");

  const open = ESSENCE_CARDS.find((c) => c.id === openId) ?? ESSENCE_CARDS[0];

  return (
    <section id="essence" className="py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          kicker="Essence"
          title="What stays on the flat-top stays in memory."
          subtitle="Three threads — fire, masa, and family — that explain how we cook and why Kansas City keeps coming back."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {ESSENCE_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setOpenId(card.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition",
                  openId === card.id
                    ? "border-cream bg-cream text-charcoal"
                    : "border-white/10 bg-white/5 text-cream hover:border-white/25",
                )}
              >
                <span className="font-display text-3xl">{card.number}</span>
                <span className="text-xs uppercase tracking-editorial">{card.title}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={open?.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10"
            >
              {open ? (
                <>
                  <Image
                    src={open.image}
                    alt={`${open.title} — brand essence imagery for La Hamburguesa Loca`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 640px, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <p className="text-xs uppercase tracking-editorial text-cream/70">
                      {open.number} / {open.title}
                    </p>
                    <p className="mt-2 font-display text-3xl text-cream">{open.teaser}</p>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/85">
                      {open.body}
                    </p>
                  </div>
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
