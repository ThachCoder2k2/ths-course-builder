import { minutesLabel, pct } from '../../../behavior/format';
import { BRAND, GRID } from '../../analytics/palette';
import { cn } from '../../../lib/cn';
import type { CourseRow, CourseStatus } from '../../../behavior/types';

/** Plain-Vietnamese subject name for the muted second line. */
const TOPIC_LABEL: Record<CourseRow['topic'], string> = {
  ai: 'Trí tuệ nhân tạo',
  data: 'Phân tích dữ liệu',
  web: 'Lập trình web',
  english: 'Tiếng Anh',
  pm: 'Kỹ năng & Quản lý',
};

const STATUS_LABEL: Record<CourseStatus, string> = {
  done: 'Hoàn thành',
  active: 'Đang học',
  paused: 'Tạm dừng',
};

/** Pill colours: done reads as settled green, active as brand blue, paused as a soft amber. */
const STATUS_PILL: Record<CourseStatus, string> = {
  done: 'bg-success-50 text-success-600',
  active: 'bg-brand-50 text-brand-secondary',
  paused: 'bg-warning-50 text-warning-700',
};

const WEEK_DAYS = 30;

/** "Học gần nhất" wording from a whole-day distance. */
function lastActiveLabel(daysAgo: number): string {
  if (daysAgo <= 0) return 'hôm nay';
  if (daysAgo === 1) return 'hôm qua';
  if (daysAgo < WEEK_DAYS) return `${daysAgo} ngày trước`;
  return `${Math.round(daysAgo / 7)} tuần trước`;
}

const COLUMNS = ['Khóa học', 'Tiến độ', 'Mức nắm', 'Giờ', 'Hiểu ra', 'Trạng thái', 'Học gần nhất'] as const;

interface CourseTableProps {
  rows: CourseRow[];
  onPick: (id: string) => void;
  activeId?: string | null;
}

/**
 * CourseTable — the learner's courses as one calm HTML table, one row per khóa.
 * Each row is clickable: bấm một khóa để xem riêng khóa đó. The chosen row is
 * held in brand colour with a thin left mark so it stays obvious while the rest
 * of the dashboard reacts. Numbers use tabular figures so columns line up, and a
 * single blue progress bar carries the sense of "how far", nothing louder.
 */
export function CourseTable({ rows, onPick, activeId }: CourseTableProps) {
  if (rows.length === 0) {
    return <p className="p-md text-sm text-tertiary">Chưa có khóa nào trong khoảng thời gian này.</p>;
  }

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-xs text-tertiary">Bấm một khóa để xem riêng khóa đó.</p>

      <div className="-mx-md overflow-x-auto px-md">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-secondary">
              {COLUMNS.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-tertiary"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const isActive = row.id === activeId;
              const progressLabel = pct(row.progress);
              return (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`Xem riêng khóa ${row.title}`}
                  onClick={() => onPick(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPick(row.id);
                    }
                  }}
                  className={cn(
                    'cursor-pointer select-none border-b border-secondary outline-none transition-colors',
                    isActive ? 'bg-brand-50' : 'hover:bg-secondary focus-visible:bg-secondary',
                  )}
                >
                  {/* Khóa học: title + muted subject line, with the active left mark */}
                  <td
                    className={cn(
                      'border-l-2 px-4 py-3 align-middle',
                      isActive ? 'border-brand' : 'border-transparent',
                    )}
                  >
                    <div className="font-medium text-primary">{row.title}</div>
                    <div className="text-xs text-tertiary">{TOPIC_LABEL[row.topic]}</div>
                  </td>

                  {/* Tiến độ: one thin blue bar for magnitude + the exact percent */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-sm" title={`Tiến độ ${progressLabel}`}>
                      <span
                        className="h-1.5 w-20 shrink-0 overflow-hidden rounded-pill"
                        style={{ background: GRID }}
                      >
                        <span
                          className="block h-full rounded-pill"
                          style={{ width: progressLabel, background: BRAND.blue }}
                        />
                      </span>
                      <span className="tabular-nums text-secondary">{progressLabel}</span>
                    </div>
                  </td>

                  {/* Mức nắm */}
                  <td className="px-4 py-3 align-middle tabular-nums text-secondary">{pct(row.mastery)}</td>

                  {/* Giờ */}
                  <td className="px-4 py-3 align-middle tabular-nums text-secondary">{minutesLabel(row.minutes)}</td>

                  {/* Hiểu ra */}
                  <td className="px-4 py-3 align-middle tabular-nums text-secondary">{row.ahaCount} lần</td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                        STATUS_PILL[row.status],
                      )}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>

                  {/* Học gần nhất */}
                  <td className="px-4 py-3 align-middle tabular-nums text-tertiary">
                    {lastActiveLabel(row.lastActiveDaysAgo)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
