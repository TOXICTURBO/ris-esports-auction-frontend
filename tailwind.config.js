module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/context/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'ris-blue': '#00a0e9',
        'ris-dark': '#0a0a0a',
        'ris-gray': '#1a1a1a', 
        'ris-light-gray': '#2a2a2a',
      },
    },
  },
  plugins: [],
}
