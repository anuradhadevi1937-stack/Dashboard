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
          bg: '#F8FAFC',
          card: '#0F172A',
          cardLight: '#1E293B',
          cardBorder: '#334155',
          orange: '#FF6B00',
          orangeHover: '#E05D00',
          orangeLight: 'rgba(255, 107, 0, 0.12)',
          navy: '#0B1120',
          emerald: '#10B981',
          cyan: '#06B6D4',
          indigo: '#6366F1',
          rose: '#F43F5E',
          muted: '#94A3B8',
          textDark: '#0F172A',
          textLight: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card-dark': '0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
        'card-glow': '0 0 20px rgba(255, 107, 0, 0.15)',
        'light-elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
