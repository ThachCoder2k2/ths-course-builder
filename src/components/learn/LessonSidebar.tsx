import { Link } from 'react-router-dom';
import { Check, CirclePlay, List } from 'lucide-react';
import { flattenLessons } from '../../mock';
import type { Course } from '../../mock/types';
import type { useProgress } from '../../lib/useProgress';
import { cn } from '../../lib/cn';

/**
 * Figma: `Sub nav` (node 204:4881) — the lesson rail.
 * An "Ẩn mục lục" button (204:4882, 128×36) tops a flat lesson list (no
 * section headers in Figma). Each row (204:4884): a 20px content icon, a
 * Text sm/Semibold title over a Text sm/Medium HH:MM:SS duration in the
 * disabled colour, and a completion checkbox filling brand with a white
 * check. The active row is tinted bg-secondary with brand text.
 */
function hms(min: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}:00`;
}

export default function LessonSidebar({
  course,
  activeLessonId,
  progress,
  className,
  onNavigate,
}: {
  course: Course;
  activeLessonId: string;
  progress: ReturnType<typeof useProgress>;
  className?: string;
  onNavigate?: () => void;
}) {
  const lessons = flattenLessons(course);

  return (
    <aside className={cn('bg-primary', className)}>
      <div className="p-xl pb-0">
        <button
          type="button"
          className="flex h-9 items-center gap-sm rounded-md border border-primary bg-primary px-lg text-sm font-semibold text-secondary shadow-xs"
        >
          <List className="h-4 w-4 shrink-0" aria-hidden="true" />
          Ẩn mục lục
        </button>
      </div>

      <nav aria-label="Danh sách bài học" className="p-xl">
        <ul className="flex flex-col gap-md">
          {lessons.map(({ lesson }) => {
            const isActive = lesson.id === activeLessonId;
            const done = progress.isCompleted(lesson.id);

            return (
              <li
                key={lesson.id}
                className={cn(
                  'flex items-start gap-lg rounded-sm px-lg py-md hover:bg-secondary',
                  isActive && 'bg-secondary',
                )}
              >
                <Link
                  to={'/learn/' + course.slug + '/' + lesson.id}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex min-w-px flex-1 items-start gap-md"
                >
                  <span className="flex shrink-0 items-center pt-xs">
                    <CirclePlay
                      className={cn('h-5 w-5', isActive ? 'text-brand-tertiary' : 'text-quaternary')}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="flex min-w-px flex-1 flex-col justify-center">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isActive ? 'text-brand-secondary' : 'text-tertiary',
                      )}
                    >
                      {lesson.title}
                    </span>
                    <span className="text-sm font-medium text-fg-quinary">{hms(lesson.durationMin)}</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => progress.toggleComplete(lesson.id)}
                  aria-label={done ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu đã hoàn thành'}
                  aria-pressed={done}
                  className="flex shrink-0 items-center pt-xs"
                >
                  <span
                    className={cn(
                      'flex h-[14px] w-[14px] items-center justify-center rounded-full',
                      done ? 'bg-brand-500 text-white' : 'border border-primary',
                    )}
                  >
                    {done ? <Check className="h-2.5 w-2.5" aria-hidden="true" /> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
