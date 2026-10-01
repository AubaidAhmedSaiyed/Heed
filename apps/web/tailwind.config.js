/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        elevated: 'var(--surface-elevated)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        accent: 'var(--accent)',
        'accent-muted': 'var(--accent-muted)',
        allow: 'var(--allow)',
        'allow-muted': 'var(--allow-muted)',
        ask: 'var(--ask)',
        'ask-muted': 'var(--ask-muted)',
        block: 'var(--block)',
        'block-muted': 'var(--block-muted)',
      },
      fontFamily: {
        sans: ['var(--sans)'],
        mono: ['var(--mono)'],
      },
      borderColor: {
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')]
}
