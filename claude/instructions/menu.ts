// lib/menu/menu.ts
// ──────────────────────────────────────────────────────────────────────────────
// Single source of truth for the storefront menu.
//
// This extends the existing menu.json shape with three display-layer fields:
//   - image       → /menu/<slug>.png (lives in public/menu/)
//   - imageAlt    → screen-reader alt text
//   - tag         → small badge shown on the card ("Signature", "Crowd pick", …)
//
// The pricing structure (basePrice + variantOverrides) is preserved exactly
// from menu.json. The cart/order system should keep reading menu.json for
// pricing math; this file is for what the menu PAGE displays.
//
// If you'd rather keep one source: replace `menuData` below with a build-time
// import of menu.json and overlay the display fields here. For now, both are
// in sync — update both together when prices change.
// ──────────────────────────────────────────────────────────────────────────────

export interface MenuVariant {
  /** Slug matches globalModifiers.meats[].slug from menu.json */
  slug: string;
  upcharge: number;
}

export interface MenuItem {
  slug: string;
  name: string;
  description: string;
  /** Base/starting price (lowest variant price). */
  basePrice: number;
  /** True if the item requires a meat choice at the window. */
  requiresMeatSelection: boolean;
  /** Per-meat price overrides. Maps meat slug → absolute price (not delta). */
  variantOverrides?: Record<string, number>;
  /** Public path to the item photo. */
  image: string;
  /** Alt text for the photo. */
  imageAlt: string;
  /** Optional badge shown on the card. */
  tag?: string;
}

export interface MenuCategory {
  slug: string;
  name: string;
  /** Short tagline shown beneath the category name when active. */
  tagline?: string;
  items: MenuItem[];
}

// Notes used to render the "+meat upcharges" footnote on cards.
export const MEAT_UPCHARGES = {
  barbacoa: 0.5,
  lengua: 1.0,
} as const;

export const menu: MenuCategory[] = [
  {
    slug: "tacos",
    name: "Tacos",
    tagline: "Corn tortillas, your choice of meat, served street-style.",
    items: [
      {
        slug: "street-tacos",
        name: "Street tacos",
        description:
          "Corn tortilla with your choice of meat, cilantro, onions, lettuce, cheese, and salsa. Served with lemon and cucumber on the side.",
        basePrice: 3.5,
        requiresMeatSelection: true,
        variantOverrides: {
          "barbacoa-beef": 3.75,
          "lengua-tongue": 4.0,
        },
        image: "/menu/street-tacos.png",
        imageAlt: "Three street tacos with lettuce, cheese, and pico de gallo, with red salsa on a wooden board.",
        tag: "Crowd pick",
      },
      {
        slug: "tacos-de-canasta",
        name: "Tacos de canasta",
        description:
          "Three corn tortillas filled with potatoes and chorizo. Served with lettuce, jalapeño, and salsa on the side.",
        basePrice: 9.0,
        requiresMeatSelection: false,
        image: "/menu/tacos-de-canasta.png",
        imageAlt: "Four soft folded basket tacos with chorizo and potato filling, lettuce and pickled jalapeño on the side.",
        tag: "Steamed",
      },
      {
        slug: "tacos-de-birria",
        name: "Tacos de birria",
        description:
          "Three light, crispy corn tortillas loaded with cheese, birria, cilantro, and onions. Served with consommé, salsa, lemon, and cucumber on the side.",
        basePrice: 14.0,
        requiresMeatSelection: false,
        image: "/menu/tacos-de-birria.png",
        imageAlt: "Three crispy red-stained birria tacos with melted cheese, a cup of consommé, salsa verde, lime, and cucumber.",
        tag: "Signature",
      },
    ],
  },
  {
    slug: "burritos",
    name: "Burritos",
    tagline: "12-inch flour tortillas, packed and griddled to order.",
    items: [
      {
        slug: "classic-burrito",
        name: "Classic burrito",
        description:
          "12-inch flour tortilla packed with your choice of meat, cheese, rice, and beans. Served with salsa on the side.",
        basePrice: 11.0,
        requiresMeatSelection: true,
        variantOverrides: {
          "barbacoa-beef": 11.75,
          "lengua-tongue": 12.0,
        },
        image: "/menu/classic-burrito.png",
        imageAlt: "A halved griddled burrito on a banana leaf showing rice, beans, and meat filling, with red and green salsa cups.",
        tag: "Classic",
      },
      {
        slug: "breakfast-burrito",
        name: "Breakfast burrito",
        description:
          "12-inch flour tortilla filled with your choice of meat, cheese, eggs, and potatoes. Served with salsa on the side.",
        basePrice: 11.0,
        requiresMeatSelection: true,
        image: "/menu/breakfast-burrito.png",
        imageAlt: "A halved breakfast burrito on a wooden board with eggs, potatoes, and meat visible inside, with red and green salsa cups.",
        tag: "Breakfast",
      },
      {
        slug: "california-burrito",
        name: "California burrito",
        description:
          "12-inch flour tortilla loaded with your choice of meat, crispy potatoes, pico de gallo, and cream.",
        basePrice: 12.0,
        requiresMeatSelection: true,
        image: "/menu/california-burrito.png",
        imageAlt: "A halved griddled California burrito on a wooden board showing meat, potatoes, and pico de gallo filling.",
        tag: "House style",
      },
    ],
  },
  {
    slug: "quesadillas",
    name: "Quesadillas",
    tagline: "Flour tortillas, melted cheese, fillings cooked at the window.",
    items: [
      {
        slug: "quesadilla",
        name: "Quesadilla",
        description:
          "12-inch flour tortilla filled with your choice of meat and melted cheese. Served with a lettuce mix, pico de gallo, and sour cream on the side.",
        basePrice: 11.0,
        requiresMeatSelection: true,
        variantOverrides: {
          "barbacoa-beef": 11.75,
          "lengua-tongue": 12.0,
        },
        image: "/menu/quesadilla.png",
        imageAlt: "A folded griddled quesadilla cut into triangles on a white plate with a shredded lettuce salad, salsa verde, and sour cream.",
        tag: "Classic",
      },
      {
        slug: "quesabirria",
        name: "Quesabirria",
        description:
          "12-inch flour tortilla loaded with melted cheese, savory birria, cilantro, and onions. Served with a side of rich consommé for dipping.",
        basePrice: 14.0,
        requiresMeatSelection: false,
        image: "/menu/quesabirria.png",
        imageAlt: "A folded crispy quesabirria cut into triangles on a beige plate with a side of dark red consommé, salsa verde, and lime wedges.",
        tag: "Signature",
      },
    ],
  },
  {
    slug: "classics",
    name: "Classics",
    tagline: "Stacked, stuffed, smothered — house favorites beyond the wrap.",
    items: [
      {
        slug: "cemita",
        name: "Cemita",
        description:
          "Mexican torta on a sesame bun with your choice of meat, beans, lettuce, melted Oaxaca cheese, mayo, and avocado. Served with jalapeño on the side.",
        basePrice: 13.0,
        requiresMeatSelection: true,
        variantOverrides: {
          "barbacoa-beef": 13.75,
          "lengua-tongue": 14.0,
        },
        image: "/menu/cemita.png",
        imageAlt: "A large sesame-bun sandwich stuffed with breaded chicken, shredded cabbage, Oaxaca cheese, and jalapeño peppers on a wooden board.",
        tag: "Torta",
      },
      {
        slug: "tostada",
        name: "Tostada",
        description:
          "Crispy flat tortilla stacked with your choice of meat, beans, lettuce, pico de gallo, cream, and queso fresco.",
        basePrice: 4.5,
        requiresMeatSelection: true,
        variantOverrides: {
          "barbacoa-beef": 5.0,
          "lengua-tongue": 5.5,
        },
        image: "/menu/tostada.png",
        imageAlt: "A loaded tostada with beans, meat, lettuce, tomato, cream drizzle, and crumbled queso fresco on a wooden board, with red and green salsa cups.",
        tag: "Crispy",
      },
      {
        slug: "chilaquiles",
        name: "Chilaquiles",
        description:
          "Crispy tortilla chips tossed in red salsa, topped with cream, cilantro, onions, queso fresco, and a perfectly fried egg.",
        basePrice: 11.0,
        requiresMeatSelection: false,
        variantOverrides: {
          "any-meat": 14.0,
        },
        image: "/menu/chilaquiles.png",
        imageAlt: "A plate of red chilaquiles topped with crema, queso fresco, cilantro, and a sunny-side-up egg, served outdoors.",
        tag: "Breakfast",
      },
    ],
  },
];

