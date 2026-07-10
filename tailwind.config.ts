import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core surface palette — deep, cinematic near-black.
        ink: {
          950: "#05060a",
          900: "#0a0b12",
          850: "#0f111b",
          800: "#141625",
          700: "#1c1f31",
          600: "#272b42",
        },
        // Brand accent — electric violet → cyan.
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6d5efc",
          600: "#5b4bdb",
          700: "#4a3cb8",
        },
        cyanx: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(109, 94, 252, 0.55)",
        "glow-cyan": "0 0 40px -10px rgba(34, 211, 238, 0.5)",
        card: "0 20px 50px -20px rgba(0, 0, 0, 0.75)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(120deg, #6d5efc 0%, #8b5cf6 45%, #22d3ee 100%)",
        "radial-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(109,94,252,0.28) 0%, rgba(10,11,18,0) 70%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
