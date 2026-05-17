/** Local menu catalog — built from `public/menu/menu.json` when DB is empty (dev / edge). */
import { loadBundledMenuItems } from "@/lib/menu/menu-from-import";

export const localMenuItems = loadBundledMenuItems();
