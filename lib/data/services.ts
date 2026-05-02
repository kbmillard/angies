export type ServiceRow = {
  id: string;
  number: string;
  title: string;
  summary: string;
  detail: string;
  ctas: { label: string; action: "order" | "locations" | "catering" | "scroll"; target?: string }[];
};

/** Unused on the one-pager today — kept for parity with the Gringos Cubanos component set. */
export const SERVICE_ROWS: ServiceRow[] = [
  {
    id: "pickup",
    number: "01",
    title: "Pickup at the truck",
    summary: "Order from the board, grab it hot.",
    detail:
      "Your cart updates live, pickup stays tied to today’s pin, and everything lives on this page so you never lose momentum.",
    ctas: [{ label: "Open order panel", action: "order" }],
  },
  {
    id: "truck",
    number: "02",
    title: "Food truck",
    summary: "Mexican menu DNA, street-level energy.",
    detail:
      "Follow the current location board for today’s address — Linwood is the home base when we are not booked for an event.",
    ctas: [{ label: "Find the truck", action: "scroll", target: "locations" }],
  },
  {
    id: "catering",
    number: "03",
    title: "Catering",
    summary: "Trays, toppings, and crowd-ready heat.",
    detail:
      "Office lunches, school celebrations, and block parties — we scale the flavors without losing the handmade touch.",
    ctas: [{ label: "Start catering form", action: "catering" }],
  },
  {
    id: "aguas",
    number: "04",
    title: "Aguas frescas",
    summary: "Cold drinks for hot service windows.",
    detail: "Horchata, mango, and rotating flavors — ask the window what is pouring today.",
    ctas: [{ label: "View menu", action: "scroll", target: "menu" }],
  },
  {
    id: "schedule",
    number: "05",
    title: "Schedule",
    summary: "Published stops and private holds.",
    detail:
      "Wed–Sat service is the demo cadence until the owner confirms final hours — see the schedule board for published stops.",
    ctas: [{ label: "View schedule", action: "scroll", target: "schedule" }],
  },
  {
    id: "private",
    number: "06",
    title: "Private events",
    summary: "Bring the truck — bring the party.",
    detail:
      "Birthdays, corporate mixers, festivals, and school events — we roll up, fire the line, and serve with a smile.",
    ctas: [{ label: "Book the truck", action: "catering" }],
  },
];
