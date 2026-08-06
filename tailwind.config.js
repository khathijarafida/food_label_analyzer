/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F6FAF1',
          100: '#EBFADC',
          200: '#D8E5C8',
          300: '#C7D9B1',
          400: '#9CB57F',
          500: '#728C5A',
          600: '#5E744B',
          700: '#4A5D3A',
          800: '#2E4726',
          900: '#102F15',
          950: '#08190C',
        },

        mint: {
          50: '#FDFEF9',
          100: '#F6FAF1',
          200: '#EBFADC',
          300: '#D8E5C8',
          400: '#C7D9B1',
          500: '#9CB57F',
          600: '#728C5A',
        },

        accent: {
          50: '#FFF8E6',
          100: '#FFF0C2',
          200: '#FFE39A',
          300: '#FFD16B',
          400: '#F7BE4A',
          500: '#E8A317',
          600: '#C9890F',
          700: '#9B670A',
        },

        gold: {
          50: '#FFFBEA',
          100: '#FFF3C4',
          200: '#FCE588',
          300: '#FADB5F',
          400: '#F7C948',
          500: '#F0B429',
          600: '#DE911D',
          700: '#CB6E17',
        },

        info: {
          50: '#EEF8FF',
          100: '#D9F0FF',
          200: '#B8E3FF',
          300: '#7ED0FF',
          400: '#42B7FF',
          500: '#2196F3',
          600: '#1976D2',
          700: '#1258A7',
        },

        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },

        warning: {
          50: '#FFF8E6',
          100: '#FFF0C2',
          200: '#FFE39A',
          300: '#FFD16B',
          400: '#F7BE4A',
          500: '#E8A317',
          600: '#C9890F',
          700: '#9B670A',
        },

        success: {
          50: '#F6FAF1',
          100: '#EBFADC',
          200: '#D8E5C8',
          300: '#C7D9B1',
          400: '#9CB57F',
          500: '#728C5A',
          600: '#5E744B',
          700: '#102F15',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        xl2: '1.25rem',
      },

      boxShadow: {
        soft: '0 8px 30px rgba(114,140,90,0.12)',
        'soft-lg': '0 15px 45px rgba(114,140,90,0.18)',
        emerald: '0 10px 30px rgba(114,140,90,0.25)',
        glow: '0 0 30px rgba(114,140,90,0.35)',
      },

      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'scan-line': 'scanLine 2s ease-in-out infinite',
        'scan-glow': 'scanGlow 1.5s ease-in-out infinite alternate',
        'float-blob': 'floatBlob 8s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },

        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },

        pulseRing: {
          '0%': {
            transform: 'scale(.8)',
            opacity: '.8',
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },

        scanLine: {
          '0%': {
            transform: 'translateY(0)',
            opacity: '.4',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(400%)',
            opacity: '.4',
          },
        },

        scanGlow: {
          '0%': {
            boxShadow: '0 0 20px rgba(114,140,90,.3)',
          },
          '100%': {
            boxShadow: '0 0 40px rgba(114,140,90,.5)',
          },
        },

        floatBlob: {
          '0%,100%': {
            transform: 'translate(0,0) scale(1)',
          },
          '50%': {
            transform: 'translate(20px,-20px) scale(1.05)',
          },
        },
      },
    },
  },

  plugins: [],
};