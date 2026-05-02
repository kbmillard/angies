"use client";

import { CalendarRange, MapPin, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useScheduleCatalog } from "@/context/ScheduleCatalogContext";
import type { ScheduleItem } from "@/lib/schedule/schema";
import { SOCIAL_LINKS } from "@/lib/data/social";
import { MAPS_FALLBACK_SEARCH_QUERY } from "@/lib/locations/helpers";

function formatWhen(it: ScheduleItem): string {
  const d = it.date?.trim();
  const a = it.startTime?.trim();
  const b = it.endTime?.trim();
  if (!d) return "—";
  if (a && b) return `${d} · ${a} – ${b}`;
  if (a) return `${d} · from ${a}`;
  return d;
}

function lineAddress(it: ScheduleItem): string {
  const parts = [it.address, [it.city, it.state, it.zip].filter(Boolean).join(" ")].filter(
    Boolean,
  );
  return parts.join(" · ");
}

function mapsHref(it: ScheduleItem): string {
  const u = it.mapsUrl?.trim();
  if (u) return u;
  const q = encodeURIComponent(lineAddress(it) || it.locationName || MAPS_FALLBACK_SEARCH_QUERY);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function appleHref(it: ScheduleItem): string {
  const qApple = encodeURIComponent(lineAddress(it) || it.locationName || MAPS_FALLBACK_SEARCH_QUERY);
  return `https://maps.apple.com/?q=${qApple}`;
}

export function ScheduleSection() {
  const { loading, error, data } = useScheduleCatalog();
  const items = data?.items ?? [];
  const nextId = items[0]?.id;

  return (
    <section
      id="schedule"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] bg-charcoal/45 py-24 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div id="schedule-start" tabIndex={-1} className="outline-none focus:outline-none">
          <SectionHeading
            kicker="Upcoming schedule"
            title="Where we are rolling next."
            subtitle="Dates, times, and stops update here when they are published."
          />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl border border-salsa/40 bg-salsa/10 p-4 text-sm text-cream">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-white/10 bg-black/30 p-10 text-center">
            <CalendarRange className="mx-auto h-10 w-10 text-gold/80" aria-hidden />
            <p className="mt-4 font-display text-2xl text-cream">Schedule coming soon</p>
            <p className="mx-auto mt-3 max-w-lg text-sm text-cream/75">
              Follow{" "}
              <a
                href={SOCIAL_LINKS.facebook.href}
                className="text-gold underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>{" "}
              or{" "}
              <a
                href={SOCIAL_LINKS.instagram.href}
                className="text-gold underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {SOCIAL_LINKS.instagram.handle}
              </a>{" "}
              for daily truck updates until the live schedule is published.
            </p>
          </div>
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {items.map((it) => (
              <li key={it.id}>
                <article
                  className={`flex h-full flex-col rounded-2xl border bg-black/25 p-6 ${
                    it.id === nextId
                      ? "border-gold/50 ring-1 ring-gold/30"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {it.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-editorial text-gold">
                        <Star className="h-3 w-3" aria-hidden />
                        Featured
                      </span>
                    ) : null}
                    {it.status ? (
                      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-editorial text-cream/80">
                        {it.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-editorial text-cream/55">
                    {formatWhen(it)}
                  </p>
                  <h3 className="mt-1 font-display text-2xl text-cream">{it.title}</h3>
                  {it.locationName ? (
                    <p className="mt-2 flex items-start gap-2 text-sm text-cream/85">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                      <span>
                        <span className="font-medium text-cream">{it.locationName}</span>
                        {lineAddress(it) ? (
                          <>
                            <br />
                            <span className="text-cream/70">{lineAddress(it)}</span>
                          </>
                        ) : null}
                      </span>
                    </p>
                  ) : null}
                  {it.description ? (
                    <p className="mt-3 text-sm text-cream/70">{it.description}</p>
                  ) : null}
                  {it.statusNote ? (
                    <p className="mt-2 text-xs text-cream/60">{it.statusNote}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={mapsHref(it)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
                    >
                      Google Maps
                    </a>
                    <a
                      href={appleHref(it)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
                    >
                      Apple Maps
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
