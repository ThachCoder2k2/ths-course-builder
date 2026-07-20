import { Link } from 'react-router-dom';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import { flattenLessons, getCourses, getFeaturedCourses } from '../../mock';
import { hasStarted, progressPercent, readProgress } from '../../lib/progress';
import { cn } from '../../lib/cn';
import { courseGradient } from './courseGradient';

export default function ContinueLearning() {
  const started = getCourses().filter((course) => hasStarted(readProgress(course.id)));
  const list = (started.length > 0 ? started : getFeaturedCourses(3)).slice(0, 3);

  return (
    <section>
      <h2 className="mb-4 text-h2 text-primary">Đang học</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {list.map((course) => {
          const lessons = flattenLessons(course);
          const progress = readProgress(course.id);
          const percent = progressPercent(progress, lessons.length);
          const resumeId = progress.lastLessonId ?? lessons[0]?.lesson.id;

          return (
            <article
              key={course.id}
              className="flex flex-col overflow-hidden rounded-card border border-secondary bg-primary shadow-card"
            >
              <div className={cn('aspect-[16/7] bg-gradient-to-br p-4', courseGradient(course.id))}>
                <p className="line-clamp-2 text-sm font-bold text-white">{course.title}</p>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-tertiary">
                    <span>
                      {progress.completedLessonIds.length}/{lessons.length} bài học
                    </span>
                    <span className="font-semibold text-brand-secondary">{percent}%</span>
                  </div>
                  <ProgressBar value={percent} />
                </div>

                {resumeId ? (
                  <Link to={'/learn/' + course.slug + '/' + resumeId} className="mt-auto">
                    <Button className="w-full">
                      {percent > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
