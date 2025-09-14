/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Emotional color palette for Whisper Walls
        joy: {
          50: '#fef7e0',
          100: '#fdecc8',
          200: '#fbd38d',
          300: '#f6ad55',
          400: '#ed8936',
          500: '#dd6b20',
          600: '#c05621',
          700: '#9c4221',
          800: '#7c2d12',
          900: '#652b19',
        },
        nostalgia: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        hope: {
          50: '#f0fff4',
          100: '#c6f6d5',
          200: '#9ae6b4',
          300: '#68d391',
          400: '#48bb78',
          500: '#38a169',
          600: '#2f855a',
          700: '#276749',
          800: '#22543d',
          900: '#1a202c',
        },
        stress: {
          50: '#fed7d7',
          100: '#feb2b2',
          200: '#fc8181',
          300: '#f56565',
          400: '#e53e3e',
          500: '#c53030',
          600: '#9b2c2c',
          700: '#742a2a',
          800: '#4a5568',
          900: '#2d3748',
        },
        love: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      animation: {
        'fade-whisper': 'fadeWhisper 3s ease-out forwards',
        'bloom-match': 'bloomMatch 2s ease-out forwards',
        'butterfly': 'butterfly 1.5s ease-in-out forwards',
        'heart-flutter': 'heartFlutter 0.6s ease-in-out',
        'pulse-aura': 'pulseAura 2s ease-in-out infinite',
      },
      keyframes: {
        fadeWhisper: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '70%': { opacity: '0.7', transform: 'scale(1.05)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        bloomMatch: {
          '0%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(360deg)' },
        },
        butterfly: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(5deg)' },
          '50%': { transform: 'translateY(-5px) rotate(-3deg)' },
          '75%': { transform: 'translateY(-15px) rotate(2deg)' },
          '100%': { transform: 'translateY(-20px) rotate(0deg)' },
        },
        heartFlutter: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        pulseAura: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      fontFamily: {
        'romantic': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}