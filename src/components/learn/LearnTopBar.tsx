import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import type { Course } from '../../mock/types';

/**
 * Figma: `Dropdown header navigation` (node 204:4566) — 80px.
 * bg-primary, border-b border-primary, px-8xl. Left: a round arrow-left back
 * button and the course title (Display xs). Right: a "Tiến độ hoàn thành"
 * label (Text sm/Semibold) beside a 320px progress bar with a trailing "X%"
 * (Text sm/Medium). Lesson navigation lives in the info area, not here.
 */
export default function LearnTopBar({ course, percent }: { course: Course; percent: number }) {
  return (
    <header className="flex h-20 shrink-0 items-center border-b border-primary bg-primary px-8">
      <div className="flex min-w-px flex-1 items-center justify-between gap-8">
        <div className="flex min-w-px items-center gap-md">
          <Link
            to={'/courses/' + course.slug}
            aria-label="Quay lại trang khoá học"
            className="flex shrink-0 items-center justify-center rounded-md p-md text-secondary hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <p className="truncate text-display-xs text-primary">{course.title}</p>
        </div>

        <div className="hidden shrink-0 items-center gap-md sm:flex">
          <p className="whitespace-nowrap text-sm font-semibold text-tertiary">Tiến độ hoàn thành</p>
          <div className="flex w-[320px] items-center gap-lg">
            <ProgressBar value={percent} />
            <span className="shrink-0 text-sm font-medium text-secondary">{percent}%</span>
          </div>
        </div>
      </div>
    </header>
  );
}
