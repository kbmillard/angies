import type { MenuCategoryColor } from "./schema";

/** Active category tile — matches hero/outline CTA (cream ring on charcoal). */
export function categoryActiveRing(color: MenuCategoryColor): string {
  void color;
  return "ring-2 ring-cream/50";
}

/** In-panel hero plate — charcoal-first like the hero image wash, subtle accent tint only. */
export function categoryHeroGradient(color: MenuCategoryColor): string {
  switch (color) {
    case "cyan":
      return "from-accent-cyan/12 via-charcoal to-charcoal";
    case "green":
      return "from-accent-green/12 via-charcoal to-charcoal";
    case "yellow":
      return "from-accent-yellow/12 via-charcoal to-charcoal";
    case "pink":
      return "from-accent-pink/12 via-charcoal to-charcoal";
    case "orange":
      return "from-accent-orange/12 via-charcoal to-charcoal";
    case "red":
      return "from-accent-red/12 via-charcoal to-charcoal";
    default:
      return "from-white/5 via-charcoal to-charcoal";
  }
}

/** Visible frame on the right-hand menu panel when a category is selected (restored accent “outer line”). */
export function menuPanelBorderClass(color: MenuCategoryColor): string {
  switch (color) {
    case "cyan":
      return "border-accent-cyan/55";
    case "green":
      return "border-accent-green/55";
    case "yellow":
      return "border-accent-yellow/65";
    case "pink":
      return "border-accent-pink/55";
    case "orange":
      return "border-accent-orange/60";
    case "red":
      return "border-accent-red/55";
    default:
      return "border-white/25";
  }
}
