/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B57AD',
          hover: '#234a91',
        },
        secondary: {
          DEFAULT: '#B91F3B',
          hover: '#9d1a32',
        },
        accent: {
          DEFAULT: '#F57B17',
          hover: '#d66b14',
        }
      },
      keyframes: {
        attention: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' }
        }
      },
      animation: {
        attention: 'attention 2s ease-in-out infinite'
      }
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        'summary::-webkit-details-marker': {
          display: 'none'
        }
      })
    }
  ],
}

