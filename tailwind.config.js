/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        voyx: {
          bg: '#080B10',
          card: '#0D1117',
          cardLight: '#161B22',
          cardBorder: '#21262D',
          primary: '#14B8A6',
          primaryHover: '#0D9488',
          primaryLight: 'rgba(20, 184, 166, 0.14)',
          teal: '#14B8A6',
          tealDark: '#0F766E',
          tealGlow: '#2DD4BF',
          orange: '#14B8A6',
          orangeHover: '#0D9488',
          orangeLight: 'rgba(20, 184, 166, 0.14)',
          navy: '#05070A',
          emerald: '#10B981',
          cyan: '#06B6D4',
          indigo: '#6366F1',
          rose: '#F43F5E',
          muted: '#94A3B8',
          textDark: '#F1F5F9',
          textLight: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card-dark': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'card-glow': '0 0 25px rgba(20, 184, 166, 0.25)',
        'light-elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
