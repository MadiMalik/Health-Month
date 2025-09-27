/** @type {import('tailwindcss').Config} */
// Tailwind looks through these files, finds class names (e.g. "bg-indigo-600"),
// and generates ONLY the CSS you actually use (JIT build).
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          500: '#264414', // focus ring
          600: '#264414', // primary button bg
          700: '#1f3711', // primary hover bg (slightly darker)
        },
      },
    },
  },
  plugins: [], // add official/community plugins here if needed
};