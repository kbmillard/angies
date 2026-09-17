// tailwind.config.ts
// ──────────────────────────────────────────────────────────────────────────────
// MERGE TARGET: tailwind.config.ts (your existing file)
//
// Merge each key into your existing `theme.extend` block. Keep your current
// colors, letterSpacing.editorial, and any other extensions intact.
//
// This file is shown as a STANDALONE merge fragment — do NOT copy it whole
// over your existing tailwind.config.ts. Pull the keys into your config.
// ──────────────────────────────────────────────────────────────────────────────

import type { Config } from "tailwindcss";

const mergeIntoThemeExtend = {
  // ─── FONT FAMILIES ─────────────────────────────────────────────────────────
  // Add `display`, `script`, and `mono`. Keep your existing `sans`.
  fontFamily: {
    display: ["var(--font-display)", "Georgia", "serif"],
    sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
    script:  ["var(--font-script)", "Brush Script MT", "cursive"],
    mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
  },

  // ─── KEYFRAMES ─────────────────────────────────────────────────────────────
  // Mirror the @keyframes in globals.css so Tailwind's animation utilities
  // pick them up too.
  keyframes: {
    marquee: {
      from: { transform: "translateX(0)" },
      to:   { transform: "translateX(-50%)" },
    },
    kenburns: {
      from: { transform: "scale(1.06) translate(0, 0)" },
      to:   { transform: "scale(1.15) translate(-1.5%, 1%)" },
    },
    spin28: {
      to: { transform: "rotate(360deg)" },
    },
    bob: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%":      { transform: "translateY(-6px)" },
    },
    ringPulse: {
      "0%":   { boxShadow: "0 0 0 0 rgba(69, 184, 46, 0.55)" },
      "70%":  { boxShadow: "0 0 0 14px rgba(69, 184, 46, 0)" },
      "100%": { boxShadow: "0 0 0 0 rgba(69, 184, 46, 0)" },
    },
    radarPing: {
      "0%":   { width: "0px",   height: "0px",   opacity: "0.6" },
      "100%": { width: "220px", height: "220px", opacity: "0"   },
    },
    drift: {
      "0%":   { bottom: "-10%", transform: "translateX(0) rotate(0deg)",     opacity: "0" },
      "10%":  { opacity: "0.3" },
      "50%":  { transform: "translateX(30px) rotate(180deg)" },
      "90%":  { opacity: "0.3" },
      "100%": { bottom: "110%", transform: "translateX(-30px) rotate(360deg)", opacity: "0" },
    },
    rise: {
      from: { opacity: "0", transform: "translateY(28px)" },
      to:   { opacity: "1", transform: "translateY(0)" },
    },
  },

  // ─── ANIMATION SHORTHANDS ──────────────────────────────────────────────────
  // Map a class name → (keyframe + timing). Use as `animate-marquee` etc.
  animation: {
    marquee:      "marquee 38s linear infinite",
    kenburns:     "kenburns 24s ease-in-out infinite alternate",
    spin28:       "spin28 28s linear infinite",
    bob:          "bob 6s ease-in-out infinite",
    "ring-pulse": "ringPulse 2s ease-out infinite",
    "radar-ping": "radarPing 3s ease-out infinite",
    drift:        "drift 14s linear infinite",
    rise:         "rise 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// REFERENCE — what your final tailwind.config.ts theme.extend should look
// like AFTER merging (preserving your existing color tokens and other extensions):
// ──────────────────────────────────────────────────────────────────────────────
const referenceFinalConfig: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // YOUR EXISTING COLOR TOKENS — keep unchanged
        charcoal: "#101114",
        cream: "#fff7ec",
        // ... (all other tokens from your current config)
      },
      letterSpacing: {
        editorial: "0.35em",
      },
      // ↓↓↓ ADD THESE FROM mergeIntoThemeExtend ABOVE ↓↓↓
      fontFamily: mergeIntoThemeExtend.fontFamily,
      keyframes: mergeIntoThemeExtend.keyframes,
      animation: mergeIntoThemeExtend.animation,
    },
  },
  plugins: [],
};

export default referenceFinalConfig;
