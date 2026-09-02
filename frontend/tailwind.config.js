/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Geist', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        zinc: {
          900: '#18181b', // cards
          950: '#09090b', // background
        },
        surface: '#18181b',
        background: '#09090b',
        border: '#27272a',
        primary: '#10b981', // emerald for highlights
      }
    },
  },
  plugins: [],
}
