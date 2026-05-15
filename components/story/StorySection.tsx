"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gallerySrc } from "@/lib/data/gallery-path";

type StorySlide = {
  src: string;
  alt: string;
  kicker: string;
  line: string;
};

/** Truck slides — `truck*` filenames from `gallery/` only. */
const STORY_SLIDES: StorySlide[] = [
  {
    src: gallerySrc("truck1.jpg"),
    alt: "Angie’s Food Truck on the street in Kansas City",
    kicker: "Bright truck, fresh masa energy",
    line: "A Mexican food truck built for flavor, speed, and Kansas City curbs.",
  },
  {
    src: gallerySrc("truck3.jpg"),
    alt: "Angie’s Food Truck serving guests",
    kicker: "Bold Tex-Mex from the window",
    line: "Tacos, birria, burritos, and aguas frescas — made to order from the window.",
  },
  {
    src: gallerySrc("truck4.jpg"),
    alt: "Angie’s Food Truck exterior",
    kicker: "Linwood roots, KC-wide stops",
    line: "Follow today’s pin for catering, events, and everyday truck service.",
  },
];

const AUTO_ADVANCE_MS = 5000;
const SLIDE_ZOOM_OUT_S = 5.25;

export function StorySection() {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [zoomKeys, setZoomKeys] = useState(STORY_SLIDES.map(() => 0));
  const prevIndexRef = useRef(-1);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % STORY_SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prevIndexRef.current === index) return;
    setZoomKeys((keys) => {
      const next = [...keys];
      next[index] += 1;
      return next;
    });
    prevIndexRef.current = index;
  }, [index]);

  const fadeDuration = prefersReducedMotion ? 0 : 1.15;
  const slide = STORY_SLIDES[index]!;

  return (
    <section
      id="story"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] bg-charcoal/45 py-24 backdrop-blur-sm"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading
            kicker="Our story"
            title="Mexican flavor, rolling through Kansas City."
          />
          <blockquote className="mt-6 border-l-2 border-gold/55 pl-5">
            <p className="text-sm italic leading-relaxed text-cream/85">
              &ldquo;You will experience bold Tex-Mex flavor without leaving Kansas City.&rdquo;
            </p>
            <p className="mt-3 text-sm italic leading-relaxed text-cream/85">
              &ldquo;We had the opportunity to have Angie&apos;s Food Truck present for one of our
              events. Over 100 guests raved about the food…&rdquo;
            </p>
            <footer className="mt-4 text-xs font-medium tracking-editorial text-cream/65">
              Short public review snippets — confirm exact wording with owner.
            </footer>
          </blockquote>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
        >
          <div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Angie’s Food Truck story slideshow"
          >
            {STORY_SLIDES.map((s, i) => (
              <motion.div
                key={s.src}
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: i === index ? 1 : 0,
                }}
                transition={{
                  duration: fadeDuration,
                  ease: [0.22, 1, 0.36, 1],
                }}
                aria-hidden={i !== index}
              >
                {!prefersReducedMotion ? (
                  <motion.div
                    key={zoomKeys[i]}
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
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent"
              aria-hidden
            />
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
        </motion.div>
      </div>
    </section>
  );
}
