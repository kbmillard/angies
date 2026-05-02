/** Removes clock ranges from sheet copy so cards never show "8 AM – 4 PM" style lines. */
export function stripClockFromLabel(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  let s = raw.trim();
  s = s.replace(
    /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM)\s*[–—-]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)\b/gi,
    "",
  );
  s = s.replace(/\b\d{1,2}(?::\d{2})?\s*(?:AM|PM)\b/gi, "");
  s = s.replace(/\s*[–—-]\s*(?=[,\s]|$)/g, " ");
  s = s.replace(/\s*,\s*,/g, ",").replace(/^[,.\s·]+|[,.\s·]+$/g, "").trim();
  s = s.replace(/\s{2,}/g, " ");
  if (!s || s.length < 3) return null;
  return s;
}

/** Secondary line (e.g. englishName): drop time-only strings; otherwise keep non-time copy. */
export function englishSublineWithoutClock(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const stripped = stripClockFromLabel(raw);
  if (stripped) return stripped;
  if (!/\b\d{1,2}\s*(?::\d{2})?\s*(?:am|pm)\b|\b(?:am|pm)\b/i.test(raw)) return raw.trim();
  return null;
}
