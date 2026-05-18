/** Shared form field styles (catering + order drawer). */

export const FORM_INPUT_CLASS = [
  "w-full px-4 py-3 rounded-xl",
  "bg-white/[0.04] border border-white/10",
  "text-cream placeholder:text-cream/40",
  "font-sans text-sm",
  "transition-all duration-300 ease-out",
  "hover:bg-white/[0.06] hover:border-white/15",
  "focus:outline-none focus:bg-white/[0.07]",
  "focus:border-gold/60 focus:ring-2 focus:ring-gold/20",
].join(" ");

export const FORM_LABEL_CLASS =
  "block mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-cream/65";
