import { cn } from "@/lib/utils/cn";

/** Shared glass pill — matches nav / hero editorial button typography. */
export const glassCtaBase =
  "inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-editorial text-cream backdrop-blur-sm transition hover:border-white/35 hover:bg-white/10";

export const glassCtaAccent =
  "inline-flex items-center justify-center rounded-full border border-angie-orange/45 bg-angie-orange/15 px-6 py-3 text-xs font-semibold uppercase tracking-editorial text-cream backdrop-blur-sm transition hover:border-angie-orange/60 hover:bg-angie-orange/25";

export function glassCtaClass(...extra: (string | false | undefined)[]) {
  return cn(glassCtaBase, ...extra);
}
