import type { Config } from 'tailwindcss';

/**
 * Design tokens extracted from the Figma file's Dev Mode inspector.
 *
 * The design is built on Untitled UI. Token names match Figma exactly.
 * Values marked VERIFIED were read directly from Dev Mode swatches.
 * Values marked INFERRED fill gaps in a ramp where no node in the inspected
 * frames used that step — correct them if a design ever needs them.
 */

const gray = {
  25: '#FDFDFD', // INFERRED
  50: '#FAFAFA', // VERIFIED bg-secondary
  100: '#F5F5F5', // VERIFIED bg-tertiary
  200: '#E9EAEB', // VERIFIED border-secondary
  300: '#D5D7DA', // VERIFIED border-primary
  400: '#A4A7AE', // VERIFIED fg-quinary (400)
  500: '#717680', // VERIFIED text-quaternary (500)
  600: '#535862', // VERIFIED text-tertiary (600)
  700: '#414651', // VERIFIED text-secondary (700)
  800: '#252B37', // INFERRED
  900: '#181D27', // VERIFIED text-primary (900)
};

const brand = {
  25: '#F5FAFF', // INFERRED
  50: '#EFF8FF', // VERIFIED utility-blue-50
  100: '#D1E9FF', // INFERRED
  200: '#B2DDFF', // VERIFIED utility-blue-200
  300: '#84CAFF', // INFERRED
  400: '#53B1FD', // INFERRED
  500: '#0D67F7', // VERIFIED icon-fg-brand / text-brand-tertiary_alt
  600: '#055BE6', // VERIFIED text-brand-secondary (700)
  700: '#175CD3', // VERIFIED utility-blue-700
  800: '#1849A9', // INFERRED
  900: '#20447E', // VERIFIED button-primary-bg
};

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray,
        brand,
        utility: {
          'blue-50': '#EFF8FF', // VERIFIED
          'blue-200': '#B2DDFF', // VERIFIED
          'blue-700': '#175CD3', // VERIFIED
          'gray-blue-500': '#4E5BA6', // VERIFIED
          'orange-500': '#EF6820', // VERIFIED
        },
        // INFERRED - no success/green token appeared in the inspected frames
        success: { 50: '#ECFDF3', 200: '#ABEFC6', 600: '#079455', 700: '#067647' },
        canvas: {
          dark: '#181D27', // VERIFIED (gray-900), used for dark card artwork
          deep: '#1E4079', // VERIFIED skeuemorphic-gradient-border
        },
        // INFERRED soft tints for collection / feature tiles
        accent: { blue: '#EFF8FF', peach: '#FEF6EE', lavender: '#F4F3FF', mint: '#ECFDF3' },
      },

      backgroundColor: {
        primary: '#FFFFFF', // VERIFIED bg-primary
        'primary-alt': '#FFFFFF', // VERIFIED bg-primary_alt
        secondary: '#FAFAFA', // VERIFIED bg-secondary
        'secondary-alt': '#FAFAFA', // VERIFIED bg-secondary_alt
        tertiary: '#F5F5F5', // VERIFIED bg-tertiary
        'button-primary': '#20447E', // VERIFIED button-primary-bg
        'button-secondary': '#FFFFFF', // VERIFIED button-secondary-bg
      },
      textColor: {
        primary: '#181D27', // VERIFIED
        secondary: '#414651', // VERIFIED
        tertiary: '#535862', // VERIFIED
        quaternary: '#717680', // VERIFIED
        placeholder: '#717680', // VERIFIED
        'brand-secondary': '#055BE6', // VERIFIED
        'brand-tertiary': '#0D67F7', // VERIFIED text-brand-tertiary_alt
        'button-primary-fg': '#FFFFFF', // VERIFIED
        'button-secondary-fg': '#414651', // VERIFIED
        'button-tertiary-fg': '#535862', // VERIFIED
        'fg-quaternary': '#717680', // VERIFIED
        'fg-quinary': '#A4A7AE', // VERIFIED
      },
      borderColor: {
        primary: '#D5D7DA', // VERIFIED border-primary
        secondary: '#E9EAEB', // VERIFIED border-secondary
        'button-secondary': '#D5D7DA', // VERIFIED button-secondary-border
        brand: '#055BE6', // VERIFIED
      },
      divideColor: {
        primary: '#D5D7DA',
        secondary: '#E9EAEB',
      },

      borderRadius: { card: '16px', pill: '999px', btn: '8px' },
      boxShadow: {
        card: '0 1px 2px rgba(24,29,39,0.06), 0 8px 24px rgba(24,29,39,0.06)',
        pop: '0 12px 32px rgba(24,29,39,0.12)',
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
