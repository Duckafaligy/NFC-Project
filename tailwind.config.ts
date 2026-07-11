import type { Config } from "tailwindcss";

/**
 * Warm, welcoming e-commerce theme.
 * Cream background, white rounded cards with soft shadows, warm orange
 * accent, pastel tint tiles for bento sections. Friendly sentence-case type.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFFFF",
        ink: "#1C1917",
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 3px rgb(28 25 23 / 0.04), 0 4px 14px rgb(28 25 23 / 0.06)",
        lift: "0 2px 6px rgb(28 25 23 / 0.05), 0 12px 32px rgb(28 25 23 / 0.10)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        rollup: {
          "0%": { transform: "translateY(90%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        progressbar: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        rollup: "rollup 0.35s ease-out",
        progressbar: "progressbar 5s linear forwards",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
