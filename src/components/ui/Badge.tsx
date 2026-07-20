import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'brand' | 'success';

const TONE: Record<Tone, string> = {
  neutral: 'bg-secondary text-secondary',
  brand: 'bg-brand-50 text-brand-secondary',
  success: 'bg-success-50 text-success-600',
};

export default function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
