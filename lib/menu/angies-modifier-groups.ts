import type { MenuOptionGroup } from "./schema";

/** TODO: confirm modifier pricing with owner. */
export const ANGIES_ADD_GROUP: MenuOptionGroup = {
  id: "add",
  label: "Add",
  required: false,
  multiple: true,
  options: [
    "Cheese",
    "Sour Cream",
    "Guacamole",
    "Rice",
    "Beans",
    "Extra Salsa",
    "Lettuce",
    "Pico de Gallo",
  ],
};

/** TODO: confirm modifier pricing with owner. */
export const ANGIES_EXTRA_GROUP: MenuOptionGroup = {
  id: "extra",
  label: "Extra",
  required: false,
  multiple: true,
  options: [
    "Extra Meat",
    "Extra Cheese",
    "Extra Guacamole",
    "Extra Sour Cream",
    "Extra Salsa",
  ],
};

/** TODO: confirm modifier pricing with owner. */
export const ANGIES_SUBSTITUTE_GROUP: MenuOptionGroup = {
  id: "substitute",
  label: "Substitute",
  required: false,
  multiple: true,
  options: [
    "No onions",
    "No cilantro",
    "No cheese",
    "No sour cream",
    "No rice",
    "No beans",
    "Salsa on the side",
  ],
};

export const ANGIES_ADD_EXTRA_SUB: MenuOptionGroup[] = [
  ANGIES_ADD_GROUP,
  ANGIES_EXTRA_GROUP,
  ANGIES_SUBSTITUTE_GROUP,
];

/** Street tacos — meat required. */
export const ANGIES_STREET_TACO_MEAT: MenuOptionGroup = {
  id: "meat",
  label: "Choose Meat",
  required: true,
  multiple: false,
  options: ["Asada", "Pastor", "Chicken", "Birria", "Fish", "No meat / Veggie"],
};

/** Burrito — meat required (sheet-style list). */
export const ANGIES_BURRITO_MEAT: MenuOptionGroup = {
  id: "meat",
  label: "Choose Meat",
  required: true,
  multiple: false,
  options: ["Asada", "Pastor", "Chicken", "Birria", "Other / Confirm"],
};
