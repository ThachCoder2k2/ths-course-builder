import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import zapFast from '../../assets/icons/zap-fast.svg';
import CompactCourseCard from './CompactCourseCard';
import { cn } from '../../lib/cn';
import type { Course } from '../../mock/types';

/**
 * Figma: `Section` (node 179:4444) — 1376 × 420.6.
 * A green gradient card (from #c1dfc4 to #deecdd, radius-4xl, pl-6xl pr-3xl
 * py-3xl) holding a 250px left rail — a 56px bg-tertiary featured icon
 * (zap-fast), a Text xl title, a Text sm supporting paragraph and a "Xem tất
 * cả" secondary button — beside a body with an 8-tab underlined topic strip
 * (node 181:3622) and a Card list of four compact Blog post cards.
 *
 * Câu mô tả trong thiết kế là lorem ipsum; ở đây thay bằng câu nói đúng việc mà khối
 * này làm, vì để chữ giả trên trang chạy thật thì không dùng được.
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

const SUPPORTING =
  'Mỗi chủ đề chia thành ba mức: cơ bản, trung cấp và nâng cao. Bắt đầu ở mức nào cũng được, hệ thống sẽ đo lại sau bài kiểm tra đầu tiên rồi xếp bạn vào đúng chỗ.';

export default function FeaturedTabsSection({
  courses,
  batDau = 0,
}: {
  courses: Course[];
  /** Điểm bắt đầu trong danh sách khoá, để hai mục cạnh nhau không hiện cùng một bộ. */
  batDau?: number;
}) {
  // Giữ cả hướng vừa bấm, không chỉ chỉ số: bộ thẻ mới phải vào từ đúng phía người
  // dùng vừa chọn. Cập nhật một lần trong onClick, đừng tính hướng bằng ref lúc render.
  const [tab, setTab] = useState({ i: 0, huong: 1 });
  const active = tab.i;

  // Mock chỉ có 5 chủ đề thật (t1..t5) trong khi thiết kế cho 8 tab, nên không lọc thật
  // theo tám nhãn đó được. Thay vào đó mỗi tab lấy một KHỐI 4 khoá khác nhau, và mỗi mục
  // có điểm bắt đầu riêng — đủ để đổi tab là thấy bộ khác, và hai mục cạnh nhau không
  // bao giờ hiện cùng một bộ.
  const visible = Array.from(
    { length: 4 },
    (_, i) => courses[(batDau + active * 4 + i) % courses.length],
  ).filter(Boolean);

  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-col justify-center gap-5xl rounded-4xl bg-gradient-to-t from-[#c1dfc4] to-[#deecdd] p-xl sm:p-3xl lg:py-3xl lg:pl-6xl lg:pr-3xl">
        <div className="flex w-full flex-col items-stretch gap-3xl lg:flex-row lg:gap-lg">
          <div className="flex w-full shrink-0 flex-col justify-center gap-2xl lg:w-[250px]">
            {/* Figma `Featured icon` (182:14426) — downloaded verbatim. */}
            <img src={zapFast} alt="" className="h-14 w-14 shrink-0" />
            <div className="flex flex-col gap-[2px]">
              <h2 className="text-xl font-semibold text-primary">Giáo trình theo cấp độ</h2>
              <p className="text-sm text-tertiary">{SUPPORTING}</p>
            </div>
            <Link to="/topics/tri-tue-nhan-tao" className="w-fit">
              <span className="relative flex w-[128px] items-center justify-center gap-xs overflow-hidden rounded-md bg-button-secondary px-[14px] py-[10px] text-sm font-semibold text-button-secondary-fg shadow-xs-ring-primary">
                Xem tất cả
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <div className="flex min-w-px flex-1 flex-col gap-lg">
            <div role="tablist" className="flex w-full border-b border-secondary">
              <div className="-mb-px flex items-start gap-lg overflow-x-auto">
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

            {/* Lưới xuống dòng, không phải một hàng flex: bốn thẻ trong một hàng không
                xuống dòng làm mỗi thẻ co về 0 ở khung hẹp, và nhãn kinh nghiệm (shrink-0)
                chọc ra ngoài viewport 151px. */}
            <div
              key={tab.i}
              style={{ ['--ln-dir' as string]: String(tab.huong) }}
              className="grid grid-cols-1 gap-lg sm:grid-cols-2 xl:grid-cols-4"
            >
              {visible.map((course, i) => (
                <div key={course.id} className="ln-swap flex" style={{ animationDelay: `${i * 45}ms` }}>
                  <CompactCourseCard course={course} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
