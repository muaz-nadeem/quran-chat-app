/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F6F7F4",
        surface: "#FFFFFF",
        "surface-light": "#E8ECE6",
        emerald: {
          DEFAULT: "#10B981",
          light: "#0B815A",
          dark: "#059669",
        },
        gold: {
          DEFAULT: "#A97E3F",
          light: "#8F6A32",
          dark: "#75561F",
        },
        muted: "#98A29A",
        danger: "#EF4444",
        "text-primary": "#1B211D",
        "text-secondary": "#68736C",
      },
      fontFamily: {
        arabic: ["Amiri"],
      },
    },
  },
  plugins: [],
};
