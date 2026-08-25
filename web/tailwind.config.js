/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f0',
          100: '#ffe6dc',
          200: '#ffccb8',
          300: '#ffaa8a',
          400: '#f78354',
          500: '#f06023',
          600: '#d94b12',
          700: '#b3380c',
          800: '#8e2b0d',
          900: '#73250f',
          950: '#3e1005',
        },
        secondary: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#a1a1aa',
          300: '#71717a',
          400: '#52525b',
          500: '#3f3f46',
          600: '#27272a',
          700: '#18181b',
          800: '#121212',
          900: '#09090b',
          950: '#050505',
        },
        brandOrange: '#f06023',
        dark: {
          bg: '#09090b',
          card: '#121215',
          surface: '#18181b',
          border: '#27272a',
        },
        success: {
          500: '#22c55e',
        },
        warning: {
          500: '#f59e0b',
        },
        error: {
          500: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
        display: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      animation: {
        'water-portal': 'water-portal 3s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.5s ease-in-out',
      },
      keyframes: {
        'water-portal': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0 font' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};