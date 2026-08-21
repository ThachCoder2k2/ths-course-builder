import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import IconBadge from '../ui/IconBadge';
import { courseExp, courseMinutes } from '../../mock';
import type { Course } from '../../mock/types';
import { courseImage } from './courseImage';

/**
 * Thẻ khoá học của trang chủ, theo thiết kế Figma node 550:11174: tranh minh hoạ bo góc
 * ở trên, tên khoá một dòng, hai nhãn kinh nghiệm và thời lượng ở dòng dưới, rồi mô tả.
 *
 * Nhãn xuống dòng riêng thay vì nằm cạnh tên: một hàng bốn thẻ thì mỗi thẻ chỉ còn ~320px,
 * để tên và hai nhãn chung một dòng là tên bị bóp còn vài chữ.
 *
 * Ảnh dùng `ln-card-img` để nở nhẹ khi thẻ hiện ra, chữ theo sau — xem globals.css.
 */
export default function CourseCard({ course, slot }: { course: Course; slot?: number }) {
  return (
    <Link to={'/courses/' + course.slug} className="group block h-full">
      <article className="ln-card ln-card-tilt flex h-full flex-col gap-xl rounded-2xl bg-tertiary">
        <img
          src={courseImage(course.id, slot)}
          alt=""
          loading="lazy"
          className="ln-card-img aspect-[4/3] w-full shrink-0 rounded-2xl object-cover"
        />

        <div className="ln-card-body flex flex-1 flex-col gap-md px-xl pb-xl">
          <h3 className="line-clamp-1 text-lg font-semibold text-primary transition-colors group-hover:text-brand-secondary">
            {course.title}
          </h3>
          <div className="flex flex-wrap items-center gap-md">
            <IconBadge icon={<Star className="h-3 w-3 text-utility-orange-500" />}>
              +{courseExp(course)} exp
            </IconBadge>
            <IconBadge icon={<Clock className="h-3 w-3" />}>{courseMinutes(course)} phút</IconBadge>
          </div>
          <p className="line-clamp-2 text-sm text-tertiary">{course.subtitle}</p>
        </div>
      </article>
    </Link>
  );
}
