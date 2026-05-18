// components/nav/EditorialNav.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REPLACE existing file.
//
// What changed from the screenshot:
//
//   1. BALANCED LAYOUT
//      Old:  STORY MENU LOCATION    [LOGO]    CATERING CONTACT  [MENU]
//            (3 links left, 2 links right + pill — uneven)
//      New:  STORY MENU LOCATION    [LOGO]    CATERING CONTACT  [MENU]
//            with proper flex-1 spacing on each side, so the logo is
//            mathematically centered regardless of link count
//
//   2. TYPOGRAPHY
//      Links use t-kicker (same micro-uppercase pattern as the rest of the
//      site). Brand wordmark next to logo uses Fraunces italic — echoes
//      the script feel of the actual logo's hand-lettering.
//
//   3. MENU PILL
//      Now has a pulsing dot (matches the OPEN status indicator on the
//      location section). Same ring-pulse keyframe.
//
//   4. MOBILE
//      Below md (768px) the link rows hide, leaving just [LOGO] + [MENU pill].
//      Hamburger toggle reveals a slide-down panel with the full nav.
//      The pill stays visible — it's the primary conversion path.
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const LEFT_LINKS = [
  { href: "#story",    label: "Story" },
  { href: "#menu",     label: "Menu" },
  { href: "#location", label: "Location" },
];

const RIGHT_LINKS = [
  { href: "#catering", label: "Catering" },
  { href: "#contact",  label: "Contact" },
];

export default function EditorialNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-50 w-full border-b border-white/8 bg-midnight/85 backdrop-blur-md"
    >
      <div className="relative mx-auto flex h-[4.5rem] max-w-7xl items-center px-5 sm:px-8">

        {/* ─── LEFT LINK GROUP ───────────────────────────────────────── */}
        <ul className="hidden md:flex flex-1 items-center justify-start gap-8">
          {LEFT_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="t-kicker text-cream/70 hover:text-cream relative py-2 transition-colors"
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-350 ease-out group-hover:scale-x-100"
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* ─── CENTER BRAND ──────────────────────────────────────────── */}
        <Link
          href="/"
          aria-label="Angie's Food Truck — home"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2.5 md:static md:translate-x-0 md:translate-y-0 md:mx-6"
        >
          <Image
            src="/images/brand/site-logo.webp"
            alt=""
            width={44}
            height={44}
            priority
            className="h-10 w-auto sm:h-11"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))" }}
          />
          <span
            className="hidden sm:inline font-display italic text-cream tracking-tight text-lg"
            style={{
              fontVariationSettings: '"SOFT" 100, "opsz" 48',
              fontWeight: 500,
            }}
          >
            Angie&apos;s
          </span>
        </Link>

        {/* ─── RIGHT LINK GROUP + MENU PILL ──────────────────────────── */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-8">
          <ul className="flex items-center gap-8">
            {RIGHT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="t-kicker text-cream/70 hover:text-cream relative py-2 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="#menu"
            className="group inline-flex items-center gap-2 rounded-full bg-angie-orange text-cream px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-lg shadow-angie-orange/40 transition-all duration-300 hover:bg-angie-orange/90 hover:-translate-y-0.5 hover:scale-[1.03]"
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-cream animate-ring-pulse" />
            Order menu
          </Link>
        </div>

        {/* ─── MOBILE: hamburger + pill (logo stays centered) ────────── */}
        <div className="md:hidden flex flex-1 items-center justify-between">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-cream transition hover:bg-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6"  x2="6"  y2="18" />
                  <line x1="6"  y1="6"  x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          <Link
            href="#menu"
            className="inline-flex items-center gap-2 rounded-full bg-angie-orange text-cream px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] shadow-lg shadow-angie-orange/40"
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-cream animate-ring-pulse" />
            Menu
          </Link>
        </div>
      </div>

      {/* ─── MOBILE PANEL ─────────────────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden border-t border-white/8 transition-[max-height,opacity] duration-300 ease-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-5 py-4 gap-1 bg-midnight/95">
          {[...LEFT_LINKS, ...RIGHT_LINKS].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="t-kicker text-cream/80 hover:text-cream block py-3 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
