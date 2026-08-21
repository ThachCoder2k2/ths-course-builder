import { EmptyState } from '../EmptyState';
import type { TimeSlice } from '../../../behavior/types';
import { minutesLabel, pct } from '../../../behavior/format';

const SIZE = 240;
const R = 92;
const STROKE = 30;
const C = 2 * Math.PI * R;

/** "3 giờ 42 phút" — số phút trần đọc lên không hình dung được. */
function studyTime(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} giờ` : `${h} giờ ${String(rest).padStart(2, '0')} phút`;
}

/**
 * Thời gian học chia cho những việc gì. Vòng tròn để thấy nhanh tỉ lệ; con số giờ và
 * phần trăm đứng ngay cạnh tên từng việc nên không phải dò màu mới đọc được.
 */
export function TimeDonut({ slices }: { slices: TimeSlice[] }) {
  const shown = slices.filter((s) => s.share > 0);
  const total = shown.reduce((n, s) => n + s.minutes, 0);
  let offset = 0;

  if (shown.length === 0) return <EmptyState text="Chưa có buổi học nào" />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3xl lg:flex-row lg:items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-[220px] shrink-0"
        role="img"
        aria-label="Tỉ lệ thời gian học dành cho từng việc"
      >
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#E9EAEB" strokeWidth={STROKE} />
        <g className="rp-pop">
          {shown.map((s) => {
            const len = C * s.share;
            const gap = Math.min(2, len);
            const el = (
              <circle
                key={s.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${len - gap} ${C - len + gap}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              >
                <title>{`${s.label}: ${pct(s.share)} · ${minutesLabel(s.minutes)}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        </g>
        <text x={SIZE / 2} y={SIZE / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#535862">
          Tổng thời gian học
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 20} textAnchor="middle" fontSize={18} fontWeight={600} fill="#181D27">
          {studyTime(total)}
        </text>
      </svg>

      <ul className="flex w-full min-w-0 flex-col">
        {shown.map((s) => (
          <li key={s.label} className="flex items-center gap-md border-b border-secondary py-lg last:border-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden="true" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-primary">{s.label}</span>
              <span className="truncate text-xs text-quaternary">{studyTime(s.minutes)}</span>
            </span>
            <span className="shrink-0 text-sm font-medium tabular-nums text-primary">{pct(s.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
