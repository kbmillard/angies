// components/menu/InteractiveMenu.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REPLACE existing file.
//
// Photo-led menu with category tabs. Reads from lib/menu/menu.ts.
//
// What this renders:
//   - Section header (kicker + section heading + tagline)
//   - 4 numbered category tabs (Tacos / Burritos / Quesadillas / Classics)
//   - Active-category tagline strip
//   - Responsive 1/2/3-column grid of MenuItemCards
//   - "All upcharges & sides at the window" footnote
//
// Wire-up:
//   - Item cards call onAdd(item) when clicked. By default, the handler here
//     opens the OrderDrawer via a custom event ('angies:open-order'). Your
//     OrderDrawer or order-state provider should listen for that event, or
//     you can swap onAdd for a direct store call (Zustand/Context/whatever
//     you use today).
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { menu, type MenuItem, CATEGORY_ACCENT } from "@/lib/menu/menu";
import MenuItemCard from "@/components/menu/MenuItemCard";
import Reveal from "@/components/ui/Reveal";

export default function InteractiveMenu() {
  const [activeSlug, setActiveSlug] = useState(menu[0].slug);
  const activeCategory =
    menu.find((c) => c.slug === activeSlug) ?? menu[0];

  // ── Add-to-order handler ───────────────────────────────────────────────────
  // Default behavior: dispatches a custom event your cart layer can listen for.
  // Swap with your real store call if you have one.
  const handleAdd = (item: MenuItem) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("angies:open-order", { detail: { item } })
    );
  };

  return (
    <section
      id="menu"
      className="relative z-10 border-t border-white/5 bg-charcoal/45 backdrop-blur-sm px-5 sm:px-8 py-24 sm:py-32"
    >
      <div className="max-w-7xl mx-auto">

        {/* ─── SECTION HEAD ────────────────────────────────────────────── */}
        <Reveal as="div" className="max-w-2xl mb-12">
          <div className="t-kicker t-kicker-gold mb-4">Menu</div>
          <h2 className="t-section mb-5">
            Fresh Tex-Mex plates, <em>drinks,</em> and daily specials.
          </h2>
          <p className="t-body-lg">
            Everything is built at the window. Pick your meat, pick your sides —
            prices below are for the base build.
          </p>
        </Reveal>

        {/* ─── CATEGORY TABS ───────────────────────────────────────────── */}
        <Reveal as="div" className="mb-3">
          <div role="tablist" aria-label="Menu categories" className="flex flex-wrap gap-2.5">
            {menu.map((cat, i) => {
              const isActive = cat.slug === activeSlug;
              const accent = CATEGORY_ACCENT[cat.slug];
              return (
                <button
                  key={cat.slug}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`menu-panel-${cat.slug}`}
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`inline-flex items-baseline gap-2.5 rounded-full px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 ease-out ${
                    isActive
                      ? "bg-cream text-charcoal border border-cream shadow-lg shadow-black/30"
                      : "bg-black/25 text-cream/85 border border-white/12 hover:border-white/30 hover:-translate-y-0.5"
                  }`}
                  style={isActive ? { ["--accent" as string]: accent } : undefined}
                >
                  <span
                    className="font-display italic text-xl"
                    style={{
                      fontVariationSettings: '"SOFT" 100, "opsz" 48',
                      color: isActive ? accent : undefined,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ─── ACTIVE CATEGORY TAGLINE ────────────────────────────────── */}
        {activeCategory.tagline && (
          <p
            key={activeCategory.slug}
            className="t-micro normal-case tracking-normal text-cream/55 mb-10 max-w-xl"
            style={{ animation: "rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            {activeCategory.tagline}
          </p>
        )}

        {/* ─── ITEM GRID ──────────────────────────────────────────────── */}
        <div
          id={`menu-panel-${activeCategory.slug}`}
          role="tabpanel"
          aria-labelledby={`menu-tab-${activeCategory.slug}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          // Re-mount on category change so cards re-stagger
          key={activeCategory.slug}
        >
          {activeCategory.items.map((item, i) => (
            <div
              key={item.slug}
              style={{
                animation: "rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                animationDelay: `${i * 70}ms`,
                opacity: 0,
              }}
            >
              <MenuItemCard
                item={item}
                categorySlug={activeCategory.slug}
                onAdd={handleAdd}
              />
            </div>
          ))}
        </div>

        {/* ─── FOOTNOTE ────────────────────────────────────────────────── */}
        <Reveal as="div" className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 max-w-5xl">
            <div>
              <div className="t-kicker mb-2">Meat upgrades</div>
              <p className="font-mono text-[12px] text-cream/65 leading-relaxed">
                +$0.50 barbacoa<br />
                +$1 lengua<br />
                <span className="text-cream/40">All other meats — no upcharge</span>
              </p>
            </div>
            <div>
              <div className="t-kicker mb-2">Sides</div>
              <p className="font-mono text-[12px] text-cream/65 leading-relaxed">
                Rice or beans · $3<br />
                Chips &amp; salsa · $4<br />
                Guacamole &amp; chips · $6.50
              </p>
            </div>
            <div>
              <div className="t-kicker mb-2">Toppings</div>
              <p className="font-mono text-[12px] text-cream/65 leading-relaxed">
                Pico · $1 · sour cream · $1<br />
                Guacamole · $2 · lettuce · $0.50<br />
                <span className="text-cream/40">Red &amp; green salsa included</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
