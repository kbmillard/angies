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
        charcoal: "#0f1114",
        cream: "#f7f0e4",
        tortilla: "#e8dcc4",
        salsa: "#c41e1c",
        ember: "#ea580c",
        cilantro: "#16a34a",
        navy: "#0B1426",
        midnight: "#060b14",
        gold: "#f59e0b",
        sand: "#d4c4a8",
        teal: "#0d9488",
        agave: "#0f766e",
        cocoa: "#3d2a1f",
        plum: "#1a1520",
        "menu-plum": "#121a28",
        "accent-cyan": "#22d3ee",
        "accent-green": "#4ade80",
        "accent-yellow": "#facc15",
        "accent-pink": "#fb7185",
        "accent-orange": "#fb923c",
        "accent-red": "#f87171",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.35em",
      },
    },
  },
  plugins: [],
};

export default config;
