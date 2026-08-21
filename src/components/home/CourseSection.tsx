import { ArrowRight } from 'lucide-react';
import CourseCard from './CourseCard';
import { Reveal } from '../ui/Reveal';
import type { Course } from '../../mock/types';

/**
 * Một hàng thẻ khoá học có tiêu đề. Thiết kế xếp bốn thẻ một hàng ở cỡ máy tính; khung
 * hẹp hơn thì xuống hai thẻ rồi một thẻ, chứ không cuộn ngang.
 *
 * Mỗi thẻ nằm trong một `Reveal` riêng với `order` tăng dần, nên khi cuộn tới thì các thẻ
 * lần lượt hiện ra thay vì bật cùng lúc.
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
      <Reveal>
        <h2 className="w-full text-display-xs text-primary">{title}</h2>
      </Reveal>

      <div className="relative flex w-full flex-col items-center gap-5xl">
        <div className="grid w-full grid-cols-1 gap-3xl sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((course, i) => (
            <Reveal key={course.id} order={i} className="flex">
              <CourseCard course={course} slot={i} />
            </Reveal>
          ))}
        </div>

        {showNext ? (
          <button
            type="button"
            onClick={onNext}
            aria-label="Xem thêm khoá học"
            className="absolute right-0 top-[128px] hidden translate-x-1/2 items-center justify-center rounded-full bg-button-secondary p-xl shadow-xs-ring-primary transition-transform duration-200 hover:scale-105 xl:flex"
          >
            <ArrowRight className="h-6 w-6 text-black" aria-hidden="true" />
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
