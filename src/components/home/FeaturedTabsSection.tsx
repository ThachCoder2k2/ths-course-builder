import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Button from '../ui/Button';
import CompactCourseCard from './CompactCourseCard';
import { getCoursesByLevel } from '../../mock';
import { LEVEL_LABEL, type Level } from '../../mock/types';
import { cn } from '../../lib/cn';

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

/**
 * Figma: `Section` (node 179:4444) — 1376 × 420.6.
 * Cards inset 48/24; a 250px left rail (Featured icon 56, text block, 128×40
 * button) beside a 1042px body containing Horizontal tabs (36) and a Card list
 * of four 251.5-wide cards.
 */
export default function FeaturedTabsSection({
  title,
  supportingText,
}: {
  title: string;
  supportingText: string;
}) {
  const [level, setLevel] = useState<Level>('beginner');
  const courses = getCoursesByLevel(level).slice(0, 4);

  return (
    <section className="flex w-full gap-lg px-6xl py-3xl">
      <div className="hidden w-[250px] shrink-0 flex-col justify-center gap-4xl lg:flex">
        <span className="grid h-14 w-14 place-items-center rounded-xl border border-primary bg-primary shadow-xs">
          <GraduationCap className="h-6 w-6 text-brand-tertiary" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-md">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <p className="text-sm text-tertiary">{supportingText}</p>
        </div>
        <Link to="/topics/tri-tue-nhan-tao">
          <Button variant="secondary" className="w-[128px]">
            Xem tất cả
          </Button>
        </Link>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-lg">
        <div role="tablist" className="flex h-9 items-center gap-xs">
          {LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={level === value}
              onClick={() => setLevel(value)}
              className={cn(
                'rounded-md px-lg py-md text-sm font-semibold transition-colors',
                level === value ? 'bg-secondary text-primary' : 'text-quaternary hover:text-secondary',
              )}
            >
              {LEVEL_LABEL[value]}
            </button>
          ))}
        </div>

        <div className="flex items-start gap-lg overflow-hidden">
          {courses.map((course) => (
            <CompactCourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
