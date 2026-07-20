import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import IconBadge from '../ui/IconBadge';
import { courseExp, courseMinutes } from '../../mock';
import type { Course } from '../../mock/types';
import { courseImage } from './courseImage';

/**
 * Figma: `Blog post card` (node 179:2925).
 * bg-tertiary, radius-2xl, 240px image, gap-2xl; content gap-3xl with px/pb-xl.
 * Title Text xl/Semibold, badges (star/clock), supporting text Text sm/Regular.
 */
export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link to={'/courses/' + course.slug} className="group block h-full">
      <article className="flex h-full flex-col gap-2xl rounded-2xl bg-tertiary">
        <img
          src={courseImage(course.id)}
          alt=""
          className="h-[240px] w-full shrink-0 rounded-2xl object-cover"
        />

        <div className="flex flex-1 flex-col gap-3xl px-xl pb-xl">
          <div className="flex flex-col gap-md">
            <div className="flex items-center gap-xl">
              <h3 className="min-w-0 flex-1 text-xl font-semibold text-primary transition-colors group-hover:text-brand-secondary">
                {course.title}
              </h3>
              <div className="flex shrink-0 items-center gap-md">
                <IconBadge icon={<Star className="h-3 w-3 fill-current" />}>
                  +{courseExp(course)} exp
                </IconBadge>
                <IconBadge icon={<Clock className="h-3 w-3" />}>{courseMinutes(course)} phút</IconBadge>
              </div>
            </div>
            <p className="line-clamp-2 text-sm text-tertiary">{course.subtitle}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
