/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bai: {
          blue: '#023E8A',
          'blue-dark': '#012A62',
          'blue-light': '#E8F4FD',
          'blue-hover': '#0356B3',
        },
        sil: {
          yellow: '#FFD581',
          'yellow-dark': '#FFC233',
          'yellow-light': '#FFF9E0',
          'yellow-hover': '#FFE699',
        },
        coral: '#FF6B6B',
        mint: '#00D2D3',
        orange: '#FF9F43',
        surface: {
          DEFAULT: '#FFF8F0',
          dark: '#FFF5EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 4px 16px rgba(2, 62, 138, 0.08)',
        'card-hover': '0 12px 32px rgba(2, 62, 138, 0.15)',
        'glow-blue': '0 0 24px rgba(2, 62, 138, 0.2)',
        'glow-yellow': '0 0 24px rgba(255, 213, 129, 0.3)',
        'glow-red': '0 0 24px rgba(255, 107, 107, 0.2)',
        'glow-mint': '0 0 24px rgba(0, 210, 211, 0.2)',
        'cartoon': '4px 4px 0px rgba(2, 62, 138, 0.15)',
        'cartoon-sm': '2px 2px 0px rgba(2, 62, 138, 0.1)',
        'cartoon-lg': '6px 6px 0px rgba(2, 62, 138, 0.12)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
        'count-up': 'countUp 0.5s ease-out forwards',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pop': 'pop 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 107, 107, 0.4)' },
          '70%': { boxShadow: '0 0 0 12px rgba(255, 107, 107, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 107, 107, 0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
