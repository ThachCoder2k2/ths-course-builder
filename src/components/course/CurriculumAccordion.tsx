import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, CirclePlay, FileText, Puzzle } from 'lucide-react';
import { sectionDurationMin } from '../../mock';
import type { Course } from '../../mock/types';
import { cn } from '../../lib/cn';

/**
 * Figma: `Section` (node 184:10201) — "Cấu trúc của khoá học".
 * A list of `_Job post` rows (node 184:10502): border-t border-secondary,
 * py-2xl, a Text lg/Semibold title beside a utility-blue duration badge, a
 * details row (play-circle video count, file lesson count, puzzle quiz count
 * in Text md/Medium) and a trailing round chevron toggle. Expanding a row
 * reveals its lessons.
 */
function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

export default function CurriculumAccordion({ course }: { course: Course }) {
  const [open, setOpen] = useState<Set<string>>(
    new Set(course.sections[0] ? [course.sections[0].id] : []),
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex w-full flex-col">
      {course.sections.map((section, index) => {
        const isOpen = open.has(section.id);
        const count = section.lessons.length;

        return (
          <div key={section.id} className={cn(index > 0 && 'border-t border-secondary')}>
            <button
              type="button"
              onClick={() => toggle(section.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-xl py-2xl text-left"
            >
              <span className="flex min-w-px flex-1 flex-col gap-lg">
                <span className="flex flex-wrap items-center gap-md">
                  <span className="text-lg font-semibold text-primary">{section.title}</span>
                  <span className="flex items-center rounded-full border border-utility-blue-200 bg-utility-blue-50 px-[10px] py-xxs text-sm font-medium text-utility-blue-700">
                    {formatDuration(sectionDurationMin(section))}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2xl text-md font-medium text-tertiary">
                  <span className="flex items-center gap-md">
                    <CirclePlay className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {count} video
                  </span>
                  <span className="flex items-center gap-md">
                    <FileText className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {count} bài học
                  </span>
                  <span className="flex items-center gap-md">
                    <Puzzle className="h-5 w-5 shrink-0" aria-hidden="true" />
                    01 quiz
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center justify-center rounded-full p-md">
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-quaternary transition-transform',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </span>
            </button>

            {isOpen ? (
              <ul className="flex flex-col gap-xs pb-2xl">
                {section.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-md rounded-md px-md py-md hover:bg-secondary"
                  >
                    <CirclePlay className="h-4 w-4 shrink-0 text-quaternary" aria-hidden="true" />
                    <span className="flex-1 text-sm text-secondary">{lesson.title}</span>
                    <span className="text-xs text-tertiary">{lesson.durationMin} phút</span>
                    {lesson.isPreview ? (
                      <Link
                        to={'/learn/' + course.slug + '/' + lesson.id}
                        className="text-xs font-semibold text-brand-secondary hover:underline"
                      >
                        Xem trước
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
