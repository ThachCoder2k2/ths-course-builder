import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import Accordion from '../ui/Accordion';
import { sectionDurationMin } from '../../mock';
import type { Course } from '../../mock/types';

export default function CurriculumAccordion({ course }: { course: Course }) {
  const items = course.sections.map((section) => ({
    id: section.id,
    header: (
      <span className="flex flex-wrap items-baseline gap-x-3">
        <span>{section.title}</span>
        <span className="text-sm font-normal text-tertiary">
          {section.lessons.length} bài • {sectionDurationMin(section)} phút
        </span>
      </span>
    ),
    body: (
      <ul className="divide-y divide-secondary">
        {section.lessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center gap-3 py-3">
            <PlayCircle className="h-4 w-4 shrink-0 text-quaternary" aria-hidden="true" />
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
    ),
  }));

  return <Accordion items={items} defaultOpenIds={course.sections[0] ? [course.sections[0].id] : []} />;
}
