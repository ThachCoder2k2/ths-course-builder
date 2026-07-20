import { Star } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-semibold text-secondary', className)}>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      {value.toFixed(1)}
    </span>
  );
}
