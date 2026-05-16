"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScheduleListBlock } from "@/components/schedule/ScheduleListBlock";

/** Full-width schedule band (optional; homepage embeds `ScheduleListBlock` next to the map). */
export function ScheduleSection() {
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
        <ScheduleListBlock variant="page" />
      </div>
    </section>
  );
}
