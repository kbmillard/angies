import type { Metadata } from "next";
import Link from "next/link";
import { AngiesTruckCTA } from "@/components/cta/AngiesTruckCTA";

export const metadata: Metadata = {
  title: "Truck button preview",
  robots: { index: false, follow: false },
};

export default function TruckButtonPreviewPage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-5 py-16">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs uppercase tracking-editorial text-cream/50">Preview only</p>
        <h1 className="mt-2 font-display text-3xl text-cream">Truck CTA button</h1>
        <p className="mt-3 text-sm text-cream/65">
          Not on the live homepage. Default uses <strong className="text-cream">angie-orange</strong>{" "}
          (#f7542d) truck gradient. <strong className="text-cream">Salsa</strong> is for closed/destructive only.
        </p>
        <p className="mt-6 flex justify-center gap-4 text-sm">
          <Link href="/admin" className="text-gold underline-offset-4 hover:underline">
            ← Admin
          </Link>
          <Link href="/" className="text-gold underline-offset-4 hover:underline">
            Home
          </Link>
        </p>
      </div>

      <section className="mt-14 w-full max-w-md text-center">
        <p className="text-xs uppercase tracking-editorial text-gold/90">Brand gradient (default)</p>
        <p className="mt-1 text-sm text-cream/60">Could be the “enter the site” gate someday</p>
        <div className="mt-6 flex justify-center">
          <AngiesTruckCTA
            label="Enter for flavor explosion"
            subtext="Tap to roll in"
            tone="orange"
          />
        </div>
      </section>

      <section className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-charcoal/35 p-6 text-center backdrop-blur-md">
          <p className="text-xs uppercase tracking-editorial text-gold/90">Salsa tone</p>
          <p className="mt-1 text-sm text-cream/60">#b92b19 — closed / destructive only</p>
          <div className="mt-8 flex justify-center">
            <AngiesTruckCTA tone="salsa" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-charcoal/35 p-6 text-center backdrop-blur-md">
          <p className="text-xs uppercase tracking-editorial text-gold/90">Orange tone</p>
          <p className="mt-1 text-sm text-cream/60">#f7542d — nav MENU + glass accent</p>
          <div className="mt-8 flex justify-center">
            <AngiesTruckCTA tone="orange" />
          </div>
        </div>
      </section>
    </main>
  );
}
