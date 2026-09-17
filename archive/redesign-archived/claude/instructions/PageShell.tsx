// components/home/PageShell.tsx
// ──────────────────────────────────────────────────────────────────────────────
// The root layout wiring for the home page.
//
// This is a REFERENCE — your existing HomeView.tsx may already do this work
// inline. Use this either as a drop-in replacement (HomeView wraps its
// sections in <PageShell>) or as a guide for refactoring HomeView itself.
//
// What it does:
//   - Renders the FIXED watermark backdrop at z-0 (renders once per page)
//   - Renders the BrandTicker at z-60 (sticky top)
//   - Renders the EditorialNav at z-50 (sticky top, below ticker)
//   - Wraps children in <main> at z-10 so all page content sits above the
//     watermark, below the sticky chrome.
//
// See SCROLL-AND-MOTION.md § A for the full Z-stack and § D for the rationale.
// ──────────────────────────────────────────────────────────────────────────────

import BrandTicker from "@/components/marquee/BrandTicker";
import EditorialNav from "@/components/nav/EditorialNav";
import FixedBrandBackdrop from "@/components/backdrop/FixedBrandBackdrop";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <>
      {/* z-0 — fixed watermark, never scrolls.
           Visible THROUGH glass sections, INVISIBLE under opaque sections. */}
      <FixedBrandBackdrop />

      {/* z-60 — top marquee, sticky to viewport top. */}
      <BrandTicker />

      {/* z-50 — nav, sticky to viewport top (sits below the marquee in flow,
           pinned just below it visually). */}
      <EditorialNav />

      {/* z-10 — page content, scrolls normally.
           Every section beneath manages its own background opacity per the
           "opacity contract" in SCROLL-AND-MOTION.md § C. */}
      <main className="relative z-10">
        {children}
      </main>
    </>
  );
}
