"use client";

import Reveal from "@/components/ui/Reveal";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { prologueSectionClass } from "@/lib/ui/home-band";

export function Prologue() {
  const site = useSiteSettings();

  return (
    <section id="prologue" className={prologueSectionClass}>
      <Reveal
        as="div"
        className="relative mx-auto max-w-3xl rounded-3xl border border-white/10 bg-charcoal/92 p-8 sm:p-14 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--gold, #f6a21a) 50%, transparent 100%)",
          }}
        />

        <span
          className="t-script inline-block text-3xl sm:text-4xl leading-none mb-2"
          style={{ transform: "rotate(-3deg)" }}
        >
          ¡Bienvenidos!
        </span>

        <div className="t-kicker t-kicker-gold mt-1 mb-4">A warm welcome</div>

        <h2 className="t-section mb-5">
          Welcome to <em>Angie&apos;s Food Truck.</em>
        </h2>

        <p className="t-body-lg max-w-xl mx-auto">{site.prologue.subtitle}</p>
      </Reveal>
    </section>
  );
}
