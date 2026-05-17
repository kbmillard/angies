"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import HeroBadge from "@/components/redesign/hero/HeroBadge";
import HeroLeaves from "@/components/redesign/hero/HeroLeaves";
import { glassCtaAccent, glassCtaBase } from "@/components/ui/glass-cta";
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
      className="relative z-10 isolate flex min-h-[min(78svh,820px)] items-end overflow-hidden bg-charcoal pt-[calc(var(--nav-h)+var(--ticker-h,2.5rem))] sm:min-h-[min(80svh,860px)]"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-charcoal" aria-hidden />
        {heroSlides.map((slideItem, idx) => (
          <motion.div
            key={slideItem.src}
            className={cn("absolute inset-0 overflow-hidden", idx !== i && "pointer-events-none")}
            initial={false}
            aria-hidden={idx !== i}
            animate={{ opacity: idx === i ? 1 : 0 }}
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
            "radial-gradient(80% 60% at 20% 30%, rgba(247, 84, 45, 0.18), transparent 60%), radial-gradient(60% 50% at 85% 80%, rgba(246, 162, 26, 0.15), transparent 60%), linear-gradient(180deg, rgba(16, 17, 20, 0.72) 0%, rgba(16, 17, 20, 0.88) 55%, rgba(16, 17, 20, 0.96) 100%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[28%] bg-gradient-to-t from-angie-orange/18 to-transparent sm:h-[30%]" />

      <HeroLeaves />

      <motion.div
        initial="hidden"
        animate="show"
        variants={heroContainer}
        className="relative z-[2] mx-auto w-full max-w-7xl px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-16 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16 items-end"
      >
        <div className="max-w-2xl [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">
          <motion.div variants={heroItem} className="inline-flex items-center gap-3 mb-7">
            <span className="block h-2 w-2 rounded-full bg-accent-green animate-ring-pulse" />
            <span className="t-kicker">{site.hero.eyebrow}</span>
          </motion.div>

          <motion.h1 variants={heroItem} className="t-hero mb-6">
            {site.hero.headlineLine1}
            <br />
            {site.hero.headlineLine2.includes("served fresh") ? (
              <>
                <em>served fresh</em>
                {site.hero.headlineLine2.replace("served fresh", "")}
              </>
            ) : (
              site.hero.headlineLine2
            )}
          </motion.h1>

          <motion.p variants={heroItem} className="t-body-lg max-w-lg mb-9">
            {site.hero.body}
          </motion.p>

          <motion.div variants={heroItem} className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollToSection("menu")}
              className={cn(glassCtaAccent, "group")}
            >
              {site.hero.cta.viewMenu}
              <span className="btn-arrow inline-block">→</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("locations")}
              className={cn(glassCtaBase, "group")}
            >
              {site.hero.cta.findTruck}
              <span className="btn-arrow inline-block">→</span>
            </button>
          </motion.div>

        </div>

        <motion.div
          variants={heroItem}
          className="relative z-20 hidden justify-self-end self-end lg:block"
        >
          <HeroBadge />
        </motion.div>
      </motion.div>

      <div
        className="absolute inset-x-0 bottom-6 z-[3] flex justify-center gap-1.5 sm:bottom-8"
        role="tablist"
        aria-label="Hero slideshow"
      >
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            className={cn(
              "h-1.5 rounded-full transition-[width,opacity]",
              idx === i ? "w-8 bg-gold" : "w-2 bg-cream/35 hover:bg-cream/55",
            )}
            aria-label={`Show slide ${idx + 1}`}
            aria-current={idx === i ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
