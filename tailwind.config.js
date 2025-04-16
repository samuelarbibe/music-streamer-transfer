module.exports = {
  darkMode: ["class"], // לוודא שהתמיכה ב-dark mode פעילה
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // אם אתה משתמש ב- app router של Next.js
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          DEFAULT: "var(--spotify)",
          foreground: "var(--spotify-foreground)"
        },
        apple: {
          DEFAULT: "var(--apple)",
          foreground: "var(--apple-foreground)",
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};