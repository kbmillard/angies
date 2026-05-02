/**
 * Map nav / CTA section ids to elements at the **intro** of each section so
 * programmatic scroll does not land deep in cards or forms.
 */
export function resolveAnchorScrollId(id: string): string {
  switch (id) {
    case "menu":
      return "menu-start";
    case "locations":
      return "locations-start";
    case "schedule":
      return "schedule-start";
    /** Legacy anchor removed from page; land on schedule for hours-style intent */
    case "hours":
      return "schedule-start";
    case "catering":
      return "catering-start";
    case "weekend-breakfast":
      return "weekend-breakfast-start";
    default:
      return id;
  }
}

function readCssLengthAsPx(varName: string, fallback: number): number {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return fallback;
  const probe = document.createElement("div");
  probe.style.cssText = `position:fixed;left:-9999px;top:0;height:${raw};width:1px;visibility:hidden;pointer-events:none;box-sizing:border-box`;
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return Number.isFinite(h) && h > 0 ? h : fallback;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll so `elementId`'s top edge sits `offset` px below the fixed nav bar.
 */
export function scrollDocumentToAnchor(
  elementId: string,
  options?: { offset?: number },
): void {
  if (typeof window === "undefined") return;
  const el = document.getElementById(elementId);
  if (!el) return;

  const extra = options?.offset ?? 16;
  const navPx = readCssLengthAsPx("--nav-h", 68);
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY - navPx - extra;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}
