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
}: {
  title: string;
  courses: Course[];
}) {
  const [active, setActive] = useState(0);

  // The mock carries no per-tab taxonomy; rotate the pool so switching tabs
  // shows a different trio while the default tab matches Figma's three cards.
  // Bốn thẻ một hàng theo thiết kế (node 550:11307), không phải ba như bản cũ.
  const visible = Array.from({ length: 4 }, (_, i) => courses[(active + i) % courses.length]).filter(
    Boolean,
  );

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

      <div className="flex w-full flex-col items-center gap-5xl">
        <div className="grid w-full grid-cols-1 gap-3xl sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((course, i) => (
            <Reveal key={course.id} order={i} className="flex">
              <CourseCard course={course} slot={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
