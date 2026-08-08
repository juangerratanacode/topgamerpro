import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          bg: "#05060F",
          surface: "#0B1220",
          surfaceLight: "#131C31",
          border: "#1E2A44",
          primary: "#0EA5E9",
          primaryDark: "#0284C7",
          accent: "#F5B942",
          accent2: "#E8A93B",
          gold: "#F5B942",
          whatsapp: "#25D366",
          whatsappDark: "#1EA855",
          green: "#34D399",
          textMuted: "#8CA3BF",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at top left, rgba(14,165,233,0.25), transparent 55%), radial-gradient(ellipse at bottom right, rgba(245,185,66,0.16), transparent 50%)",
        "card-glow": "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(14,165,233,0.4), 0 8px 24px rgba(14,165,233,0.25)",
        "glow-accent": "0 0 0 1px rgba(245,185,66,0.4), 0 8px 24px rgba(245,185,66,0.25)",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(20px,-30px) scale(1.1)" },
          "66%": { transform: "translate(-15px,15px) scale(0.95)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        blob: "blob 9s infinite ease-in-out",
        floaty: "floaty 4s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
