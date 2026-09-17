"use client";

import Image from "next/image";
import type { MenuDisplayItem } from "@/lib/menu/menu-display";
import { CATEGORY_ACCENT, formatDisplayPrice, formatVariantNote } from "@/lib/menu/menu-display";

interface MenuItemCardProps {
  item: MenuDisplayItem;
  categorySlug: string;
  onAdd?: (item: MenuDisplayItem) => void;
}

export function MenuItemCard({ item, categorySlug, onAdd }: MenuItemCardProps) {
  const accent = CATEGORY_ACCENT[categorySlug] ?? "#f87171";
  const variantNote = formatVariantNote(item);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-charcoal/55 backdrop-blur-sm transition-all duration-400 ease-out hover:-translate-y-1 hover:-rotate-[0.4deg] hover:border-white/20 hover:bg-charcoal/75 hover:shadow-2xl hover:shadow-black/40"
      style={{ ["--accent" as string]: accent }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent"
        />
        {item.tag ? (
          <span
            className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-cream backdrop-blur-md"
            style={{ color: accent }}
          >
            {item.tag}
          </span>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        <h3
          className="mb-2 font-display text-2xl leading-[1.05] tracking-[-0.01em] text-cream"
          style={{
            fontVariationSettings: '"SOFT" 80, "opsz" 48',
            fontWeight: 500,
          }}
        >
          {item.name}
        </h3>

        <p className="t-body mb-5 min-h-[3.6em] line-clamp-3 text-sm leading-[1.55] text-cream/65">
          {item.description}
        </p>

        <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="t-price-mono whitespace-nowrap">{formatDisplayPrice(item)}</span>
            {variantNote ? (
              <span className="whitespace-nowrap font-mono text-[10px] text-cream/45">
                {variantNote}
              </span>
            ) : null}
          </div>

          {onAdd ? (
            <button
              type="button"
              onClick={() => onAdd(item)}
              aria-label={`Add ${item.name} to order`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-cream transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-angie-orange hover:bg-angie-orange"
            >
              Add
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                +
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
