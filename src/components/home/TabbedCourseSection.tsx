import { useState } from 'react';
import CourseCard from './CourseCard';
import { Reveal } from '../ui/Reveal';
import { cn } from '../../lib/cn';
import type { Course } from '../../mock/types';

/**
 * Figma: `Section` (node 179:4624) — 1376 × 454.
 * Section gap-xl stacking Page header (gap-2xl, Display xs/Semibold), a
 * Horizontal tabs strip (node 179:4699 — border-b border-secondary, tab row
 * gap-lg, each tab h-36 pb-lg px-xs Text md/Semibold, active underlined 2px in
 * fg-brand-primary_alt) and Content gap-5xl holding a Cards row (gap-4xl,
 * flex-1 columns) of Blog post cards.
 *
 * Unlike node 179:4442 this section has no "next" arrow button.
 */
const TABS = [
  'Trí tuệ nhân tạo',
  'Python',
  'Microsoft',
  'AI Agents',
  'Marketing',
  'Thiết kế',
  'Phân tích nghiệp vụ',
  'Kinh tế',
] as const;

export default function TabbedCourseSection({
  title,
  courses,
  batDau = 0,
}: {
  title: string;
  courses: Course[];
  /** Điểm bắt đầu trong danh sách khoá, để hai mục cạnh nhau không hiện cùng một bộ. */
  batDau?: number;
}) {
  const [tab, setTab] = useState({ i: 0, huong: 1 });
  const active = tab.i;

  // The mock carries no per-tab taxonomy; rotate the pool so switching tabs
  // shows a different trio while the default tab matches Figma's three cards.
  // Bốn thẻ một hàng theo thiết kế (node 550:11307), không phải ba như bản cũ.
  // Nhảy theo KHỐI 4, không trượt một ô: trượt một ô thì đổi tab chỉ thay đúng một thẻ,
  // ba thẻ còn lại y nguyên nên trông như trang không phản ứng.
  const visible = Array.from(
    { length: 4 },
    (_, i) => courses[(batDau + active * 4 + i) % courses.length],
  ).filter(Boolean);

  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-col gap-2xl">
        <div className="flex w-full flex-wrap items-start gap-xl">
          <div className="flex min-w-0 flex-1 flex-col gap-xs">
            <h2 className="w-full text-display-xs text-primary">{title}</h2>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-md border-b border-secondary">
        <div role="tablist" className="-mb-px flex items-start gap-lg overflow-x-auto">
          {TABS.map((label, index) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={active === index}
              onClick={() => setTab((truoc) => ({ i: index, huong: index > truoc.i ? 1 : -1 }))}
              className={cn(
                'flex h-9 shrink-0 items-center justify-center gap-md whitespace-nowrap border-b-2 px-xs pb-lg text-md font-semibold transition-colors',
                active === index
                  ? 'border-brand-alt text-brand-secondary'
                  : 'border-transparent text-quaternary hover:text-secondary',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-5xl">
        {/* `key` của Reveal phải là CHỈ SỐ, không phải mã khoá: mã khoá đổi khi đổi tab
            nên React tháo rồi gắn lại Reveal, làm lượt hiện-khi-cuộn-tới chạy lại và
            chồng lên cú vào của .ln-swap. Mảng luôn dài 4 nên chỉ số là danh tính ổn
            định. Khi đó Reveal lo lần hiện đầu, .ln-swap lo mọi lần đổi tab. */}
        <div
          key={tab.i}
          style={{ ['--ln-dir' as string]: String(tab.huong) }}
          className="grid w-full grid-cols-1 gap-3xl sm:grid-cols-2 xl:grid-cols-4"
        >
          {visible.map((course, i) => (
            <Reveal key={i} order={i} className="flex">
              <div className="ln-swap flex w-full" style={{ animationDelay: `${i * 45}ms` }}>
                <CourseCard course={course} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
