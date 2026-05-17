import type { ReactNode } from "react";
import { Caveat, Fraunces, JetBrains_Mono } from "next/font/google";
import "./redesign-globals.css";

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

/** Fraunces + redesign type/motion tokens — scoped to `/redesign` only. */
export default function RedesignLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${script.variable} ${mono.variable} min-h-screen`}>
      {children}
    </div>
  );
}
