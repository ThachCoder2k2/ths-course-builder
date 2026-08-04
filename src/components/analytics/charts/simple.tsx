import { Award, Check, Lock } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { sequential } from '../palette';

// ---- Pyramid / funnel -------------------------------------------------------

export interface PyramidRow {
  label: string;
  value: number; // drives width
  sub?: string; // e.g. "26/30"
}

/** Centred layered pyramid. Pass rows top→bottom (narrow→wide) for a pyramid silhouette. */
export function Pyramid({ rows, unit = '%' }: { rows: PyramidRow[]; unit?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="flex flex-col items-center gap-[4px]">
      {rows.map((r, i) => {
        const width = 42 + 58 * (r.value / max);
        return (
          <div
            key={r.label + i}
            style={{ width: `${width}%`, background: sequential(0.62 + 0.38 * (r.value / max)) }}
            className="flex h-11 items-center justify-between gap-md rounded-lg px-lg text-white"
          >
            <span className="min-w-0 truncate text-sm font-semibold">{r.label}</span>
            <span className="shrink-0 text-sm font-semibold tabular-nums opacity-90">{r.sub ?? `${r.value}${unit}`}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---- Level-up stepper -------------------------------------------------------

export interface StepItem {
  label: string;
  readiness: number;
}

export function Stepper({ steps, current }: { steps: StepItem[]; current: number }) {
  return (
    <ol className="flex items-stretch">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.label} className="flex flex-1 items-start">
            <div className="flex flex-1 flex-col items-center gap-md">
              <div className="flex w-full items-center">
                <span className={cn('h-0.5 flex-1', i === 0 ? 'bg-transparent' : done || active ? 'bg-brand-500' : 'bg-gray-200')} />
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                    done && 'border-brand-500 bg-brand-500 text-white',
                    active && 'border-brand-500 bg-brand-50 text-brand-secondary',
                    !done && !active && 'border-gray-300 bg-primary text-quaternary',
                  )}
                >
                  {done ? <Check className="h-5 w-5" /> : active ? <span className="text-sm font-bold">{i + 1}</span> : <Lock className="h-4 w-4" />}
                </span>
                <span className={cn('h-0.5 flex-1', i === steps.length - 1 ? 'bg-transparent' : done ? 'bg-brand-500' : 'bg-gray-200')} />
              </div>
              <div className="flex flex-col items-center gap-xxs text-center">
                <span className={cn('text-sm font-semibold', active ? 'text-primary' : 'text-tertiary')}>{s.label}</span>
                <span className={cn('text-xs tabular-nums', active ? 'text-brand-secondary' : 'text-quaternary')}>Sẵn sàng {s.readiness}%</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---- Badge shelf ------------------------------------------------------------

export interface BadgeItem {
  label: string;
  earned: boolean;
  hint?: string;
}

export function BadgeShelf({ badges }: { badges: BadgeItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-md sm:grid-cols-3">
      {badges.map((b) => (
        <li
          key={b.label}
          className={cn(
            'flex items-center gap-md rounded-xl border p-md',
            b.earned ? 'border-secondary bg-accent-peach' : 'border-dashed border-primary bg-secondary',
          )}
        >
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              b.earned ? 'bg-brandOrange text-white' : 'bg-gray-200 text-quaternary',
            )}
          >
            {b.earned ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className={cn('truncate text-sm font-semibold', b.earned ? 'text-primary' : 'text-tertiary')}>{b.label}</span>
            {!b.earned && b.hint ? <span className="text-xs text-quaternary">{b.hint}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
