import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { primary: { DEFAULT: "#18181b", foreground: "#fafafa" }, accent: { DEFAULT: "#f59e0b", foreground: "#18181b" } },
      animation: { "fade-in": "fadeIn 0.5s ease-in-out", "slide-up": "slideUp 0.4s ease-out", float: "float 3s ease-in-out infinite" },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        float: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
      },
    },
  },
  plugins: [],
};
export default config;
