"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";

export function Prologue() {
  return (
    <section
      id="prologue"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] pt-10 pb-2 sm:pt-14 sm:pb-4"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="mx-auto mb-10 max-w-3xl rounded-3xl border border-white/10 bg-charcoal/35 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md sm:mb-14 sm:p-10">
          <SectionHeading
            title="Welcome to Angie&apos;s Food Truck."
            subtitle="Fresh Mexican plates from the window — tacos, birria, burritos, aguas frescas, and daily specials. Follow the pin for today’s stop, or book us for your next event."
            align="center"
            className="max-w-none [&_h2]:text-balance [&_p]:text-pretty"
          />
        </div>
      </div>
    </section>
  );
}
