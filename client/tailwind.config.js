/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#c9a84c",
          light:   "#dbb85e",
          dark:    "#b8943e",
        },
      },
      fontFamily: {
        sans: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
