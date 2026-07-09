/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bgDeep: "#0A0F2D",
        bgSurface: "#141B41",
        accentNeon: "#6C63FF",
        pinkNeon: "#FF007F",
        cyanNeon: "#00E5FF",
        orangeNeon: "#F59E0B",
        greenNeon: "#10B981",
        redNeon: "#EF4444"
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
        mono: ["Courier New", "monospace"]
      }
    },
  },
  plugins: [],
}
