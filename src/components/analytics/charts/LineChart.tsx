import { areaPath, niceMax, scaleLinear, smoothPath, ticks, type Pt } from '../../../lib/svg';
import { AXIS, GRID, INK, STATUS } from '../palette';

export interface LineSeries {
  name: string;
  color: string;
  points: (number | null)[];
  dashed?: boolean;
  area?: boolean;
}

/**
 * Multi-series line chart. Null points break the line (used for future weeks).
 * One y-axis only — never a dual axis (dataviz non-negotiable).
 */
const fmtTick = (t: number): string => (Number.isInteger(t) ? String(t) : String(Math.round(t * 10) / 10));

export function LineChart({
  series,
  labels,
  height = 240,
  yMax,
  yTicks = 4,
  unit = '',
  goal,
  ariaLabel,
}: {
  series: LineSeries[];
  labels: string[];
  height?: number;
  yMax?: number;
  yTicks?: number;
  unit?: string;
  goal?: { value: number; label: string };
  ariaLabel: string;
}) {
  const W = 540;
  const H = height;
  const P = { l: 38, r: 16, t: 16, b: 30 };
  const values = series.flatMap((s) => s.points.filter((v): v is number => v != null));
  const max = yMax ?? niceMax(Math.max(1, ...values, goal?.value ?? 0));
  const x = scaleLinear(0, Math.max(1, labels.length - 1), P.l, W - P.r);
  const y = scaleLinear(0, max, H - P.b, P.t);
  const yt = ticks(max, yTicks);

  const segments = (points: (number | null)[]): Pt[][] => {
    const segs: Pt[][] = [];
    let cur: Pt[] = [];
    points.forEach((v, i) => {
      if (v == null) {
        if (cur.length) segs.push(cur);
        cur = [];
      } else {
        cur.push({ x: x(i), y: y(v) });
      }
    });
    if (cur.length) segs.push(cur);
    return segs;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block h-auto w-full">
      {/* gridlines + y labels */}
      {yt.map((t) => (
        <g key={t}>
          <line x1={P.l} y1={y(t)} x2={W - P.r} y2={y(t)} stroke={GRID} strokeWidth={1} />
          <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={INK.quaternary} className="tabular-nums">
            {fmtTick(t)}
          </text>
        </g>
      ))}
      {/* x labels */}
      {labels.map((lb, i) => (
        <text key={lb + i} x={x(i)} y={H - 10} textAnchor="middle" fontSize={11} fill={INK.quaternary}>
          {lb}
        </text>
      ))}
      {/* goal line */}
      {goal ? (
        <g>
          <line x1={P.l} y1={y(goal.value)} x2={W - P.r} y2={y(goal.value)} stroke={STATUS.warning} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={W - P.r} y={y(goal.value) - 6} textAnchor="end" fontSize={10} fontWeight={600} fill="#B54708">
            {goal.label}
          </text>
        </g>
      ) : null}
      {/* areas */}
      {series.map((s) =>
        s.area
          ? segments(s.points).map((seg, si) => (
              <path key={s.name + 'a' + si} d={areaPath(seg, H - P.b, true)} fill={s.color} opacity={0.09} />
            ))
          : null,
      )}
      {/* lines */}
      {series.map((s) =>
        segments(s.points).map((seg, si) => (
          <path
            key={s.name + si}
            className={s.dashed ? undefined : 'dv-draw'}
            pathLength={s.dashed ? undefined : 1}
            d={smoothPath(seg)}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={s.dashed ? '5 5' : undefined}
          />
        )),
      )}
      {/* markers + native tooltip */}
      {series.map((s) =>
        s.points.map((v, i) =>
          v == null ? null : (
            <circle key={s.name + 'p' + i} cx={x(i)} cy={y(v)} r={3.5} fill="#fff" stroke={s.color} strokeWidth={2}>
              <title>{`${s.name} · ${labels[i]}: ${v}${unit}`}</title>
            </circle>
          ),
        ),
      )}
      <line x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} stroke={AXIS} strokeWidth={1} />
    </svg>
  );
}
