"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Utensils } from "lucide-react";
import { gallerySrc } from "@/lib/data/gallery-path";
import { cn } from "@/lib/utils/cn";

const TRUCK_BUTTON_SRC = gallerySrc("angies-truck-button1.png");

const toneStyles = {
  /** Brand truck gradient — matches logo / real truck orange-red */
  orange: {
    glow: "bg-angie-orange/25",
    ring: "focus-visible:ring-angie-orange/50",
    pill:
      "border-angie-orange/50 bg-[var(--angies-truck-gradient)] text-cream group-hover:brightness-110",
  },
  /** Darker tomato-red — closed/destructive contexts only */
  salsa: {
    glow: "bg-salsa/25",
    ring: "focus-visible:ring-salsa/50",
    pill: "border-salsa/50 bg-salsa/15 group-hover:border-salsa/70 group-hover:bg-salsa/25",
  },
} as const;

export type AngiesTruckCTAProps = {
  onClick?: () => void;
  label?: string;
  subtext?: string;
  /** `orange` = brand gradient pill; `salsa` = darker red variant for comparison */
  tone?: keyof typeof toneStyles;
  className?: string;
};

export function AngiesTruckCTA({
  onClick,
  label = "Find The Truck",
  subtext = "Serving fresh now!",
  tone = "orange",
  className,
}: AngiesTruckCTAProps) {
  const colors = toneStyles[tone];
  const handleClick = () => {
    if (onClick) onClick();
    else if (typeof window !== "undefined") {
      const el = document.getElementById("locations");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.location.href = "/#locations";
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover="hover"
      whileTap="tap"
      initial="idle"
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-3xl p-6 focus:outline-none focus-visible:ring-4",
        colors.ring,
        className,
      )}
      aria-label={label}
    >
      <motion.div
        variants={{
          idle: { opacity: 0, scale: 0.8 },
          hover: { opacity: 1, scale: 1.1 },
          tap: { opacity: 0.8, scale: 1.05 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn("pointer-events-none absolute inset-0 rounded-full blur-3xl", colors.glow)}
      />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <motion.div
          variants={{
            idle: { scale: 1, rotate: 0 },
            hover: {
              scale: 1.1,
              rotate: -2,
              transition: { type: "spring", stiffness: 300, damping: 15 },
            },
            tap: {
              scale: 0.95,
              rotate: 0,
              transition: { type: "spring", stiffness: 400, damping: 20 },
            },
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TRUCK_BUTTON_SRC}
            alt="Angie's Food Truck"
            width={240}
            height={180}
            className="pointer-events-none object-contain drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>

      <motion.div
        variants={{ idle: { y: 0, scale: 1 }, hover: { y: -8, scale: 1.05 } }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative z-20 mt-1 flex flex-col items-center"
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-editorial text-cream shadow-[0_8px_30px_rgb(0,0,0,0.25)] backdrop-blur-sm transition-colors duration-300",
            colors.pill,
          )}
        >
          <MapPin className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
          <span className="text-base tracking-tight normal-case sm:text-lg">{label}</span>
          <ArrowRight className="ml-0 h-0 w-0 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:h-5 group-hover:w-5 group-hover:opacity-100" />
        </div>

        <motion.div
          variants={{ idle: { opacity: 0.7, y: 0 }, hover: { opacity: 1, y: 2 } }}
          className="mt-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-charcoal/35 px-3 py-1 text-sm font-semibold text-cream/75 backdrop-blur-sm"
        >
          <Utensils className="h-3.5 w-3.5 text-gold/80" />
          {subtext}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
