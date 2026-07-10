import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F172A",
          950: "#080D1A",
          900: "#0F172A",
          800: "#141C33",
          700: "#1B2542",
        },
        electric: {
          DEFAULT: "#3B82F6",
          500: "#3B82F6",
          600: "#2563EB",
        },
        skyline: {
          DEFAULT: "#93C5FD",
          300: "#93C5FD",
        },
        intl: {
          DEFAULT: "#10B981",
          300: "#6EE7B7",
          500: "#10B981",
          600: "#059669",
        },
      },
      fontFamily: {
        heading: ["var(--font-big-shoulders)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "angular-hero":
          "linear-gradient(135deg, #0F172A 0%, #0F172A 40%, #141C33 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
