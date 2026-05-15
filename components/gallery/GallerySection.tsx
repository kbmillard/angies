"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  GALLERY_FOOD_SHOTS,
  galleryShotSrc,
} from "@/lib/data/gallery-food-shots";

type GridImage = { key: string; src: string; alt: string };

/**
 * Probes with `Image()` before painting a tile — no empty rounded box or broken-image
 * black cell over the fixed backdrop. Gallery is **only** `GALLERY_FOOD_SHOTS` (no menu/Sheet URLs).
 */
function LocalGalleryTile({ img }: { img: GridImage }) {
  const [state, setState] = useState<"probe" | "ok" | "dead">("probe");

  useEffect(() => {
    let cancelled = false;
    const i = new Image();
    i.onload = () => {
      if (!cancelled) setState("ok");
    };
    i.onerror = () => {
      if (!cancelled) setState("dead");
    };
    i.src = img.src;
    return () => {
      cancelled = true;
      i.onload = null;
      i.onerror = null;
    };
  }, [img.src]);

  if (state === "dead") return null;
  if (state !== "ok") return null;

  return (
    <div className="relative mb-4 break-inside-avoid aspect-square overflow-hidden rounded-3xl ring-1 ring-inset ring-white/15">
      {/* eslint-disable-next-line @next/next/no-img-element -- native img after successful probe */}
      <img
        src={img.src}
        alt={img.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center"
      />
    </div>
  );
}

export function GallerySection() {
  const images = useMemo((): GridImage[] => {
    return GALLERY_FOOD_SHOTS.map((s) => ({
      key: `g-${s.file}`,
      src: galleryShotSrc(s.file),
      alt: s.alt,
    }));
  }, []);

  return (
    <section
      id="gallery"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] bg-charcoal/45 py-24 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          title="Featured picks from the street."
          align="center"
          className="max-w-none"
        />

        <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((img) => (
            <LocalGalleryTile key={img.key} img={img} />
          ))}
        </div>
      </div>
    </section>
  );
}
