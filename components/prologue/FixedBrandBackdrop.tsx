"use client";

import Image from "next/image";

const LOGO = "/images/brand/site-logo.webp";

/**
 * Stays fixed under the scrolling homepage (below the nav). Hero sits above it;
 * translucent sections use bg-charcoal/45 + blur so this mark stays visible.
 * Do not regress to opaque section backgrounds — see .cursor/rules/gringos-backdrop.mdc
 */
export function FixedBrandBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 top-[var(--nav-h)] z-0 bg-charcoal"
      aria-hidden
    >
      <div className="flex h-full w-full items-center justify-center pb-20 pt-8 sm:pb-24 sm:pt-10">
        <div className="relative aspect-square h-[min(68vmin,480px)] w-[min(68vmin,480px)] max-h-[62svh] max-w-[92vw] -translate-y-[6%] sm:h-[min(72vmin,540px)] sm:w-[min(72vmin,540px)] sm:max-h-[58svh] sm:-translate-y-[8%] md:-translate-y-[10%]">
          <Image
            src={LOGO}
            alt=""
            fill
            className="object-contain object-center opacity-[0.34] brightness-[1.04] saturate-[1.05] contrast-[1.02] sm:opacity-[0.42]"
            sizes="(max-width: 768px) 90vw, 560px"
          />
        </div>
      </div>
    </div>
  );
}
