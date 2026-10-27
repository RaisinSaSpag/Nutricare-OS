/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          navy: '#0F172A',
          teal: '#0D9488',
          tealLight: '#14B8A6',
          darkBg: '#090D16',
          surface: '#1E293B',
          border: '#334155',
        },
        vitality: {
          green: '#10B981',
          greenLight: '#34D399',
          coral: '#F43F5E',
          coralLight: '#FB7185',
          amber: '#F59E0B',
          blue: '#0EA5E9',
          purple: '#8B5CF6',
        },
        canvas: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'soft-md': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'soft-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'glow-teal': '0 0 20px -3px rgba(13, 148, 136, 0.35)',
        'glow-coral': '0 0 20px -3px rgba(244, 63, 94, 0.35)',
      }
    },
  },
  plugins: [],
}
