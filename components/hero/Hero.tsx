"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const SLIDE_MS = 5500;
/** Crossfade — keep well under SLIDE_MS so the next slide reads as a new beat, not “same photo twice.” */
const CROSSFADE_S = 0.75;
const CROSSFADE_EASE: [number, number, number, number] = [0.33, 0, 0.2, 1];

export function Hero() {
  const site = useSiteSettings();
  const heroSlides = site.hero.slides;
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    setI((v) => (heroSlides.length === 0 ? 0 : Math.min(v, heroSlides.length - 1)));
  }, [heroSlides.length]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const len = heroSlides.length;
    if (len < 2) return undefined;
    const id = window.setInterval(() => {
      setI((v) => (v + 1) % len);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, heroSlides.length]);

  return (
    <section
      id="hero"
      className="relative z-10 isolate flex min-h-[min(78svh,820px)] items-end overflow-hidden bg-charcoal pt-[var(--nav-h)] sm:min-h-[min(80svh,860px)]"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-charcoal" aria-hidden />
        {heroSlides.map((slideItem, idx) => (
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[28%] bg-gradient-to-t from-angie-orange/18 to-transparent sm:h-[30%]" />

      <div className="relative z-[2] mx-auto w-full max-w-[1400px] px-5 pb-14 pt-20 sm:px-8 sm:pb-16 sm:pt-24">
        <div className="max-w-3xl [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">
          <p className="text-xs uppercase tracking-editorial text-cream/75">{site.hero.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] text-cream sm:text-6xl lg:text-7xl">
            {site.hero.headlineLine1}
            <br />
            {site.hero.headlineLine2}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
            {site.hero.body}
          </p>
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {heroSlides.map((_, idx) => (
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
      </div>
    </section>
  );
}
