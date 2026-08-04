import { sequential } from '../palette';

export interface HeatDay {
  daysAgo: number;
  minutes: number;
}

const CELL = 15;
const GAP = 3.5;

function bucket(minutes: number): number {
  if (minutes <= 0) return -1;
  if (minutes < 20) return 0.25;
  if (minutes < 40) return 0.5;
  if (minutes < 60) return 0.75;
  return 1;
}

/** GitHub-style activity calendar. Columns = weeks (oldest left), rows = weekday slots. */
export function CalendarHeatmap({ days }: { days: HeatDay[] }) {
  const cols = Math.ceil(days.length / 7);
  const W = cols * (CELL + GAP);
  const H = 7 * (CELL + GAP);
  const total = days.reduce((n, d) => n + (d.minutes > 0 ? 1 : 0), 0);

  return (
    <div className="flex flex-col gap-lg">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Lịch học: ${total} ngày có hoạt động trong ${days.length} ngày gần nhất`} className="block h-auto w-full">
        {days.map((d, i) => {
          const col = Math.floor(i / 7);
          const row = i % 7;
          const b = bucket(d.minutes);
          const fill = b < 0 ? '#F2F4F7' : sequential(b);
          return (
            <rect key={i} x={col * (CELL + GAP)} y={row * (CELL + GAP)} width={CELL} height={CELL} rx={3} fill={fill}>
              <title>{d.minutes > 0 ? `${d.minutes} phút` : 'Nghỉ'}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex items-center justify-end gap-xs text-xs text-quaternary">
        <span>Ít</span>
        {[-1, 0.25, 0.5, 0.75, 1].map((b) => (
          <span key={b} className="h-3 w-3 rounded-[3px]" style={{ background: b < 0 ? '#F2F4F7' : sequential(b) }} />
        ))}
        <span>Nhiều</span>
      </div>
    </div>
  );
}
