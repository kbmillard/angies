"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useMenuCatalog } from "@/context/MenuCatalogContext";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  GALLERY_FOOD_SHOTS,
  galleryDedupeKey,
  galleryShotSrc,
} from "@/lib/data/gallery-food-shots";

type GridImage = { key: string; src: string; alt: string };

/**
 * Featured + gallery in one section: menu “featured” images first, then remaining
 * `gallery/` food shots — **deduped by file path** so nothing appears twice.
 */
export function GallerySection() {
  const { data, loading } = useMenuCatalog();

  const images = useMemo((): GridImage[] => {
    const seen = new Set<string>();
    const out: GridImage[] = [];

    const push = (src: string | undefined, alt: string, key: string) => {
      if (!src?.trim()) return;
      const k = galleryDedupeKey(src);
      if (!k || seen.has(k)) return;
      seen.add(k);
      out.push({ key, src: src.trim(), alt });
    };

    if (data) {
      const tiles =
        data.featuredItems.length > 0 ? data.featuredItems : data.items.slice(0, 6);
      for (const item of tiles) {
        push(item.imageUrl, item.imageAlt ?? `${item.name} — Angie’s Food Truck`, `m-${item.id}`);
      }
    }

    for (const s of GALLERY_FOOD_SHOTS) {
      push(galleryShotSrc(s.file), s.alt, `g-${s.file}`);
    }

    return out;
  }, [data]);

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

        {loading && !data ? (
          <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`relative mb-4 break-inside-avoid aspect-square animate-pulse rounded-3xl bg-white/10 ${
                  i % 3 === 0 ? "sm:aspect-[3/4]" : ""
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {images.map((img, i) => (
              <div
                key={img.key}
                className={`relative mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-white/10 ${
                  i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
