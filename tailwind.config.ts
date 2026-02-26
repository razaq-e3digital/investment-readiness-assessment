/* eslint-disable ts/no-require-imports */
import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Design system colours (from Stitch mockups) ─────────────────────────
      colors: {
        // shadcn/ui CSS variable tokens (kept intact)
        'border': 'hsl(var(--border))',
        'input': 'hsl(var(--input))',
        'ring': 'hsl(var(--ring))',
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
        'primary': {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'secondary': {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        'destructive': {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'muted': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'popover': {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'card': {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ── E3 Digital brand colours ─────────────────────────────────────────
        'navy': '#0f172a',
        'navy-light': '#1e293b',
        'accent-blue': '#2563eb',
        'accent-blue-hover': '#1d4ed8',
        'accent-blue-light': '#dbeafe',
        'cta-green': '#10b981',
        'cta-green-hover': '#059669',
        // Page backgrounds / surfaces
        'page-bg': '#f8fafc',
        'page-bg-alt': '#f1f5f9',
        'surface': '#ffffff',
        'card-border': '#e2e8f0',
        'card-border-light': '#f1f5f9',
        // Text colours
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-muted': '#94a3b8',
        // Score colours
        'score-green': '#22c55e',
        'score-green-bg': '#dcfce7',
        'score-blue': '#3b82f6',
        'score-blue-bg': '#dbeafe',
        'score-orange': '#f97316',
        'score-orange-bg': '#ffedd5',
        'score-red': '#ef4444',
        'score-red-bg': '#fee2e2',
      },
      // ── Typography ───────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Hero headline
        'hero': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        // Section heading
        'section': ['1.875rem', { lineHeight: '1.25', fontWeight: '700' }],
        // Card heading
        'card-title': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      // ── Border radius ────────────────────────────────────────────────────────
      borderRadius: {
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
        'xl': '12px',
        '2xl': '16px',
      },
      // ── Box shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
      },
      // ── Keyframes ────────────────────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
