import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export default function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-btn text-ink-700 transition-colors hover:bg-surface-muted',
        className,
      )}
      {...props}
    />
  );
}
