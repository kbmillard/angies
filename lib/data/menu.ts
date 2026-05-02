/**
 * Compatibility re-exports — canonical menu lives under `lib/menu/`.
 */
export type {
  MenuItem,
  MenuOptionGroup,
  MenuCatalogResponse,
  MenuResponse,
  MenuCategoryColor,
} from "@/lib/menu/schema";
export { MENU_CATEGORY_ORDER, meatChoices } from "@/lib/menu/schema";
export { MENU_CATEGORY_META } from "@/lib/menu/category-meta";
export { localMenuItems } from "@/lib/menu/local-menu";
