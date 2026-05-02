"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { CONTACT, HOURS_LINES } from "@/lib/data/locations";
import { SOCIAL_LINKS } from "@/lib/data/social";
import { useLocationsCatalog } from "@/context/LocationsCatalogContext";
import { footerHoursLines, footerTruckVisit } from "@/lib/locations/footer-visit-from-catalog";
import { telHrefFromDisplay } from "@/lib/locations/helpers";

export function SiteFooter() {
  const { error, data } = useLocationsCatalog();

  const restaurantLoc = data?.restaurantLocations?.[0];
  const truckLoc = data?.foodTruckLocations?.[0];

  const visitTruck = footerTruckVisit(data);

  const phoneDisplay =
    truckLoc?.phone?.trim() || restaurantLoc?.phone?.trim() || CONTACT.phoneDisplay;
  const phoneTel = telHrefFromDisplay(phoneDisplay, CONTACT.phoneTel);

  const emailAddr =
    truckLoc?.email?.trim() || restaurantLoc?.email?.trim() || CONTACT.email;

  const hoursLines = footerHoursLines(data, HOURS_LINES[1]);

  return (
    <footer
      id="contact"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] border-t border-white/10 bg-charcoal/70 py-16 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 sm:flex-row sm:justify-between sm:px-8">
        <div className="max-w-sm space-y-4">
          <BrandLogo width={72} height={72} />
          <p className="text-sm leading-relaxed text-cream/70">
            Angie&apos;s Food Truck — Mexican food in Kansas City. Call or text{" "}
            <a className="text-cream underline-offset-4 hover:underline" href={phoneTel}>
              {phoneDisplay}
            </a>
            . Follow Facebook and Instagram for the live pin.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a className="text-cream underline-offset-4 hover:underline" href={phoneTel}>
              {phoneDisplay}
            </a>
            {emailAddr ? (
              <a
                className="text-cream underline-offset-4 hover:underline"
                href={`mailto:${emailAddr}`}
              >
                {emailAddr}
              </a>
            ) : null}
            <a
              className="text-cream underline-offset-4 hover:underline"
              href={SOCIAL_LINKS.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SOCIAL_LINKS.instagram.label} ({SOCIAL_LINKS.instagram.handle})
            </a>
            <a
              className="text-cream underline-offset-4 hover:underline"
              href={SOCIAL_LINKS.facebook.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SOCIAL_LINKS.facebook.label}
            </a>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-editorial text-cream/50">Visit</p>
            {visitTruck.address?.trim() ? (
              <p className="mt-2 text-sm text-cream/85">{visitTruck.address}</p>
            ) : (
              <p className="mt-2 text-sm text-cream/70">TBD</p>
            )}
            {visitTruck.detail?.trim() ? (
              <p className="text-sm text-cream/85">{visitTruck.detail}</p>
            ) : null}
            {visitTruck.cityLine?.trim() ? (
              <p className="text-sm text-cream/85">{visitTruck.cityLine}</p>
            ) : null}
            {error ? (
              <p className="mt-3 text-xs text-cream/50">Visit details could not be loaded.</p>
            ) : null}
          </div>
          <div>
            <p className="text-xs uppercase tracking-editorial text-cream/50">Hours</p>
            <ul className="mt-2 space-y-1 text-sm text-cream/80">
              {hoursLines.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-cream/50">
              Order requests are sent to the team; confirm pickup at the truck.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
