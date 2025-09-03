/* eslint-disable no-undef */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      
      colors: {
        'brand-blue': '#00A9FF', 
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}

