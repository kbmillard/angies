"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { HERO_SLIDES } from "@/lib/data/hero-slides";
import { useOrder } from "@/context/OrderContext";

const SLIDE_MS = 5500;
/** Crossfade — keep well under SLIDE_MS so the next slide reads as a new beat, not “same photo twice.” */
const CROSSFADE_S = 0.75;
const CROSSFADE_EASE: [number, number, number, number] = [0.33, 0, 0.2, 1];

export function Hero() {
  const { openOrderPanel, focusMenu, scrollToSection, focusCatering, focusSchedule } = useOrder();
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const len = HERO_SLIDES.length;
    if (len < 2) return undefined;
    const id = window.setInterval(() => {
      setI((v) => (v + 1) % len);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section
      id="hero"
      className="relative z-10 isolate flex min-h-[min(78svh,820px)] items-end overflow-hidden bg-charcoal pt-[var(--nav-h)] sm:min-h-[min(80svh,860px)]"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-charcoal" aria-hidden />
        {HERO_SLIDES.map((slideItem, idx) => (
          <motion.div
            key={slideItem.src}
            className={`absolute inset-0 ${idx !== i ? "pointer-events-none" : ""}`}
            initial={false}
            aria-hidden={idx !== i}
            animate={{
              opacity: idx === i ? 1 : 0,
            }}
            transition={{
              duration: reduceMotion ? 0 : CROSSFADE_S,
              ease: CROSSFADE_EASE,
            }}
            style={{ zIndex: idx === i ? 1 : 0 }}
          >
            <Image
              src={slideItem.src}
              alt={slideItem.alt}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={idx < 3}
              fetchPriority={idx === i ? "high" : idx < 3 ? "auto" : "low"}
            />
          </motion.div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-charcoal via-charcoal/80 to-navy/40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[42%] bg-gradient-to-t from-angie-orange/30 to-transparent" />

      <div className="relative z-[2] mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-5 pb-14 pt-20 sm:px-8 sm:pb-16 sm:pt-24 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">
          <p className="text-xs uppercase tracking-editorial text-cream/75">
            Angie&apos;s Food Truck · Mexican food truck · Kansas City
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] text-cream sm:text-6xl lg:text-7xl">
            Close-to-Mexico flavor,
            <br />
            rolling through Kansas City.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
            Find Angie&apos;s Food Truck near Linwood, follow today&apos;s location, and order
            Mexican favorites from the truck.
          </p>
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-[width,opacity] ${
                  idx === i ? "w-8 bg-gold" : "w-2 bg-cream/35 hover:bg-cream/55"
                }`}
                aria-label={`Show slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-2 lg:w-auto">
          <Cta primary label="Order" onClick={openOrderPanel} />
          <Cta label="View menu" onClick={focusMenu} />
          <Cta label="Find the truck" onClick={() => scrollToSection("locations")} />
          <Cta label="Upcoming schedule" onClick={focusSchedule} />
          <Cta label="Book catering / event" onClick={focusCatering} className="col-span-2 sm:col-span-1" />
        </div>
      </div>
    </section>
  );
}

function Cta({
  label,
  onClick,
  primary,
  className,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? `rounded-full bg-angie-orange px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-editorial text-cream shadow-lg transition hover:bg-angie-orange/90 sm:text-[11px] ${className ?? ""}`
          : `rounded-full border border-white/20 bg-black/35 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-editorial text-cream backdrop-blur-sm transition hover:bg-black/45 sm:text-[11px] ${className ?? ""}`
      }
    >
      {label}
    </button>
  );
}
