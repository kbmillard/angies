/**
 * Display-layer menu for the redesign card grid (photo-led).
 * Slugs/prices align with public/menu/menu.json; images from menu_final/.
 */

export interface MenuDisplayItem {
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  requiresMeatSelection: boolean;
  variantOverrides?: Record<string, number>;
  image: string;
  imageAlt: string;
  tag?: string;
}

export interface MenuDisplayCategory {
  slug: string;
  name: string;
  tagline?: string;
  items: MenuDisplayItem[];
}

const IMG: Record<string, readonly [file: string, alt: string]> = {
  "street-tacos": ["tacos.png", "Street tacos with salsa on a wooden board"],
  "tacos-de-canasta": ["Taco de canasta.png", "Basket tacos with chorizo filling"],
  "tacos-de-birria": ["Taco birrias.png", "Birria tacos with consommé"],
  "classic-burrito": ["Burrito.png", "Classic burrito"],
  "breakfast-burrito": ["Breakfast burrito.png", "Breakfast burrito"],
  "california-burrito": ["California burrito.png", "California burrito"],
  quesadilla: ["Quesadilla.png", "Quesadilla"],
  quesabirria: ["Quesabirria.png", "Quesabirria with consommé"],
  cemita: ["Cemita.png", "Cemita sandwich"],
  tostada: ["Tostada.png", "Loaded tostada"],
  chilaquiles: ["Chilaquiles.png", "Chilaquiles with egg"],
};

function img(slug: string, fallbackName: string): { image: string; imageAlt: string } {
  const row = IMG[slug];
  if (!row) {
    return { image: "/menu/menu_final/tacos.png", imageAlt: fallbackName };
  }
  const [file, alt] = row;
  return {
    image: `/menu/menu_final/${encodeURIComponent(file)}`,
    imageAlt: alt,
  };
}

export const CATEGORY_ACCENT: Record<string, string> = {
  tacos: "#f87171",
  burritos: "#facc15",
  quesadillas: "#ff8a3d",
  classics: "#fb7185",
};

export const menuDisplay: MenuDisplayCategory[] = [
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
        variantOverrides: { "barbacoa-beef": 3.75, "lengua-tongue": 4.0 },
        tag: "Crowd pick",
        ...img("street-tacos", "Street tacos"),
      },
      {
        slug: "tacos-de-canasta",
        name: "Tacos de canasta",
        description:
          "Three corn tortillas filled with potatoes and chorizo. Served with lettuce, jalapeño, and salsa on the side.",
        basePrice: 9.0,
        requiresMeatSelection: false,
        tag: "Steamed",
        ...img("tacos-de-canasta", "Tacos de canasta"),
      },
      {
        slug: "tacos-de-birria",
        name: "Tacos de birria",
        description:
          "Three crispy corn tortillas loaded with cheese, birria, cilantro, and onions. Served with consommé, salsa, lemon, and cucumber.",
        basePrice: 14.0,
        requiresMeatSelection: false,
        tag: "Signature",
        ...img("tacos-de-birria", "Tacos de birria"),
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
        variantOverrides: { "barbacoa-beef": 11.75, "lengua-tongue": 12.0 },
        tag: "Classic",
        ...img("classic-burrito", "Classic burrito"),
      },
      {
        slug: "breakfast-burrito",
        name: "Breakfast burrito",
        description:
          "12-inch flour tortilla filled with your choice of meat, cheese, eggs, and potatoes. Served with salsa on the side.",
        basePrice: 11.0,
        requiresMeatSelection: true,
        tag: "Breakfast",
        ...img("breakfast-burrito", "Breakfast burrito"),
      },
      {
        slug: "california-burrito",
        name: "California burrito",
        description:
          "12-inch flour tortilla loaded with your choice of meat, crispy potatoes, pico de gallo, and cream.",
        basePrice: 12.0,
        requiresMeatSelection: true,
        tag: "House style",
        ...img("california-burrito", "California burrito"),
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
          "12-inch flour tortilla filled with your choice of meat and melted cheese. Served with lettuce mix, pico, and sour cream.",
        basePrice: 11.0,
        requiresMeatSelection: true,
        variantOverrides: { "barbacoa-beef": 11.75, "lengua-tongue": 12.0 },
        tag: "Classic",
        ...img("quesadilla", "Quesadilla"),
      },
      {
        slug: "quesabirria",
        name: "Quesabirria",
        description:
          "Flour tortilla loaded with melted cheese, birria, cilantro, and onions. Served with consommé for dipping.",
        basePrice: 14.0,
        requiresMeatSelection: false,
        tag: "Signature",
        ...img("quesabirria", "Quesabirria"),
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
          "Mexican torta on a sesame bun with your choice of meat, beans, lettuce, Oaxaca cheese, mayo, and avocado.",
        basePrice: 13.0,
        requiresMeatSelection: true,
        variantOverrides: { "barbacoa-beef": 13.75, "lengua-tongue": 14.0 },
        tag: "Torta",
        ...img("cemita", "Cemita"),
      },
      {
        slug: "tostada",
        name: "Tostada",
        description:
          "Crispy flat tortilla stacked with your choice of meat, beans, lettuce, pico, cream, and queso fresco.",
        basePrice: 4.5,
        requiresMeatSelection: true,
        variantOverrides: { "barbacoa-beef": 5.0, "lengua-tongue": 5.5 },
        tag: "Crispy",
        ...img("tostada", "Tostada"),
      },
      {
        slug: "chilaquiles",
        name: "Chilaquiles",
        description:
          "Crispy tortilla chips in red salsa, topped with cream, cilantro, onions, queso fresco, and a fried egg.",
        basePrice: 11.0,
        requiresMeatSelection: false,
        variantOverrides: { "any-meat": 14.0 },
        tag: "Breakfast",
        ...img("chilaquiles", "Chilaquiles"),
      },
    ],
  },
];

export function formatDisplayPrice(item: MenuDisplayItem): string {
  const hasUpcharges =
    item.variantOverrides &&
    Object.values(item.variantOverrides).some((p) => p > item.basePrice);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  return hasUpcharges ? `from ${fmt(item.basePrice)}` : fmt(item.basePrice);
}

export function formatVariantNote(item: MenuDisplayItem): string | null {
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
