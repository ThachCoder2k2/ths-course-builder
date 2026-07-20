import type { Config } from 'tailwindcss';

/**
 * Design tokens mirroring the Figma file's system.
 *
 * The Figma design is built on **Untitled UI**, consumed from an external library
 * (the tokens are not defined locally in the file, so they cannot be read from its
 * Variables panel). Token NAMES below are taken verbatim from Figma Dev Mode.
 *
 * VERIFIED from Dev Mode:
 *   - Colors/Background/bg-primary            #FFFFFF
 *   - Gradient/skeuemorphic-gradient-border   #1E4079
 *
 * UNVERIFIED (standard Untitled UI ramps, inferred because the design uses
 * unmodified Untitled UI token names). Confirm against Dev Mode and correct here —
 * every value lives in this file only, so fixing one is a one-line change.
 */

const gray = {
  25: '#FCFCFD',
  50: '#F9FAFB',
  100: '#F2F4F7',
  200: '#EAECF0',
  300: '#D0D5DD',
  400: '#98A2B3',
  500: '#667085',
  600: '#475467',
  700: '#344054',
  800: '#1D2939',
  900: '#101828',
};

// Brand ramp is blue in this design (primary buttons, links, active tabs).
const brand = {
  25: '#F5FAFF',
  50: '#EFF8FF',
  100: '#D1E9FF',
  200: '#B2DDFF',
  300: '#84CAFF',
  400: '#53B1FD',
  500: '#2E90FA',
  600: '#1570EF',
  700: '#175CD3',
  800: '#1849A9',
  900: '#194185',
};

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray,
        brand,
        // Untitled UI utility colours referenced by the design
        utility: {
          'blue-50': '#EFF8FF',
          'blue-200': '#B2DDFF',
          'blue-700': '#175CD3',
          'gray-blue-500': '#4E5BA6',
          'orange-500': '#EF6820',
        },
        success: { 50: '#ECFDF3', 200: '#ABEFC6', 600: '#079455', 700: '#067647' },
        // Dark surface used by course-card artwork and the course hero
        canvas: { dark: '#101828', deep: '#1E4079' },
        // Soft accent cards (collections / feature tiles)
        accent: { blue: '#EFF8FF', peach: '#FEF6EE', lavender: '#F4F3FF', mint: '#ECFDF3' },
      },

      // Semantic tokens, named to match Figma exactly (bg-primary, text-tertiary, ...)
      backgroundColor: {
        primary: '#FFFFFF',
        'primary-alt': '#FFFFFF',
        secondary: gray[50],
        'secondary-alt': gray[50],
        tertiary: gray[100],
        'brand-solid': brand[600],
        'button-primary': brand[600],
        'button-primary-hover': brand[700],
        'button-secondary': '#FFFFFF',
      },
      textColor: {
        primary: gray[900],
        secondary: gray[700],
        tertiary: gray[600],
        quaternary: gray[500],
        placeholder: gray[500],
        'brand-secondary': brand[700],
        'brand-tertiary': brand[600],
        'button-primary-fg': '#FFFFFF',
        'button-secondary-fg': gray[700],
      },
      borderColor: {
        primary: gray[300],
        secondary: gray[200],
        brand: brand[600],
        'button-secondary': gray[300],
      },
      divideColor: {
        primary: gray[300],
        secondary: gray[200],
      },
      ringColor: {
        brand: brand[600],
      },

      borderRadius: { card: '16px', pill: '999px', btn: '8px' },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 8px 24px rgba(16,24,40,0.06)',
        pop: '0 12px 32px rgba(16,24,40,0.12)',
      },
      maxWidth: { content: '1280px' },
      fontSize: {
        display: ['40px', { lineHeight: '48px', fontWeight: '700' }],
        h1: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '28px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
