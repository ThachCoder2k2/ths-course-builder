import { scaleLinear } from '../../../lib/svg';
import { INK, GRID, STATUS, SERIES } from '../../analytics/palette';
import { shortDate } from '../../../behavior/format';
import type { HorizonBand } from '../../../behavior/types';

const LANES = [
  { key: 'stuck' as const, label: 'Sắp vấp', color: STATUS.warning },
  { key: 'forget' as const, label: 'Sắp quên', color: SERIES.violet },
  { key: 'dropout' as const, label: 'Nguy cơ bỏ', color: STATUS.danger },
];

/**
 * Behavioural-twin forecast — three thin risk lanes over the next two weeks.
 * Darker = more likely; the strip fades a touch to the right to show that the
 * further ahead we look, the less certain it is.
 */
export function TwinHorizon({ horizon }: { horizon: HorizonBand[] }) {
  if (horizon.length === 0) return null;
  const n = horizon.length;
  const LABEL_W = 78;
  const CW = 20;
  const GAP = 2;
  const ROW_H = 26;
  const gridW = n * (CW + GAP);
  const W = LABEL_W + gridW + 8;
  const H = 16 + LANES.length * (ROW_H + GAP) + 20;
  const opacity = (v: number, day: number) => Math.max(0.06, Math.min(1, v)) * (1 - (day / n) * 0.18);

  return (
    <div className="flex flex-col gap-md">
      <div className="-mx-md overflow-x-auto px-md">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dự báo 14 ngày tới" className="block h-auto w-full" style={{ minWidth: 520 }}>
          {LANES.map((lane, li) => {
            const y = 16 + li * (ROW_H + GAP);
            return (
              <g key={lane.key}>
                <text x={LABEL_W - 8} y={y + ROW_H / 2 + 4} textAnchor="end" fontSize={11} fontWeight={600} fill={INK.secondary}>
                  {lane.label}
                </text>
                {horizon.map((h, i) => (
                  <rect key={i} x={LABEL_W + i * (CW + GAP)} y={y} width={CW} height={ROW_H} rx={3} fill={lane.color} opacity={opacity(h[lane.key], h.day)}>
                    <title>{`${lane.label} · ${shortDate(h.date)} · ${Math.round(h[lane.key] * 100)}%`}</title>
                  </rect>
                ))}
              </g>
            );
          })}
          {/* day ticks */}
          {horizon.filter((_, i) => i % 3 === 0 || i === n - 1).map((h, _i) => {
            const idx = horizon.indexOf(h);
            return (
              <text key={h.day} x={LABEL_W + idx * (CW + GAP) + CW / 2} y={H - 6} textAnchor="middle" fontSize={10} fill={INK.quaternary}>
                {shortDate(h.date)}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center justify-end gap-xs text-xs text-quaternary">
        <span>Ít khả năng</span>
        {[0.15, 0.4, 0.7, 1].map((t) => (
          <span key={t} className="h-3 w-3 rounded-[3px]" style={{ background: STATUS.neutral, opacity: t }} />
        ))}
        <span>Nhiều khả năng</span>
      </div>
    </div>
  );
}
