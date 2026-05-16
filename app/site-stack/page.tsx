import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Site stack reference | Angie's Food Truck",
  description: "Internal-style map of how angieskc.com is built (stack and component files).",
  robots: { index: false, follow: false },
};

const STACK = [
  ["Framework", "Next.js 15 (App Router)"],
  ["UI", "React 19"],
  ["Language", "TypeScript (.tsx / .ts)"],
  ["Styling", "Tailwind CSS 3 + app/globals.css"],
  ["Animation", "Framer Motion"],
  ["Icons", "Lucide React"],
  ["Fonts", "DM Sans + Playfair Display"],
  ["Hosting", "Vercel"],
  ["Database", "Postgres (when configured)"],
  ["Maps", "Google Maps API"],
] as const;

const SECTIONS = [
  ["Nav + Menu button", "components/nav/EditorialNav.tsx"],
  ["Fixed watermark", "components/prologue/FixedBrandBackdrop.tsx"],
  ["Hero", "components/hero/Hero.tsx"],
  ["Welcome", "components/prologue/Prologue.tsx"],
  ["Story", "components/story/StorySection.tsx"],
  ["Menu", "components/menu/InteractiveMenu.tsx"],
  ["Location + map + schedule", "components/locations/LocationsSection.tsx"],
  ["Social", "components/social/SocialPromoSection.tsx"],
  ["Catering", "components/catering/CateringSection.tsx"],
  ["READY TO EAT?", "components/cta/FinalConversion.tsx"],
  ["Footer", "components/footer/SiteFooter.tsx"],
] as const;

const OVERLAYS = [
  ["Cart / checkout", "components/order/OrderDrawer.tsx"],
  ["Payment modal", "components/clover/CloverPaymentModal.tsx"],
] as const;

const DATA = [
  ["Site copy defaults", "lib/site-settings/defaults.ts (+ admin DB)"],
  ["Menu JSON", "public/menu/menu.json → app/api/menu/route.ts"],
  ["Footer hours", "lib/data/locations.ts"],
  ["Truck hours logic", "lib/locations/angies-truck-hours.ts"],
  ["Locations API", "app/api/locations/route.ts"],
  ["Schedule API", "app/api/schedule/route.ts"],
] as const;

function Table({
  title,
  rows,
}: {
  title: string;
  rows: readonly (readonly [string, string])[];
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-cream">{title}</h2>
      <table className="mt-4 w-full border-collapse text-sm">
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-b border-white/10">
              <th className="py-2 pr-4 text-left font-medium text-cream/90">{a}</th>
              <td className="py-2 font-mono text-xs text-cream/70">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function SiteStackPage() {
  return (
    <main className="min-h-screen bg-charcoal px-5 py-12 text-cream sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-editorial text-cream/50">Reference</p>
        <h1 className="mt-2 font-display text-4xl">How angieskc.com is built</h1>
        <p className="mt-4 text-sm text-cream/75">
          Stack and file map for everything visible on the public homepage. Not customer-facing
          copy. Markdown copy lives in{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">snapshots/site-stack.md</code>
          .
        </p>
        <p className="mt-4">
          <Link href="/" className="text-sm text-gold underline-offset-4 hover:underline">
            ← Back to site
          </Link>
        </p>
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-xs text-cream/80">
          app/page.tsx → HomeView.tsx
        </p>
        <Table title="Stack" rows={STACK} />
        <Table title="Homepage sections (scroll order)" rows={SECTIONS} />
        <Table title="Overlays" rows={OVERLAYS} />
        <Table title="Content sources" rows={DATA} />
      </div>
    </main>
  );
}
