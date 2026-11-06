/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        khmer: ['"Kantumruy Pro"', '"Khmer OS Siemreap"', '"Khmer OS Battambang"', 'sans-serif'],
        heading: ['"Moul"', '"Kantumruy Pro"', 'sans-serif'],
      },
      colors: {
        moeys: {
          blue: '#0B4F8A',
          darkBlue: '#062F56',
          gold: '#E5A912',
          lightBlue: '#E8F1F9',
          green: '#1B8754',
          crimson: '#A81C2E'
        }
      }
    },
  },
  plugins: [],
}
