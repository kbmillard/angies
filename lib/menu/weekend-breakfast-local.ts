import type { MenuItem } from "./schema";

const GUISO_FORMAT: NonNullable<MenuItem["optionGroups"]> = [
  {
    id: "format",
    label: "Style",
    required: true,
    options: ["Taco", "Burrito", "Gordita Harina", "Gordita Maíz"],
  },
];

const CHILAQUILES_SAUCE: NonNullable<MenuItem["optionGroups"]> = [
  {
    id: "sauce",
    label: "Sauce",
    required: true,
    options: ["Verde", "Rojo"],
  },
];

const AVAIL = "Saturday & Sunday";

function guiso(
  id: string,
  sortOrder: number,
  name: string,
  englishName: string,
  description: string,
): MenuItem {
  return {
    id,
    active: true,
    category: "Weekend Breakfast",
    section: "Guisos",
    sortOrder,
    name,
    englishName,
    description,
    price: null,
    includesFries: false,
    meatChoiceRequired: false,
    featured: false,
    availabilityLabel: AVAIL,
    optionGroups: GUISO_FORMAT,
  };
}

export const weekendBreakfastLocalItems: MenuItem[] = [
  guiso("wb-guiso-chicharron-prensado", 1, "Chicharrón Prensado", "Pressed Pork", "Slow-cooked, seasoned pork with a rich, savory flavor."),
  guiso("wb-guiso-chicharron-verde", 2, "Chicharrón en Salsa Verde", "Pork in Green Sauce", "Tender pork simmered in a mild tomatillo green sauce."),
  guiso("wb-guiso-deshebrada", 3, "Deshebrada", "Shredded Beef", "Slow-cooked beef, shredded and well-seasoned."),
  guiso("wb-guiso-puerco-rojo", 4, "Puerco Chile Rojo", "Pork in Red Chili Sauce", "Pork cooked in a fresh red chili sauce."),
  guiso("wb-guiso-puerco-verde", 5, "Puerco Chile Verde", "Pork in Green Chili Sauce", "Pork cooked in a fresh green chili sauce."),
  guiso("wb-guiso-huevo-rojo", 6, "Huevo Chile Rojo", "Egg in Red Chili Sauce", "Eggs cooked with traditional red chili sauce."),
  guiso("wb-guiso-huevo-verde", 7, "Huevo Chile Verde", "Egg in Green Chili Sauce", "Eggs cooked with a mild green chili sauce."),
  guiso("wb-guiso-bisteck", 8, "Bisteck a la Mexicana", "Mexican Style Steak", "Sliced beef cooked in a savory spicy sauce of tomatoes, onions, and green chiles."),
  guiso("wb-guiso-papas-rajas", 9, "Papas con Rajas", "Potato with Poblano Pepper", "Mild fried poblano slices with potato."),
  guiso("wb-guiso-papas-chorizo", 10, "Papas con Chorizo", "Potato with Chorizo", "Seasoned chorizo with fried potato."),
  {
    id: "wb-desayuno-huevos",
    active: true,
    category: "Weekend Breakfast",
    section: "Desayunos",
    sortOrder: 20,
    name: "Huevos al Gusto",
    englishName: "Eggs to Your Liking",
    description: "Eggs prepared to your liking.",
    price: null,
    includesFries: false,
    meatChoiceRequired: false,
    featured: false,
    availabilityLabel: AVAIL,
  },
  {
    id: "wb-desayuno-chilaquiles",
    active: true,
    category: "Weekend Breakfast",
    section: "Desayunos",
    sortOrder: 21,
    name: "Chilaquiles Verdes or Rojos",
    englishName: "Green or Red Chilaquiles",
    description:
      "Tortilla chips simmered in red or green sauce, topped with cheese, sour cream, onions, and a fried egg.",
    price: null,
    includesFries: false,
    meatChoiceRequired: false,
    featured: false,
    availabilityLabel: AVAIL,
    optionGroups: CHILAQUILES_SAUCE,
  },
  {
    id: "wb-desayuno-molletes",
    active: true,
    category: "Weekend Breakfast",
    section: "Desayunos",
    sortOrder: 22,
    name: "Molletes (2)",
    englishName: "Open-Face Bean and Cheese Sandwiches",
    description:
      "Open-face sandwich with refried beans and melted cheese, served with Mexican chorizo salsa.",
    price: null,
    includesFries: false,
    meatChoiceRequired: false,
    featured: false,
    availabilityLabel: AVAIL,
  },
  {
    id: "wb-desayuno-quesabirria",
    active: true,
    category: "Weekend Breakfast",
    section: "Desayunos",
    sortOrder: 23,
    name: "Quesabirria (3) and Consomé",
    englishName: "Quesabirria with Consomé",
    description: "Three quesabirrias with onion, cilantro, cheese, limes, and consommé.",
    price: null,
    includesFries: false,
    meatChoiceRequired: false,
    featured: false,
    availabilityLabel: AVAIL,
  },
  {
    id: "wb-caldo-menudo",
    active: true,
    category: "Weekend Breakfast",
    section: "Caldos",
    sortOrder: 40,
    name: "Menudo",
    englishName: "Mexican Tripe Soup",
    description:
      "Mexican soup made from slow-cooked beef tripe in a flavorful red chili broth with hominy. Served with onion, cilantro, and limes on the side.",
    price: null,
    includesFries: false,
    meatChoiceRequired: false,
    featured: false,
    availabilityLabel: AVAIL,
  },
  {
    id: "wb-caldo-res",
    active: true,
    category: "Weekend Breakfast",
    section: "Caldos",
    sortOrder: 41,
    name: "Caldo de Res",
    englishName: "Mexican Beef Stew",
    description:
      "Mexican stew with beef, carrots, squash, potato, and rice. Served with onion, cilantro, and limes on the side.",
    price: null,
    includesFries: false,
    meatChoiceRequired: false,
    featured: false,
    availabilityLabel: AVAIL,
  },
];
