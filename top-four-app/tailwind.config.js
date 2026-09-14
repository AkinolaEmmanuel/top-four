/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand)',
          fill: 'var(--brand-fill)',
        },
        nav: {
          surface: 'var(--nav-surface)',
          text: 'var(--nav-text)',
          muted: 'var(--nav-muted)',
          border: 'var(--nav-border)',
          warning: 'var(--nav-warning)',
          positive: 'var(--nav-positive)',
        },
        surface: {
          canvas: 'var(--surface-canvas)',
          card: 'var(--surface-card)',
          border: 'var(--surface-border)',
          'border-strong': 'var(--surface-border-strong)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        pitch: {
          turf: 'var(--pitch-turf)',
          stripe: 'var(--pitch-turf-stripe)',
          line: 'var(--pitch-line)',
        },
        pos: {
          gk: 'var(--pos-gk)',
          df: 'var(--pos-df)',
          mf: 'var(--pos-mf)',
          fw: 'var(--pos-fw)',
        }
      },
      fontFamily: {
        primary: ['var(--font-dm-sans)', 'sans-serif'],
        secondary: ['var(--font-sora)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
