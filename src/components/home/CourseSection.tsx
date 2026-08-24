import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CourseCard from './CourseCard';
import CardRail from '../ui/CardRail';
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
  den = '/tim-kiem',
  showNext = false,
}: {
  title: string;
  courses: Course[];
  /** Đích của mũi tên "Xem thêm khoá học". */
  den?: string;
  showNext?: boolean;
}) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <Reveal>
        <h2 className="w-full text-display-xs text-primary">{title}</h2>
      </Reveal>

      <div className="relative flex w-full flex-col items-center gap-5xl">
        <CardRail nhan={title}>
          {courses.map((course, i) => (
            <Reveal key={course.id} order={i} className="flex">
              <CourseCard course={course} />
            </Reveal>
          ))}
        </CardRail>

        {/*
          Mũi tên này là LINK, không phải nút.

          Trước đây nó là `<button onClick={onNext}>` mà không một chỗ gọi nào truyền
          `onNext` xuống — nên nó hiện ra và bấm vào không có gì xảy ra. Nhãn của nó là
          "Xem thêm khoá học", nên đích đúng là trang tìm kiếm; `den` cho phía gọi chỉ định
          đúng chủ đề của dải thẻ đó.
        */}
        {showNext ? (
          <Link
            to={den}
            aria-label="Xem thêm khoá học"
            className="ln-press ln-focus-flat absolute right-0 top-[128px] hidden translate-x-1/2 items-center justify-center rounded-full bg-button-secondary p-xl shadow-xs-ring-primary xl:flex"
          >
            <ArrowRight className="h-6 w-6 text-black" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
            />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
