import { Link } from 'react-router-dom';
import CourseCard from './CourseCard';
import type { Course } from '../../mock/types';

export default function CardGrid({
  title,
  courses,
  viewAllTo,
}: {
  title?: string;
  courses: Course[];
  viewAllTo?: string;
}) {
  return (
    <section>
      {title ? (
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-display-xs text-primary">{title}</h2>
          {viewAllTo ? (
            <Link to={viewAllTo} className="shrink-0 text-sm font-semibold text-brand-secondary hover:underline">
              Xem tất cả
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
