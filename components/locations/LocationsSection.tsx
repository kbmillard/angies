"use client";

import { MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/lib/data/locations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { glassCtaAccent, glassCtaBase } from "@/components/ui/glass-cta";
import { cn } from "@/lib/utils/cn";
import { useLocationsCatalog } from "@/context/LocationsCatalogContext";
import type { LocationItem } from "@/lib/locations/schema";
import { LocationPublicStatus } from "@/components/locations/LocationPublicStatus";
import {
  formatAddressLine,
  resolvedAppleMapsUrl,
  resolvedMapsUrl,
  telHrefFromDisplay,
} from "@/lib/locations/helpers";

function addressLines(loc: LocationItem): string[] {
  const cityLine = [loc.city, loc.state, loc.zip].filter(Boolean).join(" ").trim();
  const lines = [loc.address, cityLine].filter(Boolean);
  return lines.length > 0 ? lines : [];
}

function hasPublishedAddress(loc: LocationItem): boolean {
  return formatAddressLine(loc).trim().length > 0;
}

function MapButton({ label, href, accent }: { label: string; href: string; accent?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("w-full sm:w-auto", accent ? glassCtaAccent : glassCtaBase)}
    >
      {label}
    </a>
  );
}

export function LocationsSection() {
  const { loading, error, data } = useLocationsCatalog();

  const trucks = data?.foodTruckLocations ?? [];
  const primaryTruck = trucks[0];
  const phoneDisplay = primaryTruck?.phone?.trim() ?? "";
  const phoneTel = phoneDisplay
    ? telHrefFromDisplay(phoneDisplay, CONTACT.phones[0]!.tel)
    : `tel:${CONTACT.phones[0]!.tel}`;

  return (
    <section
      id="locations"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] bg-charcoal/45 pb-12 pt-12 backdrop-blur-sm sm:pb-14 sm:pt-14"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div id="locations-start" tabIndex={-1} className="outline-none focus:outline-none">
          <SectionHeading
            title="Find us on the curb — pin updates from the road."
            subtitle="The truck moves daily. Address, hours, and notes update here when they are published."
          />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl border border-angie-orange/35 bg-angie-orange/10 p-4 text-sm text-cream">
            {error}. Call{" "}
            {CONTACT.phones.map((p, i) => (
              <span key={p.tel}>
                {i > 0 ? " or " : null}
                <a className="underline" href={`tel:${p.tel}`}>
                  {p.display}
                </a>
              </span>
            ))}
            .
          </p>
        ) : null}

        {loading ? (
          <div className="mt-8 h-40 animate-pulse rounded-3xl bg-white/10" />
        ) : primaryTruck ? (
          <article className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-charcoal/35 p-5 backdrop-blur-md sm:p-6">
            <p className="text-xs uppercase tracking-editorial text-gold/90">Current truck location</p>
            <h3 className="mt-1 font-display text-2xl text-cream sm:text-3xl">{primaryTruck.name}</h3>
            <LocationPublicStatus location={primaryTruck} variant="card" showNote={false} />
            <div className="mt-3 flex items-start gap-2 text-sm text-cream/90">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <div>
                {hasPublishedAddress(primaryTruck) ? (
                  addressLines(primaryTruck).map((l) => <p key={l}>{l}</p>)
                ) : (
                  <p className="text-cream/75">TBD</p>
                )}
              </div>
            </div>
            <div
              id="schedule"
              tabIndex={-1}
              className="sr-only scroll-mt-[calc(var(--nav-h)+16px)] outline-none"
              aria-hidden
            />
            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-3 sm:gap-4">
              <MapButton label="Open in Google Maps" href={resolvedMapsUrl(primaryTruck)} />
              <MapButton label="Apple Maps" href={resolvedAppleMapsUrl(primaryTruck)} />
              <a href={phoneTel} className={cn(glassCtaAccent, "w-full gap-2 sm:w-auto")}>
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                Call / text
              </a>
            </div>
          </article>
        ) : (
          <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-cream/80">
            Current truck location is not available yet.
          </p>
        )}
      </div>
    </section>
  );
}
