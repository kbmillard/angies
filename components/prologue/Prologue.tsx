"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export function Prologue() {
  const site = useSiteSettings();

  return (
    <section
      id="prologue"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] pt-10 pb-2 sm:pt-14 sm:pb-4"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="mx-auto mb-10 max-w-3xl rounded-3xl border border-white/10 bg-charcoal/92 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)] sm:mb-14 sm:p-10">
          <SectionHeading
            title={site.prologue.title}
            subtitle={site.prologue.subtitle}
            align="center"
            className="max-w-none [&_h2]:text-balance [&_p]:text-pretty"
          />
        </div>
      </div>
    </section>
  );
}
