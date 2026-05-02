import { gallerySrc } from "@/lib/data/gallery-path";

/**
 * Hero slideshow — filenames containing `truck` from `gallery/` only.
 */
const HERO_SLIDE_DEFS = [
  {
    file: "truck.png",
    alt: "Angie’s Food Truck on the street in Kansas City",
  },
  {
    file: "truck1.jpg",
    alt: "Angie’s Food Truck parked for service",
  },
  {
    file: "truck2.png",
    alt: "Angie’s Mexican food truck",
  },
  {
    file: "truck3.jpg",
    alt: "Angie’s Food Truck at an event",
  },
  {
    file: "truck4.jpg",
    alt: "Angie’s Food Truck exterior",
  },
] as const;

const rawSlides = HERO_SLIDE_DEFS.map(({ file, alt }) => ({
  src: gallerySrc(file),
  alt,
}));

/** Drop accidental duplicate URLs so the carousel never “sticks” on the same asset twice. */
export const HERO_SLIDES = (() => {
  const seen = new Set<string>();
  return rawSlides.filter((s) => {
    if (seen.has(s.src)) return false;
    seen.add(s.src);
    return true;
  });
})();
