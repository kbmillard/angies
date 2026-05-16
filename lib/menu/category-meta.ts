import type { MenuCategoryMeta } from "./schema";

/**
 * Editorial styling for menu category tabs. Labels must match `category` / DB category names.
 */
export const MENU_CATEGORY_META: MenuCategoryMeta[] = [
  {
    id: "tacos",
    label: "Tacos",
    panelKickerEn: "Street & birria",
    subtitle: "Street tacos, tacos de canasta, and tacos de birria — built at the window.",
    color: "red",
    number: "01",
  },
  {
    id: "burritos",
    label: "Burritos",
    panelKickerEn: "12″ builds",
    subtitle: "Classic, breakfast, and California — choose your meat when it applies.",
    color: "yellow",
    number: "02",
  },
  {
    id: "quesadillas",
    label: "Quesadillas",
    panelKickerEn: "Melted cheese",
    subtitle: "Quesadilla and quesabirria with consommé for dipping.",
    color: "orange",
    number: "03",
  },
  {
    id: "classics",
    label: "Classics",
    panelKickerEn: "Torta & more",
    subtitle: "Cemita, tostada, and chilaquiles — bold plates from the classics line.",
    color: "pink",
    number: "04",
  },
];
