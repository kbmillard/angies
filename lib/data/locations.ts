import { SOCIAL_LINKS } from "@/lib/data/social";

/** Hours copy when no location hours are loaded yet. */
export const HOURS_LINES = [
  "Hours are owner-editable via the Locations Sheet — confirm final public hours (demo: Wed–Sat 10am–5pm, America/Chicago).",
  `Same-day truck updates: ${SOCIAL_LINKS.facebook.handle} on Facebook and ${SOCIAL_LINKS.instagram.handle} on Instagram`,
] as const;

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
