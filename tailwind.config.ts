import type { Config } from 'tailwindcss';

// Design tokens. Values are eyeballed defaults from the Figma screenshots, to be
// refined against Figma Dev Mode (plan Task 1, Step 3) once Figma access is available.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF5FF',
          100: '#DBE8FE',
          200: '#BFD6FE',
          500: '#3B72F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
        ink: { 900: '#0F172A', 700: '#334155', 500: '#64748B', 400: '#94A3B8' },
        surface: { DEFAULT: '#FFFFFF', muted: '#F8FAFC', card: '#0B1220' },
        line: '#E2E8F0',
        success: { 50: '#ECFDF5', 600: '#059669' },
        accent: { blue: '#EAF1FF', peach: '#FFF1E9', lavender: '#F1ECFF', mint: '#E9FBF3' },
      },
      borderRadius: { card: '16px', pill: '999px', btn: '10px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        pop: '0 12px 32px rgba(15,23,42,0.12)',
      },
      maxWidth: { content: '1200px' },
      fontSize: {
        display: ['40px', { lineHeight: '48px', fontWeight: '800' }],
        h1: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h3: ['18px', { lineHeight: '28px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
