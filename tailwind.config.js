/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./src/Components/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#fff0eb',
            100: '#ffddd1',
            500: '#F1592A', // Orange custom brand color
            600: '#d94c21',
            700: '#b83b16',
          },
          secondary: '#1D2A5B', // Custom Navy Blue
          accent: '#f59e0b', // Amber
          background: '#f8fafc',
          card: '#ffffff',
          text: '#334155',
        },
        fontFamily: {
          sans: ['Inter', 'Roboto', 'sans-serif'],
          heading: ['Outfit', 'Inter', 'sans-serif'],
        },
        boxShadow: {
          'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          'card': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
          'card-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.12)',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
          '3xl': '2rem',
        }
      },
    },
    plugins: [],
}