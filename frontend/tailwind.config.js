/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gc: {
          bg: 'rgb(var(--gc-bg) / <alpha-value>)',
          bgMuted: 'rgb(var(--gc-bg-muted) / <alpha-value>)',
          surface: 'rgb(var(--gc-surface) / <alpha-value>)',
          surface2: 'rgb(var(--gc-surface-2) / <alpha-value>)',
          text: 'rgb(var(--gc-text) / <alpha-value>)',
          mutedText: 'rgb(var(--gc-text-muted) / <alpha-value>)',
          border: 'rgb(var(--gc-border) / <alpha-value>)',
          primary: 'rgb(var(--gc-primary) / <alpha-value>)',
          primary2: 'rgb(var(--gc-primary-2) / <alpha-value>)',
          accent: 'rgb(var(--gc-accent) / <alpha-value>)',
          accentSoft: 'rgb(var(--gc-accent-soft) / <alpha-value>)',
          warn: 'rgb(var(--gc-warn) / <alpha-value>)',
          purple: 'rgb(var(--gc-purple) / <alpha-value>)',
          success: 'rgb(var(--gc-success) / <alpha-value>)',
          danger: 'rgb(var(--gc-danger) / <alpha-value>)',
        },
      },
      boxShadow: {
        gc: '0 12px 40px rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [],
}