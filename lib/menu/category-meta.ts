import type { MenuCategoryMeta } from "./schema";

/**
 * Editorial styling for menu category tabs. Labels must match sheet `category` values.
 */
export const MENU_CATEGORY_META: MenuCategoryMeta[] = [
  {
    id: "tacos",
    label: "Tacos",
    panelKickerEn: "Street & seafood",
    subtitle: "Fish tacos, street tacos — confirm daily meats with the window",
    color: "red",
    number: "01",
  },
  {
    id: "birria",
    label: "Birria",
    panelKickerEn: "Slow-cooked",
    subtitle: "Beef birria — confirm tacos, plate, or consommé with owner",
    color: "orange",
    number: "02",
  },
  {
    id: "burritos",
    label: "Burritos",
    panelKickerEn: "12″ builds",
    subtitle: "Flour tortilla, cheese, rice, beans, meat, salsa",
    color: "yellow",
    number: "03",
  },
  {
    id: "aguas-frescas",
    label: "Aguas Frescas",
    panelKickerEn: "Fresh waters",
    subtitle: "Horchata, mango, rotating flavors",
    color: "cyan",
    number: "04",
  },
  {
    id: "specials",
    label: "Specials",
    panelKickerEn: "Hot board",
    subtitle: "Daily hot specials — update via Google Sheet",
    color: "pink",
    number: "05",
  },
  {
    id: "sides",
    label: "Sides",
    panelKickerEn: "Sides",
    subtitle: "Rice, beans, and more",
    color: "green",
    number: "06",
  },
  {
    id: "catering",
    label: "Catering",
    panelKickerEn: "Events",
    subtitle: "Festivals, offices, private parties — request a quote",
    color: "red",
    number: "07",
  },
];
