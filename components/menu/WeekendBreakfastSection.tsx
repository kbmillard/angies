"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMenuCatalog } from "@/context/MenuCatalogContext";
import { useOrder } from "@/context/OrderContext";
import type { MenuCategoryColor, MenuItem } from "@/lib/menu/schema";
import { itemRequiresOptionSelections } from "@/lib/menu/option-groups";
import { MeatChoiceModal } from "@/components/menu/MeatChoiceModal";
import { MenuOptionGroupsModal } from "@/components/menu/MenuOptionGroupsModal";
import { cn } from "@/lib/utils/cn";
import {
  categoryActiveRing,
  categoryHeroGradient,
  menuPanelBorderClass,
} from "@/lib/menu/category-styles";
import { englishSublineWithoutClock } from "@/lib/menu/strip-clock-from-label";
import { navPrimaryLinkClass } from "@/lib/ui/nav-typography";

const SUBSECTIONS: {
  section: string;
  title: string;
  kicker: string;
  panelKickerEn: string;
  blurb?: string;
}[] = [
  {
    section: "Guisos",
    title: "Guisos / Stews",
    kicker: "01",
    panelKickerEn: "Stews",
    blurb: "Available as tacos, burritos, gorditas harina, or gorditas maíz.",
  },
  { section: "Desayunos", title: "Desayunos / Breakfast", kicker: "02", panelKickerEn: "Breakfast" },
  { section: "Caldos", title: "Caldos / Broths", kicker: "03", panelKickerEn: "Broths" },
];

const PANEL_COLORS: MenuCategoryColor[] = ["orange", "yellow", "red"];

function BreakfastPriceRow({ name, price }: { name: string; price: number | null }) {
  const priceStr = price === null ? "Pending" : `$${price.toFixed(2)}`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <p className="min-w-0 break-words text-base font-medium leading-snug text-cream">{name}</p>
      <p className="shrink-0 text-sm leading-snug text-cream/85 sm:pt-0.5">{priceStr}</p>
    </div>
  );
}

