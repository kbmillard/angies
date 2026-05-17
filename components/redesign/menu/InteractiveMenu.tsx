"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MENU_CATEGORY_META } from "@/lib/menu/category-meta";
import type { MenuItem } from "@/lib/menu/schema";
import { useMenuCatalog } from "@/context/MenuCatalogContext";
import { useOrder } from "@/context/OrderContext";
import Reveal from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/redesign/ui/SectionHeading";
import { homeBandClass } from "@/lib/ui/home-band";
import { cn } from "@/lib/utils/cn";
import { MeatChoiceModal } from "@/components/menu/MeatChoiceModal";
import { MenuOptionGroupsModal } from "@/components/menu/MenuOptionGroupsModal";
import {
  itemOpensOptionsModal,
  sanitizeOptionSelections,
  type OptionSelections,
} from "@/lib/menu/option-groups";
import {
  categoryActiveRing,
  categoryHeroGradient,
  menuPanelBorderClass,
} from "@/lib/menu/category-styles";
import { navPrimaryLinkClass } from "@/lib/ui/nav-typography";

function MenuSkeleton() {
  return (
    <div className="mt-14 animate-pulse space-y-4">
      <div className="h-12 rounded-2xl bg-white/10" />
      <div className="h-64 rounded-3xl bg-white/10" />
    </div>
  );
}

function PriceRow({ name, price }: { name: string; price: number | null }) {
  const priceLabel = price === null ? "TBD" : `$${price.toFixed(2)}`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <p className="min-w-0 break-words font-medium leading-snug text-cream">{name}</p>
      <p className="t-price-mono shrink-0 sm:pt-0.5">{priceLabel}</p>
    </div>
  );
}

function itemHeroImage(item: MenuItem): { src: string; alt: string } | null {
  const src = item.imageUrl?.trim();
  if (!src) return null;
  return { src, alt: (item.imageAlt?.trim() || item.name).trim() };
}

function defaultCategoryHero(items: MenuItem[]): { src: string; alt: string } | null {
  if (!items.length) return null;
  const featured = items.find((i) => i.featured && i.imageUrl?.trim());
  const any = items.find((i) => i.imageUrl?.trim());
  const pick = featured ?? any;
  return pick ? itemHeroImage(pick) : null;
}

