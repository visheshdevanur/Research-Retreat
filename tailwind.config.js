/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: '#102D50',
          dark: '#0A1C33',
          light: '#1B4575',
        },
        midnight: {
          DEFAULT: '#172F4D',
          900: '#0C1A2B',
          800: '#11253D',
        },
        champagne: {
          DEFAULT: '#D6B56F',
          light: '#EAD7A5',
          dark: '#B8974E',
        },
        antique: {
          DEFAULT: '#B99752',
          light: '#D1B26E',
          dark: '#967838',
        },
        ivory: {
          DEFAULT: '#F8F5ED',
          100: '#FFFFFF',
          200: '#FAF8F3',
          300: '#F0ECE1',
        },
        electric: {
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#00D2FF',
        },
      },
      fontFamily: {
        cinematic: ['"Cinzel"', '"Trajan Pro"', '"Cinzel Decorative"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Montserrat"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 35s linear infinite',
        'spin-reverse': 'spin-rev 28s linear infinite',
        'shimmer': 'shimmer 3s infinite',
      },
      keyframes: {
        'spin-rev': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