export function WeekendBreakfastSection() {
  const { data } = useMenuCatalog();
  const { addItem, openOrderPanel } = useOrder();
  const reduceMotion = useReducedMotion();
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef(SUBSECTIONS[0]!.section);
  const [swipeCueDismissed, setSwipeCueDismissed] = useState(false);
  const [activeSection, setActiveSection] = useState(SUBSECTIONS[0]!.section);
  const [meatItem, setMeatItem] = useState<MenuItem | null>(null);
  const [optionsItem, setOptionsItem] = useState<MenuItem | null>(null);

  const breakfastItems = useMemo(
    () =>
      (data?.items ?? []).filter(
        (i) => i.category.toLowerCase() === "weekend breakfast",
      ),
    [data],
  );

  const bySection = useMemo(() => {
    const m = new Map<string, MenuItem[]>();
    for (const s of SUBSECTIONS) {
      m.set(
        s.section,
        breakfastItems.filter(
          (i) => (i.section ?? "").toLowerCase() === s.section.toLowerCase(),
        ),
      );
    }
    return m;
  }, [breakfastItems]);

  const visibleSubsections = useMemo(
    () => SUBSECTIONS.filter((s) => (bySection.get(s.section) ?? []).length > 0),
    [bySection],
  );

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    if (!visibleSubsections.length) return;
    if (!visibleSubsections.some((s) => s.section === activeSection)) {
      setActiveSection(visibleSubsections[0]!.section);
    }
  }, [activeSection, visibleSubsections]);

  const activeMeta =
    visibleSubsections.find((s) => s.section === activeSection) ?? visibleSubsections[0] ?? null;
  const activeItems = activeMeta ? (bySection.get(activeMeta.section) ?? []) : [];
  const panelColor: MenuCategoryColor =
    PANEL_COLORS[
      Math.max(
        0,
        visibleSubsections.findIndex((s) => s.section === activeMeta?.section),
      ) % PANEL_COLORS.length
    ] ?? "orange";

  const onCategoryScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el || swipeCueDismissed) return;
    if (el.scrollLeft > 8) setSwipeCueDismissed(true);
  }, [swipeCueDismissed]);

  const selectSection = useCallback((section: string) => {
    if (activeSectionRef.current !== section) setSwipeCueDismissed(true);
    setActiveSection(section);
  }, []);

  const showSwipeCue = !swipeCueDismissed && visibleSubsections.length > 1;

  const handleAdd = (item: MenuItem) => {
    if (item.meatChoiceRequired) {
      setMeatItem(item);
      return;
    }
    if (itemRequiresOptionSelections(item)) {
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

  const onOptionsChosen = (selections: Record<string, string>) => {
    if (!optionsItem) return;
    addItem(optionsItem.id, { quantity: 1, selectedOptions: selections });
    openOrderPanel();
    setOptionsItem(null);
  };

  if (!breakfastItems.length || !visibleSubsections.length) return null;

  return (
    <div
      id="weekend-breakfast"
      className="scroll-mt-[calc(var(--nav-h)+16px)] mt-10 w-full max-w-full overflow-x-hidden bg-charcoal py-12 md:py-20"
    >
      <div className="mx-auto w-full max-w-full px-4 sm:px-5 md:px-8">
        <div
          id="weekend-breakfast-start"
          tabIndex={-1}
          className="w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-black/40 p-4 outline-none focus:outline-none sm:p-5 md:rounded-3xl md:p-10"
        >
          <p className={navPrimaryLinkClass}>Weekend Breakfast</p>
          <h2 className="mt-2 font-display text-3xl text-cream sm:text-4xl md:text-5xl">
            Desayuno de Fin de Semana
          </h2>
          <p className="mt-3 max-w-full text-sm leading-relaxed text-cream/70 md:max-w-2xl">
            Available Saturday &amp; Sunday. All prices confirmed at pickup — add to cart to send
            an order request.
          </p>

          {activeMeta ? (
            <div className="mt-10 grid w-full min-w-0 max-w-full grid-cols-1 gap-10 lg:mt-12 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
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
                    {visibleSubsections.map((sub) => (
                      <button
                        key={sub.section}
                        type="button"
                        onClick={() => selectSection(sub.section)}
                        className={cn(
                          "flex min-w-[220px] items-baseline justify-between rounded-2xl border px-4 py-4 text-left transition lg:min-w-0",
                          activeSection === sub.section
                            ? cn("bg-cream/95 text-charcoal", categoryActiveRing(panelColor))
                            : "border-white/10 bg-black/25 text-cream hover:border-white/25",
                        )}
                      >
                        <span className="font-display text-3xl">{sub.kicker}</span>
                        <span className="pl-4 text-xs uppercase tracking-editorial">{sub.title}</span>
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
                  <motion.div
                    key={activeMeta.section}
                    id="weekend-breakfast-panel"
                    tabIndex={-1}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className={cn(
                      "w-full min-w-0 max-w-full overflow-x-hidden rounded-3xl border-2 bg-black/35 p-4 sm:p-8",
                      menuPanelBorderClass(panelColor),
                    )}
                  >
                    <div className="grid min-w-0 w-full max-w-full grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="min-w-0 w-full max-w-full">
                        <p className={navPrimaryLinkClass}>
                          {activeMeta.kicker} / {activeMeta.panelKickerEn}
                        </p>
                        <h3 className="mt-2 font-display text-4xl text-cream">{activeMeta.title}</h3>
                        <p className="mt-4 text-sm leading-relaxed text-cream/75 sm:text-base">
                          {activeMeta.blurb ??
                            "Tap items on the right — choices open when required."}
                        </p>
                        <div
                          className={cn(
                            "relative mt-8 aspect-[4/3] w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br",
                            categoryHeroGradient(panelColor),
                          )}
                        >
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
                        </div>
                      </div>

                      <div className="min-w-0 w-full max-w-full space-y-4">
                        {activeItems.map((item) => {
                          const englishSub = englishSublineWithoutClock(item.englishName);
                          return (
                          <article
                            key={item.id}
                            className="w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-charcoal/50 p-4 sm:p-5"
                          >
                            <div className="flex min-w-0 flex-col gap-4 md:flex-row md:gap-4">
                              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:rounded-xl">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.imageAlt ?? item.name}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-editorial text-cream/40">
                                    LHL
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 w-full max-w-full flex-1">
                                <BreakfastPriceRow name={item.name} price={item.price} />
                                {englishSub ? (
                                  <p className="mt-0.5 break-words text-xs text-cream/55">
                                    {englishSub}
                                  </p>
                                ) : null}
                                {item.meatChoiceRequired ? (
                                  <span className="mt-1 inline-block max-w-full rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-editorial text-cream/75">
                                    Choice of meat
                                  </span>
                                ) : null}
                                {item.optionGroups?.some((g) => g.required) ? (
                                  <>
                                    <span className="mt-1 hidden max-w-full rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-editorial text-cream/75 md:inline-block">
                                      Choose options
                                    </span>
                                    <span className="mt-1 inline-block w-fit max-w-full rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs uppercase tracking-[0.12em] text-cream/75 md:hidden">
                                      Options
                                    </span>
                                  </>
                                ) : null}
                                {item.description ? (
                                  <p className="mt-2 break-words text-xs leading-relaxed text-cream/60">
                                    {item.description}
                                  </p>
                                ) : null}
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className={cn(
                                      "min-h-10 rounded-full bg-salsa px-4 py-2 text-[10px] font-semibold uppercase tracking-editorial text-cream hover:bg-salsa/90 md:px-5",
                                    )}
                                    onClick={() => handleAdd(item)}
                                  >
                                    Add
                                  </button>
                                  <button
                                    type="button"
                                    className="min-h-10 rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-editorial text-cream/80 hover:bg-white/5 md:px-5"
                                    onClick={() => openOrderPanel()}
                                  >
                                    Cart
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
                </AnimatePresence>
              </div>
            </div>
          ) : null}
        </div>
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
    </div>
  );
}
