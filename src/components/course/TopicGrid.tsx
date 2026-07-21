import { ChevronDown } from 'lucide-react';
import CourseCard from '../home/CourseCard';
import type { Course } from '../../mock/types';

/**
 * Figma: `Section` (node 182:7673) — the topic course grid.
 * A right-aligned filter row of two dropdowns (node 182:8049 — "Tất cả mục
 * đích" / "Tất cả cấp độ", white, border-primary, radius-md, shadow-xs) above a
 * grid of Blog post cards. Figma art-directs a masonry with a few feature-sized
 * cards; bound to uniform course data this renders as an even 3-column grid.
 */
const FILTERS = ['Tất cả mục đích', 'Tất cả cấp độ'];

export default function TopicGrid({ courses }: { courses: Course[] }) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full items-center justify-end gap-lg">
        {FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-md rounded-md border border-primary bg-primary px-[14px] py-[10px] text-md font-medium text-primary shadow-xs"
          >
            {label}
            <ChevronDown className="h-5 w-5 shrink-0 text-quaternary" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4xl md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
