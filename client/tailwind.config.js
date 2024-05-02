/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        jp: ['ヒラギノ角ゴシック', 'sans-serif'],
        en: ['Arial', 'Helvetica Neue', 'sans-serif'],
        fr: ['Helvetica Neue', 'sans-serif'],
        title: ['Avenir', 'Helvetica', 'Arial', 'sans-serif']
      },
      colors: {
        orange: {
          DEFAULT: '#DEAA5A',
          700: '#DD9A34'
        },
        ivory: '#EFEDE8',
        ivory50: '#90908D',
        dark: '#30353A',
        dark50: '#6F7376',
        black095: 'rgba(52, 52, 52, 0.95)'
      }
    }
  },
  variants: {
    extend: {
      backgroundColor: ['checked'], // チェックされたときの背景色のバリアントを追加
      borderColor: ['checked']
    }
  },
  plugins: []
};
