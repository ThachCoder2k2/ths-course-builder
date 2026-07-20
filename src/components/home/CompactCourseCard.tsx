import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import IconBadge from '../ui/IconBadge';
import { courseExp, courseMinutes } from '../../mock';
import type { Course } from '../../mock/types';
import { courseImage } from './courseImage';

/**
 * Figma: `Blog post card` inside `Card list` (node 179:4466).
 * 251.5 × 324.625 — image 188.625, content 120 with 16px left inset,
 * heading 30, badges 22, supporting text 40 (two lines).
 */
export default function CompactCourseCard({ course }: { course: Course }) {
  return (
    <Link to={'/courses/' + course.slug} className="group block h-full min-w-0 flex-1">
      <article className="flex h-full flex-col gap-xl">
        <img
          src={courseImage(course.id)}
          alt=""
          className="aspect-[251.5/188.625] w-full rounded-2xl object-cover"
        />
        <div className="flex flex-col gap-xl pl-xl">
          <div className="flex flex-col gap-xs">
            <h3 className="line-clamp-1 text-xl font-semibold text-primary transition-colors group-hover:text-brand-secondary">
              {course.title}
            </h3>
            <div className="flex items-center gap-md">
              <IconBadge icon={<Star className="h-3 w-3 fill-current" />}>+{courseExp(course)} exp</IconBadge>
              <IconBadge icon={<Clock className="h-3 w-3" />}>{courseMinutes(course)} phút</IconBadge>
            </div>
          </div>
          <p className="line-clamp-2 text-sm text-tertiary">{course.subtitle}</p>
        </div>
      </article>
    </Link>
  );
}
