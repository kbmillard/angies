// components/menu/MenuItemCard.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Photo-led menu item card.
//
// Layout:
//   ┌────────────────────────────┐
//   │       [ PHOTO 4:3 ]        │
//   │                            │
//   │  ┌─ TAG (overlay)          │
//   ├────────────────────────────┤
//   │  Item name                 │
//   │  Description…              │
//   │                            │
//   │  $14.00       Add to order │
//   │  +$0.50 barbacoa · …       │
//   └────────────────────────────┘
//
// Motion:
//   - Hover: card lifts + tilts -0.4deg, image scales 1.04
//   - Top accent stripe scales-in left→right on hover (category color)
//   - Tag badge fades up on mount
//
// onAdd callback is optional — if not provided, the "Add to order" button
// hides. Wire it to your existing cart/OrderDrawer add action.
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/menu/menu";
import { formatPrice, formatVariantNote, CATEGORY_ACCENT } from "@/lib/menu/menu";

interface MenuItemCardProps {
  item: MenuItem;
  categorySlug: string;
  /** Optional click handler — typically opens the OrderDrawer with this item. */
  onAdd?: (item: MenuItem) => void;
}

export default function MenuItemCard({
  item,
  categorySlug,
  onAdd,
}: MenuItemCardProps) {
  const accent = CATEGORY_ACCENT[categorySlug] ?? "#f87171";
  const variantNote = formatVariantNote(item);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-charcoal/55 backdrop-blur-sm transition-all duration-400 ease-out hover:-translate-y-1 hover:-rotate-[0.4deg] hover:border-white/20 hover:bg-charcoal/75 hover:shadow-2xl hover:shadow-black/40"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Category accent stripe — slides in on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{ background: "var(--accent)" }}
      />

      {/* PHOTO */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {/* Bottom-up dark fade so the tag and edge sit cleanly */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent"
        />

        {/* Tag badge */}
        {item.tag && (
          <span
            className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-cream backdrop-blur-md"
            style={{ color: accent }}
          >
            {item.tag}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-cream text-2xl leading-[1.05] tracking-[-0.01em] mb-2"
            style={{
              fontVariationSettings: '"SOFT" 80, "opsz" 48',
              fontWeight: 500,
            }}>
          {item.name}
        </h3>

        <p className="t-body text-sm leading-[1.55] text-cream/65 mb-5 min-h-[3.6em] line-clamp-3">
          {item.description}
        </p>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/8">
          <div className="flex flex-col gap-0.5">
            <span className="t-price-mono whitespace-nowrap">
              {formatPrice(item)}
            </span>
            {variantNote && (
              <span className="font-mono text-[10px] text-cream/45 whitespace-nowrap">
                {variantNote}
              </span>
            )}
          </div>

          {onAdd && (
            <button
              type="button"
              onClick={() => onAdd(item)}
              aria-label={`Add ${item.name} to order`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/15 px-3.5 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-cream transition-all duration-300 ease-out hover:bg-angie-orange hover:border-angie-orange hover:text-cream hover:-translate-y-0.5"
            >
              Add
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                +
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
