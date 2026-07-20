import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Figma: `Badge` (node 192:6640) — bg-primary, border-primary, shadow-xs,
 * radius-sm, pl-xs/pr-sm/py-xxs, 12px icon, Text xs/Medium in text-secondary.
 */
export default function IconBadge({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-xs rounded-sm border border-primary bg-primary py-xxs pl-xs pr-sm text-xs font-medium text-secondary shadow-xs',
        className,
      )}
    >
      <span className="grid h-3 w-3 shrink-0 place-items-center">{icon}</span>
      {children}
    </span>
  );
}
