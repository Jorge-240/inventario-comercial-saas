/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9f0ff',
          200: '#bde2ff',
          300: '#8ad0ff',
          400: '#51b6ff',
          500: '#2196f3',
          600: '#1676d6',
          700: '#145daa',
          800: '#174d8a',
          900: '#183f71'
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
};
