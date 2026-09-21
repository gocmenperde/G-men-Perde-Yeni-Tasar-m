import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#B8973E",
          light:   "#D4AF5A",
          pale:    "#F5EDD6",
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#F5EDD6",
          400: "#D4AF5A",
          500: "#B8973E",
          600: "#9a7d2e",
          700: "#7c6323",
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        out:    "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-in":   "fadeIn 0.3s ease-in-out",
        "slide-up":  "slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in":  "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
        shimmer:     "shimmer 1.8s linear infinite",
        marquee:     "marquee 36s linear infinite",
        float:       "float 6s ease-in-out infinite",
        "float-slow":"floatSlow 8s ease-in-out infinite",
        "spin-slow": "spinSlow 20s linear infinite",
        "glow-pulse":"glowPulse 3s ease-in-out infinite",
        "cart-bounce":"cartBounce 0.4s ease",
        "badge-pop": "badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "ping-once": "ping 0.6s cubic-bezier(0,0,0.2,1) 1",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":     { transform: "translateY(-12px) rotate(1deg)" },
          "66%":     { transform: "translateY(-6px) rotate(-0.5deg)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-18px)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        glowPulse: {
          "0%,100%": { opacity: "0.4" },
          "50%":     { opacity: "0.8" },
        },
        cartBounce: {
          "0%,100%": { transform: "scale(1)" },
          "30%":     { transform: "scale(1.3) rotate(-8deg)" },
          "60%":     { transform: "scale(0.9) rotate(4deg)" },
        },
        badgePop: {
          "0%":   { transform: "scale(0) rotate(-12deg)", opacity: "0" },
          "60%":  { transform: "scale(1.15) rotate(3deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      boxShadow: {
        gold:    "0 8px 32px rgba(184,151,62,0.30), 0 2px 8px rgba(184,151,62,0.15)",
        "gold-lg":"0 20px 60px rgba(184,151,62,0.35), 0 4px 16px rgba(184,151,62,0.18)",
        card:    "0 2px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 16px 48px rgba(0,0,0,0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
