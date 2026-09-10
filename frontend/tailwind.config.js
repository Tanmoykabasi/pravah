/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Plus Jakarta Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Space Grotesk',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Light + light-blue "sky" palette
        sky: {
          25:  '#f4faff',
          50:  '#eef7ff',
          100: '#dceeff',
          200: '#b6dcff',
          300: '#84c5ff',
          400: '#48a8ff',
          500: '#1d8aff',
          600: '#0e6ff5',
          700: '#0c5ad6',
        },
        ink: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(244, 63, 94, 0.45)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(244, 63, 94, 0)' },
        },
        'radar': {
          '0%':   { transform: 'scale(0.6)', opacity: '0.9' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'flashing-red': {
          '0%, 100%': { backgroundColor: 'rgba(254, 226, 226, 0.55)' },
          '50%':      { backgroundColor: 'rgba(254, 202, 202, 0.85)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%':      { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'pulse-red': 'pulse-red 1.6s ease-out infinite',
        'radar': 'radar 1.8s ease-out infinite',
        'flashing-red': 'flashing-red 0.8s ease-in-out infinite',
        'soft-pulse': 'soft-pulse 2s ease-in-out infinite',
        'float': 'float 3.6s ease-in-out infinite',
      },
      boxShadow: {
        glass: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
        'glass-lg': '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 12px rgba(15, 23, 42, 0.04), 0 24px 48px -16px rgba(15, 78, 168, 0.18)',
        'soft-sky': '0 8px 28px -8px rgba(14, 165, 233, 0.45)',
        'soft-rose': '0 12px 32px -8px rgba(244, 63, 94, 0.45)',
      },
      backgroundImage: {
        'sky-soft': 'linear-gradient(180deg, #f4faff 0%, #eaf3ff 60%, #dceeff 100%)',
        'sky-card': 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(238,247,255,0.6) 100%)',
      },
    },
  },
  plugins: [],
};
