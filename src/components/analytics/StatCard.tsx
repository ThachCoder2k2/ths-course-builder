import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useInView } from '../../lib/useInView';
import { useCountUp } from '../../lib/useCountUp';
import { Sparkline } from './charts/Sparkline';

/** KPI tile: icon + label, big value, delta pill, mini sparkline. */
export function StatCard({
  icon,
  label,
  value,
  unit,
  delta,
  deltaUnit = '',
  spark,
  sparkColor,
  positiveIsGood = true,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  delta: number;
  deltaUnit?: string;
  spark: number[];
  sparkColor?: string;
  positiveIsGood?: boolean;
}) {
  const up = delta >= 0;
  const good = up === positiveIsGood;
  const { ref, inView } = useInView<HTMLDivElement>();
  const isNumber = typeof value === 'number';
  const counted = useCountUp(isNumber ? value : 0, inView);
  return (
    <div ref={ref} className={cn('dv-reveal flex flex-col gap-lg rounded-card border border-secondary bg-primary p-xl shadow-card', inView && 'dv-in')}>
      <span className="flex items-center gap-md text-sm font-medium text-tertiary">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-secondary">{icon}</span>
        {label}
      </span>
      <div className="flex items-end justify-between gap-md">
        <div className="flex flex-col gap-md">
          <span className="text-display-xs font-semibold tabular-nums text-primary">
            {isNumber ? counted : value}
            {unit ? <span className="text-lg font-medium text-tertiary">{unit}</span> : null}
          </span>
          <span
            className={cn(
              'inline-flex w-fit items-center gap-xxs rounded-pill px-md py-xxs text-xs font-semibold',
              good ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-700',
            )}
          >
            {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
            {up ? '+' : ''}
            {delta}
            {deltaUnit}
          </span>
        </div>
        <Sparkline data={spark} color={sparkColor} width={104} height={40} />
      </div>
    </div>
  );
}
