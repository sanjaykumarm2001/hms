export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F8F5',
        ink: {
          DEFAULT: '#111417',
          soft: '#4b5257',
          muted: '#868f96'
        },
        line: '#e6e8e3',
        brand: {
          50: '#f6faec',
          100: '#eaf5d5',
          200: '#d6ebac',
          300: '#b9de6f',
          400: '#a4d13f',
          500: '#60c64a',
          600: '#25b84f',
          700: '#1c9440',
          800: '#167233',
          900: '#0f4d23'
        },
        citrus: '#d9dd3a',
        panel: '#0e1113'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #d9dd3a, #a4d13f, #60c64a, #25b84f)',
        'brand-gradient-v': 'linear-gradient(180deg, #d9dd3a, #a4d13f, #60c64a, #25b84f)',
        'brand-wash': 'linear-gradient(135deg, #fbfde9, #f0f8dc, #e2f4e2)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 20, 0.04), 0 1px 12px rgba(16, 24, 20, 0.04)',
        panel: '0 8px 40px rgba(16, 24, 20, 0.10)'
      },
      borderRadius: {
        card: '10px'
      }
    }
  }
};
