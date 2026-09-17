// app/layout.tsx
// ──────────────────────────────────────────────────────────────────────────────
// MERGE TARGET: app/layout.tsx
//
// Changes from existing file:
//   1. Remove Playfair_Display import + instance
//   2. Add Fraunces (replaces Playfair as --font-display)
//   3. Add Caveat (new — --font-script)
//   4. Add JetBrains_Mono (new — --font-mono)
//   5. Add all four CSS variables to <body> className
//
// Everything else in your existing layout.tsx (metadata, Providers,
// analytics, viewport, etc.) stays exactly as-is. Only the font block
// and the <body> className need to change.
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, Caveat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display: Fraunces (variable, with SOFT axis for warmth).
// Replaces Playfair Display. The SOFT axis is what makes italics feel
// hand-drawn instead of stiff editorial. Keep it.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

// Body: DM Sans (unchanged).
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Script accent: Caveat. STRICT usage — only "¡Bienvenidos!" in Prologue
// and "Hecho con cariño" in the footer. See README.md.
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-script",
  display: "swap",
});

// Mono: JetBrains Mono. Used for prices, hour times, tabular figures.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // Keep your existing metadata object here — do not overwrite.
  title: "Angie's Food Truck | Kansas City Mexican Food Truck",
  description:
    "Find Angie's Food Truck in Kansas City for Mexican food, tacos, birria, burritos, aguas frescas, catering, and daily truck updates.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${dmSans.variable} ${caveat.variable} ${jetbrainsMono.variable} bg-charcoal text-cream antialiased font-sans`}
      >
        {/* Keep your existing providers, analytics, etc. wrapping {children} */}
        {children}
      </body>
    </html>
  );
}
