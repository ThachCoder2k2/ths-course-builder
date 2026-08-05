import { STATUS } from '../../analytics/palette';
import type { RecurringStumble } from '../../../behavior/types';

/**
 * RecurringStumbleBars — a plain "hay vấp lặp lại" list: the concepts the learner
 * keeps tripping over, longest bar first. Each row names the concept (đậm) with its
 * course underneath, and a warm bar whose length is that concept's struggle so với
 * chỗ vấp nặng nhất. Không cần trục — đây là danh sách top, đọc từ trên xuống.
 */
export function RecurringStumbleBars({ data }: { data: RecurringStumble[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-tertiary">Không có chỗ nào vấp lặp lại đáng kể — tốt!</p>;
  }

  // Length is read relative to the worst offender (data is already sorted highest-first).
  const maxScore = Math.max(...data.map((d) => d.score), 0);

  return (
    <ul className="flex flex-col gap-sm">
      {data.map((row, i) => {
        const t = maxScore > 0 ? Math.max(0, Math.min(1, row.score / maxScore)) : 0;
        return (
          <li
            key={`${row.conceptLabel}-${i}`}
            title={`Hay vấp: ${row.conceptLabel} (${row.courseTitle})`}
            className="flex items-center gap-md"
            style={{ minHeight: 48 }}
          >
            <div className="w-48 shrink-0">
              <p className="truncate text-sm font-semibold text-primary">{row.conceptLabel}</p>
              <p className="truncate text-xs text-tertiary">{row.courseTitle}</p>
            </div>

            {/* recessive gray track; the warm fill carries the magnitude */}
            <div className="h-3 flex-1 rounded-pill bg-gray-200">
              <div
                className="h-full rounded-pill"
                style={{ width: `${(t * 100).toFixed(1)}%`, background: STATUS.warning }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
