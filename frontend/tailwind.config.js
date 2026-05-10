/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50:  '#eff9fb',
          100: '#d9f0f6',
          200: '#b6e2ee',
          300: '#86cce3',
          400: '#55b1d4',
          500: '#359bc0',
          600: '#217ba0',
          700: '#1b6281',
          800: '#1a4f6a',
          900: '#164156',
          950: '#0b2533',
        },
        sea: {
          50:  '#edfaf6',
          100: '#d4f3eb',
          200: '#ade7d6',
          300: '#7dd4ba',
          400: '#4fc09c',
          500: '#32907e',
          600: '#287367',
          700: '#215c54',
          800: '#1e4c45',
          900: '#1b3f3a',
          950: '#0b2421',
        },
        sand: {
          50:  '#fefcf5',
          100: '#fdf9eb',
          200: '#f9f0ce',
          300: '#f3e3a8',
          400: '#ecd17e',
          500: '#e6c05e',
          600: '#d9a93f',
          700: '#b58433',
          800: '#93652e',
          900: '#78542a',
          950: '#412d15',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'soft':   '0 2px 16px rgba(13, 71, 99, 0.08)',
        'lifted': '0 8px 32px rgba(13, 71, 99, 0.12)',
        'card':   '0 1px 4px rgba(13, 71, 99, 0.06)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'ripple': {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'wave': {
          '0%':   { transform: 'translateX(0) translateY(0)' },
          '50%':  { transform: 'translateX(-25%) translateY(4px)' },
          '100%': { transform: 'translateX(-50%) translateY(0)' },
        },
      },
      animation: {
        'float':   'float 4s ease-in-out infinite',
        'ripple':  'ripple 1.5s ease-out infinite',
        'slide-up':'slide-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'wave':    'wave 8s linear infinite',
      },
    },
  },
  plugins: [],
}
