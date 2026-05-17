"use client";

import type { ReactNode } from "react";
import { MapPin, Phone } from "lucide-react";
import { CONTACT, PUBLIC_HOURS_ROWS } from "@/lib/data/locations";
import Reveal from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeBandClass } from "@/lib/ui/home-band";
import { glassCtaBase } from "@/components/ui/glass-cta";
import { cn } from "@/lib/utils/cn";
import { useLocationsCatalog } from "@/context/LocationsCatalogContext";
import type { LocationItem } from "@/lib/locations/schema";
import { LocationPublicStatus } from "@/components/locations/LocationPublicStatus";
import {
  formatAddressLine,
  resolvedEmbedSrc,
  resolvedMapsUrl,
  telHrefFromDisplay,
} from "@/lib/locations/helpers";
import { DEFAULT_MAP_PIN_LAT, DEFAULT_MAP_PIN_LNG } from "@/lib/maps/default-map-pin";
import { GoogleMapClientResolved } from "@/components/locations/GoogleMapClientResolved";
import { GoogleMapGreedy } from "@/components/locations/GoogleMapGreedy";
import MapPinRadar from "@/components/locations/MapPinRadar";
import { ScheduleListBlock } from "@/components/schedule/ScheduleListBlock";

const MAP_FRAME_CLASS =
  "aspect-[4/5] w-full min-h-[240px] bg-charcoal sm:min-h-[280px]";

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

function MapFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10">{children}</div>
  );
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
        <MapFrame>
          <GoogleMapGreedy lat={lat} lng={lng} title={loc.name} className={MAP_FRAME_CLASS} />
        </MapFrame>
      ) : useClientResolve ? (
        <MapFrame>
          <GoogleMapClientResolved loc={loc} title={loc.name} className={MAP_FRAME_CLASS} />
        </MapFrame>
      ) : src && apiKey ? (
        <MapFrame>
          <GoogleMapGreedy
            lat={DEFAULT_MAP_PIN_LAT}
            lng={DEFAULT_MAP_PIN_LNG}
            title={loc.name}
            className={MAP_FRAME_CLASS}
          />
        </MapFrame>
      ) : src ? (
        <MapFrame>
          <iframe
            title={`Map — ${loc.name}`}
            className={MAP_FRAME_CLASS}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={src}
          />
        </MapFrame>
      ) : (
        <MapPinRadar />
      )}
    </>
  );
}

function MapButton({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(glassCtaBase)}>
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
    <section id="locations" className={homeBandClass}>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div
          id="locations-start"
          tabIndex={-1}
          className="scroll-mt-[calc(var(--header-stack-h)+1rem)] outline-none focus:outline-none"
        >
          <Reveal>
            <SectionHeading
              kicker="Today on the curb"
              title={
                <>
                  Find us — <em>pin updates</em> from the road.
                </>
              }
              subtitle="The truck moves daily. Address, hours, and notes update here when they are published."
            />
          </Reveal>
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
          <>
            <Reveal className="mt-10">
              <article className="grid grid-cols-1 gap-10 rounded-3xl border border-white/10 bg-charcoal/55 p-6 backdrop-blur-md sm:p-8 md:grid-cols-[1.2fr_1fr] md:gap-14 md:p-10 lg:items-center">
                <div className="min-w-0">
                  <LocationPublicStatus
                    location={primaryTruck}
                    variant="card"
                    showNote={false}
                    className="[&_p]:mt-0"
                  />
                  <h3 className="t-section mt-4 text-3xl sm:text-4xl">{primaryTruck.name}</h3>
                  <div className="mt-6 flex items-center gap-3 text-base text-cream/90">
                    <MapPin className="h-5 w-5 shrink-0 text-gold" aria-hidden />
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
                  <ul className="mt-6 border-t border-white/[0.08] pt-5">
                    {PUBLIC_HOURS_ROWS.map((row) => (
                      <li
                        key={row.days}
                        className="flex items-baseline justify-between gap-4 py-2 text-[0.92rem] text-cream/78"
                      >
                        <span>{row.days}</span>
                        <span className="t-hours-mono text-[0.82rem]">{row.hours}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <MapButton label="Google Maps" href={resolvedMapsUrl(primaryTruck)} />
                    <a href={phoneTel} className={cn(glassCtaBase, "gap-2")}>
                      <Phone className="h-4 w-4 shrink-0" aria-hidden />
                      Call / text
                    </a>
                  </div>
                </div>
                <div className="min-w-0">
                  <MapEmbedBlock loc={primaryTruck} />
                </div>
              </article>
            </Reveal>
            <div
              id="schedule"
              tabIndex={-1}
              className="mt-10 scroll-mt-[calc(var(--header-stack-h)+1rem)] outline-none focus:outline-none"
            >
              <p className="t-kicker t-kicker-gold">Upcoming schedule</p>
              <p className="mt-1 text-sm text-cream/65">Where we&apos;re rolling next.</p>
              <div className="mt-4">
                <ScheduleListBlock variant="embedded" />
              </div>
            </div>
          </>
        ) : (
          <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-cream/80">
            Current truck location is not available yet.
          </p>
        )}
      </div>
    </section>
  );
}
