import { Link } from 'react-router-dom';
import { CirclePlay } from 'lucide-react';
import { flattenLessons } from '../../mock';
import type { Course } from '../../mock/types';
import { hasStarted, readProgress } from '../../lib/progress';
import heroBg from '../../assets/heroes/course-hero.png';

/**
 * Figma: `Header section` (node 183:6357) inside Frame 7 (182:12813).
 * A photographic banner (radius-4xl, py-9xl) over a max-w-1280 container
 * (px-8xl, gap-7xl). Content gap-4xl: a heading block (eyebrow Text md/Semibold
 * brand-secondary, title Display lg/Semibold tracking-tight, Text xl body) and
 * an Actions row (gap-xl) with a primary play button and the enrolled count.
 *
 * NOTE: the eyebrow reads "Our team" in Figma — an Untitled UI template
 * leftover — reproduced verbatim per the exact-match brief.
 */
export default function CourseHero({ course }: { course: Course }) {
  const lessons = flattenLessons(course);
  const progress = readProgress(course.id);
  const started = hasStarted(progress);
  const resumeId = progress.lastLessonId ?? lessons[0]?.lesson.id;

  return (
    <section className="relative flex flex-col items-start justify-center gap-7xl overflow-hidden rounded-4xl py-9xl">
      <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />

      <div className="relative flex w-full max-w-content flex-col items-center gap-4xl px-8xl">
        <div className="flex w-full flex-col items-start gap-4xl">
          <div className="flex w-full flex-col items-start gap-lg">
            <div className="flex w-full flex-col items-start gap-lg">
              <p className="w-full text-md font-semibold text-brand-secondary">Our team</p>
              <h1 className="w-full text-display-lg tracking-[-0.96px] text-primary">
                {course.title}
              </h1>
            </div>
            <p className="w-full text-xl text-tertiary">{course.subtitle}</p>
          </div>

          <div className="flex items-center gap-xl">
            {resumeId ? (
              <Link
                to={'/learn/' + course.slug + '/' + resumeId}
                className="relative flex shrink-0 items-center justify-center gap-md overflow-hidden rounded-lg border-2 border-white/[0.12] bg-button-primary px-[22px] py-xl text-lg font-semibold text-button-primary-fg shadow-xs"
                aria-label={started ? 'Tiếp tục học' : 'Bắt đầu học ngay'}
              >
                <CirclePlay className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span className="flex items-center justify-center px-xxs">
                  {started ? 'Tiếp tục học' : 'Bắt đầu học ngay'}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
                />
              </Link>
            ) : null}
            <p className="text-sm text-tertiary">
              <span className="font-semibold">
                {course.enrolledCount.toLocaleString('vi-VN')}
              </span>{' '}
              người đã học
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
