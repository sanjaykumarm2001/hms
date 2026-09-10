export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: '#F4F5F7',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#0B1220',
          muted: '#5B6472',
          faint: '#8A93A2',
        },
        line: '#E4E7EC',
        brand: {
          50: '#EFF4FF',
          100: '#DBE6FE',
          200: '#BFD3FE',
          300: '#93B4FD',
          400: '#608DFA',
          500: '#3B6BF6',
          600: '#2563EB',
          700: '#1D4FD7',
          800: '#1E42AE',
          900: '#1E3A8A',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(11, 18, 32, 0.04)',
        pop: '0 12px 32px -8px rgba(11, 18, 32, 0.18)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
}
