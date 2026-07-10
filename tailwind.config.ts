import type { Config } from "tailwindcss";

/**
 * Neubrutalist minimal theme.
 * Cream background, true-black 2px borders, hard offset shadows (no blur),
 * flat accent blocks (yellow / pink / green / blue), sharp corners.
 * Display: Archivo Black. Body: Space Grotesk. Labels: Space Mono.
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
        cream: "#FAF6EE",
        ink: "#111111",
        yolk: "#FFC700",
        bubble: "#FF90E8",
        mint: "#3ECF8E",
        sky: "#69B9FF",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0 0 #111111",
        "brutal-lg": "8px 8px 0 0 #111111",
        "brutal-sm": "2px 2px 0 0 #111111",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
