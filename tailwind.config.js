/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-sidebar': '#1a1f2e',
        'dark-main': '#1e2332',
        'accent-yellow': '#fbbf24',
        'accent-gold': '#f59e0b',
      },
    },
  },
  plugins: [],
}



