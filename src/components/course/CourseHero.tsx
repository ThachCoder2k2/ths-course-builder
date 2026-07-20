import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Rating from '../ui/Rating';
import StatsRow from './StatsRow';
import { flattenLessons, getInstructor } from '../../mock';
import type { Course } from '../../mock/types';
import { hasStarted, readProgress } from '../../lib/progress';

export default function CourseHero({ course }: { course: Course }) {
  const lessons = flattenLessons(course);
  const instructor = getInstructor(course.instructorId);
  const progress = readProgress(course.id);
  const started = hasStarted(progress);
  const resumeId = progress.lastLessonId ?? lessons[0]?.lesson.id;
  const previewLesson = lessons.find((item) => item.lesson.isPreview);

  return (
    <section className="overflow-hidden rounded-card bg-gradient-to-br from-canvas-dark via-canvas-deep to-brand-900 px-6 py-10 sm:px-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Khoá học</p>
      <h1 className="mt-3 max-w-3xl text-h1 text-white">{course.title}</h1>
      <p className="mt-3 max-w-2xl text-white/70">{course.subtitle}</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
        {instructor ? <span>Giảng viên: {instructor.name}</span> : null}
        <span>{course.enrolledCount.toLocaleString('vi-VN')} học viên</span>
        <Rating value={course.rating} className="text-white" />
      </div>

      <div className="mt-8">
        <StatsRow course={course} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {resumeId ? (
          <Link to={'/learn/' + course.slug + '/' + resumeId}>
            <Button variant="inverse" size="lg">
              {started ? 'Tiếp tục học' : 'Vào học'}
            </Button>
          </Link>
        ) : null}
        {previewLesson ? (
          <Link to={'/learn/' + course.slug + '/' + previewLesson.lesson.id}>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
              Xem trước
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
