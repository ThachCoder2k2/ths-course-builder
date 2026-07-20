import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import type { Course } from '../../mock/types';
import type { FlatLesson } from '../../mock';

export default function LearnTopBar({
  course,
  percent,
  previous,
  next,
}: {
  course: Course;
  percent: number;
  previous?: FlatLesson;
  next?: FlatLesson;
}) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface px-4 py-3">
      <Link
        to={'/courses/' + course.slug}
        aria-label="Quay lại trang khoá học"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-btn text-ink-700 hover:bg-surface-muted"
      >
        <X className="h-5 w-5" />
      </Link>

      <p className="line-clamp-1 flex-1 font-bold text-ink-900">{course.title}</p>

      <div className="hidden w-40 items-center gap-2 sm:flex">
        <ProgressBar value={percent} />
        <span className="shrink-0 text-xs font-semibold text-brand-700">{percent}%</span>
      </div>

      <div className="flex shrink-0 gap-2">
        {previous ? (
          <Link to={'/learn/' + course.slug + '/' + previous.lesson.id}>
            <Button variant="ghost" size="sm" aria-label="Bài trước">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Bài trước</span>
            </Button>
          </Link>
        ) : null}
        {next ? (
          <Link to={'/learn/' + course.slug + '/' + next.lesson.id}>
            <Button size="sm" aria-label="Bài tiếp theo">
              <span className="hidden sm:inline">Bài tiếp</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
