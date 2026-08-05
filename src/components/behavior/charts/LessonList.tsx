import { STATUS } from '../../analytics/palette';
import { pct } from '../../../behavior/format';
import { cn } from '../../../lib/cn';
import type { LessonRow } from '../../../behavior/types';

interface LessonListProps {
  rows: LessonRow[];
  onPick: (conceptId: string) => void;
  activeId?: string | null;
}

/** Mastery colour follows the good / warning / danger thresholds; never colour-alone (paired with the percent). */
function masteryColor(mastery: number): string {
  if (mastery >= 0.7) return STATUS.good;
  if (mastery >= 0.45) return STATUS.warning;
  return STATUS.danger;
}

export function LessonList({ rows, onPick, activeId }: LessonListProps) {
  const ordered = [...rows].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-md">
      <p className="text-xs text-tertiary">
        Bấm một bài để xem chỗ vấp và tua lại buổi học của bài đó.
      </p>

      {ordered.length === 0 ? (
        <p className="rounded-lg bg-secondary p-md text-sm text-tertiary">
          Khóa này chưa có bài nào được học.
        </p>
      ) : (
        <ul className="flex flex-col gap-xs">
          {ordered.map((row) => {
            const isActive = row.conceptId === activeId;
            const barColor = masteryColor(row.mastery);
            const share = pct(row.mastery);

            return (
              <li key={row.conceptId}>
                <button
                  type="button"
                  onClick={() => onPick(row.conceptId)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-md rounded-lg border-l-2 px-md py-sm text-left transition',
                    isActive
                      ? 'border-brand bg-brand-50'
                      : 'border-transparent hover:bg-secondary',
                  )}
                >
                  {/* Lesson number + title */}
                  <span className="flex min-w-0 flex-1 flex-col gap-xs">
                    <span className="text-xs tabular-nums text-quaternary">
                      Bài {row.order + 1}
                    </span>
                    <span className="truncate text-sm font-semibold text-primary">
                      {row.label}
                    </span>
                  </span>

                  {/* Mastery bar + percent */}
                  <span className="flex shrink-0 items-center gap-sm">
                    <span
                      className="h-[6px] w-24 overflow-hidden rounded-pill"
                      style={{ background: '#E9EAEB' }}
                      title={`Nắm được ${share}`}
                    >
                      <span
                        className="block h-full rounded-pill"
                        style={{ width: share, background: barColor }}
                      />
                    </span>
                    <span
                      className="w-9 text-right text-sm font-medium tabular-nums"
                      style={{ color: barColor }}
                    >
                      {share}
                    </span>
                  </span>

                  {/* Struggle tag */}
                  {row.struggle >= 3 && (
                    <span className="inline-flex shrink-0 items-center rounded-pill bg-warning-50 px-md py-xxs text-xs font-medium text-warning-700">
                      hay vấp
                    </span>
                  )}

                  {/* Watched status */}
                  <span className="w-20 shrink-0 text-right text-xs font-medium tabular-nums">
                    {row.watched ? (
                      <span className="text-success-600">✓ đã xem</span>
                    ) : (
                      <span className="text-quaternary">chưa xem</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
