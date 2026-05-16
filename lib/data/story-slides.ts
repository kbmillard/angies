import { gallerySrc } from "@/lib/data/gallery-path";
import type { StorySlideResolved } from "@/lib/site-settings/types";

const STORY_SLIDE_DEFS = [
  {
    file: "truck1.jpg",
    alt: "Angie’s Food Truck on the street in Kansas City",
    kicker: "Bright truck, fresh masa energy",
    line: "A Mexican food truck built for flavor, speed, and Kansas City curbs.",
  },
  {
    file: "truck3.jpg",
    alt: "Angie’s Food Truck serving guests",
    kicker: "Bold Tex-Mex from the window",
    line: "Tacos, birria, burritos, and aguas frescas — made to order from the window.",
  },
  {
    file: "truck4.jpg",
    alt: "Angie’s Food Truck exterior",
    kicker: "Linwood roots, KC-wide stops",
    line: "Follow today’s pin for catering, events, and everyday truck service.",
  },
] as const;

/** Truck story carousel — `truck*` filenames from `gallery/` only. */
export const DEFAULT_STORY_SLIDES: StorySlideResolved[] = STORY_SLIDE_DEFS.map((d) => ({
  src: gallerySrc(d.file),
  alt: d.alt,
  kicker: d.kicker,
  line: d.line,
}));
