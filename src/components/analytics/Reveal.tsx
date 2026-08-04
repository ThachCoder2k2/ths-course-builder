import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useInView } from '../../lib/useInView';

/** Fades + slides its children in when scrolled into view (once). Reduced-motion safe. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cn('dv-reveal', inView && 'dv-in', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
