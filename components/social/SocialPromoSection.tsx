"use client";

import { motion } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SOCIAL_LINKS } from "@/lib/data/social";

export function SocialPromoSection() {
  return (
    <section className="relative z-10 bg-charcoal/45 py-24 backdrop-blur-sm">
      <div className="mx-auto max-w-[900px] px-5 sm:px-8">
        <SectionHeading
          kicker="Social"
          title="Follow the truck — same-day updates."
          align="center"
          subtitle="Facebook and Instagram carry the live pin, specials, and catering highlights."
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="mt-10 rounded-3xl border border-gold/25 bg-gradient-to-br from-navy/60 to-charcoal p-8 text-center"
        >
          <p className="text-lg font-medium text-cream">
            Tag us when you order — we love resharing KC neighborhoods enjoying Angie&apos;s.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={SOCIAL_LINKS.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-cream transition hover:bg-white/10"
            >
              <Instagram className="h-5 w-5" aria-hidden />
              <span>
                {SOCIAL_LINKS.instagram.label}{" "}
                <span className="text-cream/70">({SOCIAL_LINKS.instagram.handle})</span>
              </span>
            </a>
            <a
              href={SOCIAL_LINKS.facebook.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-cream transition hover:bg-white/10"
            >
              <Facebook className="h-5 w-5" aria-hidden />
              <span>{SOCIAL_LINKS.facebook.label}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
