/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        safe: '#22c55e',
        caution: '#eab308',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}


