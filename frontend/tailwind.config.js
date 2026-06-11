/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yt: {
          red: '#FF0000',
          dark: '#0F0F0F',
          card: '#1A1A1A',
          border: '#272727',
          text: '#AAAAAA',
        },
      },
    },
  },
  plugins: [],
};
