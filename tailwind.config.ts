import type { Config } from 'tailwindcss';

/**
 * Design tokens pulled from Figma via the Figma MCP (`get_variable_defs`) on the
 * "Cource builder" file. Every value below is the real token value — nothing inferred.
 *
 * Token names mirror Figma so classes map 1:1 to Dev Mode:
 *   bg-primary, text-tertiary, border-secondary, bg-button-primary, ...
 */

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // THS brand
        brandNavy: '#1F427A', // Brand/1
        brandOrange: '#E9772C', // Brand/2

        brand: {
          50: '#EFF8FF', // utility-blue-50
          200: '#B2DDFF', // utility-blue-200
          500: '#0D67F7', // icon-fg-brand / text-brand-tertiary_alt
          600: '#055BE6', // text-brand-secondary (700)
          700: '#175CD3', // utility-blue-700
          900: '#20447E', // button-primary-bg
        },
        gray: {
          50: '#FAFAFA', // bg-secondary
          100: '#F5F5F5', // bg-tertiary
          200: '#E9EAEB', // border-secondary
          300: '#D5D7DA', // border-primary
          400: '#A4A7AE', // fg-quinary (400)
          500: '#717680', // text-quaternary (500)
          600: '#535862', // text-tertiary (600)
          700: '#414651', // text-secondary (700)
          900: '#181D27', // text-primary (900)
        },
        utility: {
          'brand-50': '#F0F6FE',
          'brand-200': '#B4D0FE',
          'brand-700': '#055BE6',
          'blue-50': '#EFF8FF',
          'blue-200': '#B2DDFF',
          'blue-700': '#175CD3',
          'gray-blue-500': '#4E5BA6',
          'orange-500': '#EF6820',
        },
        success: { 50: '#ECFDF3', 200: '#ABEFC6', 600: '#079455', 700: '#067647' },
        canvas: { dark: '#181D27', deep: '#1F427A' },
        accent: { blue: '#EFF8FF', peach: '#FEF6EE', lavender: '#F4F3FF', mint: '#ECFDF3' },
      },

      backgroundColor: {
        primary: '#FFFFFF',
        'primary-alt': '#FFFFFF',
        secondary: '#FAFAFA',
        'secondary-alt': '#FAFAFA',
        tertiary: '#F5F5F5',
        quaternary: '#E9EAEB',
        'button-primary': '#20447E',
        'button-secondary': '#FFFFFF',
      },
      textColor: {
        primary: '#181D27',
        secondary: '#414651',
        tertiary: '#535862',
        quaternary: '#717680',
        placeholder: '#717680',
        'brand-secondary': '#055BE6',
        'brand-tertiary': '#0D67F7',
        'orange-dark-900': '#771A0D', // Orange dark/900 — banner slide 2 heading
        'button-primary-fg': '#FFFFFF',
        'button-secondary-fg': '#414651',
        'button-tertiary-fg': '#535862',
        'fg-quaternary': '#717680',
        'fg-quinary': '#A4A7AE',
      },
      borderColor: {
        primary: '#D5D7DA',
        secondary: '#E9EAEB',
        'button-secondary': '#D5D7DA',
        'button-secondary-color': '#86B4FE', // button-secondary-color-border
        brand: '#055BE6',
        'brand-alt': '#0D67F7', // fg-brand-primary_alt — active tab underline
      },
      divideColor: { primary: '#D5D7DA', secondary: '#E9EAEB' },

      fontFamily: {
        // Font family/font-family-body + font-family-display
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      // Font size / Line height token pairs
      fontSize: {
        xs: ['12px', { lineHeight: '18px' }],
        sm: ['14px', { lineHeight: '20px' }],
        md: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '30px' }],
        'display-xs': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'display-sm': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'display-md': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['48px', { lineHeight: '60px', letterSpacing: '-0.02em', fontWeight: '600' }],
      },

      // spacing-* tokens
      spacing: {
        none: '0px',
        xxs: '2px',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
        '6xl': '48px',
        '7xl': '64px',
        '8xl': '80px',
        '9xl': '96px',
      },

      // radius-* tokens
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        full: '9999px',
        // aliases used across components
        btn: '8px',
        card: '16px',
        pill: '9999px',
      },

      // Shadows/* tokens (alpha hex straight from Figma)
      boxShadow: {
        xs: '0 1px 2px 0 #0A0D120D',
        sm: '0 1px 2px -1px #0A0D121A, 0 1px 3px 0 #0A0D121A',
        card: '0 1px 2px 0 #0A0D120D',
        pop: '0 1px 2px -1px #0A0D121A, 0 1px 3px 0 #0A0D121A',

        // Figma draws frame strokes *inside* the frame, so a 1px stroke does not
        // grow the box. A CSS `border` does. These pair shadow-xs with an inset
        // ring so bordered auto-height elements match Figma's stated heights.
        'xs-ring-primary': '0 1px 2px 0 #0A0D120D, inset 0 0 0 1px #D5D7DA',
        'xs-ring-secondary': '0 1px 2px 0 #0A0D120D, inset 0 0 0 1px #E9EAEB',
        'xs-ring-brand': '0 1px 2px 0 #0A0D120D, inset 0 0 0 1px #86B4FE',
      },

      maxWidth: {
        content: '1280px', // container-max-width-desktop
        paragraph: '720px', // paragraph-max-width
        'width-sm': '480px',
        'width-xl': '768px',
      },
    },
  },
  plugins: [],
} satisfies Config;
