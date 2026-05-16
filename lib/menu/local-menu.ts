/** Local menu catalog — mirrors `public/menu/menu_final/menu.json` when DB is empty (dev / edge). */
import { menuFinalSrc, type MenuFinalFile } from "@/lib/data/menu-final-path";
import { ANGIES_ADD_EXTRA_SUB } from "@/lib/menu/angies-modifier-groups";
import type { MenuItem } from "./schema";
import { meatChoices } from "./schema";

const chooseMeatGroup: NonNullable<MenuItem["optionGroups"]>[number] = {
  id: "meat",
  label: "Choose meat",
  required: true,
  multiple: false,
  options: [...meatChoices],
};

function art(file: MenuFinalFile, alt: string): Pick<MenuItem, "imageUrl" | "imageAlt"> {
  return { imageUrl: menuFinalSrc(file), imageAlt: alt };
}

export const localMenuItems: MenuItem[] = [
  {
    id: "street-tacos",
    active: true,
    category: "Tacos",
    sortOrder: 0,
    name: "Street Tacos",
    description:
      "Corn tortilla with your choice of meat, cilantro, onions, lettuce, cheese, and salsa. Served with lemon & cucumber on the side.",
    price: 3.5,
    includesFries: false,
    meatChoiceRequired: true,
    featured: true,
    ...art("tacos.png", "Street tacos"),
    optionGroups: [chooseMeatGroup, ...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "tacos-de-canasta",
    active: true,
    category: "Tacos",
    sortOrder: 1,
    name: "Tacos de Canasta",
    description:
      "Three corn tortillas filled with potatoes & chorizo. Served with lettuce, jalapeño, & salsa on the side.",
    price: 9.0,
    includesFries: false,
    meatChoiceRequired: false,
    featured: true,
    ...art("Taco de canasta.png", "Tacos de canasta"),
    optionGroups: [...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "tacos-de-birria",
    active: true,
    category: "Tacos",
    sortOrder: 2,
    name: "Tacos de Birria",
    description:
      "Three light & crispy corn tortillas loaded with cheese, birria, cilantro, and onions. Served with consommé, salsa, lemon, & cucumber on the side.",
    price: 14.0,
    includesFries: false,
    meatChoiceRequired: false,
    featured: true,
    ...art("Taco birrias.png", "Tacos de birria"),
    optionGroups: [...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "classic-burrito",
    active: true,
    category: "Burritos",
    sortOrder: 0,
    name: "Classic Burrito",
    description:
      "12″ flour tortilla packed with your choice of meat, cheese, rice, and beans. Served with salsa on the side.",
    price: 11.0,
    includesFries: false,
    meatChoiceRequired: true,
    featured: true,
    ...art("Burrito.png", "Classic burrito"),
    optionGroups: [chooseMeatGroup, ...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "breakfast-burrito",
    active: true,
    category: "Burritos",
    sortOrder: 1,
    name: "Breakfast Burrito",
    description:
      "12″ flour tortilla filled with your choice of meat, cheese, eggs, and potatoes. Served with salsa on the side.",
    price: 11.0,
    includesFries: false,
    meatChoiceRequired: true,
    featured: true,
    ...art("Breakfast burrito.png", "Breakfast burrito"),
    optionGroups: [chooseMeatGroup, ...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "california-burrito",
    active: true,
    category: "Burritos",
    sortOrder: 2,
    name: "California Burrito",
    description:
      "12″ flour tortilla loaded with your choice of meat, crispy potatoes, pico de gallo, and cream.",
    price: 12.0,
    includesFries: false,
    meatChoiceRequired: true,
    featured: true,
    ...art("California burrito.png", "California burrito"),
    optionGroups: [chooseMeatGroup, ...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "quesadilla",
    active: true,
    category: "Quesadillas",
    sortOrder: 0,
    name: "Quesadilla",
    description:
      "12″ flour tortilla filled with your choice of meat and melted cheese. Served with a lettuce mix, pico de gallo, & sour cream on the side.",
    price: 11.0,
    includesFries: false,
    meatChoiceRequired: true,
    featured: true,
    ...art("Quesadilla.png", "Quesadilla"),
    optionGroups: [chooseMeatGroup, ...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "quesabirria",
    active: true,
    category: "Quesadillas",
    sortOrder: 1,
    name: "Quesabirria",
    description:
      "12″ flour tortilla loaded with melted cheese, savory birria, cilantro, and onions. Served with a side of rich consommé for dipping.",
    price: 14.0,
    includesFries: false,
    meatChoiceRequired: false,
    featured: true,
    ...art("Quesabirria.png", "Quesabirria"),
    optionGroups: [...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "cemita",
    active: true,
    category: "Classics",
    sortOrder: 0,
    name: "Cemita (Mexican Torta)",
    description:
      "Your choice of meat, beans, lettuce, melted Oaxaca cheese, mayo, and avocado. Served with jalapeño on the side.",
    price: 13.0,
    includesFries: false,
    meatChoiceRequired: true,
    featured: true,
    ...art("Cemita.png", "Cemita"),
    optionGroups: [chooseMeatGroup, ...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "tostada",
    active: true,
    category: "Classics",
    sortOrder: 1,
    name: "Tostada",
    description:
      "Crispy flat tortilla stacked with your choice of meat, beans, lettuce, pico de gallo, cream, and queso fresco.",
    price: 4.5,
    includesFries: false,
    meatChoiceRequired: true,
    featured: true,
    ...art("Tostada.png", "Tostada"),
    optionGroups: [chooseMeatGroup, ...ANGIES_ADD_EXTRA_SUB],
  },
  {
    id: "chilaquiles",
    active: true,
    category: "Classics",
    sortOrder: 2,
    name: "Chilaquiles",
    description:
      "Crispy tortilla chips tossed in red salsa, topped with cream, cilantro, onions, queso fresco, and a perfectly fried egg.",
    price: 11.0,
    includesFries: false,
    meatChoiceRequired: true,
    featured: true,
    ...art("Chilaquiles.png", "Chilaquiles"),
    optionGroups: [chooseMeatGroup, ...ANGIES_ADD_EXTRA_SUB],
  },
];