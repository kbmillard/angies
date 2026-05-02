import { gallerySrc } from "@/lib/data/gallery-path";

export type EssenceCard = {
  id: string;
  number: string;
  title: string;
  teaser: string;
  body: string;
  image: string;
};

/** Unused on the one-pager today — images are repo `gallery/` only for compliance. */
export const ESSENCE_CARDS: EssenceCard[] = [
  {
    id: "fire",
    number: "01",
    title: "Fire",
    teaser: "Flat-top discipline, salsa-forward finishes.",
    body: "We cook with intention — proteins that carry smoke and citrus, onions that melt into sweetness, and tortillas kissed on the plancha.",
    image: gallerySrc("food6.png"),
  },
  {
    id: "fresh",
    number: "02",
    title: "Fresh",
    teaser: "Aguas frescas, bright herbs, daily specials.",
    body: "From horchata to mango fresca, drinks stay as intentional as the plates — rested, cold, and ready for KC heat.",
    image: gallerySrc("drink2.png"),
  },
  {
    id: "family",
    number: "03",
    title: "Family",
    teaser: "Built for curbs, offices, and block parties.",
    body: "Angie’s Food Truck is Kansas City energy — Mexican flavor made fresh for lunch rushes, neighborhoods, and events that need the line to move.",
    image: gallerySrc("truck2.png"),
  },
];
