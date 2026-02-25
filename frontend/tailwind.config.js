/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        brand: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#e0e7ff',
          dark: '#4338ca',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card: '#ffffff',
          'dark-DEFAULT': '#0f172a',
          'dark-card': '#1e293b',
        },
        neutral: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'xs':        '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card':      '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-md':   '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-hover':'0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 10px -5px rgb(0 0 0 / 0.04)',
        'glow-sm':   '0 0 15px -3px rgb(99 102 241 / 0.4)',
        'glow':      '0 0 30px -5px rgb(99 102 241 / 0.5)',
        'inner-sm':  'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981, #059669)',
        'gradient-rose':    'linear-gradient(135deg, #f43f5e, #e11d48)',
        'gradient-amber':   'linear-gradient(135deg, #f59e0b, #d97706)',
        'gradient-blue':    'linear-gradient(135deg, #3b82f6, #2563eb)',
        'gradient-violet':  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'mesh-light':       'radial-gradient(at 40% 20%, #ede9fe 0px, transparent 50%), radial-gradient(at 80% 0%, #dbeafe 0px, transparent 50%), radial-gradient(at 0% 50%, #fce7f3 0px, transparent 50%)',
        'mesh-dark':        'radial-gradient(at 40% 20%, #1e1b4b 0px, transparent 50%), radial-gradient(at 80% 0%, #0f172a 0px, transparent 50%), radial-gradient(at 0% 50%, #0f172a 0px, transparent 50%)',
      },
      animation: {
        'fade-in':       'fadeIn 0.25s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up':   'slideInUp 0.3s ease-out',
        'scale-in':      'scaleIn 0.2s ease-out',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
        'shimmer':       'shimmer 1.8s linear infinite',
        'bounce-light':  'bounceLight 0.6s ease-out',
        'spin-slow':     'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceLight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}
