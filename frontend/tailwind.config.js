/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#b33a3a",   // rojo romántico
        secondary: "#f9f4f2", // fondo suave
        accent: "#f7d1cd"     // tonos cálidos
      },
      fontFamily: {
        body: ["Georgia", "serif"],
        title: ["Playfair Display", "serif"]
      }
    },
  },
  plugins: [],
}
