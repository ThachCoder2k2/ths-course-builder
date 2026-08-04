import { niceMax, scaleLinear, ticks } from '../../../lib/svg';
import { AXIS, GRID, INK, STATUS } from '../palette';

export interface BarDatum {
  label: string;
  values: number[]; // one per series (grouped)
}

/** Vertical (grouped) bars with subtle grid, optional goal line and direct value labels. */
const fmtTick = (t: number): string => (Number.isInteger(t) ? String(t) : String(Math.round(t * 10) / 10));

export function BarChart({
  data,
  colors,
  seriesNames,
  height = 240,
  max,
  yTicks = 4,
  unit = '',
  goal,
  showValues = true,
  ariaLabel,
}: {
  data: BarDatum[];
  colors: string[];
  seriesNames?: string[];
  height?: number;
  max?: number;
  yTicks?: number;
  unit?: string;
  goal?: { value: number; label: string };
  showValues?: boolean;
  ariaLabel: string;
}) {
  const W = 540;
  const H = height;
  const P = { l: 38, r: 16, t: 18, b: 30 };
  const groups = data.length;
  const seriesCount = data[0]?.values.length ?? 1;
  const flat = data.flatMap((d) => d.values);
  const top = max ?? niceMax(Math.max(1, ...flat, goal?.value ?? 0));
  const y = scaleLinear(0, top, H - P.b, P.t);
  const yt = ticks(top, yTicks);
  const band = (W - P.l - P.r) / groups;
  const gap = band * 0.24;
  const inner = band - gap;
  const barW = inner / seriesCount;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block h-auto w-full">
      {yt.map((t) => (
        <g key={t}>
          <line x1={P.l} y1={y(t)} x2={W - P.r} y2={y(t)} stroke={GRID} strokeWidth={1} />
          <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={INK.quaternary} className="tabular-nums">
            {fmtTick(t)}
          </text>
        </g>
      ))}
      {goal ? (
        <g>
          <line x1={P.l} y1={y(goal.value)} x2={W - P.r} y2={y(goal.value)} stroke={STATUS.warning} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={W - P.r} y={y(goal.value) - 6} textAnchor="end" fontSize={10} fontWeight={600} fill="#B54708">
            {goal.label}
          </text>
        </g>
      ) : null}
      {data.map((d, gi) => {
        const gx = P.l + gap / 2 + gi * band;
        return (
          <g key={d.label + gi}>
            {d.values.map((v, si) => {
              const bx = gx + si * barW + 2;
              const bw = barW - 4;
              const by = y(v);
              const h = H - P.b - by;
              return (
                <g key={si}>
                  <rect className="dv-grow" x={bx} y={by} width={Math.max(0, bw)} height={Math.max(0, h)} rx={4} fill={colors[si % colors.length]}>
                    <title>{`${seriesNames?.[si] ? seriesNames[si] + ' · ' : ''}${d.label}: ${v}${unit}`}</title>
                  </rect>
                  {showValues && seriesCount <= 2 ? (
                    <text x={bx + bw / 2} y={by - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill={INK.secondary} className="tabular-nums">
                      {v}
                    </text>
                  ) : null}
                </g>
              );
            })}
            <text x={gx + inner / 2} y={H - 10} textAnchor="middle" fontSize={11} fill={INK.quaternary}>
              {d.label}
            </text>
          </g>
        );
      })}
      <line x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} stroke={AXIS} strokeWidth={1} />
    </svg>
  );
}
