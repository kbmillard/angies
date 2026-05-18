// components/backdrop/FixedBrandBackdrop.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REFERENCE IMPLEMENTATION — you likely have this file already. Diff against
// your current version; merge what's useful. The key contract is:
//
//   - position: fixed
//   - inset: 0 (or fills viewport)
//   - z-index: 0
//   - pointer-events: none
//   - opacity ~6% on the logo
//   - sits BENEATH the marquee, nav, and all page content
//   - sits ABOVE the body background color (so its own bg is transparent)
//
// This component must render exactly ONCE per page. Rendering it twice causes
// double-opacity stacking. Keep it at the root of the home page (or in the
// app/layout if it should appear on every route).
// ──────────────────────────────────────────────────────────────────────────────

import Image from "next/image";

interface FixedBrandBackdropProps {
  /** Logo src. Defaults to the public path. */
  src?: string;
  /** Opacity 0..1. Default 0.06. Higher feels heavy; lower disappears in glass sections. */
  opacity?: number;
  /** Tailwind sizing on the logo. Default 68vmin (vw/vh smaller dimension). */
  sizeClass?: string;
}

export default function FixedBrandBackdrop({
  src = "/images/brand/site-logo.webp",
  opacity = 0.06,
  sizeClass = "w-[68vmin] h-[68vmin]",
}: FixedBrandBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center"
    >
      <div
        className={`${sizeClass} relative -translate-y-[4%]`}
        style={{
          opacity,
          filter: "saturate(1.15) contrast(1.05)",
        }}
      >
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="68vmin"
          className="object-contain"
        />
      </div>
    </div>
  );
}
