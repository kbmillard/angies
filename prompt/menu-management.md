# Menu management (Google Sheets)

## Restaurant workflow

1. Open the Google Sheet that backs the published CSV.
2. Add or edit rows using the columns below.
3. Set `active` to TRUE or FALSE to show or hide an item.
4. Add numeric `price` values when the kitchen confirms pricing (use dollars, e.g. `12.99`).
5. Set `featured` to TRUE for items that should appear in the Popular Orders grid.
6. Wait up to **5 minutes** for the live site to pick up changes (ISR cache). Lower `revalidate` in `app/api/menu/route.ts` or the `fetch` call in `lib/menu/get-menu.ts` if you need faster refresh during service.

## Publish Sheet as CSV

1. In Google Sheets: **File → Share → Publish to web**.
2. Select the menu tab.
3. Choose **CSV** as format.
4. Copy the published URL.
5. Add it to Vercel (and locally in `.env.local`) as **`MENU_CSV_URL`** (preferred). `NEXT_PUBLIC_MENU_CSV_URL` is also read server-side but the browser only calls `/api/menu`, so the sheet URL does not need to be public.

## Column reference

| Column | Notes |
| --- | --- |
| id | Optional stable id for URLs and cart; if blank, generated from category + name |
| active | TRUE/FALSE, yes/no, 1/0 |
| category | Main board: Hamburguesas, Tacos, Tortas, Antojitos, Kids Menu, Drinks. Also **`Weekend Breakfast`** for the weekend section (see below). |
| section | Optional. For **Weekend Breakfast**, use `Guisos`, `Desayunos`, or `Caldos`. |
| sortOrder | Number, lower first within category (and section for weekend rows) |
| name | Item display name |
| englishName | Optional English subtitle (shown on weekend breakfast cards) |
| description | Optional |
| price | Blank → Price TBD; number → dollars |
| includesFries | TRUE for burgers with fries |
| meatChoiceRequired | TRUE forces meat picker before add-to-cart |
| featured | TRUE surfaces item in Popular Orders |
| imageUrl | Optional absolute image URL (add hostname to `next.config` if needed) |
| imageAlt | Optional alt text for `imageUrl` |
| availabilityLabel | Optional (e.g. `Saturday & Sunday, 8 AM - 4 PM` for weekend items) |
| optionGroupsJson | Optional JSON array: `{ id, label, required, options[] }[]` for required extras (Guisos style, Chilaquiles sauce). Invalid JSON on a row is ignored. |

## Template

- **`prompt/google-sheet-menu-template.csv`** — copy this header row and example rows into your Sheet, then publish as CSV.