export function InteractiveMenu() {
  const { data, loading, error } = useMenuCatalog();
  const { addItem, openOrderPanel } = useOrder();
  const reduceMotion = useReducedMotion();
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef(MENU_CATEGORY_META[0]!.id);
  const [swipeCueDismissed, setSwipeCueDismissed] = useState(false);
  const [activeId, setActiveId] = useState(MENU_CATEGORY_META[0]!.id);
  const [meatItem, setMeatItem] = useState<MenuItem | null>(null);
  const [optionsItem, setOptionsItem] = useState<MenuItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoverItemId, setHoverItemId] = useState<string | null>(null);

  const visibleMeta = useMemo(() => {
    if (!data?.items.length) return MENU_CATEGORY_META;
    return MENU_CATEGORY_META.filter((m) =>
      data.items.some((i) => i.category.toLowerCase() === m.label.toLowerCase()),
    );
  }, [data]);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!visibleMeta.length) return;
    if (!visibleMeta.some((m) => m.id === activeId)) {
      setActiveId(visibleMeta[0]!.id);
    }
  }, [activeId, visibleMeta]);

  const active = visibleMeta.find((m) => m.id === activeId) ?? visibleMeta[0];
  const items = useMemo(() => {
    if (!data || !active) return [];
    return data.items.filter(
      (i) => i.category.toLowerCase() === active.label.toLowerCase(),
    );
  }, [active, data]);

  const categoryHero = useMemo(() => defaultCategoryHero(items), [items]);

  const displayHero = useMemo(() => {
    const previewId = hoverItemId ?? selectedItemId;
    if (previewId) {
      const item = items.find((i) => i.id === previewId);
      if (item) {
        const hero = itemHeroImage(item);
        if (hero) return hero;
      }
    }
    return categoryHero;
  }, [categoryHero, hoverItemId, items, selectedItemId]);

  useEffect(() => {
    const firstWithImage = items.find((i) => i.imageUrl?.trim());
    setSelectedItemId(firstWithImage?.id ?? null);
    setHoverItemId(null);
  }, [activeId, items]);

  const handleAdd = (item: MenuItem) => {
    if (item.meatChoiceRequired && !item.optionGroups?.length) {
      setMeatItem(item);
      return;
    }
    if (itemOpensOptionsModal(item)) {
      setOptionsItem(item);
      return;
    }
    addItem(item.id, { quantity: 1 });
    openOrderPanel();
  };

  const onMeatChosen = (meat: string) => {
    if (!meatItem) return;
    addItem(meatItem.id, { quantity: 1, selectedMeat: meat });
    openOrderPanel();
    setMeatItem(null);
  };

  const onOptionsChosen = (selections: OptionSelections) => {
    if (!optionsItem) return;
    const cleaned = sanitizeOptionSelections(selections);
    addItem(optionsItem.id, { quantity: 1, selectedOptions: cleaned });
    openOrderPanel();
    setOptionsItem(null);
  };

  const onCategoryScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el || swipeCueDismissed) return;
    if (el.scrollLeft > 8) setSwipeCueDismissed(true);
  }, [swipeCueDismissed]);

  const selectCategory = useCallback((id: string) => {
    if (activeIdRef.current !== id) setSwipeCueDismissed(true);
    setActiveId(id);
  }, []);

  const showSwipeCue = !swipeCueDismissed && visibleMeta.length > 1;

  return (
    <section
      id="menu"
      className={cn(
        homeBandClass,
        "w-full min-w-0 max-w-full overflow-x-hidden",
      )}
    >
      <div className="mx-auto w-full min-w-0 max-w-[1400px] overflow-x-hidden px-5 sm:px-8">
        <div
          id="menu-start"
          tabIndex={-1}
          className="scroll-mt-[calc(var(--header-stack-h)+1rem)] w-full min-w-0 max-w-full outline-none focus:outline-none"
        >
          <Reveal>
            <SectionHeading
              kicker="Menu"
              title={
                <>
                  Fresh Tex-Mex plates, <em>drinks,</em> and daily specials.
                </>
              }
              subtitle="Everything is built at the window. Tap a category — prices flex with daily ingredients and weekend specials."
            />
          </Reveal>
        </div>

        {error ? (
          <p className="mt-6 rounded-xl border border-angie-orange/35 bg-angie-orange/10 p-4 text-sm text-cream">
            {error} — refresh the page. If this persists, the menu API may be unreachable.
          </p>
        ) : null}

        {loading || !data ? (
          <MenuSkeleton />
        ) : (
          <div className="mt-14 grid w-full min-w-0 max-w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            <div className="min-w-0 w-full max-w-full">
              <div
                className={cn(
                  "mb-2 flex items-center justify-end gap-2 lg:hidden",
                  !showSwipeCue && "hidden",
                )}
                aria-hidden
              >
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-editorial text-cream/55">
                  <ChevronLeft className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  Swipe for more
                  <motion.span
                    className="inline-flex"
                    animate={reduceMotion ? false : { x: [0, 5, 0] }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                    }
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  </motion.span>
                </span>
              </div>
              <div className="relative min-w-0 w-full max-w-full">
                <div
                  ref={categoryScrollRef}
                  onScroll={onCategoryScroll}
                  className="flex max-w-full gap-3 overflow-x-auto overflow-y-hidden pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden"
                >
                  {visibleMeta.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  className={cn(
                    "flex min-w-[220px] items-baseline justify-between rounded-2xl border px-4 py-4 text-left transition lg:min-w-0",
                    active?.id === cat.id
                      ? cn("bg-cream/95 text-charcoal ring-2", categoryActiveRing(cat.color))
                      : "border-white/10 bg-black/25 text-cream hover:border-white/25",
                  )}
                >
                  <span className="font-display text-3xl">{cat.number}</span>
                  <span className="pl-4 text-xs uppercase tracking-editorial">{cat.label}</span>
                </button>
                  ))}
                </div>
                {showSwipeCue ? (
                  <div
                    className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-14 bg-gradient-to-l from-charcoal from-[18%] to-transparent lg:hidden"
                    aria-hidden
                  />
                ) : null}
              </div>
            </div>

            <div className="min-w-0 w-full max-w-full">
              <AnimatePresence mode="wait">
                {active ? (
                  <motion.div
                    key={active.id}
                    id="menu-panel"
                    tabIndex={-1}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className={cn(
                      "w-full min-w-0 max-w-full overflow-x-hidden rounded-3xl border-2 bg-black/35 p-4 sm:p-8",
                      menuPanelBorderClass(active.color),
                    )}
                  >
                    <div className="grid min-w-0 w-full max-w-full grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="min-w-0 w-full max-w-full">
                        <p className={navPrimaryLinkClass}>{active.number} / {active.panelKickerEn}</p>
                        <h3 className="mt-2 font-display text-4xl text-cream">{active.label}</h3>
                        <p className="mt-4 text-sm leading-relaxed text-cream/75 sm:text-base">
                          {active.subtitle}
                        </p>
                        <div
                          className={cn(
                            "relative mt-8 aspect-[4/3] w-full max-w-full overflow-hidden rounded-2xl border border-white/10",
                            !displayHero && cn("bg-gradient-to-br", categoryHeroGradient(active.color)),
                          )}
                        >
                          {displayHero ? (
                            <AnimatePresence initial={false}>
                              <motion.div
                                key={displayHero.src}
                                initial={{ opacity: reduceMotion ? 1 : 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: reduceMotion ? 1 : 0 }}
                                transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
                                className="absolute inset-0"
                              >
                                <Image
                                  src={displayHero.src}
                                  alt={displayHero.alt}
                                  fill
                                  className="object-cover"
                                sizes="(min-width: 1024px) 480px, 100vw"
                                priority={false}
                                />
                              </motion.div>
                            </AnimatePresence>
                          ) : null}
                          <div
                            className={cn(
                              "pointer-events-none absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent",
                              !displayHero && "from-black/45 via-black/15",
                            )}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
                        </div>
                      </div>

                      <div className="min-w-0 w-full max-w-full space-y-4">
                        {items.map((item) => {
                          const hasPreviewImage = Boolean(item.imageUrl?.trim());
                          return (
                          <article
                            key={item.id}
                            role={hasPreviewImage ? "button" : undefined}
                            tabIndex={hasPreviewImage ? 0 : undefined}
                            aria-pressed={hasPreviewImage ? selectedItemId === item.id : undefined}
                            className={cn(
                              "group relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border bg-charcoal/50 p-4 transition-all duration-[400ms] ease-out hover:-translate-y-1 hover:-rotate-[0.4deg] hover:border-white/20 hover:bg-charcoal/70 sm:p-5",
                              hasPreviewImage && "cursor-pointer",
                              selectedItemId === item.id
                                ? "border-cream/25 ring-1 ring-cream/15"
                                : "border-white/10",
                            )}
                            onClick={() => {
                              if (hasPreviewImage) setSelectedItemId(item.id);
                            }}
                            onKeyDown={(e) => {
                              if (
                                hasPreviewImage &&
                                (e.key === "Enter" || e.key === " ")
                              ) {
                                e.preventDefault();
                                setSelectedItemId(item.id);
                              }
                            }}
                            onMouseEnter={() => {
                              if (hasPreviewImage) setHoverItemId(item.id);
                            }}
                            onMouseLeave={() => setHoverItemId(null)}
                          >
                            <div className="flex w-full min-w-0 flex-col gap-3">
                              <div className="min-w-0 flex-1">
                                <PriceRow name={item.name} price={item.price} />
                                {item.includesFries ? (
                                  <span className="mt-1 inline-block rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-editorial text-cream/75">
                                    With fries
                                  </span>
                                ) : null}
                                {item.description ? (
                                  <p className="mt-2 break-words text-xs leading-relaxed text-cream/60">
                                    {item.description}
                                  </p>
                                ) : null}
                                <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="min-h-10 rounded-full bg-angie-orange px-3 py-1.5 text-[10px] font-semibold uppercase tracking-editorial text-cream shadow-sm transition hover:bg-angie-orange/90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAdd(item);
                                    }}
                                  >
                                    Add
                                  </button>
                                  <button
                                    type="button"
                                    className="min-h-10 rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream/80 hover:bg-white/5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openOrderPanel();
                                    }}
                                  >
                                    Checkout
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>

      <MeatChoiceModal
        item={meatItem}
        open={Boolean(meatItem)}
        onOpenChange={(o) => {
          if (!o) setMeatItem(null);
        }}
        onConfirm={onMeatChosen}
      />
      <MenuOptionGroupsModal
        item={optionsItem}
        open={Boolean(optionsItem)}
        onOpenChange={(o) => {
          if (!o) setOptionsItem(null);
        }}
        onConfirm={onOptionsChosen}
      />
    </section>
  );
}
