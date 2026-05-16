-- One-time cleanup: legacy scaffold item "Fish Tacos" (slug tacos-fish) is not on the owner's menu.
-- Run in Neon SQL Editor or: psql "$DATABASE_URL" -f scripts/deactivate-legacy-fish-tacos-item.sql

-- Relational menu (JSON import / catalog_menu_items)
UPDATE catalog_menu_items
SET active = FALSE, updated_at = NOW()
WHERE slug = 'tacos-fish';

-- Legacy flat menu row (menu_items), if present
UPDATE menu_items
SET active = FALSE, updated_at = NOW()
WHERE id = 'tacos-fish';
