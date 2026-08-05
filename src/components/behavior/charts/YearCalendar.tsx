import { sequential, INK } from '../../analytics/palette';
import { NOW, DAY_S } from '../../../behavior/catalog';
import type { HeatDay } from '../../../behavior/types';

const CELL = 13;
const GAP = 3;
const LABEL_W = 26; // weekday labels on the left
const TOP_H = 16; // month labels on top
const EMPTY = '#F2F4F7';
const MONTHS_VI = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']; // row 0 = Monday

function bucket(min: number): number {
  if (min <= 0) return -1;
  if (min < 20) return 0.28;
  if (min < 45) return 0.5;
  if (min < 75) return 0.72;
  return 1;
}
const fillOf = (min: number) => (bucket(min) < 0 ? EMPTY : sequential(bucket(min)));

/**
 * GitHub-style year calendar with real month + weekday labels, so each square
 * reads as an actual day (columns = weeks, rows = thứ trong tuần).
 */
export function YearCalendar({ days }: { days: HeatDay[] }) {
  if (days.length === 0) return <p className="text-sm text-tertiary">Chưa có ngày học nào trong khoảng này.</p>;

  const base = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  const dateOf = (daysAgo: number) => new Date(base.getTime() - daysAgo * DAY_S * 1000);

  // anchor the grid on the Monday of the first day's week
  const first = dateOf(days[0].daysAgo);
  const firstRow = (first.getDay() + 6) % 7; // Mon=0 … Sun=6
  const firstMonday = new Date(first.getTime() - firstRow * DAY_S * 1000);

  const cells = days.map((d) => {
    const date = dateOf(d.daysAgo);
    const diff = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - firstMonday.getTime()) / (DAY_S * 1000));
    return { date, minutes: d.minutes, col: Math.floor(diff / 7), row: ((diff % 7) + 7) % 7 };
  });
  const nCols = Math.max(1, ...cells.map((c) => c.col)) + 1;

  // month labels: mark the column where a new month first appears
  const monthMarks: { col: number; label: string }[] = [];
  let prevMonth = -1;
  for (let c = 0; c < nCols; c++) {
    const monday = new Date(firstMonday.getTime() + c * 7 * DAY_S * 1000);
    if (monday.getMonth() !== prevMonth) {
      monthMarks.push({ col: c, label: MONTHS_VI[monday.getMonth()] });
      prevMonth = monday.getMonth();
    }
  }

  const W = LABEL_W + nCols * (CELL + GAP);
  const H = TOP_H + 7 * (CELL + GAP);

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Lịch nhịp học theo ngày" className="block h-auto w-full" style={{ minWidth: Math.min(760, W) }}>
          {/* month labels */}
          {monthMarks.map((m) => (
            <text key={`${m.col}-${m.label}`} x={LABEL_W + m.col * (CELL + GAP)} y={11} fontSize={10} fill={INK.quaternary}>
              {m.label}
            </text>
          ))}
          {/* weekday labels (every other row to avoid clutter) */}
          {WEEKDAYS.map((w, r) => (r % 2 === 0 ? (
            <text key={w} x={LABEL_W - 6} y={TOP_H + r * (CELL + GAP) + CELL - 2} textAnchor="end" fontSize={9} fill={INK.quaternary}>
              {w}
            </text>
          ) : null))}
          {/* day cells */}
          {cells.map((c, i) => (
            <rect key={i} x={LABEL_W + c.col * (CELL + GAP)} y={TOP_H + c.row * (CELL + GAP)} width={CELL} height={CELL} rx={3} fill={fillOf(c.minutes)}>
              <title>{`${WEEKDAYS[c.row]} ${c.date.getDate()}/${c.date.getMonth() + 1}: ${c.minutes > 0 ? `${c.minutes} phút` : 'nghỉ'}`}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div className="flex items-center justify-end gap-xs text-xs text-quaternary">
        <span>Ít</span>
        {[-1, 0.28, 0.5, 0.72, 1].map((t) => (
          <span key={t} className="h-3 w-3 rounded-[3px]" style={{ background: t < 0 ? EMPTY : sequential(t) }} />
        ))}
        <span>Nhiều</span>
      </div>
    </div>
  );
}
