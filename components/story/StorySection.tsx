"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { homeBandClass } from "@/lib/ui/home-band";

const AUTO_ADVANCE_MS = 5000;
const SLIDE_ZOOM_OUT_S = 5.25;

export function StorySection() {
  const site = useSiteSettings();
  const slides = site.story.slides;
  const slideFingerprints = slides.map((s) => s.src).join("|");
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [zoomKeys, setZoomKeys] = useState(slides.map(() => 0));
  const prevIndexRef = useRef(-1);

  useEffect(() => {
    setZoomKeys(slides.map(() => 0));
    setIndex(0);
    prevIndexRef.current = -1;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when the ordered list of slide URLs changes
  }, [slideFingerprints]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const len = slides.length;
    if (len < 2) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, slides.length]);

  useEffect(() => {
    if (prevIndexRef.current === index) return;
    setZoomKeys((keys) => {
      const next = [...keys];
      if (next[index] == null) next[index] = 0;
      next[index] += 1;
      return next;
    });
    prevIndexRef.current = index;
  }, [index]);

  const fadeDuration = prefersReducedMotion ? 0 : 1.15;
  const slide = slides[index] ?? slides[0]!;

  return (
    <section id="story" className={homeBandClass}>
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <SectionHeading
            kicker={site.story.sectionKicker}
            title={
              <>
                Mexican flavor, <em>rolling through</em> Kansas City.
              </>
            }
          />
          <blockquote className="story-quote mt-8">
            <div className="story-quote-mark" aria-hidden>
              &ldquo;
            </div>
            <p className="t-quote text-xl sm:text-2xl lg:text-3xl">&ldquo;{site.story.quote1}&rdquo;</p>
            {site.story.quoteFooter ? (
              <footer className="t-micro mt-6 normal-case">{site.story.quoteFooter}</footer>
            ) : null}
          </blockquote>
        </Reveal>

        <Reveal className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] border border-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Angie’s Food Truck story slideshow"
          >
            {slides.map((s, i) => (
              <motion.div
                key={s.src}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === index ? 1 : 0 }}
                transition={{
                  duration: fadeDuration,
                  ease: [0.22, 1, 0.36, 1],
                }}
                aria-hidden={i !== index}
              >
                {!prefersReducedMotion ? (
                  <motion.div
                    key={zoomKeys[i] ?? 0}
                    className="absolute inset-0 h-full w-full"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: index === i ? 1 : 1.08 }}
                    transition={{
                      duration: index === i ? SLIDE_ZOOM_OUT_S : 0.35,
                      ease: index === i ? [0.12, 0.82, 0.24, 1] : [0.4, 0, 0.2, 1],
                    }}
                  >
                    <Image
                      src={s.src}
                      alt={s.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 560px, 100vw"
                      priority={i === 0}
                    />
                  </motion.div>
                ) : (
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 560px, 100vw"
                    priority={i === 0}
                  />
                )}
              </motion.div>
            ))}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent"
              aria-hidden
            />
            <span className="story-image-tag">Bright truck · fresh masa</span>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" }}
                  className="max-w-[20rem] rounded-2xl border border-white/15 bg-black/40 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-editorial text-gold">
                    {slide.kicker}
                  </p>
                  <p className="mt-1 font-display text-sm italic leading-snug text-cream/88">
                    {slide.line}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
