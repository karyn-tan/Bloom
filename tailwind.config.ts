import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:             'var(--color-bg)',
        surface:        'var(--color-surface)',
        border:         'var(--color-border)',
        ink:            'var(--color-ink)',
        'accent-red':   'var(--color-accent-red)',
        'accent-gold':  'var(--color-accent-gold)',
        'accent-teal':  'var(--color-accent-teal)',
        'accent-navy':  'var(--color-accent-navy)',
        muted:          'var(--color-muted)',
      },
    },
  },
  plugins: [],
};

export default config;