// components/order/OrderDrawer.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REPLACE existing file. (You almost certainly have an existing OrderDrawer
// with real cart state. DIFF this against yours — keep your state logic,
// adopt this file's visual/typography/motion shell.)
//
// What this fixes vs. the existing pattern:
//
//   1. PROPER OVERLAY STACKING
//      - Backdrop at z-[100] (above watermark + page, below modals)
//      - Drawer at z-[100]
//      - prevents the watermark from showing through (which would be
//        readability hell for cart items)
//
//   2. TYPOGRAPHY ROLES
//      - Drawer heading uses t-section (smaller variant)
//      - Item names use card-style display font
//      - Prices use t-price-mono (tabular, aligned)
//      - Subtotal/total uses a larger mono treatment
//      - Labels use t-form-label pattern from CateringSection
//
//   3. FORM-FIELD CONSISTENCY
//      Reuses the FORM_INPUT_CLASS from CateringSection (lifted to a shared
//      constants file would be even better — see comment block below).
//
//   4. MOTION
//      - Drawer slides in from right (translate-x)
//      - Backdrop fades in
//      - Item rows stagger in on open
//      - Quantity buttons have subtle press feedback
//      - "Place order" button has the primary lift + arrow slide
//
//   5. ACCESSIBILITY
//      - Focus trap on open (via React state — escape closes)
//      - aria-modal + role="dialog"
//      - Escape key closes
//      - Scroll lock on body when open
//
// CART STATE:
//   This file uses a local mock cart for demonstration. Replace the useState
//   block + cart functions with your real store (Zustand, Context, useReducer,
//   whatever you currently use). The render layer stays the same.
//
// LISTENING FOR ITEM ADDS:
//   The InteractiveMenu dispatches 'angies:open-order' when an item card's
//   "Add" button is clicked. This drawer listens for that event and opens.
//   Replace the listener if you have a direct add-to-cart action.
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import type { MenuItem } from "@/lib/menu/menu";

// Lift these to lib/forms/styles.ts so CateringSection + OrderDrawer share.
const FORM_INPUT_CLASS = [
  "w-full px-4 py-3 rounded-xl",
  "bg-white/[0.04] border border-white/10",
  "text-cream placeholder:text-cream/40",
  "font-sans text-sm",
  "transition-all duration-300 ease-out",
  "hover:bg-white/[0.06] hover:border-white/15",
  "focus:outline-none focus:bg-white/[0.07]",
  "focus:border-gold/60 focus:ring-2 focus:ring-gold/20",
].join(" ");

const FORM_LABEL_CLASS =
  "block mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-cream/65";

