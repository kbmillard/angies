"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { PUBLIC_HOURS_LINES } from "@/lib/data/locations";
import { useLocationsCatalog } from "@/context/LocationsCatalogContext";
import { footerTruckVisit } from "@/lib/locations/footer-visit-from-catalog";

export function SiteFooter() {
  const { error, data } = useLocationsCatalog();

  const visitTruck = footerTruckVisit(data);

  return (
    <footer
      id="contact"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] border-t border-white/10 bg-charcoal/70 py-16 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 sm:flex-row sm:justify-between sm:px-8">
        <div>
          <BrandLogo width={72} height={72} />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-editorial text-cream/50">Visit</p>
            {visitTruck.address?.trim() ? (
              <p className="mt-2 text-sm text-cream/85">{visitTruck.address}</p>
            ) : (
              <p className="mt-2 text-sm text-cream/70">TBD</p>
            )}
            {visitTruck.detail?.trim() ? (
              <p className="text-sm text-cream/85">{visitTruck.detail}</p>
            ) : null}
            {visitTruck.cityLine?.trim() ? (
              <p className="text-sm text-cream/85">{visitTruck.cityLine}</p>
            ) : null}
            {error ? (
              <p className="mt-3 text-xs text-cream/50">Visit details could not be loaded.</p>
            ) : null}
          </div>
          <div>
            <p className="text-xs uppercase tracking-editorial text-cream/50">Hours</p>
            <ul className="mt-2 space-y-1 text-sm text-cream/80">
              {PUBLIC_HOURS_LINES.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
