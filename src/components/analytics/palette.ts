/**
 * Chart palette derived from the project's Untitled UI tokens.
 * The categorical order below was validated for colour-vision-deficiency safety
 * with the dataviz `validate_palette.js` checker (light mode, all checks PASS;
 * the green↔pink adjacent pair sits in the 6–8 ΔE floor band, so those series
 * are always direct-labelled — identity never rests on colour alone).
 */

export const CATEGORICAL = ['#0D67F7', '#EF6820', '#7A5AF8', '#DD2590', '#099250', '#4E5BA6'] as const;
export const cat = (i: number): string => CATEGORICAL[((i % CATEGORICAL.length) + CATEGORICAL.length) % CATEGORICAL.length];

/** Named series colours so sections stop hardcoding raw hex (single source of truth). */
export const SERIES = {
  blue: CATEGORICAL[0],
  orange: CATEGORICAL[1],
  violet: CATEGORICAL[2],
  pink: CATEGORICAL[3],
  green: CATEGORICAL[4],
  greenBlue: CATEGORICAL[5],
} as const;

/** Pick a legible text colour (dark ink vs white) for a given fill using relative luminance. */
export function readableText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.42 ? '#181D27' : '#FFFFFF';
}

export const INK = {
  primary: '#181D27',
  secondary: '#414651',
  tertiary: '#535862',
  quaternary: '#717680',
  quinary: '#A4A7AE',
};

export const SURFACE = { primary: '#FFFFFF', secondary: '#FAFAFA', tertiary: '#F5F5F5' };

/** Recessive chart chrome (gray-200 / gray-300). */
export const GRID = '#E9EAEB';
export const AXIS = '#D5D7DA';

export const BRAND = {
  navy: '#1F427A',
  navyBtn: '#20447E',
  blue: '#0D67F7',
  blue600: '#055BE6',
  orange: '#E9772C',
};

/** Reserved status colours — always paired with an icon or text label, never colour-alone. */
export const STATUS = { good: '#079455', warning: '#DC6803', danger: '#D92D20', neutral: '#717680' };

const BLUE_RAMP = [
  '#EFF8FF',
  '#D1E9FF',
  '#B2DDFF',
  '#84CAFF',
  '#53B1FD',
  '#2E90FA',
  '#1570EF',
  '#175CD3',
  '#1849A9',
  '#194185',
];

/** Single-hue sequential (magnitude), t in [0,1]. */
export function sequential(t: number): string {
  const x = Math.max(0, Math.min(1, t)) * (BLUE_RAMP.length - 1);
  return BLUE_RAMP[Math.round(x)];
}

const ORANGE_RAMP = ['#FEF6EE', '#FDEAD7', '#F9DBAF', '#F7B27A', '#EF6820', '#B93815'];

/** Diverging orange↔blue with a neutral gray midpoint, t in [-1,1]. */
export function diverging(t: number): string {
  if (t > 0.04) return sequential(0.45 + 0.55 * Math.min(1, t));
  if (t < -0.04) {
    const x = Math.min(1, -t) * (ORANGE_RAMP.length - 1);
    return ORANGE_RAMP[Math.round(x)];
  }
  return '#D5D7DA';
}
