/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Brand Colors
      colors: {
        brand: {
          DEFAULT: '#ff5f57',
          hover: '#ff4540',
          light: '#ff8a85',
          dark: '#e53e36',
        },
        // Gray Scale (Light Theme)
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          150: '#f0f0f0',
          200: '#e8e8e8',
          250: '#e0e0e0',
          300: '#d0d0d0',
          400: '#ccc',
          450: '#bbb',
          500: '#999',
          600: '#888',
          700: '#666',
          800: '#333',
        },
        // Dark Theme Colors
        dark: {
          50: '#5a5a5a',
          100: '#4a4a4a',
          200: '#3a3a3a',
          300: '#2a2a2a',
          800: '#1e1e1e',
          900: '#0a0a0a',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#4ade80',
          light: '#86efac',
          dark: '#22c55e',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee',
          dark: '#f44336',
        },
        info: {
          DEFAULT: '#888',
          light: '#e3f2fd',
          dark: '#1976d2',
        },
      },

      // Spacing (custom values not in default Tailwind)
      spacing: {
        'log-viewer': '35px',
        '18': '4.5rem',    // 72px
        '88': '22rem',     // 352px
        '128': '32rem',    // 512px
      },

      // Border Radius
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },

      // Font Sizes
      fontSize: {
        'xxs': ['10px', { lineHeight: '1.4' }],
        'xs': ['11px', { lineHeight: '1.4' }],
        'sm': ['12px', { lineHeight: '1.5' }],
        'base': ['13px', { lineHeight: '1.5' }],
        'md': ['14px', { lineHeight: '1.5' }],
        'lg': ['16px', { lineHeight: '1.5' }],
        'xl': ['18px', { lineHeight: '1.4' }],
        '2xl': ['20px', { lineHeight: '1.4' }],
        '3xl': ['24px', { lineHeight: '1.3' }],
      },

      // Font Families
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },

      // Font Weights
      fontWeight: {
        regular: '400',
        medium: '450',
        semibold: '500',
        bold: '600',
      },

      // Box Shadows (for elevation)
      boxShadow: {
        'elevation-sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'elevation-md': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'elevation-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      },

      // Background Images
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },

      // Transitions
      transitionDuration: {
        '250': '250ms',
      },

      // Z-index layers
      zIndex: {
        'modal': '1000',
        'log-viewer': '9999',
      },

      // Animation
      keyframes: {
        flash: {
          '0%, 100%': { color: '#888' },
          '50%': { color: '#4ade80' },
        },
        spin: {
          'to': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        flash: 'flash 0.5s ease-in-out infinite',
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};
