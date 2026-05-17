import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#101114",
        cream: "#fff7ec",
        tortilla: "#eadcc4",
        salsa: "#b92b19",
        /** Primary CTAs — brand orange-red (truck / logo / MENU). */
        "angie-orange": "#f7542d",
        ember: "#f7542d",
        cilantro: "#16a34a",
        navy: "#0b1726",
        midnight: "#060b14",
        gold: "#f6a21a",
        sand: "#d4c4a8",
        teal: "#0d9488",
        agave: "#0f766e",
        cocoa: "#3d2a1f",
        plum: "#1a1520",
        "menu-plum": "#121a28",
        "accent-cyan": "#22d3ee",
        "accent-green": "#45b82e",
        "accent-yellow": "#facc15",
        "accent-pink": "#fb7185",
        "accent-orange": "#ff8a3d",
        "accent-red": "#f87171",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "Brush Script MT", "cursive"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        editorial: "0.35em",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        kenburns: {
          from: { transform: "scale(1.06) translate(0, 0)" },
          to: { transform: "scale(1.15) translate(-1.5%, 1%)" },
        },
        spin28: {
          to: { transform: "rotate(360deg)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        ringPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(69, 184, 46, 0.55)" },
          "70%": { boxShadow: "0 0 0 14px rgba(69, 184, 46, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(69, 184, 46, 0)" },
        },
        radarPing: {
          "0%": { width: "0px", height: "0px", opacity: "0.6" },
          "100%": { width: "220px", height: "220px", opacity: "0" },
        },
        drift: {
          "0%": {
            bottom: "-10%",
            transform: "translateX(0) rotate(0deg)",
            opacity: "0",
          },
          "10%": { opacity: "0.3" },
          "50%": { transform: "translateX(30px) rotate(180deg)" },
          "90%": { opacity: "0.3" },
          "100%": {
            bottom: "110%",
            transform: "translateX(-30px) rotate(360deg)",
            opacity: "0",
          },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        kenburns: "kenburns 24s ease-in-out infinite alternate",
        spin28: "spin28 28s linear infinite",
        bob: "bob 6s ease-in-out infinite",
        "ring-pulse": "ringPulse 2s ease-out infinite",
        "radar-ping": "radarPing 3s ease-out infinite",
        drift: "drift 14s linear infinite",
        rise: "rise 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
