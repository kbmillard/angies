"use client";

import { CalendarRange } from "lucide-react";
import { useScheduleCatalog } from "@/context/ScheduleCatalogContext";
import { WeeklySchedulePanel } from "@/components/schedule/WeeklySchedulePanel";
import { consolidateWeeklySchedule } from "@/lib/schedule/consolidate-weekly-schedule";

type Props = {
  /** Full-page vs embedded — both use the consolidated weekly panel now */
  variant?: "page" | "embedded";
};

export function ScheduleListBlock({ variant = "page" }: Props) {
  const { loading, error, data } = useScheduleCatalog();
  const items = data?.items ?? [];
  const groups = consolidateWeeklySchedule(items);
  const compact = variant === "embedded";

  if (error) {
    return (
      <p
        className={`rounded-xl border border-angie-orange/35 bg-angie-orange/10 p-4 text-sm text-cream ${
          compact ? "mt-0" : "mt-6"
        }`}
      >
        {error}
      </p>
    );
  }

  if (loading) {
    return (
      <div className={`${compact ? "mt-6" : "mt-12"} h-40 animate-pulse rounded-2xl bg-white/10`} />
    );
  }

  if (groups.length === 0) {
    return (
      <div
        className={`rounded-3xl border border-white/10 bg-black/30 p-6 text-center ${
          compact ? "mt-6" : "mt-12 p-10"
        }`}
      >
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
    <div className={compact ? "mt-6" : "mt-12"}>
      <WeeklySchedulePanel />
    </div>
  );
}
