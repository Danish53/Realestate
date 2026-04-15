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
        },
        keyframes: {
          /* Position + opacity so the wash clearly “breathes” and moves */
          aiPromoBgShift: {
            '0%, 100%': {
              backgroundPosition: '0% 50%',
              opacity: '0.52',
            },
            '35%': {
              backgroundPosition: '100% 35%',
              opacity: '0.9',
            },
            '70%': {
              backgroundPosition: '45% 100%',
              opacity: '0.58',
            },
          },
          aiPromoBgShiftAlt: {
            '0%, 100%': {
              backgroundPosition: '100% 45%',
              opacity: '0.38',
            },
            '40%': {
              backgroundPosition: '0% 80%',
              opacity: '0.82',
            },
            '75%': {
              backgroundPosition: '90% 0%',
              opacity: '0.48',
            },
          },
          aiPromoOrbPulse: {
            '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
            '50%': { opacity: '0.95', transform: 'scale(1.18)' },
          },
          aiPromoBorderGlow: {
            '0%, 100%': {
              boxShadow:
                '0 2px 5px rgba(0,0,0,0.05), 0 0 0 1px rgba(253, 186, 116, 0.45), 0 0 28px rgba(96, 165, 250, 0.2)',
            },
            '50%': {
              boxShadow:
                '0 2px 5px rgba(0,0,0,0.05), 0 0 0 1px rgba(96, 165, 250, 0.5), 0 0 32px rgba(241, 89, 42, 0.22)',
            },
          },
        },
        animation: {
          'ai-promo-bg': 'aiPromoBgShift 11s ease-in-out infinite',
          'ai-promo-bg-alt': 'aiPromoBgShiftAlt 14s ease-in-out infinite',
          'ai-promo-orb': 'aiPromoOrbPulse 6.5s ease-in-out infinite',
          'ai-promo-border': 'aiPromoBorderGlow 9s ease-in-out infinite',
        },
      },
    },
    plugins: [],
}