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
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'bg-alt': 'var(--color-bg-alt)',
        border: 'var(--color-border)',
        ink: 'var(--color-ink)',
        'ink-light': 'var(--color-ink-light)',
        muted: 'var(--color-muted)',
        // New cheerful accent colors
        coral: 'var(--color-coral)',
        'coral-dark': 'var(--color-coral-dark)',
        sage: 'var(--color-sage)',
        'sage-dark': 'var(--color-sage-dark)',
        butter: 'var(--color-butter)',
        'butter-dark': 'var(--color-butter-dark)',
        sky: 'var(--color-sky)',
        'sky-dark': 'var(--color-sky-dark)',
        blush: 'var(--color-blush)',
        mint: 'var(--color-mint)',
        // Legacy mappings
        'accent-red': 'var(--color-accent-red)',
        'accent-gold': 'var(--color-accent-gold)',
        'accent-teal': 'var(--color-accent-teal)',
        'accent-navy': 'var(--color-accent-navy)',
        // Electric color backward compatibility
        pink: 'var(--color-pink)',
        'pink-dark': 'var(--color-pink-dark)',
        yellow: 'var(--color-yellow)',
        'yellow-dark': 'var(--color-yellow-dark)',
        cyan: 'var(--color-cyan)',
        'cyan-dark': 'var(--color-cyan-dark)',
        lime: 'var(--color-lime)',
        purple: 'var(--color-purple)',
      },
    },
  },
  plugins: [],
};

export default config;
