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
          50: '#f4f9f1',
          100: '#e3f2e4',
          200: '#c5e5c8',
          300: '#94d19b',
          400: '#5ab664',
          500: '#2daf57',
          600: '#1e8e44',
          700: '#176938',
          800: '#14542e',
          900: '#104526'
        },
        citrus: {
          DEFAULT: '#d0c44e',
          light: '#f5f2d0',
          dark: '#9e932b'
        },
        panel: '#0c1829'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #d0c44e, #2daf57, #176938)',
        'brand-gradient-v': 'linear-gradient(180deg, #d0c44e, #2daf57, #176938)',
        'brand-wash': 'linear-gradient(135deg, #fbfde9, #edf7f0, #e3f2e4)'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
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
