# Angie’s menu — research notes

## Sources (no unauthorized scraping)

- Owner / client prompt (`prompt/angies_food_truck_one_page_cursor_prompt.txt`) listing public menu signals: fish tacos, birria/beef birria, burrito (12″ flour tortilla, cheese, rice, beans, meat, salsa), horchata, mango fresh water, aguas frescas, daily specials, Mexican food truck positioning.
- Public business profile fields in the same prompt (Facebook / Instagram URLs, phone, Linwood address).

## What is **not** sourced

- Exact prices — left `null` / **TBD** until owner confirmation.
- Full official menu PDF or Facebook menu tab — not retrieved in this build; Google Sheet remains the owner-editable source of truth.

## Fallback catalog

Implemented in `lib/menu/local-menu.ts` with categories: Tacos, Birria, Burritos, Aguas Frescas, Specials, Sides, Catering. Burrito carries a required **Meat** option group (Asada, Pastor, Chicken, Birria, Other / Confirm) per prompt.

When a fuller public menu is confirmed, update:

1. `prompt/google-sheet-menu-template.csv`
2. Published menu CSV referenced by `MENU_CSV_URL` / `NEXT_PUBLIC_MENU_CSV_URL`
3. Remove or adjust fallback rows in `local-menu.ts` as needed.
