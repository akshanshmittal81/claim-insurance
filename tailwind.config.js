/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#F0F7FF',
          1: '#DBEAFE',
          2: '#BFDBFE',
          3: '#93C5FD',
          4: '#60A5FA',
        },
        accent: {
          blue: '#2563EB',
          cyan: '#0891B2',
          emerald: '#059669',
          amber: '#D97706',
          red: '#DC2626',
          violet: '#7C3AED',
        },
        ink: {
          primary: '#0F172A',
          secondary: '#334155',
          muted: '#64748B',
          disabled: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
}