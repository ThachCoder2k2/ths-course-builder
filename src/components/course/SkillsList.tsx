import { Sparkles } from 'lucide-react';
import type { Course } from '../../mock/types';
import skillsImage from '../../assets/heroes/skills-image.jpg';

/**
 * Figma: `Section` (node 182:11991) — "Kỹ năng bạn sẽ đạt được".
 * A bg-primary content section (gap-7xl, wrap): a flex-1 text column
 * (max-w-720 min-w-480) with a Display xs heading, a Text lg rich-text body,
 * and a wrapping row of secondary skill pills; beside it a 656×437 image
 * (radius-4xl). Figma gives each pill a distinct category icon; the mock has
 * only skill strings, so a single Sparkles marker is used.
 */
export default function SkillsList({ course }: { course: Course }) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-wrap items-start justify-center gap-7xl bg-primary">
        <div className="flex min-w-[480px] max-w-paragraph flex-1 flex-col items-start gap-xl">
          <div className="flex w-full max-w-width-xl flex-col items-start gap-lg">
            <h2 className="w-full text-display-xs text-primary">Kỹ năng bạn sẽ đạt được</h2>
          </div>

          <div className="w-full text-lg text-tertiary">
            <p>{course.description}</p>
          </div>

          <div className="flex w-full max-w-[1440px] flex-wrap items-start gap-xl">
            {course.skills.map((skill) => (
              <span
                key={skill}
                className="relative flex shrink-0 items-center justify-center gap-xs overflow-hidden rounded-full bg-button-secondary px-lg py-md text-sm font-semibold text-button-secondary-fg shadow-xs-ring-primary"
              >
                <Sparkles className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="flex items-center justify-center px-xxs">{skill}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="h-[437px] w-[656px] max-w-full shrink-0 overflow-hidden rounded-4xl">
          <img src={skillsImage} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
