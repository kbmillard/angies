"use client";

import { CalendarRange, MapPin, Star } from "lucide-react";
import { useScheduleCatalog } from "@/context/ScheduleCatalogContext";
import type { ScheduleItem } from "@/lib/schedule/schema";
import { SOCIAL_LINKS } from "@/lib/data/social";
import {
  formatScheduleWhen,
  scheduleAppleHref,
  scheduleLineAddress,
  scheduleMapsHref,
} from "@/lib/schedule/schedule-ui-helpers";

function ScheduleCard({
  it,
  compact,
  highlight,
}: {
  it: ScheduleItem;
  compact: boolean;
  highlight: boolean;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-black/25 ${
        compact ? "p-4" : "p-6"
      } ${
        highlight
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
        {formatScheduleWhen(it)}
      </p>
      <h3
        className={`mt-1 font-display text-cream ${
          compact ? "text-xl sm:text-2xl" : "text-2xl"
        }`}
      >
        {it.title}
      </h3>
      {it.locationName ? (
        <p className="mt-2 flex items-start gap-2 text-sm text-cream/85">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <span>
            <span className="font-medium text-cream">{it.locationName}</span>
            {scheduleLineAddress(it) ? (
              <>
                <br />
                <span className="text-cream/70">{scheduleLineAddress(it)}</span>
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
          href={scheduleMapsHref(it)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
        >
          Google Maps
        </a>
        <a
          href={scheduleAppleHref(it)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
        >
          Apple Maps
        </a>
      </div>
    </article>
  );
}

type Props = {
  /** Full-page grid vs single column under the map */
  variant?: "page" | "embedded";
};

export function ScheduleListBlock({ variant = "page" }: Props) {
  const { loading, error, data } = useScheduleCatalog();
  const items = data?.items ?? [];
  const nextId = items[0]?.id;
  const compact = variant === "embedded";

  return (
    <>
      {error ? (
        <p
          className={`rounded-xl border border-angie-orange/35 bg-angie-orange/10 p-4 text-sm text-cream ${
            compact ? "mt-0" : "mt-6"
          }`}
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div
          className={`grid gap-4 ${compact ? "mt-6 grid-cols-1" : "mt-12 sm:grid-cols-2"}`}
        >
          <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
          {!compact ? <div className="h-40 animate-pulse rounded-2xl bg-white/10" /> : null}
        </div>
      ) : items.length === 0 ? (
        <div
          className={`rounded-3xl border border-white/10 bg-black/30 p-6 text-center ${
            compact ? "mt-6" : "mt-12 p-10"
          }`}
        >
          <CalendarRange className="mx-auto h-10 w-10 text-gold/80" aria-hidden />
          <p className="mt-4 font-display text-xl text-cream sm:text-2xl">
            Schedule coming soon
          </p>
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
        <ul
          className={`grid gap-4 ${
            compact ? "mt-6 grid-cols-1" : "mt-12 sm:grid-cols-2"
          }`}
        >
          {items.map((it) => (
            <li key={it.id}>
              <ScheduleCard
                it={it}
                compact={compact}
                highlight={it.id === nextId}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
