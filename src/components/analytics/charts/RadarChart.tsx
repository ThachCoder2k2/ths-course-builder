import { polar, polygonPoints, range } from '../../../lib/svg';
import { GRID, INK } from '../palette';

export interface RadarSeries {
  name: string;
  color: string;
  values: number[]; // one per axis, 0..max
  fill?: boolean;
  dashed?: boolean;
}

/**
 * Overlay radar for skill / topic profiles. Axes share one 0..max scale.
 * The viewBox reserves horizontal/vertical padding so axis labels never clip.
 */
export function RadarChart({
  axes,
  series,
  max = 100,
  ariaLabel,
}: {
  axes: string[];
  series: RadarSeries[];
  max?: number;
  ariaLabel: string;
}) {
  const W = 440;
  const H = 344;
  const cx = W / 2;
  const cy = 168;
  const r = 116;
  const n = axes.length;
  const angleAt = (i: number) => -90 + (360 / n) * i;
  const point = (i: number, v: number) => polar(cx, cy, (v / max) * r, angleAt(i));
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block h-auto w-full overflow-visible">
      {rings.map((rr) => (
        <polygon key={rr} points={polygonPoints(range(n).map((i) => polar(cx, cy, r * rr, angleAt(i))))} fill="none" stroke={GRID} strokeWidth={1} />
      ))}
      {range(n).map((i) => {
        const outer = polar(cx, cy, r, angleAt(i));
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={GRID} strokeWidth={1} />;
      })}
      {series.map((s) => (
        <polygon
          key={s.name}
          points={polygonPoints(s.values.map((v, i) => point(i, v)))}
          fill={s.color}
          fillOpacity={s.fill === false ? 0 : 0.14}
          stroke={s.color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeDasharray={s.dashed ? '5 5' : undefined}
        />
      ))}
      {series.map((s) =>
        s.values.map((v, i) => {
          const p = point(i, v);
          return (
            <circle key={s.name + i} cx={p.x} cy={p.y} r={3} fill={s.color}>
              <title>{`${s.name} · ${axes[i]}: ${v}`}</title>
            </circle>
          );
        }),
      )}
      {axes.map((a, i) => {
        const p = polar(cx, cy, r + 20, angleAt(i));
        const anchor = Math.abs(p.x - cx) < 8 ? 'middle' : p.x > cx ? 'start' : 'end';
        const label = a.length > 16 ? a.slice(0, 15) + '…' : a;
        return (
          <text key={a} x={p.x} y={p.y + 4} textAnchor={anchor} fontSize={11} fontWeight={500} fill={INK.tertiary}>
            {label}
          </text>
        );
      })}
    </svg>
  );
}
