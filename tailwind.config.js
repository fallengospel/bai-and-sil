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
          blue: '#7298C7',
          'blue-dark': '#5A7DA8',
          'blue-light': '#E8EFF6',
        },
        sil: {
          yellow: '#F3D98F',
          'yellow-dark': '#E8C86A',
          'yellow-light': '#FDF5E0',
        },
        coral: '#e8634a',
        surface: {
          DEFAULT: '#f7f8fa',
          dark: '#eef0f4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.1)',
        'glow-blue': '0 0 20px rgba(114, 152, 199, 0.15)',
        'glow-yellow': '0 0 20px rgba(243, 217, 143, 0.15)',
        'glow-red': '0 0 20px rgba(232, 99, 74, 0.15)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
        'count-up': 'countUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(232, 99, 74, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(232, 99, 74, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(232, 99, 74, 0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
