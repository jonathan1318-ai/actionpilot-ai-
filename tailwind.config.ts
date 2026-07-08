import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        ap: {
          bg: 'var(--ap-bg)',
          surface: 'var(--ap-surface)',
          'surface-alt': 'var(--ap-surface-alt)',
          border: 'var(--ap-border)',
          text: {
            primary: 'var(--ap-text-primary)',
            secondary: 'var(--ap-text-secondary)',
            tertiary: 'var(--ap-text-tertiary)',
          },
          accent: 'var(--ap-accent)',
          'accent-dark': 'var(--ap-accent-dark)',
          'accent-soft': 'var(--ap-accent-soft)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'Inter', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
      },
      keyframes: {
        'ap-fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'ap-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'ap-fade-up': 'ap-fade-up 0.5s ease',
        'ap-pulse': 'ap-pulse 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