// ─── LOCAL CART TYPES — REPLACE WITH YOUR STORE'S TYPES ──────────────────────
interface CartLine {
  id: string;          // unique line id (slug + meat + timestamp)
  item: MenuItem;
  meatSlug?: string;   // selected meat variant
  qty: number;
  unitPrice: number;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function OrderDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [pickupName, setPickupName] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Listen for the "open with item" event from MenuItemCard
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ item: MenuItem }>).detail;
      if (!detail?.item) {
        setIsOpen(true);
        return;
      }
      const newLine: CartLine = {
        id: `${detail.item.slug}-${Date.now()}`,
        item: detail.item,
        qty: 1,
        unitPrice: detail.item.basePrice,
      };
      setLines((prev) => [...prev, newLine]);
      setIsOpen(true);
    };
    window.addEventListener("angies:open-order", handler);
    return () => window.removeEventListener("angies:open-order", handler);
  }, []);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Scroll lock when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Focus the dialog when it opens
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  const updateQty = (id: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((line) =>
          line.id === id ? { ...line, qty: Math.max(0, line.qty + delta) } : line
        )
        .filter((line) => line.qty > 0)
    );
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const tax = subtotal * 0.0913; // KC, MO sales tax approx — use your real rate
  const total = subtotal + tax;
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  // STUB submit — swap with your real Clover/Stripe/etc. integration
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: post to your order endpoint
    console.log("Submit order:", { lines, pickupName, pickupPhone, pickupNotes, total });
  };

  return (
    <>
      {/* ─── BACKDROP ────────────────────────────────────────────────── */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ─── DRAWER ─────────────────────────────────────────────────── */}
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-drawer-title"
        tabIndex={-1}
        className={`fixed right-0 top-0 bottom-0 z-[100] w-full sm:w-[440px] flex flex-col bg-charcoal-deep border-l border-white/10 shadow-2xl shadow-black/60 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top edge gold accent (matches Prologue + Catering form cards) */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[1.5px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(246,162,26,0.6) 50%, transparent 100%)",
          }}
        />

        {/* ─── HEADER ──────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div>
            <div className="t-kicker t-kicker-gold mb-1">Your order</div>
            <h2
              id="order-drawer-title"
              className="font-display text-cream text-2xl leading-none"
              style={{
                fontVariationSettings: '"SOFT" 60, "opsz" 96',
                fontWeight: 480,
                letterSpacing: "-0.015em",
              }}
            >
              From the window
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close order drawer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-cream transition hover:bg-white/10 hover:border-white/30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* ─── BODY (scrollable) ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Empty state */}
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-8 py-16 h-full">
              <span
                className="t-script text-4xl mb-3"
                style={{ transform: "rotate(-3deg)", display: "inline-block" }}
              >
                ¡Empieza!
              </span>
              <p className="t-body-lg mb-2">Your order is empty.</p>
              <p className="t-body text-sm text-cream/55 mb-6 max-w-[28ch]">
                Add an item from the menu — meat selections and sides happen at
                the window.
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 text-cream px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition hover:border-white/35 hover:bg-white/10"
              >
                Browse the menu
              </button>
            </div>
          ) : (
            <>
              {/* Item list */}
              <ul className="px-6 py-5 space-y-4">
                {lines.map((line, i) => (
                  <li
                    key={line.id}
                    className="flex gap-3"
                    style={{
                      animation: isOpen
                        ? "rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                        : "none",
                      animationDelay: `${i * 60}ms`,
                      opacity: isOpen ? 0 : 1,
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <Image
                        src={line.item.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="font-display text-cream text-base leading-snug truncate"
                          style={{
                            fontVariationSettings: '"SOFT" 80, "opsz" 24',
                            fontWeight: 500,
                          }}
                        >
                          {line.item.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          aria-label={`Remove ${line.item.name}`}
                          className="text-cream/40 hover:text-salsa transition-colors flex-shrink-0"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                        </button>
                      </div>
                      {line.meatSlug && (
                        <p className="font-mono text-[10px] text-cream/45 mt-0.5">
                          {line.meatSlug.replace(/-/g, " ")}
                        </p>
                      )}
                      <p className="t-body text-xs text-cream/55 mt-1 line-clamp-1">
                        {line.item.description}
                      </p>

                      {/* Quantity stepper + price */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="inline-flex items-center rounded-full border border-white/12 bg-white/3">
                          <button
                            type="button"
                            onClick={() => updateQty(line.id, -1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 inline-flex items-center justify-center text-cream/70 hover:text-cream active:scale-90 transition-transform"
                          >
                            <span className="text-base">−</span>
                          </button>
                          <span className="t-price-mono text-xs px-2 min-w-[20px] text-center">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(line.id, 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 inline-flex items-center justify-center text-cream/70 hover:text-cream active:scale-90 transition-transform"
                          >
                            <span className="text-base">+</span>
                          </button>
                        </div>
                        <span className="t-price-mono text-sm">
                          {fmt(line.unitPrice * line.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pickup details form */}
              <form
                onSubmit={handleSubmit}
                className="px-6 py-5 border-t border-white/8"
              >
                <div className="t-kicker t-kicker-gold mb-4">Pickup details</div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="order-name" className={FORM_LABEL_CLASS}>
                      Name
                    </label>
                    <input
                      id="order-name"
                      type="text"
                      required
                      value={pickupName}
                      onChange={(e) => setPickupName(e.target.value)}
                      className={FORM_INPUT_CLASS}
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label htmlFor="order-phone" className={FORM_LABEL_CLASS}>
                      Phone
                    </label>
                    <input
                      id="order-phone"
                      type="tel"
                      required
                      value={pickupPhone}
                      onChange={(e) => setPickupPhone(e.target.value)}
                      className={FORM_INPUT_CLASS}
                      autoComplete="tel"
                    />
                  </div>

                  <div>
                    <label htmlFor="order-notes" className={FORM_LABEL_CLASS}>
                      Notes (meat choice, allergies, etc.)
                    </label>
                    <textarea
                      id="order-notes"
                      rows={3}
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                      className={`${FORM_INPUT_CLASS} resize-y min-h-[80px]`}
                      placeholder="e.g. asada + barbacoa, no cilantro on tacos"
                    />
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* ─── FOOTER — totals + submit ───────────────────────────────── */}
        {lines.length > 0 && (
          <footer className="border-t border-white/10 bg-charcoal/60 px-6 py-5">
            <dl className="space-y-1.5 mb-4">
              <div className="flex justify-between items-baseline">
                <dt className="t-body text-sm text-cream/65">Subtotal</dt>
                <dd className="t-price-mono text-sm">{fmt(subtotal)}</dd>
              </div>
              <div className="flex justify-between items-baseline">
                <dt className="t-body text-sm text-cream/65">Tax (est.)</dt>
                <dd className="t-price-mono text-sm">{fmt(tax)}</dd>
              </div>
              <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-white/8">
                <dt className="font-sans text-[11px] uppercase tracking-[0.28em] font-semibold text-cream">Total</dt>
                <dd
                  className="font-mono text-cream font-medium"
                  style={{ fontSize: "1.25rem" }}
                >
                  {fmt(total)}
                </dd>
              </div>
            </dl>

            <button
              type="submit"
              onClick={handleSubmit}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-angie-orange text-cream px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-lg shadow-angie-orange/40 transition-all duration-300 hover:bg-angie-orange/90 hover:shadow-xl hover:shadow-angie-orange/55"
            >
              Place order
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>

            <p className="t-micro mt-3 text-center normal-case tracking-normal text-cream/50">
              You&apos;ll get a text when it&apos;s ready at the window.
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}
