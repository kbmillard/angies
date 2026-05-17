"use client";

import { Instagram, Facebook } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { SOCIAL_LINKS } from "@/lib/data/social";
import { homeBandClass } from "@/lib/ui/home-band";

export function SocialPromoSection() {
  const site = useSiteSettings();
  const s = site.social;

  return (
    <section className={homeBandClass}>
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-navy/70 to-charcoal p-8 sm:p-12 md:p-14">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 18% 12%, rgba(247, 84, 45, 0.14), transparent 55%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <div className="t-kicker t-kicker-gold mb-4">Follow along</div>
              <h2 className="t-section max-w-[18ch]">
                Follow the truck — <em>same-day</em> updates.
              </h2>
              <p className="t-body-lg mt-6 max-w-[34rem]">
                {s.subtitle} {s.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SOCIAL_LINKS.instagram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm text-cream transition hover:border-gold/40 hover:bg-white/[0.07]"
                >
                  <Instagram className="h-4 w-4 shrink-0" aria-hidden />
                  {s.instagramHandle ?? SOCIAL_LINKS.instagram.handle}
                </a>
                <a
                  href={SOCIAL_LINKS.facebook.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm text-cream transition hover:border-gold/40 hover:bg-white/[0.07]"
                >
                  <Facebook className="h-4 w-4 shrink-0" aria-hidden />
                  {s.facebookHandle ?? SOCIAL_LINKS.facebook.label}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
