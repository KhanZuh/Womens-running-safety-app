// use of common module exports (require, and module.exports is necessary
//  for daisyUI plugin to work with tailwind) - ignore linting errors
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fun-pink': '#FF7586',
      }
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake", "valentine"],
  },
}