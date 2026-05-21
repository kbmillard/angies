"use client";

import { Phone } from "lucide-react";
import { CONTACT } from "@/lib/data/locations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { glassCtaAccent, glassCtaBase } from "@/components/ui/glass-cta";
import { cn } from "@/lib/utils/cn";
import { useScheduleCatalog } from "@/context/ScheduleCatalogContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import type { LocationItem } from "@/lib/locations/schema";
import { getCurrentScheduleStatus } from "@/lib/schedule/current-status";
import {
  consolidateWeeklySchedule,
} from "@/lib/schedule/consolidate-weekly-schedule";
import {
  formatAddressLine,
  resolvedAppleMapsUrl,
  resolvedEmbedSrc,
  resolvedMapsUrl,
} from "@/lib/locations/helpers";
import { DEFAULT_MAP_PIN_LAT, DEFAULT_MAP_PIN_LNG } from "@/lib/maps/default-map-pin";
import { GoogleMapClientResolved } from "@/components/locations/GoogleMapClientResolved";
import { GoogleMapGreedy } from "@/components/locations/GoogleMapGreedy";
import {
  WeeklySchedulePanel,
  scheduleItemToMapLocation,
} from "@/components/schedule/WeeklySchedulePanel";

const MAP_FRAME_CLASS =
  "aspect-[4/5] h-auto min-h-[200px] w-full bg-charcoal lg:min-h-[280px]";

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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal/60">
      {useGreedyJsMap && lat != null && lng != null ? (
        <GoogleMapGreedy lat={lat} lng={lng} title={loc.name} className={MAP_FRAME_CLASS} />
      ) : useClientResolve ? (
        <GoogleMapClientResolved loc={loc} title={loc.name} className={MAP_FRAME_CLASS} />
      ) : src && apiKey ? (
        <GoogleMapGreedy
          lat={DEFAULT_MAP_PIN_LAT}
          lng={DEFAULT_MAP_PIN_LNG}
          title={loc.name}
          className={MAP_FRAME_CLASS}
        />
      ) : src ? (
        <iframe
          title={`Map — ${loc.name}`}
          className={MAP_FRAME_CLASS}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={src}
        />
      ) : (
        <div className="flex min-h-[200px] items-center justify-center p-6 text-sm text-cream/75">
          <div className="text-center">
            <p className="font-medium text-cream">Map</p>
            <p className="mt-2 text-cream/70">TBD</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MapButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("w-full", glassCtaBase)}
    >
      {label}
    </a>
  );
}

export function LocationsSection() {
  const { loading, error, data: scheduleData } = useScheduleCatalog();
  const site = useSiteSettings();
  const items = scheduleData?.items ?? [];
  const scheduleStatus = getCurrentScheduleStatus(items);
  const groups = consolidateWeeklySchedule(items);

  const mapEntry =
    scheduleStatus.currentLocation ??
    groups[0]?.sampleEntry ??
    null;

  const mapLocation: LocationItem | null = mapEntry
    ? scheduleItemToMapLocation(mapEntry)
    : null;

  const phoneTel = `tel:${CONTACT.phones[0]!.tel}`;

  return (
    <section
      id="locations"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] bg-charcoal/45 pb-16 pt-12 backdrop-blur-sm sm:pb-20 sm:pt-14"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div id="locations-start" tabIndex={-1} className="outline-none focus:outline-none">
          <SectionHeading title={site.location.title} subtitle={site.location.subtitle} />
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
        ) : (
          <article className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-charcoal/35 p-5 backdrop-blur-md sm:p-8 lg:p-10">
            <div className="border-b border-white/10 pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs uppercase tracking-editorial text-gold/90">Truck status</p>
                {scheduleStatus.isOpen ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-green/30 bg-accent-green/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-editorial text-accent-green">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
                    Open Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-salsa/30 bg-salsa/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-editorial text-salsa">
                    <span className="h-1.5 w-1.5 rounded-full bg-salsa" />
                    Closed
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-cream/75">
                {scheduleStatus.isOpen
                  ? "Angie's is serving now at the location below. Stop by or open directions."
                  : "Angie's is not serving right now. See this week's schedule below for the next stop."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-10">
              <div
                id="schedule"
                tabIndex={-1}
                className="min-w-0 scroll-mt-[calc(var(--nav-h)+16px)] outline-none focus:outline-none"
              >
                <p className="text-xs font-semibold uppercase tracking-editorial text-gold/90">
                  This Week&apos;s Schedule
                </p>
                <p className="mt-1 text-sm text-cream/65">
                  Fresh stops, times, and locations for this week.
                </p>
                <div className="mt-4">
                  <WeeklySchedulePanel />
                </div>
              </div>

              <div className="min-w-0">
                {mapLocation ? (
                  <MapEmbedBlock loc={mapLocation} />
                ) : (
                  <div className="flex aspect-[4/5] min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-charcoal/60 p-6 text-sm text-cream/75">
                    Map updates when schedule is posted.
                  </div>
                )}
              </div>
            </div>

            {mapLocation ? (
              <div className="mt-8 grid grid-cols-1 gap-3 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-4">
                <MapButton label="Open in Google Maps" href={resolvedMapsUrl(mapLocation)} />
                <MapButton label="Apple Maps" href={resolvedAppleMapsUrl(mapLocation)} />
                <a href={phoneTel} className={cn(glassCtaAccent, "w-full gap-2")}>
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  Call / text
                </a>
              </div>
            ) : null}
          </article>
        )}
      </div>
    </section>
  );
}
