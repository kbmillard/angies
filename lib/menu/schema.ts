export type MenuOptionGroup = {
  id: string;
  label: string;
  required: boolean;
  /** When true, customer may pick multiple options in this group (optional groups only in practice). */
  multiple?: boolean;
  options: string[];
};

export type MenuItem = {
  id: string;
  active: boolean;
  category: string;
  /** Subsection within category */
  section?: string;
  sortOrder: number;
  name: string;
  englishName?: string;
  description?: string;
  /** Dollar amount from sheet when priced; null until confirmed */
  price: number | null;
  includesFries: boolean;
  meatChoiceRequired: boolean;
  featured: boolean;
  imageUrl?: string;
  imageAlt?: string;
  availabilityLabel?: string;
  /** Required/optional choices */
  optionGroups?: MenuOptionGroup[];
  /**
   * When set, cart uses this USD price for the line when the customer’s meat choice
   * matches the key (exact string in the required `meat` option group, or `selectedMeat`).
   */
  meatOptionPrices?: Record<string, number>;
};

export type MenuCategoryMeta = {
  id: string;
  label: string;
  /** Small "01 / …" line above the category title */
  panelKickerEn: string;
  subtitle: string;
  color: MenuCategoryColor;
  number: string;
};

export type MenuCategoryColor =
  | "cyan"
  | "green"
  | "yellow"
  | "pink"
  | "orange"
  | "red";

export type MenuCatalogSource = "google-sheet" | "local-fallback" | "database";

export type MenuCatalogResponse = {
  categories: string[];
  items: MenuItem[];
  featuredItems: MenuItem[];
  source: MenuCatalogSource;
  updatedAt: string;
};

/** API alias — same shape as `MenuCatalogResponse`. */
export type MenuResponse = MenuCatalogResponse;

export const MENU_CATEGORY_ORDER = [
  "Tacos",
  "Burritos",
  "Quesadillas",
  "Classics",
] as const;

/** Fallback meat labels for legacy meat modal when `optionGroups` are absent (prefer DB-driven menu). */
export const meatChoices = [
  "Asada (Steak)",
  "Pastor (Pork)",
  "Chicken",
  "Chorizo with Potatoes",
  "Milanesa de pollo (Fried Chicken Breast)",
  "Barbacoa (Beef) (+$0.50)",
  "Lengua (Tongue) (+$1.00)",
  "With meat (any style — specify at window)",
] as const;

/** Price in dollars → cents for cart math; null stays null */
export function priceDollarsToCents(price: number | null): number | null {
  if (price === null || Number.isNaN(price)) return null;
  return Math.round(price * 100);
}
