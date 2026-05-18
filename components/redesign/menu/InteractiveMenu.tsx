"use client";

import { useCallback, useMemo, useState } from "react";
import { MeatChoiceModal } from "@/components/menu/MeatChoiceModal";
import { MenuOptionGroupsModal } from "@/components/menu/MenuOptionGroupsModal";
import { MenuItemCard } from "@/components/redesign/menu/MenuItemCard";
import Reveal from "@/components/ui/Reveal";
import { useMenuCatalog } from "@/context/MenuCatalogContext";
import { useOrder } from "@/context/OrderContext";
import {
  menuDisplay,
  CATEGORY_ACCENT,
  type MenuDisplayCategory,
  type MenuDisplayItem,
} from "@/lib/menu/menu-display";
import { itemOpensOptionsModal } from "@/lib/menu/option-groups";
import type { MenuItem } from "@/lib/menu/schema";
import { homeBandClass } from "@/lib/ui/home-band";

export function InteractiveMenu() {
  const { data } = useMenuCatalog();
  const { addItem, setOrderDrawerOpen } = useOrder();
  const [activeSlug, setActiveSlug] = useState(menuDisplay[0]!.slug);
  const [meatItem, setMeatItem] = useState<MenuItem | null>(null);
  const [optionsItem, setOptionsItem] = useState<MenuItem | null>(null);

  const activeCategory: MenuDisplayCategory =
    menuDisplay.find((c) => c.slug === activeSlug) ?? menuDisplay[0]!;

  const catalogBySlug = useMemo(() => {
    const map = new Map<string, MenuItem>();
    for (const item of data?.items ?? []) {
      map.set(item.id, item);
    }
    return map;
  }, [data]);

  const resolveCatalogItem = useCallback(
    (display: MenuDisplayItem) =>
      catalogBySlug.get(display.slug) ??
      data?.items.find((i) => i.name.toLowerCase() === display.name.toLowerCase()) ??
      null,
    [catalogBySlug, data],
  );

  const handleAdd = useCallback(
    (display: MenuDisplayItem) => {
      const catalogItem = resolveCatalogItem(display);
      if (!catalogItem) {
        addItem(display.slug);
        setOrderDrawerOpen(true);
        return;
      }
      if (itemOpensOptionsModal(catalogItem)) {
        setOptionsItem(catalogItem);
        return;
      }
      if (catalogItem.meatChoiceRequired) {
        setMeatItem(catalogItem);
        return;
      }
      addItem(catalogItem.id);
      setOrderDrawerOpen(true);
    },
    [addItem, resolveCatalogItem, setOrderDrawerOpen],
  );

  return (
    <section id="menu" className={homeBandClass}>
      <div className="mx-auto max-w-7xl">
        <Reveal as="div" className="mb-12 max-w-2xl">
          <div className="t-kicker t-kicker-gold mb-4">Menu</div>
          <h2 className="t-section mb-5">
            Fresh Tex-Mex plates, <em>drinks,</em> and daily specials.
          </h2>
          <p className="t-body-lg">
            Everything is built at the window. Pick your meat, pick your sides — prices below
            are for the base build.
          </p>
        </Reveal>

        <Reveal as="div" className="mb-3">
          <div role="tablist" aria-label="Menu categories" className="flex flex-wrap gap-2.5">
            {menuDisplay.map((cat, i) => {
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
                      ? "border border-cream bg-cream text-charcoal shadow-lg shadow-black/30"
                      : "border border-white/12 bg-black/25 text-cream/85 hover:-translate-y-0.5 hover:border-white/30"
                  }`}
                >
                  <span
                    className="font-display text-xl italic"
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

        {activeCategory.tagline ? (
          <p className="t-micro mb-10 max-w-xl normal-case tracking-normal text-cream/55">
            {activeCategory.tagline}
          </p>
        ) : null}

        <div
          id={`menu-panel-${activeCategory.slug}`}
          role="tabpanel"
          key={activeCategory.slug}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {activeCategory.items.map((item, i) => (
            <div
              key={item.slug}
              className="animate-rise opacity-0"
              style={{ animationDelay: `${i * 70}ms`, animationFillMode: "forwards" }}
            >
              <MenuItemCard item={item} categorySlug={activeCategory.slug} onAdd={handleAdd} />
            </div>
          ))}
        </div>

        <Reveal as="div" className="mt-12 pt-4">
          <div className="grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-10">
            <div>
              <div className="t-kicker mb-2">Meat upgrades</div>
              <p className="font-mono text-[12px] leading-relaxed text-cream/65">
                +$0.50 barbacoa
                <br />
                +$1 lengua
                <br />
                <span className="text-cream/40">All other meats — no upcharge</span>
              </p>
            </div>
            <div>
              <div className="t-kicker mb-2">Sides</div>
              <p className="font-mono text-[12px] leading-relaxed text-cream/65">
                Rice or beans · $3
                <br />
                Chips &amp; salsa · $4
                <br />
                Guacamole &amp; chips · $6.50
              </p>
            </div>
            <div>
              <div className="t-kicker mb-2">Toppings</div>
              <p className="font-mono text-[12px] leading-relaxed text-cream/65">
                Pico · $1 · sour cream · $1
                <br />
                Guacamole · $2 · lettuce · $0.50
                <br />
                <span className="text-cream/40">Red &amp; green salsa included</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <MeatChoiceModal
        item={meatItem}
        open={Boolean(meatItem)}
        onOpenChange={(open) => {
          if (!open) setMeatItem(null);
        }}
        onConfirm={(selectedMeat) => {
          if (!meatItem) return;
          addItem(meatItem.id, { selectedMeat });
          setMeatItem(null);
          setOrderDrawerOpen(true);
        }}
      />

      <MenuOptionGroupsModal
        item={optionsItem}
        open={Boolean(optionsItem)}
        onOpenChange={(open) => {
          if (!open) setOptionsItem(null);
        }}
        onConfirm={(selectedOptions) => {
          if (!optionsItem) return;
          addItem(optionsItem.id, { selectedOptions });
          setOptionsItem(null);
          setOrderDrawerOpen(true);
        }}
      />
    </section>
  );
}
