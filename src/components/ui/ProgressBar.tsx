import { cn } from '../../lib/cn';

export default function ProgressBar({ value, className }: { value: number; className?: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-pill bg-line', className)}
    >
      <div className="h-full rounded-pill bg-brand-600 transition-all" style={{ width: safe + '%' }} />
    </div>
  );
}
