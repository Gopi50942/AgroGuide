import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium hand-drawn agricultural editorial palette
        cream: {
          DEFAULT: "#F7F3E9",
          50: "#FDFBF6",
          100: "#F7F3E9",
          200: "#EFE7D3",
        },
        ink: {
          DEFAULT: "#22281E",
          light: "#3C4432",
        },
        forest: {
          50: "#EAF0E4",
          100: "#D1DFC5",
          200: "#A6C48A",
          300: "#7FA85F",
          400: "#5C8A44",
          500: "#3F6B2E",
          600: "#2F5423",
          700: "#25421C",
          800: "#1C3315",
          900: "#152710",
        },
        clay: {
          50: "#FBF2E7",
          100: "#F4DFC2",
          200: "#E8BE8B",
          300: "#D99B5C",
          400: "#C9803D",
          500: "#B06A2C",
          600: "#8F5424",
          700: "#6E401C",
        },
        wheat: {
          100: "#FBEFCB",
          200: "#F5DE9C",
          300: "#EEC968",
          400: "#E3AE3C",
          500: "#C68F2A",
        },
        rust: {
          400: "#C1592F",
          500: "#A44424",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "grain": "url('/textures/grain.svg')",
      },
      boxShadow: {
        soft: "0 2px 14px rgba(34, 40, 30, 0.08)",
        card: "0 1px 3px rgba(34, 40, 30, 0.06), 0 8px 24px -8px rgba(34, 40, 30, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "sway": {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "sway": "sway 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
