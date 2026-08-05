import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { STATUS } from '../../analytics/palette';
import { pct } from '../../../behavior/format';
import { cn } from '../../../lib/cn';
import type { LessonRow } from '../../../behavior/types';

interface LessonListProps {
  rows: LessonRow[];
  activeId?: string | null;
  /** if given, each lesson links out to its own detailed report (built elsewhere) */
  hrefFor?: (conceptId: string) => string;
  onPick?: (conceptId: string) => void;
}

/** Mastery colour follows the good / warning / danger thresholds; always paired with the percent. */
function masteryColor(mastery: number): string {
  if (mastery >= 0.7) return STATUS.good;
  if (mastery >= 0.45) return STATUS.warning;
  return STATUS.danger;
}

export function LessonList({ rows, activeId, hrefFor, onPick }: LessonListProps) {
  const ordered = [...rows].sort((a, b) => a.order - b.order);

  const Inner = ({ row }: { row: LessonRow }) => {
    const barColor = masteryColor(row.mastery);
    const share = pct(row.mastery);
    return (
      <>
        <span className="flex min-w-0 flex-1 flex-col gap-xs">
          <span className="text-xs tabular-nums text-quaternary">Bài {row.order + 1}</span>
          <span className="truncate text-sm font-semibold text-primary">{row.label}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-sm sm:flex">
          <span className="h-[6px] w-24 overflow-hidden rounded-pill" style={{ background: '#E9EAEB' }} title={`Nắm được ${share}`}>
            <span className="block h-full rounded-pill" style={{ width: share, background: barColor }} />
          </span>
          <span className="w-9 text-right text-sm font-medium tabular-nums" style={{ color: barColor }}>
            {share}
          </span>
        </span>
        {row.struggle >= 3 && <span className="inline-flex shrink-0 items-center rounded-pill bg-warning-50 px-md py-xxs text-xs font-medium text-warning-700">hay vấp</span>}
        <span className="hidden w-20 shrink-0 text-right text-xs font-medium tabular-nums sm:block">
          {row.watched ? <span className="text-success-600">✓ đã xem</span> : <span className="text-quaternary">chưa xem</span>}
        </span>
        <span className="inline-flex shrink-0 items-center gap-xxs text-xs font-semibold text-brand-secondary">
          Xem báo cáo
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-md">
      <p className="text-xs text-tertiary">Bấm một bài để mở báo cáo chi tiết của bài đó.</p>

      {ordered.length === 0 ? (
        <p className="rounded-lg bg-secondary p-md text-sm text-tertiary">Khóa này chưa có bài nào được học.</p>
      ) : (
        <ul className="flex flex-col gap-xs">
          {ordered.map((row) => {
            const isActive = row.conceptId === activeId;
            const cls = cn(
              'flex w-full cursor-pointer items-center gap-md rounded-lg border-l-2 px-md py-sm text-left transition',
              isActive ? 'border-brand bg-brand-50' : 'border-transparent hover:bg-secondary',
            );
            return (
              <li key={row.conceptId}>
                {hrefFor ? (
                  <Link to={hrefFor(row.conceptId)} className={cls}>
                    <Inner row={row} />
                  </Link>
                ) : (
                  <button type="button" onClick={() => onPick?.(row.conceptId)} className={cls}>
                    <Inner row={row} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
