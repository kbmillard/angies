import type { LocationItem } from "./schema";

const DEMO_WEEKLY_HOURS = JSON.stringify({
  wed: [{ open: "10:00", close: "17:00" }],
  thu: [{ open: "10:00", close: "17:00" }],
  fri: [{ open: "10:00", close: "17:00" }],
  sat: [{ open: "10:00", close: "17:00" }],
});

/** Default truck row when no remote catalog is configured — Linwood base + demo hours (confirm with owner). */
export const localLocationItems: LocationItem[] = [
  {
    id: "angies-food-truck-linwood",
    active: true,
    type: "food_truck",
    sortOrder: 0,
    name: "Angie's food truck",
    label: "Food Truck Location",
    address: "400 E Linwood Blvd",
    city: "Kansas City",
    state: "MO",
    zip: "64109",
    hours: "Wed–Sat 10:00 AM – 5:00 PM (demo — TODO: confirm with owner)",
    phone: "(913) 954-8745",
    email: "angiesfoodtruck83@gmail.com",
    status: "Open",
    statusNote: "Linwood location",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Angie%27s%20food%20truck%20400%20E%20Linwood%20Blvd%20Kansas%20City%20MO",
    embedUrl: "",
    lat: 39.05294,
    lng: -94.56472,
    lastUpdated: new Date().toISOString(),
    timezone: "America/Chicago",
    weeklyHoursJson: DEMO_WEEKLY_HOURS,
    messageBoard:
      "Follow Angie’s Food Truck on Facebook or Instagram for same-day truck updates.",
  },
];
