import { SOCIAL_LINKS } from "@/lib/data/social";

/** Public footer hours (fixed marketing copy). */
export const PUBLIC_HOURS_LINES = [
  "Monday & Tuesday",
  "10:00 AM to 2:00 PM",
  "Wednesday – Friday",
  "10:00 AM to 8:00 PM",
  "Saturday",
  "10:00 AM to 4:00 PM",
] as const;

/** Footer / location card hours rows (mockup layout). */
export const PUBLIC_HOURS_ROWS = [
  { days: "Mon — Tue", hours: "10:00 AM — 2:00 PM" },
  { days: "Wed — Fri", hours: "10:00 AM — 8:00 PM" },
  { days: "Saturday", hours: "10:00 AM — 4:00 PM" },
  { days: "Sunday", hours: "Closed" },
] as const;

/** Compact hours for footer (mockup). */
export const FOOTER_HOURS_LINES = [
  "Mon — Tue · 10–2",
  "Wed — Fri · 10–8",
  "Saturday · 10–4",
] as const;

export const FOOTER_BRAND_BLURB =
  "Family-run Mexican food truck rolling through Kansas City since 2019.";

/** Public catering / contact lines (both numbers). */
export const CONTACT_PHONES = [
  { display: "(913) 433-1732", tel: "+19134331732" },
  { display: "(913) 954-8745", tel: "+19139548745" },
] as const;

export const CONTACT = {
  phones: CONTACT_PHONES,
  email: "angiesfoodtruck83@gmail.com",
  socialHandle: SOCIAL_LINKS.instagram.handle,
  socialUrl: SOCIAL_LINKS.instagram.href,
  facebookUrl: SOCIAL_LINKS.facebook.href,
} as const;

export const TRUCK_STATUS_OPTIONS = [
  "open",
  "moving_soon",
  "closed",
  "catering_event",
  "serving_now",
  "next_stop",
] as const;

export type TruckStatusId = (typeof TRUCK_STATUS_OPTIONS)[number];

export const TRUCK_STATUS_COPY: Record<
  TruckStatusId,
  { badge: string; detail: string }
> = {
  open: { badge: "Open", detail: "Swing by the truck — we are serving." },
  moving_soon: {
    badge: "Moving Soon",
    detail: "We are packing up or heading to the next pin.",
  },
  closed: { badge: "Closed", detail: "Off the road for now — see schedule for the next stop." },
  catering_event: {
    badge: "Private Event",
    detail: "Booked privately — public stops are listed on the schedule.",
  },
  serving_now: {
    badge: "Serving Now",
    detail: "We are on the line — follow the map pin above.",
  },
  next_stop: {
    badge: "Next Stop",
    detail: "Catch us at the next scheduled location.",
  },
};
