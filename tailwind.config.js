/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#2E7D32',
          hover: '#1B5E20',
          light: '#4CAF50',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#1A237E',
          hover: '#0D47A1',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#00695C',
          hover: '#004D40',
          foreground: '#FFFFFF',
        },
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'blob': 'blob 7s infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

