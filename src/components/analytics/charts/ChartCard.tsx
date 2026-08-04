import type { ReactNode } from 'react';
import { cn } from '../../../lib/cn';
import { useInView } from '../../../lib/useInView';
import { InfoTip, type MetricInfo } from '../InfoTip';

/** A titled surface that hosts one chart. Self-reveals + triggers chart draw-in when scrolled into view. */
export function ChartCard({
  title,
  subtitle,
  info,
  aside,
  children,
  note,
  className,
}: {
  title: string;
  subtitle?: string;
  info?: MetricInfo;
  aside?: ReactNode;
  children: ReactNode;
  note?: ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className={cn(
        'dv-reveal flex min-w-0 flex-col gap-xl rounded-card border border-secondary bg-primary p-xl shadow-card sm:p-3xl',
        inView && 'dv-in',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-lg">
        <div className="flex min-w-0 flex-col gap-xxs">
          <div className="flex items-center gap-xs">
            <h3 className="text-md font-semibold text-primary">{title}</h3>
            {info ? <InfoTip info={info} label={title} /> : null}
          </div>
          {subtitle ? <p className="text-sm text-tertiary">{subtitle}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </header>
      <div className="min-w-0 flex-1">{children}</div>
      {note ? <div className="min-w-0">{note}</div> : null}
    </section>
  );
}

export interface LegendItem {
  label: string;
  color: string;
  dashed?: boolean;
}

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-xl gap-y-xs', className)}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-xs text-xs font-medium text-tertiary">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={
              it.dashed
                ? { border: `1.5px dashed ${it.color}` }
                : { background: it.color }
            }
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
