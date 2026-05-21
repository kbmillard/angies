"use client";

import { CalendarRange, Clock, MapPin, Star } from "lucide-react";
import { useScheduleCatalog } from "@/context/ScheduleCatalogContext";
import { getCurrentScheduleStatus } from "@/lib/schedule/current-status";
import {
  splitWeeklySchedule,
  type WeeklyLocationGroup,
} from "@/lib/schedule/consolidate-weekly-schedule";
import { getNextWeeklyStop } from "@/lib/schedule/next-weekly-stop";
import {
  scheduleAppleHref,
  scheduleMapsHref,
} from "@/lib/schedule/schedule-ui-helpers";
import type { ScheduleItem } from "@/lib/schedule/schema";

function ScheduleDaysList({ days }: { days: WeeklyLocationGroup["days"] }) {
  return (
    <ul className="border-t border-white/10 pt-4">
      {days.map((day) => (
        <li
          key={day.dayOfWeek}
          className="grid grid-cols-[2.5rem_1fr] gap-x-3 py-1.5 text-sm"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-wide text-gold/90">
            {day.label}
          </span>
          <span className="font-mono text-xs text-cream/80 sm:text-sm">{day.timeRange}</span>
        </li>
      ))}
    </ul>
  );
}

function LocationGroupCard({
  group,
  showNextStop,
  nextStopLabel,
  nextStopTime,
}: {
  group: WeeklyLocationGroup;
  showNextStop: boolean;
  nextStopLabel: string;
  nextStopTime: string;
}) {
  const entry = group.sampleEntry;

  return (
    <div className="space-y-4">
      {showNextStop ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-accent-green/40 bg-accent-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-editorial text-accent-green">
            <Clock className="h-3 w-3" aria-hidden />
            Next Stop
          </span>
          <span className="text-sm text-cream/85">
            {nextStopLabel} · {nextStopTime}
          </span>
        </div>
      ) : null}

      <div>
        <h3 className="font-display text-2xl text-cream sm:text-3xl">{group.header}</h3>
        {group.description ? (
          <p className="mt-2 text-sm text-cream/75">{group.description}</p>
        ) : null}
      </div>

      {group.address ? (
        <div className="flex items-start gap-2 text-sm text-cream/90 sm:text-base">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
          <p className="leading-snug">{group.address}</p>
        </div>
      ) : null}

      <ScheduleDaysList days={group.days} />

      <div className="flex flex-wrap gap-2 pt-2">
        <a
          href={scheduleMapsHref(entry)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
        >
          Google Maps
        </a>
        <a
          href={scheduleAppleHref(entry)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
        >
          Apple Maps
        </a>
      </div>
    </div>
  );
}

function FeaturedLocationCard({ group }: { group: WeeklyLocationGroup }) {
  const entry = group.sampleEntry;

  return (
    <article className="rounded-2xl border border-gold/50 bg-black/25 p-5 ring-1 ring-gold/30 sm:p-6">
      <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-editorial text-gold">
        <Star className="h-3 w-3" aria-hidden />
        Featured this week
      </span>

      <div className="mt-4">
        <h3 className="font-display text-xl text-cream sm:text-2xl">{group.header}</h3>
        {group.description ? (
          <p className="mt-2 text-sm text-cream/75">{group.description}</p>
        ) : null}
      </div>

      {group.address ? (
        <div className="mt-3 flex items-start gap-2 text-sm text-cream/90">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <p className="leading-snug">{group.address}</p>
        </div>
      ) : null}

      <ScheduleDaysList days={group.days} />

      <div className="flex flex-wrap gap-2 pt-2">
        <a
          href={scheduleMapsHref(entry)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
        >
          Google Maps
        </a>
        <a
          href={scheduleAppleHref(entry)}
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

export function scheduleItemToMapLocation(entry: ScheduleItem) {
  return {
    id: entry.id,
    active: true,
    type: "food_truck" as const,
    sortOrder: 0,
    name: (entry.title ?? "").trim() || entry.locationName,
    label: "",
    address: entry.address,
    city: entry.city,
    state: entry.state,
    zip: entry.zip,
    hours: "",
    phone: "",
    email: "",
    status: "",
    statusNote: "",
    mapsUrl: entry.mapsUrl,
    embedUrl: "",
    lat: entry.lat,
    lng: entry.lng,
    lastUpdated: entry.updatedAt,
    timezone: entry.timezone,
    weeklyHoursJson: undefined,
    messageBoard: "",
  };
}

export function WeeklySchedulePanel() {
  const { loading, error, data } = useScheduleCatalog();
  const items = data?.items ?? [];
  const scheduleStatus = getCurrentScheduleStatus(items);
  const { regular, featured } = splitWeeklySchedule(items);
  const nextStop = !scheduleStatus.isOpen ? getNextWeeklyStop(items) : null;

  if (error) {
    return (
      <p className="rounded-xl border border-angie-orange/35 bg-angie-orange/10 p-4 text-sm text-cream">
        {error}
      </p>
    );
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-white/10" />;
  }

  if (regular.length === 0 && featured.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-center">
        <CalendarRange className="mx-auto h-10 w-10 text-gold/80" aria-hidden />
        <p className="mt-4 font-display text-xl text-cream sm:text-2xl">
          No public stops posted yet
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm text-cream/75">
          Check back soon or call Angie&apos;s for catering and private events.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {regular.map((group, index) => (
        <LocationGroupCard
          key={`regular-${group.header}-${group.address}-${index}`}
          group={group}
          showNextStop={!!nextStop && index === 0}
          nextStopLabel={nextStop?.dateLabel ?? nextStop?.dayName ?? ""}
          nextStopTime={nextStop?.timeRange ?? ""}
        />
      ))}

      {featured.length > 0 ? (
        <div className="space-y-4 border-t border-white/10 pt-6">
          {featured.map((group, index) => (
            <FeaturedLocationCard
              key={`featured-${group.header}-${group.address}-${index}`}
              group={group}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
