import { Link } from 'react-router-dom';
import { Clock, PlayCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Rating from '../ui/Rating';
import { getInstructor } from '../../mock';
import { LEVEL_LABEL, type Course } from '../../mock/types';
import { cn } from '../../lib/cn';
import { courseGradient } from './courseGradient';

export default function CourseCard({ course }: { course: Course }) {
  const instructor = getInstructor(course.instructorId);

  return (
    <Link to={'/courses/' + course.slug} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-card border border-secondary bg-primary shadow-card transition-shadow hover:shadow-pop">
        <div className={cn('relative aspect-[16/10] bg-gradient-to-br p-4', courseGradient(course.id))}>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Khoá học</span>
          <p className="mt-2 line-clamp-3 text-sm font-bold leading-snug text-white">{course.title}</p>
          <PlayCircle className="absolute bottom-4 right-4 h-8 w-8 text-white/80" aria-hidden="true" />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="line-clamp-2 font-bold text-primary transition-colors group-hover:text-brand-secondary">
            {course.title}
          </h3>

          {instructor ? (
            <div className="flex items-center gap-2">
              <Avatar name={instructor.name} src={instructor.avatar} size="sm" />
              <span className="text-sm text-tertiary">{instructor.name}</span>
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2">
            <Badge tone="brand">{LEVEL_LABEL[course.level]}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-tertiary">
              <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {course.lessonCount} bài
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-tertiary">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {course.durationHours} giờ
            </span>
            <Rating value={course.rating} className="ml-auto" />
          </div>
        </div>
      </article>
    </Link>
  );
}
