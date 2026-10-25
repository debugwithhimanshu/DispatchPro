/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        swiss: {
          bg: '#F5F2EB',          // Warm paper background
          surface: '#FFFEFA',     // Primary card surface
          subtle: '#EAE6DC',      // Secondary surface/tints
          text: '#242520',        // Primary text
          muted: '#77766F',       // Secondary muted text
          border: '#DAD6CC',      // Fine borders
          accent: '#C65332',      // Burnt orange primary accent
          accentHover: '#A94429', // Deep burnt orange
          accentBg: '#F5E4DC',    // Light warm accent tint
          mapBg: '#22231F',       // Dark charcoal map canvas
          mapGrid: '#353630',     // Map grid lines
          success: '#287653',     // Muted pine green
          warning: '#A76718',     // Warm amber
          danger: '#B83C32',      // Muted cardinal red
          rider1: '#C65332',      // Burnt orange
          rider2: '#2A7A6E',      // Muted teal
          rider3: '#6B8E23',      // Warm olive
          rider4: '#8B5A2B',      // Warm saddle
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      }
    },
  },
  plugins: [],
}
