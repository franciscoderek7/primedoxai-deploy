import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "doc-green": "#2E7D32",
        "doc-gold": "#FFD700",
        "doc-dark": "#0a0a0a",
        "doc-card": "#1a1a2e",
        "doc-border": "#2E7D32",
        "doc-text": "#e0e0e0",
      },
    },
  },
  plugins: [],
};

export default config;
