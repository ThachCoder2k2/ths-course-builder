import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
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
 * The supporting paragraph is Figma's Lorem placeholder, kept verbatim.
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
  'Porem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem';

export default function FeaturedTabsSection({ courses }: { courses: Course[] }) {
  const [active, setActive] = useState(0);

  // The mock has no per-tab taxonomy; rotate the pool so switching tabs shows a
  // different set while the default tab matches Figma's four cards.
  const visible = Array.from({ length: 4 }, (_, i) => courses[(active + i) % courses.length]).filter(
    Boolean,
  );

  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-col justify-center gap-5xl rounded-4xl bg-gradient-to-t from-[#c1dfc4] to-[#deecdd] py-3xl pl-6xl pr-3xl">
        <div className="flex w-full items-center gap-lg">
          <div className="flex h-full w-[250px] shrink-0 flex-col justify-center gap-2xl self-stretch">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-tertiary">
              <Zap className="h-7 w-7 text-secondary" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-[2px]">
              <h2 className="text-xl font-semibold text-primary">Giáo trình theo cấp độ</h2>
              <p className="text-sm text-tertiary">{SUPPORTING}</p>
            </div>
            <Link to="/topics/tri-tue-nhan-tao" className="w-fit">
              <span className="relative flex items-center justify-center gap-xs overflow-hidden rounded-md bg-button-secondary px-[14px] py-[10px] text-sm font-semibold text-button-secondary-fg shadow-xs-ring-primary">
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
                    onClick={() => setActive(index)}
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

            <div className="flex items-stretch gap-lg">
              {visible.map((course) => (
                <CompactCourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
