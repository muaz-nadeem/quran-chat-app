/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-tint": "var(--color-surface-tint)",
        "surface-light": "var(--color-surface-light)",
        "deep-green": "var(--color-primary-dark)",
        emerald: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-soft)",
          dark: "#081C15",
          soft: "var(--color-emerald-soft)",
        },
        cream: "var(--color-accent-cream)",
        gold: {
          DEFAULT: "var(--color-gold)",
          light: "#C9A66B",
          dark: "#8F6A32",
          soft: "var(--color-gold-soft)",
        },
        muted: "var(--color-muted)",
        danger: "var(--color-danger)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-on-green": "var(--color-text-on-green)",
        "text-on-green-muted": "var(--color-text-on-green-muted)",
        hero: {
          start: "var(--color-hero-start)",
          end: "var(--color-hero-end)",
        },
      },
      fontFamily: {
        serif: ["LibreBaskerville_700Bold", "Georgia", "serif"],
        "serif-regular": ["LibreBaskerville_400Regular", "Georgia", "serif"],
        arabic: ["Amiri"],
      },
    },
  },
  plugins: [],
};
