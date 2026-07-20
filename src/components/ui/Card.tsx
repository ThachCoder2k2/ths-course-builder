import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-card border border-secondary bg-primary shadow-card', className)}
      {...props}
    />
  );
}
