"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { label: "Story", id: "story" },
  { label: "Menu", id: "menu" },
  { label: "Location", id: "locations" },
  { label: "Catering", id: "catering" },
  { label: "Contact", id: "contact" },
] as const;

export function EditorialNav() {
  const { scrollToSection } = useOrder();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  const go = (id: string) => {
    close();
    requestAnimationFrame(() => scrollToSection(id));
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const backdropTransition = reduceMotion ? { duration: 0.15 } : { duration: 0.22 };
  const panelTransition = reduceMotion ? { duration: 0.15 } : { type: "spring" as const, stiffness: 420, damping: 34 };

  const mobileOverlay =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-nav"
            className="fixed inset-0 z-[58] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              aria-label="Close menu"
              onClick={close}
            />
            <motion.nav
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={panelTransition}
              className="absolute left-4 right-4 top-[calc(var(--nav-h)+var(--ticker-h,2.5rem)+8px)] rounded-3xl border border-white/10 bg-[#0c121f]/95 p-6 shadow-2xl backdrop-blur-xl"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <span id={titleId} className="sr-only">
                Site navigation
              </span>
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className="w-full border-b border-white/10 py-3 text-left text-sm font-medium uppercase tracking-editorial text-cream hover:text-gold"
                      onClick={() => go(l.id)}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-midnight/[0.88] backdrop-blur-[14px]">
      <div className="mx-auto flex h-[var(--nav-h)] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex shrink-0 rounded-full border border-white/10 p-2 text-cream hover:bg-white/5 min-[880px]:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            className="nav__brand inline-flex min-w-0 items-center gap-3"
            aria-label="Scroll to top"
          >
            <Image
              src="/images/brand/site-logo.webp"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-auto shrink-0"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))" }}
            />
            <span
              className="hidden font-display text-lg italic text-cream sm:inline"
              style={{ fontVariationSettings: '"SOFT" 100', fontWeight: 500 }}
            >
              Angie&apos;s
            </span>
          </button>
        </div>

        <nav className="hidden min-[880px]:flex flex-1 items-center justify-center gap-9" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(l.id)}
              className="group relative py-2 font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-cream/70 transition-colors hover:text-cream"
            >
              {l.label}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => go("menu")}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-angie-orange px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-cream shadow-[0_8px_20px_-8px_rgba(247,84,45,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_14px_28px_-8px_rgba(247,84,45,0.7)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cream animate-ring-pulse" aria-hidden />
          Order menu
        </button>
      </div>

      {mobileOverlay}
    </header>
  );
}
