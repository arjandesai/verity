/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        blue: "var(--blue)",
        "blue-deep": "var(--blue-deep)",
        mint: "var(--mint)",
        "mint-deep": "var(--mint-deep)",
        lavender: "var(--lavender)",
        "lavender-deep": "var(--lavender-deep)",
        peach: "var(--peach)",
        text: "var(--text)",
        "text-soft": "var(--text-soft)",
        border: "var(--border)",
      },
      borderRadius: {
        verity: "var(--radius)",
      },
    },
  },
  plugins: [],
};
