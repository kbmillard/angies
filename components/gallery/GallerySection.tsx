"use client";

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gallerySrc } from "@/lib/data/gallery-path";

/**
 * Food-focused gallery — filenames containing `food` from approved `gallery/` only.
 */
const SHOTS = [
  { file: "food.png", alt: "Mexican plate from Angie’s Food Truck" },
  { file: "food1.png", alt: "Fresh Mexican food" },
  { file: "food2.png", alt: "Angie’s window favorites" },
  { file: "food3.jpg", alt: "Rice and sides" },
  { file: "food4.png", alt: "Tacos and salsa" },
  { file: "food5.png", alt: "Loaded plate" },
  { file: "food6.png", alt: "Mexican specialties" },
  { file: "food7.jpg", alt: "Tacos" },
  { file: "food8.jpg", alt: "Street tacos" },
  { file: "food9.jpg", alt: "Truck favorites" },
  { file: "food10.jpg", alt: "Birria and sides" },
  { file: "food11.jpg", alt: "Burrito build" },
  { file: "food12.jpg", alt: "Daily special" },
  { file: "food13.png", alt: "Fresh Mexican flavors" },
  { file: "food14.png", alt: "Colorful plates" },
  { file: "food15.jpg", alt: "Beans and toppings" },
  { file: "food16.png", alt: "Angie’s spread" },
  { file: "food17.png", alt: "Mexican food truck plate" },
  { file: "food18.png", alt: "Fresh-made order" },
  { file: "food19.png", alt: "Truck menu favorites" },
  { file: "food20.png", alt: "Hearty Mexican plate" },
  { file: "food21.png", alt: "From the window" },
  { file: "food24.jpg", alt: "Angie’s Food Truck plate" },
] as const;

export function GallerySection() {
  return (
    <section
      id="gallery"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] bg-charcoal/45 py-24 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          kicker="Gallery"
          title="Fresh Mexican flavor from the window."
          align="center"
          subtitle="Real plates from Angie’s Food Truck — tacos, birria, burritos, and aguas frescas around Kansas City."
        />
        <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {SHOTS.map((s, i) => (
            <div
              key={s.file}
              className={`relative mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-white/10 ${
                i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
              }`}
            >
              <Image
                src={gallerySrc(s.file)}
                alt={s.alt}
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
