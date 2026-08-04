import { polar } from '../../../lib/svg';
import { BRAND, GRID, INK, STATUS } from '../palette';

export interface HourBar {
  hour: number;
  value: number;
}

/** 24-hour radial histogram — reveals the learner's "golden hours". */
export function PolarClock({ data, size = 300 }: { data: HourBar[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const inner = 34;
  const outer = size / 2 - 34;
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = Math.max(...data.map((d) => d.value));
  const angleAt = (h: number) => -90 + (360 / 24) * h;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Phân bố hoạt động theo 24 giờ" className="mx-auto block h-auto w-full max-w-[320px]">
      <circle cx={cx} cy={cy} r={outer} fill="none" stroke={GRID} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={(inner + outer) / 2} fill="none" stroke={GRID} strokeWidth={1} strokeDasharray="2 4" />
      {data.map((d) => {
        if (d.value <= 0) return null;
        const len = inner + (outer - inner) * (d.value / max);
        const a = angleAt(d.hour);
        const p1 = polar(cx, cy, inner, a);
        const p2 = polar(cx, cy, len, a);
        const isPeak = d.value >= peak * 0.8;
        return (
          <line key={d.hour} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={isPeak ? STATUS.warning : BRAND.blue} strokeWidth={5} strokeLinecap="round">
            <title>{`${d.hour}h: ${d.value}`}</title>
          </line>
        );
      })}
      {[0, 6, 12, 18].map((h) => {
        const p = polar(cx, cy, outer + 14, angleAt(h));
        return (
          <text key={h} x={p.x} y={p.y + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={INK.quaternary}>
            {h}h
          </text>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={12} fill={INK.quaternary}>
        Giờ vàng
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK.primary}>
        21–23h
      </text>
    </svg>
  );
}
