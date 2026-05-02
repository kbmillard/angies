"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useOrder } from "@/context/OrderContext";
import { cn } from "@/lib/utils/cn";

const LINKS: { label: string; id: string }[] = [
  { label: "Menu", id: "menu" },
  { label: "Location", id: "locations" },
  { label: "Schedule", id: "schedule" },
  { label: "Story", id: "story" },
  { label: "Gallery", id: "gallery" },
  { label: "Catering", id: "catering" },
  { label: "Contact", id: "contact" },
];

export function EditorialNav() {
  const { scrollToSection, openOrderPanel } = useOrder();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const ids = LINKS.map((l) => l.id);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0.15, 0.35, 0.55] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const close = useCallback(() => setOpen(false), []);

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
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    onChange();
    return () => mq.removeEventListener("change", onChange);
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

  useEffect(() => {
    if (!open) {
      menuButtonRef.current?.focus();
      return;
    }
    const t = window.requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        "button[data-mobile-nav-link]",
      );
      first?.focus();
    });
    return () => window.cancelAnimationFrame(t);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToSection(id);
      });
    });
  };

  const openOrderFromMenu = () => {
    setOpen(false);
    openOrderPanel();
  };

  const backdropTransition = reduceMotion ? { duration: 0.15 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };
  const panelTransition = reduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.85 };

  const mobileOverlay =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open ? (
          <div
            className="pointer-events-none fixed inset-0 z-[58] max-w-[100vw] overflow-hidden lg:hidden"
            aria-hidden={!open}
          >
            <motion.button
              key="mobile-nav-backdrop"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropTransition}
              aria-label="Close menu"
              className="pointer-events-auto fixed left-0 right-0 top-[var(--nav-h)] bottom-0 z-[58] bg-black/70 backdrop-blur-md"
              onClick={close}
            />
            <motion.nav
              id="mobile-nav-panel"
              key="mobile-nav-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
              transition={panelTransition}
              className="pointer-events-auto fixed left-4 right-4 top-[calc(var(--nav-h)+6px)] z-[59] flex max-h-[calc(100dvh-120px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c121f]/92 shadow-2xl backdrop-blur-xl"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <span id={titleId} className="sr-only">
                Site navigation
              </span>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
                <ul className="flex flex-col">
                  {LINKS.map((l, i) => (
                    <motion.li
                      key={l.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduceMotion ? { duration: 0 } : { delay: 0.03 + i * 0.025, duration: 0.2 }
                      }
                    >
                      <button
                        type="button"
                        data-mobile-nav-link
                        className="flex w-full items-center border-b border-white/10 py-4 text-left text-sm font-medium uppercase tracking-editorial text-cream transition hover:bg-white/5 active:bg-white/10"
                        onClick={() => go(l.id)}
                      >
                        {l.label}
                      </button>
                    </motion.li>
                  ))}
                </ul>
                <button
                  type="button"
                  data-mobile-nav-link
                  className="mt-4 w-full rounded-full bg-salsa py-4 text-center text-xs font-semibold uppercase tracking-editorial text-cream shadow-lg transition hover:bg-salsa/90"
                  onClick={openOrderFromMenu}
                >
                  Order now
                </button>
              </div>
            </motion.nav>
          </div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  const left = LINKS.slice(0, 3);
  const right = LINKS.slice(3);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-midnight/85 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--nav-h)] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex flex-1 items-center justify-start gap-2 sm:gap-4">
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/10 p-2 text-cream transition hover:bg-white/5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={open ? "mobile-nav-panel" : undefined}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
          <nav className="hidden flex-wrap items-center gap-x-3 gap-y-2 lg:flex" aria-label="Primary">
            {left.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => go(l.id)}
                className={cn(
                  "text-[10px] uppercase tracking-editorial text-cream/70 transition hover:text-cream sm:text-[11px]",
                  active === l.id && "text-cream",
                )}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => scrollToSection("hero")}
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
          aria-label="Scroll to top"
        >
          <BrandLogo width={44} height={44} priority className="hidden sm:block" />
          <BrandLogo width={40} height={40} priority className="sm:hidden" />
        </button>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <nav className="hidden flex-wrap items-center justify-end gap-x-3 lg:flex" aria-label="Secondary">
            {right.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => go(l.id)}
                className={cn(
                  "text-[10px] uppercase tracking-editorial text-cream/70 transition hover:text-cream sm:text-[11px]",
                  active === l.id && "text-cream",
                )}
              >
                {l.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={openOrderPanel}
            className={cn(
              "rounded-full bg-salsa px-4 py-2 text-[10px] font-semibold uppercase tracking-editorial text-cream shadow-md transition hover:bg-salsa/90 sm:text-[11px]",
              open && "max-lg:hidden",
            )}
          >
            Order now
          </button>
        </div>
      </div>

      {mobileOverlay}
    </header>
  );
}
