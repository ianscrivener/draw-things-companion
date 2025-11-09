/**
 * Design System Theme Constants
 *
 * This file provides JavaScript access to the design tokens defined in tailwind.config.js
 * Use these when you need programmatic access to theme values (e.g., inline styles, logic)
 *
 * For most cases, prefer using Tailwind utility classes directly in JSX
 */

export const colors = {
  brand: {
    DEFAULT: '#ff5f57',
    hover: '#ff4540',
    light: '#ff8a85',
    dark: '#e53e36',
  },

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

  dark: {
    50: '#5a5a5a',
    100: '#4a4a4a',
    200: '#3a3a3a',
    300: '#2a2a2a',
    800: '#1e1e1e',
    900: '#0a0a0a',
  },

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
};

export const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
  '4xl': '60px',
  logViewer: '35px',
};

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
};

export const fontSize = {
  xxs: '10px',
  xs: '11px',
  sm: '12px',
  base: '13px',
  md: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '20px',
  '3xl': '24px',
};

export const fontWeight = {
  regular: 400,
  medium: 450,
  semibold: 500,
  bold: 600,
};

export const fontFamily = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
};

export const zIndex = {
  modal: 1000,
  logViewer: 9999,
};

// Convenience getters for common use cases
export const getLogColor = (level) => {
  switch (level) {
    case 'error':
      return colors.error.DEFAULT;
    case 'warning':
      return colors.warning.DEFAULT;
    case 'success':
      return colors.success.DEFAULT;
    case 'info':
    default:
      return colors.info.DEFAULT;
  }
};

export const getLogIcon = (level) => {
  switch (level) {
    case 'error':
      return '✖';
    case 'warning':
      return '⚠';
    case 'success':
      return '✓';
    case 'info':
    default:
      return '•';
  }
};

// Export as default for easier imports
export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  fontFamily,
  zIndex,
  getLogColor,
  getLogIcon,
};
