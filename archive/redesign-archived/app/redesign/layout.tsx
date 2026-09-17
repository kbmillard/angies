import type { ReactNode } from "react";
import { Caveat, DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./redesign-globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const script = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-script",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

/** Fraunces + redesign type/motion tokens — homepage at `/redesign`. */
export default function RedesignLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-redesign="live"
      className={`${display.variable} ${sans.variable} ${script.variable} ${mono.variable} min-h-screen font-sans`}
    >
      {children}
    </div>
  );
}
