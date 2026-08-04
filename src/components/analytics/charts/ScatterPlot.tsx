import { scaleLinear } from '../../../lib/svg';
import { AXIS, BRAND, GRID, INK, STATUS } from '../palette';

export interface ScatterPoint {
  label: string;
  x: number;
  y: number;
  tone?: 'good' | 'warning' | 'danger' | 'neutral';
}

const TONE: Record<string, string> = {
  good: STATUS.good,
  warning: STATUS.warning,
  danger: STATUS.danger,
  neutral: BRAND.blue,
};

/** Scatter with optional quadrant guides and a 45° reference line (calibration). */
export interface ToneLegendItem {
  label: string;
  tone: 'good' | 'warning' | 'danger' | 'neutral';
}

export function ScatterPlot({
  points,
  xMax = 100,
  yMax = 100,
  xLabel,
  yLabel,
  quadrant = false,
  refLine = false,
  height = 260,
  legend,
  ariaLabel,
}: {
  points: ScatterPoint[];
  xMax?: number;
  yMax?: number;
  xLabel?: string;
  yLabel?: string;
  quadrant?: boolean;
  refLine?: boolean;
  height?: number;
  legend?: ToneLegendItem[];
  ariaLabel: string;
}) {
  const W = 540;
  const H = height;
  const P = { l: 40, r: 18, t: 16, b: 34 };
  const x = scaleLinear(0, xMax, P.l, W - P.r);
  const y = scaleLinear(0, yMax, H - P.b, P.t);

  return (
    <div className="flex flex-col gap-md">
      {legend && legend.length ? (
        <ul className="flex flex-wrap items-center gap-x-xl gap-y-xs">
          {legend.map((it) => (
            <li key={it.label} className="flex items-center gap-xs text-xs font-medium text-tertiary">
              <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TONE[it.tone] }} />
              {it.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="-mx-md overflow-x-auto px-md">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block h-auto w-full min-w-[440px] overflow-visible">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={P.l} y1={y(yMax * f)} x2={W - P.r} y2={y(yMax * f)} stroke={GRID} strokeWidth={1} />
      ))}
      {quadrant ? (
        <>
          <line x1={x(xMax / 2)} y1={P.t} x2={x(xMax / 2)} y2={H - P.b} stroke={AXIS} strokeWidth={1} strokeDasharray="3 4" />
          <line x1={P.l} y1={y(yMax / 2)} x2={W - P.r} y2={y(yMax / 2)} stroke={AXIS} strokeWidth={1} strokeDasharray="3 4" />
        </>
      ) : null}
      {refLine ? <line x1={x(0)} y1={y(0)} x2={x(xMax)} y2={y(yMax)} stroke={STATUS.neutral} strokeWidth={1.5} strokeDasharray="5 5" /> : null}
      {points.map((p, i) => (
        <circle key={p.label + i} className="dv-pop" cx={x(p.x)} cy={y(p.y)} r={6} fill={TONE[p.tone ?? 'neutral']} fillOpacity={0.85} stroke="#fff" strokeWidth={1.5}>
          <title>{`${p.label} — (${p.x}, ${p.y})`}</title>
        </circle>
      ))}
      <line x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} stroke={AXIS} strokeWidth={1} />
      <line x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} stroke={AXIS} strokeWidth={1} />
      {xLabel ? (
        <text x={(P.l + W - P.r) / 2} y={H - 6} textAnchor="middle" fontSize={11} fontWeight={500} fill={INK.quaternary}>
          {xLabel}
        </text>
      ) : null}
      {yLabel ? (
        <text x={14} y={(P.t + H - P.b) / 2} textAnchor="middle" fontSize={11} fontWeight={500} fill={INK.quaternary} transform={`rotate(-90 14 ${(P.t + H - P.b) / 2})`}>
          {yLabel}
        </text>
      ) : null}
      </svg>
      </div>
    </div>
  );
}
