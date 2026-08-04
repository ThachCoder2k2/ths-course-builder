import { arcPath } from '../../../lib/svg';

export interface DonutSlice {
  label: string;
  value: number;
}

/** Donut with a 2px gap between segments and direct-labelled legend (≤5 categories). */
export function Donut({
  data,
  colors,
  size = 180,
  thickness = 22,
  centerLabel,
  centerSub,
  unit = '%',
}: {
  data: DonutSlice[];
  colors: string[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
  unit?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - thickness / 2 - 2;
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  let acc = -90;
  const GAP = 3; // degrees

  return (
    <div className="flex flex-col items-center gap-lg sm:flex-row sm:items-center sm:gap-3xl">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={data.map((d) => `${d.label} ${Math.round((d.value / total) * 100)}%`).join(', ')}>
          {data.map((d, i) => {
            const frac = d.value / total;
            const start = acc + GAP / 2;
            const end = acc + frac * 360 - GAP / 2;
            acc += frac * 360;
            return (
              <path key={d.label} d={arcPath(cx, cy, r, start, Math.max(start + 0.1, end))} fill="none" stroke={colors[i % colors.length]} strokeWidth={thickness} strokeLinecap="butt">
                <title>{`${d.label}: ${Math.round(frac * 100)}%`}</title>
              </path>
            );
          })}
        </svg>
        {centerLabel ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-display-xs font-semibold tabular-nums text-primary">{centerLabel}</span>
            {centerSub ? <span className="text-xs text-tertiary">{centerSub}</span> : null}
          </div>
        ) : null}
      </div>
      <ul className="flex min-w-0 flex-col gap-md">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-md text-sm">
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="min-w-0 flex-1 truncate text-secondary">{d.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-primary">
              {Math.round((d.value / total) * 100)}
              {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
