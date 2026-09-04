/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bai: {
          blue: '#1a56db',
          'blue-dark': '#1242b0',
          'blue-light': '#e8eefb',
        },
        sil: {
          yellow: '#f5a623',
          'yellow-dark': '#d4901a',
          'yellow-light': '#fef6e6',
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
      },
    },
  },
  plugins: [],
};
