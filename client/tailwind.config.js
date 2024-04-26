/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        jp: ['ヒラギノ角ゴシック', 'sans-serif'],
        en: ['Arial', 'Helvetica Neue', 'sans-serif'],
        fr: ['Helvetica Neue', 'sans-serif']
      },
      colors: {
        orange: '#DFB068',
        ivory: '#EFEDE8',
        dark: '#30353A'
      }
    }
  },
  plugins: []
};
