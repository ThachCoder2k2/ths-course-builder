import { ArrowRight } from 'lucide-react';
import CourseCard from './CourseCard';
import type { Course } from '../../mock/types';

/**
 * Figma: `Section` (node 179:4442).
 * Section gap-xl; Page header gap-2xl with a Display xs/Semibold title;
 * Content gap-5xl holding a Cards row (gap-4xl, flex-1 columns) and an
 * absolutely-positioned circular next button aligned to the image centre.
 */
export default function CourseSection({
  title,
  courses,
  onNext,
  showNext = false,
}: {
  title: string;
  courses: Course[];
  onNext?: () => void;
  showNext?: boolean;
}) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-col gap-2xl">
        <div className="flex w-full flex-wrap items-start gap-xl">
          <div className="flex min-w-[320px] flex-1 flex-col gap-xs">
            <h2 className="w-full text-display-xs text-primary">{title}</h2>
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center gap-5xl">
        <div className="flex w-full items-start gap-4xl">
          {courses.map((course) => (
            <div key={course.id} className="flex min-w-px flex-1 flex-col gap-4xl">
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {showNext ? (
          <button
            type="button"
            onClick={onNext}
            aria-label="Xem thêm"
            className="absolute right-0 top-[152px] hidden translate-x-1/2 items-center justify-center rounded-full bg-button-secondary p-xl shadow-xs-ring-primary xl:flex"
          >
            <ArrowRight className="h-6 w-6 text-button-secondary-fg" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
            />
          </button>
        ) : null}
      </div>
    </section>
  );
}
