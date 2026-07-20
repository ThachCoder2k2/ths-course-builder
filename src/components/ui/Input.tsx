import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export default function Input({
  icon,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-btn border border-secondary bg-primary px-3 focus-within:border-brand-500',
        className,
      )}
    >
      {icon ? <span className="text-quaternary">{icon}</span> : null}
      <input
        className="h-10 w-full bg-transparent text-sm text-primary outline-none placeholder:text-quaternary"
        {...props}
      />
    </div>
  );
}
