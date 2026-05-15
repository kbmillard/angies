/**
 * Final menu art in `public/menu/menu_final/`.
 * Basename (without extension) matches the dish photo label.
 */
export const MENU_FINAL_FILES = [
  "Breakfast burrito.png",
  "Burrito.png",
  "California burrito.png",
  "Cemita.png",
  "Chilaquiles.png",
  "Quesabirria.png",
  "Quesadilla.png",
  "Taco birrias.png",
  "Taco de canasta.png",
  "tacos.png",
  "Tostada.png",
] as const;

export type MenuFinalFile = (typeof MENU_FINAL_FILES)[number];

/** Public URL for a file under `menu_final` (spaces encoded). */
export function menuFinalSrc(file: MenuFinalFile): string {
  return `/menu/menu_final/${encodeURIComponent(file)}`;
}

/** Human label from filename, e.g. `Chilaquiles.png` → `Chilaquiles`. */
export function menuFinalLabel(file: MenuFinalFile): string {
  const base = file.replace(/\.[^/.]+$/, "");
  if (base === "tacos") return "Tacos";
  return base;
}
