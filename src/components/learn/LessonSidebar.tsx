import { Link } from 'react-router-dom';
import { Check, CirclePlay } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { flattenLessons, sectionDurationMin } from '../../mock';
import type { Course } from '../../mock/types';
import type { useProgress } from '../../lib/useProgress';
import { cn } from '../../lib/cn';

/**
 * Figma: `Sub nav` list (node 204:4881) — the lesson rail.
 * Each lesson (node 204:4884) is a rounded-sm row (px-lg py-md, gap-lg): a
 * 20px content icon, a Text sm/Semibold title over a Text sm/Medium HH:MM:SS
 * duration (disabled colour), and a completion checkbox that fills brand-solid
 * with a white check when done. The mock has only video lessons, so every row
 * uses the play-circle icon.
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
  const total = flattenLessons(course).length;
  const percent = progress.percent(total);

  return (
    <aside className={cn('bg-primary', className)}>
      <div className="border-b border-secondary p-4">
        <p className="line-clamp-2 font-bold text-primary">{course.title}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-tertiary">
          <span>
            {progress.completedLessonIds.length}/{total} bài học
          </span>
          <span className="font-semibold text-brand-secondary">{percent}%</span>
        </div>
        <ProgressBar value={percent} className="mt-2" />
      </div>

      <nav aria-label="Danh sách bài học" className="p-2">
        {course.sections.map((section) => (
          <div key={section.id} className="mb-2">
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-primary">{section.title}</p>
              <p className="text-xs text-tertiary">
                {section.lessons.length} bài • {sectionDurationMin(section)} phút
              </p>
            </div>

            <ul className="flex flex-col gap-xs">
              {section.lessons.map((lesson) => {
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
          </div>
        ))}
      </nav>
    </aside>
  );
}
