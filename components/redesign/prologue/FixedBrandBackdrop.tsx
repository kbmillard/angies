"use client";

import Image from "next/image";

const LOGO = "/images/brand/site-logo.webp";

export function FixedBrandBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 top-[var(--header-stack-h)] z-0 flex items-center justify-center"
    >
      <div
        className="relative aspect-square w-[min(68vmin,480px)] max-h-[62svh] max-w-[92vw] -translate-y-[4%] sm:w-[min(72vmin,540px)] sm:max-h-[58svh]"
        style={{
          opacity: 0.06,
          filter: "saturate(1.15) contrast(1.05)",
        }}
      >
        <Image
          src={LOGO}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}
