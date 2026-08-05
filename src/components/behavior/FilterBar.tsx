import { CalendarRange, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export type RangePreset = '30' | '90' | '180' | '365' | 'all';

export const RANGE_DAYS: Record<RangePreset, number | null> = { '30': 30, '90': 90, '180': 180, '365': 365, all: null };
const RANGE_LABEL: Record<RangePreset, string> = { '30': '30 ngày', '90': '3 tháng', '180': '6 tháng', '365': '1 năm', all: 'Tất cả' };

interface Opt {
  value: string;
  label: string;
}

/** The one control that re-scopes the whole page: time range · course · lesson. */
export function FilterBar({
  range,
  onRange,
  courseId,
  onCourse,
  conceptId,
  onConcept,
  courses,
  lessons,
  courseName,
  lessonName,
}: {
  range: RangePreset;
  onRange: (r: RangePreset) => void;
  courseId: string | null;
  onCourse: (id: string | null) => void;
  conceptId: string | null;
  onConcept: (id: string | null) => void;
  courses: Opt[];
  lessons: Opt[];
  courseName: string | null;
  lessonName: string | null;
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-2xl border-b border-secondary bg-white/90 px-4 py-lg backdrop-blur lg:top-[64px]">
      <div className="flex flex-col gap-md">
        <div className="flex flex-wrap items-center gap-lg">
          <span className="inline-flex items-center gap-xs text-sm font-semibold text-secondary">
            <CalendarRange className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
            Khoảng thời gian
          </span>
          <div className="inline-flex flex-wrap rounded-lg border border-secondary bg-secondary p-[2px]">
            {(Object.keys(RANGE_DAYS) as RangePreset[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRange(r)}
                aria-pressed={range === r}
                className={cn('rounded-md px-lg py-xs text-xs font-semibold transition', range === r ? 'bg-primary text-brand-secondary shadow-xs' : 'text-tertiary hover:text-secondary')}
              >
                {RANGE_LABEL[r]}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-xs text-sm">
            <span className="text-tertiary">Khóa</span>
            <select
              value={courseId ?? ''}
              onChange={(e) => onCourse(e.target.value || null)}
              className="max-w-[220px] rounded-md border border-primary bg-primary px-md py-xs text-sm font-medium text-primary shadow-xs outline-none focus:border-brand"
            >
              <option value="">Tất cả khóa</option>
              {courses.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          {courseId ? (
            <label className="inline-flex items-center gap-xs text-sm">
              <span className="text-tertiary">Bài</span>
              <select
                value={conceptId ?? ''}
                onChange={(e) => onConcept(e.target.value || null)}
                className="max-w-[220px] rounded-md border border-primary bg-primary px-md py-xs text-sm font-medium text-primary shadow-xs outline-none focus:border-brand"
              >
                <option value="">Tất cả bài</option>
                {lessons.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {/* breadcrumb of the current scope */}
        <div className="flex flex-wrap items-center gap-xs text-xs">
          <span className="inline-flex items-center gap-xs rounded-pill bg-brand-50 px-md py-xxs font-medium text-brand-secondary">Đang xem</span>
          <span className="text-tertiary">{RANGE_LABEL[range]}</span>
          <ChevronRight className="h-3 w-3 text-quaternary" aria-hidden="true" />
          <button type="button" onClick={() => onCourse(null)} className={cn('rounded-pill px-md py-xxs font-medium', courseId ? 'text-secondary hover:bg-secondary' : 'text-primary')}>
            {courseName ?? 'Mọi khóa'}
          </button>
          {courseId ? (
            <>
              <ChevronRight className="h-3 w-3 text-quaternary" aria-hidden="true" />
              <span className="font-medium text-primary">{lessonName ?? 'Mọi bài'}</span>
              <button type="button" onClick={() => onCourse(null)} aria-label="Bỏ lọc khóa" className="ml-xxs rounded-full p-[2px] text-quaternary hover:bg-secondary hover:text-secondary">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
