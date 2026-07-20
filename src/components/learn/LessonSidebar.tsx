import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { flattenLessons, sectionDurationMin } from '../../mock';
import type { Course } from '../../mock/types';
import type { useProgress } from '../../lib/useProgress';
import { cn } from '../../lib/cn';

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

      <nav aria-label="Danh sách bài học">
        {course.sections.map((section) => (
          <div key={section.id} className="border-b border-secondary">
            <div className="px-4 py-3">
              <p className="text-sm font-bold text-primary">{section.title}</p>
              <p className="text-xs text-tertiary">
                {section.lessons.length} bài • {sectionDurationMin(section)} phút
              </p>
            </div>

            <ul>
              {section.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                const done = progress.isCompleted(lesson.id);

                return (
                  <li key={lesson.id}>
                    <Link
                      to={'/learn/' + course.slug + '/' + lesson.id}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary',
                        isActive && 'bg-brand-50 text-brand-secondary',
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-label="Đã hoàn thành" />
                      ) : isActive ? (
                        <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-quaternary" aria-hidden="true" />
                      )}
                      <span className="flex-1">{lesson.title}</span>
                      <span className="shrink-0 text-xs text-tertiary">{lesson.durationMin}p</span>
                    </Link>
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
