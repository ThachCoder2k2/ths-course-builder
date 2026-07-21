import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The Figma type scale adds font sizes Tailwind does not ship — `text-md` and
 * the `text-display-*` ramp. Stock tailwind-merge cannot tell those from text
 * *colour* utilities, so it treats them as the same conflict group and drops
 * the size when a colour follows:
 *
 *   cn('text-display-md', 'text-secondary')  ->  'text-secondary'   (36px lost)
 *
 * Registering them under `font-size` keeps both.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['md', 'display-xs', 'display-sm', 'display-md', 'display-lg'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
