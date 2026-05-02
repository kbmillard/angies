"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMenuCatalog } from "@/context/MenuCatalogContext";
import { useOrder } from "@/context/OrderContext";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { MenuItem } from "@/lib/menu/schema";
import { itemRequiresOptionSelections } from "@/lib/menu/option-groups";

export function PopularOrders() {
  const { data, loading } = useMenuCatalog();
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const { addItem, openOrderPanel, scrollToSection } = useOrder();

  const tiles = useMemo(() => {
    if (!data) return [];
    if (data.featuredItems.length > 0) return data.featuredItems;
    return data.items.slice(0, 6);
  }, [data]);

  return (
    <section id="popular" className="relative z-10 bg-charcoal/45 py-24 backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <SectionHeading
          kicker="Popular orders"
          title="Featured picks from the street."
          align="center"
          subtitle="Featured picks from the menu — tacos, birria, burritos, and fresh waters."
        />

        {loading || !data ? (
          <div className="mt-14 grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-3xl bg-white/10" />
            ))}
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenItem(item)}
                className="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 text-left"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={`${item.name} — popular order`}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-charcoal" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-xs uppercase tracking-editorial text-cream">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {openItem ? (
          <motion.div
            className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setOpenItem(null)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="relative z-[76] w-full max-w-lg rounded-t-3xl border border-white/10 bg-charcoal p-6 shadow-2xl sm:rounded-3xl"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-cream"
                onClick={() => setOpenItem(null)}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
                {openItem.imageUrl ? (
                  <Image
                    src={openItem.imageUrl}
                    alt={`${openItem.name}`}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <p className="text-xs uppercase tracking-editorial text-cream/60">
                {openItem.category}
              </p>
              <h3 className="mt-1 font-display text-3xl text-cream">{openItem.name}</h3>
              <p className="mt-3 text-sm text-cream/75">{openItem.description}</p>
              <p className="mt-4 text-lg font-semibold text-cream">
                {openItem.price === null ? "TBD" : `$${openItem.price.toFixed(2)}`}
              </p>
              <button
                type="button"
                className="mt-6 w-full rounded-full bg-salsa py-3 text-sm font-semibold uppercase tracking-editorial text-cream"
                onClick={() => {
                  if (openItem.meatChoiceRequired || itemRequiresOptionSelections(openItem)) {
                    setOpenItem(null);
                    scrollToSection("menu");
                    return;
                  }
                  addItem(openItem.id, { quantity: 1 });
                  openOrderPanel();
                  setOpenItem(null);
                }}
              >
                {openItem.meatChoiceRequired || itemRequiresOptionSelections(openItem)
                  ? "Go to menu to choose options"
                  : "Add to order"}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
