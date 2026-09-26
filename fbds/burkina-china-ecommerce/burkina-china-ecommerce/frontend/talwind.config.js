/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb', // Burkina flag blue accent
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        burkina: {
          green: '#009e49',  // Burkina Faso flag green
          yellow: '#fcd116', // Burkina Faso flag yellow  
          red: '#ce1126',    // Burkina Faso flag red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}