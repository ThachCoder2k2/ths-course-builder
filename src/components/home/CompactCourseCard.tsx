import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import IconBadge from '../ui/IconBadge';
import { courseExp, courseMinutes } from '../../mock';
import type { Course } from '../../mock/types';
import { courseImage } from './courseImage';

/**
 * Figma: `Blog post card` inside `Card list` (node 179:4466).
 * bg-primary, radius-2xl, gap-xl. A 4:3 image over Content (px-xl pb-xl): a
 * heading block (gap-xs) with a Text xl/Semibold title and star/clock badges,
 * then a two-line Text sm/Regular description.
 */
export default function CompactCourseCard({ course }: { course: Course }) {
  return (
    <Link to={'/courses/' + course.slug} className="group block h-full min-w-0 flex-1">
      <article className="flex h-full flex-col gap-xl rounded-2xl bg-primary">
        <img
          src={courseImage(course.id)}
          alt=""
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />
        <div className="flex flex-col gap-3xl px-xl pb-xl">
          <div className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <h3 className="line-clamp-1 text-xl font-semibold text-primary transition-colors group-hover:text-brand-secondary">
                {course.title}
              </h3>
              <div className="flex items-center gap-md">
                <IconBadge icon={<Star className="h-3 w-3 fill-current" />}>
                  +{courseExp(course)} exp
                </IconBadge>
                <IconBadge icon={<Clock className="h-3 w-3" />}>
                  {courseMinutes(course)} phút
                </IconBadge>
              </div>
            </div>
            {/* Figma reserves a fixed two-line supporting block (40px). */}
            <p className="line-clamp-2 min-h-[40px] text-sm text-tertiary">{course.subtitle}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
