import { CalendarRange } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { SpanMonth } from '../../behavior/overview';

/** The only control on the general report: which month window to look at. */
export function FilterBar({
  months,
  fromIdx,
  toIdx,
  onWindow,
}: {
  months: SpanMonth[];
  fromIdx: number;
  toIdx: number;
  onWindow: (from: number, to: number) => void;
}) {
  const last = months.length - 1;
  const presets: { label: string; from: number; to: number }[] = [
    { label: '3 tháng', from: Math.max(0, last - 2), to: last },
    { label: '6 tháng', from: Math.max(0, last - 5), to: last },
    { label: 'Cả năm', from: 0, to: last },
  ];
  const isActive = (p: { from: number; to: number }) => p.from === fromIdx && p.to === toIdx;

  return (
    <div className="sticky top-0 z-30 -mx-4 mb-2xl border-b border-secondary bg-white/90 px-4 py-lg backdrop-blur lg:top-[64px]">
      <div className="flex flex-col gap-md">
        <div className="flex flex-wrap items-center gap-lg">
          <span className="inline-flex items-center gap-xs text-sm font-semibold text-secondary">
            <CalendarRange className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
            Khoảng thời gian
          </span>
          <div className="inline-flex flex-wrap rounded-lg border border-secondary bg-secondary p-[2px]">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onWindow(p.from, p.to)}
                aria-pressed={isActive(p)}
                className={cn('rounded-md px-lg py-xs text-xs font-semibold transition', isActive(p) ? 'bg-primary text-brand-secondary shadow-xs' : 'text-tertiary hover:text-secondary')}
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="inline-flex items-center gap-xs text-sm text-tertiary">
            <span>Từ</span>
            <select
              value={fromIdx}
              onChange={(e) => {
                const v = Number(e.target.value);
                onWindow(v, Math.max(v, toIdx));
              }}
              aria-label="Từ tháng"
              className="rounded-md border border-primary bg-primary px-md py-xs text-sm font-medium text-primary shadow-xs outline-none focus:border-brand"
            >
              {months.map((m, i) => (
                <option key={m.key} value={i}>
                  {m.label}
                </option>
              ))}
            </select>
            <span>đến</span>
            <select
              value={toIdx}
              onChange={(e) => {
                const v = Number(e.target.value);
                onWindow(Math.min(v, fromIdx), v);
              }}
              aria-label="Đến tháng"
              className="rounded-md border border-primary bg-primary px-md py-xs text-sm font-medium text-primary shadow-xs outline-none focus:border-brand"
            >
              {months.map((m, i) => (
                <option key={m.key} value={i} disabled={i < fromIdx}>
                  {m.label}
                </option>
              ))}
            </select>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-xs text-xs">
          <span className="inline-flex items-center gap-xs rounded-pill bg-brand-50 px-md py-xxs font-medium text-brand-secondary">Đang xem</span>
          <span className="text-tertiary">
            {months[fromIdx]?.label}
            {fromIdx !== toIdx ? ` – ${months[toIdx]?.label}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
