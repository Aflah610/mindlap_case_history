/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b5cf6', // Violet 500 / Mindlap Purple accent
          hover: '#7c3aed',   // Violet 600
          light: '#f5f3ff',   // Violet 50
          dark: '#581c87',    // Purple 900
        },
        secondary: {
          DEFAULT: '#9333ea', // Purple 600
          hover: '#7e22ce',   // Purple 700
          light: '#faf5ff',   // Purple 50
        },
        brand: {
          dark: '#0f172a',    // Charcoal dark for 'Mind'
          purple: '#8b5cf6',  // Purple for 'lap' and 'i' dot
          accent: '#a855f7',  // Light purple accent
        },
        sidebar: {
          DEFAULT: '#0f172a',
          hover: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
