"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import HeroBadge from "@/components/redesign/hero/HeroBadge";
import { useOrder } from "@/context/OrderContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { cn } from "@/lib/utils/cn";

const SLIDE_MS = 5500;
const CROSSFADE_S = 0.75;
const CROSSFADE_EASE: [number, number, number, number] = [0.33, 0, 0.2, 1];

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function Hero() {
  const site = useSiteSettings();
  const { scrollToSection } = useOrder();
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
      className="relative z-10 isolate flex min-h-[calc(100svh-var(--nav-h))] items-end overflow-hidden bg-charcoal sm:min-h-[calc(100svh-var(--nav-h))]"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-charcoal" aria-hidden />
        {heroSlides.map((slideItem, idx) => (
          <motion.div
            key={slideItem.src}
            className={cn("absolute inset-0 overflow-hidden", idx !== i && "pointer-events-none")}
            initial={false}
            aria-hidden={idx !== i}
            animate={{ opacity: idx === i ? 0.55 : 0 }}
            transition={{
              duration: reduceMotion ? 0 : CROSSFADE_S,
              ease: CROSSFADE_EASE,
            }}
            style={{ zIndex: idx === i ? 1 : 0 }}
          >
            <div
              className={cn(
                "absolute inset-0",
                !reduceMotion && idx === i && "animate-kenburns",
              )}
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
            </div>
          </motion.div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(80% 60% at 20% 30%, rgba(247, 84, 45, 0.18), transparent 60%), radial-gradient(60% 50% at 85% 80%, rgba(246, 162, 26, 0.15), transparent 60%), linear-gradient(180deg, rgba(16, 17, 20, 0.55) 0%, rgba(16, 17, 20, 0.85) 60%, rgba(16, 17, 20, 0.95) 100%)",
        }}
        aria-hidden
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={heroContainer}
        className="relative z-[3] mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 min-[980px]:grid-cols-[1.6fr_1fr] min-[980px]:gap-16"
      >
        <div className="max-w-[760px] [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">
          <motion.div variants={heroItem} className="mb-7 inline-flex items-center gap-3.5">
            <span className="h-2 w-2 rounded-full bg-accent-green animate-ring-pulse" aria-hidden />
            <span className="t-kicker">Mexican food truck · Kansas City</span>
          </motion.div>

          <motion.h1 variants={heroItem} className="t-hero mb-6">
            Bold Tex-Mex flavor,
            <br />
            <em>served fresh</em> across
            <br />
            Kansas City.
          </motion.h1>

          <motion.p variants={heroItem} className="t-body-lg mb-9 max-w-[540px] text-cream/[0.82]">
            Find Angie&apos;s near Linwood and all around KC. Follow today&apos;s pin, order from the
            window, or book the truck for your next event.
          </motion.p>

          <motion.div variants={heroItem} className="flex flex-wrap gap-3.5">
            <button
              type="button"
              onClick={() => scrollToSection("menu")}
              className="group inline-flex items-center gap-2.5 rounded-full bg-angie-orange px-7 py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-cream shadow-[0_12px_24px_-10px_rgba(247,84,45,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff6a47] hover:shadow-[0_18px_32px_-10px_rgba(247,84,45,0.75)]"
            >
              See the menu
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("locations")}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-cream backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
            >
              Where&apos;s the truck?
            </button>
          </motion.div>
        </div>

        <motion.div
          variants={heroItem}
          className="relative z-20 flex w-full justify-center min-[980px]:justify-end"
        >
          <HeroBadge />
        </motion.div>
      </motion.div>

      <div
        className="absolute inset-x-0 bottom-6 z-[4] flex justify-center gap-2 sm:bottom-8"
        role="tablist"
        aria-label="Hero slideshow"
      >
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            className={cn(
              "h-2 rounded-full transition-all duration-400",
              idx === i ? "w-8 bg-gold" : "w-2 bg-cream/30 hover:bg-cream/55",
            )}
            aria-label={`Show slide ${idx + 1}`}
            aria-current={idx === i ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
