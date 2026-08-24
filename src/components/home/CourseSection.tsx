import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import CourseCard from './CourseCard';
import CardRail from '../ui/CardRail';
import { Reveal } from '../ui/Reveal';
import type { Course } from '../../mock/types';

/**
 * Một hàng thẻ khoá học có tiêu đề. Thiết kế xếp bốn thẻ một hàng ở cỡ máy tính; khung
 * hẹp hơn thì cuộn ngang trong `CardRail`.
 *
 * Mũi tên bên phải LẬT TRANG bốn thẻ — bấm là hàng thay bằng bốn khoá khác, hết thì quay
 * lại từ đầu nên không bao giờ bấm vào chỗ chết.
 *
 * Mũi tên KHÔNG có animation nào: không nảy khi bấm, không phóng khi trỏ vào. Nó đứng im,
 * việc của nó là đổi nội dung phía bên trái chứ không phải tự diễn.
 */

/** Số thẻ một trang — bằng số cột của lưới ở cỡ máy tính. */
const MOI_TRANG = 4;

export default function CourseSection({
  title,
  courses,
  showNext = false,
}: {
  title: string;
  courses: Course[];
  /** Hiện mũi tên lật trang. Chỉ có tác dụng khi danh sách dài hơn một trang. */
  showNext?: boolean;
}) {
  const [trang, setTrang] = useState(0);
  const soTrang = Math.max(1, Math.ceil(courses.length / MOI_TRANG));
  const batDau = (trang % soTrang) * MOI_TRANG;
  const hien = courses.slice(batDau, batDau + MOI_TRANG);
  const coLatTrang = showNext && soTrang > 1;

  return (
    <section className="flex w-full flex-col gap-xl">
      <Reveal>
        <h2 className="w-full text-display-xs text-primary">{title}</h2>
      </Reveal>

      <div className="relative flex w-full flex-col items-center gap-5xl">
        {/*
          `key` đổi theo trang nên `CardRail` dựng lại: vùng cuộn về đầu thay vì giữ chỗ
          cuộn của trang trước, và các thẻ mới hiện ra lần lượt như lúc mới vào.
        */}
        <CardRail key={batDau} nhan={title}>
          {hien.map((course, i) => (
            <Reveal key={course.id} order={i} className="flex">
              <CourseCard course={course} />
            </Reveal>
          ))}
        </CardRail>

        {coLatTrang ? (
          <button
            type="button"
            onClick={() => setTrang((t) => (t + 1) % soTrang)}
            aria-label={`Xem ${MOI_TRANG} khoá tiếp theo trong ${title}`}
            className="ln-focus-flat absolute right-0 top-[128px] hidden translate-x-1/2 items-center justify-center rounded-full bg-button-secondary p-xl shadow-xs-ring-primary xl:flex"
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
