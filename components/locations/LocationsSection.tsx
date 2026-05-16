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
  resolvedEmbedSrc,
  resolvedMapsUrl,
  telHrefFromDisplay,
} from "@/lib/locations/helpers";
import { DEFAULT_MAP_PIN_LAT, DEFAULT_MAP_PIN_LNG } from "@/lib/maps/default-map-pin";
import { GoogleMapClientResolved } from "@/components/locations/GoogleMapClientResolved";
import { GoogleMapGreedy } from "@/components/locations/GoogleMapGreedy";
import { ScheduleListBlock } from "@/components/schedule/ScheduleListBlock";

const MAP_FRAME_CLASS =
  "h-[min(48vw,320px)] w-full min-h-[200px] bg-charcoal lg:min-h-[240px]";

function addressLines(loc: LocationItem): string[] {
  const cityLine = [loc.city, loc.state, loc.zip].filter(Boolean).join(" ").trim();
  return [loc.address?.trim(), cityLine].filter((line): line is string => Boolean(line));
}

function hasPublishedAddress(loc: LocationItem): boolean {
  return formatAddressLine(loc).trim().length > 0;
}

function parseCoord(n: number | null | undefined): number | null {
  if (n == null) return null;
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}

function MapEmbedBlock({ loc }: { loc: LocationItem }) {
  const line = formatAddressLine(loc);
  const ownerEmbed = loc.embedUrl?.trim();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const placeId = loc.placeId?.trim();
  const lat = parseCoord(loc.lat);
  const lng = parseCoord(loc.lng);
  const coordsOk = lat != null && lng != null;
  const useGreedyJsMap = coordsOk && Boolean(apiKey);
  const useClientResolve =
    Boolean(apiKey) &&
    !coordsOk &&
    (Boolean(placeId) || Boolean(line.trim())) &&
    !ownerEmbed?.trim();
  const src = useGreedyJsMap ? null : resolvedEmbedSrc(loc);

  return (
    <>
      {useGreedyJsMap && lat != null && lng != null ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <GoogleMapGreedy lat={lat} lng={lng} title={loc.name} className={MAP_FRAME_CLASS} />
        </div>
      ) : useClientResolve ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <GoogleMapClientResolved loc={loc} title={loc.name} className={MAP_FRAME_CLASS} />
        </div>
      ) : src && apiKey ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <GoogleMapGreedy
            lat={DEFAULT_MAP_PIN_LAT}
            lng={DEFAULT_MAP_PIN_LNG}
            title={loc.name}
            className={MAP_FRAME_CLASS}
          />
        </div>
      ) : src ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title={`Map — ${loc.name}`}
            className={MAP_FRAME_CLASS}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={src}
          />
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-charcoal/60 p-6 text-sm text-cream/75">
          <div className="text-center">
            <p className="font-medium text-cream">Map</p>
            <p className="mt-2 text-cream/70">TBD</p>
          </div>
        </div>
      )}
    </>
  );
}

function MapButton({ label, href, accent }: { label: string; href: string; accent?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("w-full", accent ? glassCtaAccent : glassCtaBase)}
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
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] bg-charcoal/45 pb-16 pt-12 backdrop-blur-sm sm:pb-20 sm:pt-14"
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
          <div className="mt-8 h-96 animate-pulse rounded-3xl bg-white/10" />
        ) : primaryTruck ? (
          <article className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-charcoal/35 p-5 backdrop-blur-md sm:p-8 lg:p-10">
            <div className="grid gap-5 border-b border-white/10 pb-6 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-x-12">
              <div className="min-w-0 space-y-2 sm:space-y-3">
                <p className="text-xs uppercase tracking-editorial text-gold/90">
                  Current truck location
                </p>
                <h3 className="font-display text-3xl text-cream sm:text-4xl">
                  {primaryTruck.name}
                </h3>
                <LocationPublicStatus
                  location={primaryTruck}
                  variant="card"
                  showNote={false}
                  className="[&_p]:mt-0"
                />
              </div>
              <div className="flex items-start gap-2 text-sm text-cream/90 sm:text-base lg:justify-end lg:pt-7 lg:text-right">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                <div className="min-w-0">
                  {hasPublishedAddress(primaryTruck) ? (
                    addressLines(primaryTruck).map((line) => (
                      <p key={line} className="leading-snug">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-cream/75">TBD</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
              <div
                id="schedule"
                tabIndex={-1}
                className="min-w-0 scroll-mt-[calc(var(--nav-h)+16px)] outline-none focus:outline-none"
              >
                <p className="text-xs font-semibold uppercase tracking-editorial text-gold/90">
                  Upcoming schedule
                </p>
                <p className="mt-1 text-sm text-cream/65">Where we&apos;re rolling next.</p>
                <div className="mt-3">
                  <ScheduleListBlock variant="embedded" />
                </div>
              </div>

              <div className="min-w-0">
                <MapEmbedBlock loc={primaryTruck} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-4">
              <MapButton label="Open in Google Maps" href={resolvedMapsUrl(primaryTruck)} />
              <MapButton label="Apple Maps" href={resolvedAppleMapsUrl(primaryTruck)} />
              <a href={phoneTel} className={cn(glassCtaAccent, "w-full gap-2")}>
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
