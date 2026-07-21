import { ArrowDown } from 'lucide-react';
import CourseCard from '../home/CourseCard';
import { getRelatedCourses } from '../../mock';

/**
 * Figma: `Section` (node 184:10744) — "Khoá học liên quan".
 * Display xs heading over a three-column Blog post card row (gap-4xl) and a
 * centred tertiary "Xem thêm khoá học" button (arrow-down) below.
 */
export default function RelatedCourses({ courseId }: { courseId: string }) {
  const related = getRelatedCourses(courseId, 3);
  if (related.length === 0) return null;

  return (
    <section className="flex w-full flex-col gap-2xl">
      <h2 className="w-full text-display-xs text-primary">Khoá học liên quan</h2>

      <div className="flex w-full items-start gap-4xl">
        {related.map((course) => (
          <div key={course.id} className="flex min-w-px flex-1 flex-col">
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      <div className="flex w-full justify-start">
        <button
          type="button"
          className="flex items-center justify-center gap-sm rounded-full px-xl py-[10px] text-md font-semibold text-brand-900"
        >
          Xem thêm khoá học
          <ArrowDown className="h-5 w-5 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
