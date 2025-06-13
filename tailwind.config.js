/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        tropical: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        sunset: {
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c',
        }
      },
    },
  },
  plugins: [],
}