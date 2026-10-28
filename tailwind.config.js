/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#060913",
          surface: "#0C1322",
          card: "rgba(12, 19, 34, 0.75)",
          border: "#172544",
          borderGlow: "rgba(0, 229, 255, 0.4)",
          cyan: "#00E5FF",
          emerald: "#00FF9D",
          purple: "#8B5CF6",
          dark: "#03060E",
          muted: "#94A3B8",
        },
      },
    },
  },
  plugins: [],
};
