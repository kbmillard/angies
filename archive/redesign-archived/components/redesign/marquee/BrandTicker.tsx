// components/marquee/BrandTicker.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Top-of-page marquee ticker. Sits ABOVE the nav.
//
// Server component — pure CSS animation, no interactivity.
// Reduced motion handled globally in globals.css.
//
// USAGE: Render once at the top of components/home/HomeView.tsx, BEFORE
// <EditorialNav />.
// ──────────────────────────────────────────────────────────────────────────────

import React from "react";

const ITEMS = [
  "Fresh tacos",
  "Birria",
  "Burritos",
  "Aguas frescas",
  "Daily specials",
  "Kansas City local",
];

// Star icon as a separator between brand words.
function Sep({ variant }: { variant: "star" | "dot" }) {
  if (variant === "star") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="inline-block shrink-0"
      >
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
      </svg>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="inline-block shrink-0"
    >
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function TrackContent() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="inline-flex items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.28em] font-sans"
        >
          {item}
          <Sep variant={i % 2 === 0 ? "star" : "dot"} />
        </span>
      ))}
    </>
  );
}

export default function BrandTicker() {
  return (
    <div
      className="relative z-[60] bg-angie-orange text-charcoal overflow-hidden border-b border-black/10"
      aria-hidden="true"
    >
      {/* Two identical copies of the track, each 50% wide, side by side.
          The keyframe shifts the whole flex container by -50%, creating an
          infinite seamless loop. */}
      <div
        className="flex w-max gap-12 py-2.5 whitespace-nowrap animate-marquee"
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center gap-12">
          <TrackContent />
        </div>
        <div className="flex items-center gap-12">
          <TrackContent />
        </div>
      </div>
    </div>
  );
}
