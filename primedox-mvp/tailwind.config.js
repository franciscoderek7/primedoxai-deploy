/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0E14",
        panel: "#11151E",
        accent: "#4A90E2",
      },
    },
  },
  plugins: [],
};
