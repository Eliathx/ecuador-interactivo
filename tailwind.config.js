/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // correcto: doble asterisco para buscar en subcarpetas
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
