import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0a0f0d',
        emerald: {
          DEFAULT: '#0d2b22',
          dark: '#071a15',
        },
        gold: {
          DEFAULT: '#c9a227',
          light: '#e8c766',
          rose: '#b76e79',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a227 0%, #e8c766 50%, #b76e79 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