// ─── DISPLAY HELPERS ──────────────────────────────────────────────────────────

/**
 * Returns a human display price for a menu item.
 *  - Fixed price: "$14.00"
 *  - Range / starts-at: "from $3.50"
 */
export function formatPrice(item: MenuItem): string {
  const hasUpcharges =
    item.variantOverrides &&
    Object.values(item.variantOverrides).some((p) => p > item.basePrice);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  return hasUpcharges ? `from ${fmt(item.basePrice)}` : fmt(item.basePrice);
}

/**
 * Returns a short footnote describing meat upcharges, or null if none apply.
 * Example: "+$0.50 barbacoa · +$1 lengua"
 */
export function formatVariantNote(item: MenuItem): string | null {
  if (!item.variantOverrides) return null;
  const deltas: string[] = [];
  if (item.variantOverrides["barbacoa-beef"] !== undefined) {
    const d = item.variantOverrides["barbacoa-beef"] - item.basePrice;
    if (d > 0) deltas.push(`+$${d.toFixed(2).replace(/\.00$/, "")} barbacoa`);
  }
  if (item.variantOverrides["lengua-tongue"] !== undefined) {
    const d = item.variantOverrides["lengua-tongue"] - item.basePrice;
    if (d > 0) deltas.push(`+$${d.toFixed(2).replace(/\.00$/, "")} lengua`);
  }
  if (item.variantOverrides["any-meat"] !== undefined) {
    deltas.push(`+ meat $${item.variantOverrides["any-meat"]}`);
  }
  return deltas.length ? deltas.join(" · ") : null;
}

/** Category accent colors — used for the card hover stripe and tab active state. */
export const CATEGORY_ACCENT: Record<string, string> = {
  tacos:       "#f87171", // red
  burritos:    "#facc15", // gold-yellow
  quesadillas: "#ff8a3d", // orange
  classics:    "#fb7185", // pink
};
