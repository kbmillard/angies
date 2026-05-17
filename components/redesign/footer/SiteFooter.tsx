"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  CONTACT,
  FOOTER_BRAND_BLURB,
  FOOTER_HOURS_LINES,
} from "@/lib/data/locations";
import { useLocationsCatalog } from "@/context/LocationsCatalogContext";
import { useOrder } from "@/context/OrderContext";
import { footerTruckVisit } from "@/lib/locations/footer-visit-from-catalog";

export function SiteFooter() {
  const { error, data } = useLocationsCatalog();
  const { scrollToSection } = useOrder();
  const visitTruck = footerTruckVisit(data);
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="relative z-10 scroll-mt-[calc(var(--header-stack-h)+1rem)] border-t border-white/10 bg-charcoal/70 py-10 backdrop-blur-md sm:py-12"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div className="space-y-4">
            <BrandLogo width={56} height={56} />
            <p className="max-w-[32ch] text-sm leading-relaxed text-cream/80">{FOOTER_BRAND_BLURB}</p>
          </div>

          <div>
            <p className="t-kicker mb-3">Visit</p>
            <ul className="space-y-1 text-sm text-cream/85">
              {visitTruck.address?.trim() ? <li>{visitTruck.address}</li> : <li>TBD</li>}
              {visitTruck.cityLine?.trim() ? <li>{visitTruck.cityLine}</li> : null}
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("locations")}
                  className="text-gold/90 transition hover:text-gold"
                >
                  Today&apos;s pin →
                </button>
              </li>
            </ul>
            {error ? (
              <p className="mt-2 text-xs text-cream/50">Visit details could not be loaded.</p>
            ) : null}
          </div>

          <div>
            <p className="t-kicker mb-3">Hours</p>
            <ul className="space-y-1">
              {FOOTER_HOURS_LINES.map((h) => (
                <li key={h} className="t-hours-mono">
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="t-kicker mb-3">Contact</p>
            <ul className="space-y-1 text-sm">
              {CONTACT.phones.map((p) => (
                <li key={p.tel}>
                  <a href={`tel:${p.tel}`} className="text-cream/85 transition hover:text-cream">
                    {p.display}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-gold/90 transition hover:text-gold"
                >
                  Email us →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-cream/55 sm:flex-row">
          <span>© {year} Angie&apos;s Food Truck · Kansas City</span>
          <span
            className="t-script text-lg text-gold sm:text-xl"
            style={{ transform: "rotate(-2deg)" }}
          >
            Hecho con cariño
          </span>
        </div>
      </div>
    </footer>
  );
}
