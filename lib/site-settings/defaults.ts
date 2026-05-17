import { HERO_SLIDES } from "@/lib/data/hero-slides";
import { DEFAULT_STORY_SLIDES } from "@/lib/data/story-slides";
import type { SiteSettingsResolved } from "@/lib/site-settings/types";

export const DEFAULT_SITE_SETTINGS: SiteSettingsResolved = {
  hero: {
    eyebrow: "Angie's Food Truck · Mexican food truck · Kansas City",
    headlineLine1: "Bold Tex-Mex flavor,",
    headlineLine2: "served fresh across Kansas City.",
    body: "Find Angie's Food Truck near Linwood and all around Kansas City. Follow today's location and order fresh Tex-Mex favorites from the truck.",
    slides: HERO_SLIDES.map((s) => ({ src: s.src, alt: s.alt })),
    cta: {
      order: "Order",
      viewMenu: "See the menu",
      findTruck: "Where's the truck?",
      schedule: "Upcoming schedule",
      catering: "Book catering / event",
    },
  },
  prologue: {
    title: "Welcome to Angie's Food Truck.",
    subtitle:
      "Fresh Mexican plates from the window — tacos, birria, burritos, aguas frescas, and daily specials. Follow the pin for today's stop, or book us for your next event.",
  },
  story: {
    sectionKicker: "Our story",
    sectionTitle: "Mexican flavor, rolling through Kansas City.",
    quote1: "You will experience bold Tex-Mex flavor without leaving Kansas City.",
    quote2:
      "We had the opportunity to have Angie's Food Truck present for one of our events. Over 100 guests raved about the food…",
    quoteFooter: "Short public review snippets — confirm exact wording with owner.",
    slides: DEFAULT_STORY_SLIDES.map((s) => ({ ...s })),
  },
  catering: {
    kicker: "Catering & private events",
    title: "Bring the truck — bring the party.",
    subtitle:
      "Festivals, office lunches, birthdays, and private parties — Angie's rolls up with a bright truck, Mexican favorites, aguas frescas, and a crew that keeps the line moving.",
    body: "",
  },
  social: {
    kicker: "Social",
    title: "Follow the truck — same-day updates.",
    subtitle: "Facebook and Instagram carry the live pin, specials, and catering highlights.",
    body: "Tag us when you order — we love resharing KC neighborhoods enjoying Angie's.",
    instagramHandle: "@angiesfoodtruck",
    facebookHandle: "Angie's Food Truck",
  },
};
