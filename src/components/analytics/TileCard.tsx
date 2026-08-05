import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useInView } from '../../lib/useInView';
import { InfoTip, type MetricInfo } from './InfoTip';

/** A dashboard tile: title (+i), optional controls, body, and a plain takeaway + action. */
export function TileCard({
  title,
  subtitle,
  info,
  controls,
  children,
  takeaway,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  info?: MetricInfo;
  controls?: ReactNode;
  children: ReactNode;
  takeaway?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section ref={ref} className={cn('dv-reveal flex min-w-0 flex-col gap-xl rounded-card border border-secondary bg-primary p-xl shadow-card sm:p-3xl', inView && 'dv-in', className)}>
      <header className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex min-w-0 flex-col gap-xxs">
          <div className="flex items-center gap-xs">
            <h3 className="text-md font-semibold text-primary">{title}</h3>
            {info ? <InfoTip info={info} label={title} /> : null}
          </div>
          {subtitle ? <p className="text-sm text-tertiary">{subtitle}</p> : null}
        </div>
        {controls ? <div className="flex shrink-0 items-center gap-xs">{controls}</div> : null}
      </header>

      <div className="min-w-0 flex-1">{children}</div>

      {takeaway ? (
        <div className="flex items-start gap-md rounded-lg border-l-2 border-brand-500 bg-accent-blue px-lg py-md">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-secondary" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 flex-col gap-md">
            <p className="text-sm leading-relaxed text-secondary">{takeaway}</p>
            {action ? <div>{action}</div> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** Small segmented toggle used inside tile headers. */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-secondary bg-secondary p-[2px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn('rounded-md px-md py-xxs text-xs font-semibold transition', value === o.value ? 'bg-primary text-brand-secondary shadow-xs' : 'text-tertiary hover:text-secondary')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
