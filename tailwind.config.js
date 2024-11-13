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
          DEFAULT: '#2B57AD', // Blue
          hover: '#234a91',   // Darker blue for hover states
        },
        secondary: {
          DEFAULT: '#B91F3B', // Red
          hover: '#9d1a32',   // Darker red for hover states
        },
        accent: {
          DEFAULT: '#F57B17', // Orange
          hover: '#d66b14',   // Darker orange for hover states
        }
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

