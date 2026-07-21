import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Flag,
  ListVideo,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import LearnTopBar from '../components/learn/LearnTopBar';
import LessonSidebar from '../components/learn/LessonSidebar';
import VideoPlayer from '../components/learn/VideoPlayer';
import FloatingChatbot from '../components/learn/FloatingChatbot';
import NotFound from './NotFound';
import { flattenLessons, getCourseBySlug, getLesson } from '../mock';
import { useProgress } from '../lib/useProgress';

/**
 * Figma: `Học` (node 204:4565).
 * The 80px header (204:4566), a left lesson rail (204:4881), the video + info
 * column (211:9739), and a floating chatbot button (211:9764). Figma shows no
 * right-hand notes panel, so it is replaced by the chatbot FAB. The info block
 * (204:4683) carries feedback icon buttons and the next-lesson button.
 */
export default function LearnPage() {
  const { courseSlug, lessonId } = useParams();
  const navigate = useNavigate();

  const course = courseSlug ? getCourseBySlug(courseSlug) : undefined;
  const currentLesson = courseSlug && lessonId ? getLesson(courseSlug, lessonId) : undefined;

  const progress = useProgress(course?.id ?? '');
  const { setLast } = progress;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLessonId = currentLesson?.lesson.id;
  useEffect(() => {
    if (currentLessonId) setLast(currentLessonId);
  }, [currentLessonId, setLast]);

  if (!course || !currentLesson) return <NotFound />;

  const lessons = flattenLessons(course);
  const previous = lessons[currentLesson.index - 1];
  const next = lessons[currentLesson.index + 1];
  const percent = progress.percent(lessons.length);
  const done = progress.isCompleted(currentLesson.lesson.id);

  const handleEnded = () => {
    progress.markComplete(currentLesson.lesson.id);
    if (next) navigate('/learn/' + course.slug + '/' + next.lesson.id);
  };

  return (
    <div data-testid="page-learn" className="flex h-screen flex-col">
      <LearnTopBar course={course} percent={percent} />

      {/* Figma `Frame 7` (204:4576): sidebar + main inset as panels, gap-6xl,
          p-8 — sub nav 320, gap 24, main 1512 at 1920. */}
      <div className="flex min-h-0 flex-1 gap-6 p-8">
        <LessonSidebar
          course={course}
          activeLessonId={currentLesson.lesson.id}
          progress={progress}
          className="hidden w-80 shrink-0 overflow-y-auto rounded-2xl border border-secondary lg:block"
        />

        <main className="min-w-0 flex-1 overflow-y-auto rounded-2xl border border-secondary">
          <VideoPlayer src={currentLesson.lesson.videoUrl} onEnded={handleEnded} />

          <div className="mx-auto max-w-[1480px] px-4 py-6">
            <p className="text-sm text-tertiary">{currentLesson.section.title}</p>
            <h1 className="mt-1 text-display-xs text-primary">{currentLesson.lesson.title}</h1>

            {/* Figma actions (node 204:4686): feedback icons + progress controls. */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="Hữu ích"
                className="flex items-center justify-center rounded-md p-2.5 text-quaternary hover:bg-secondary"
              >
                <ThumbsUp className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Không hữu ích"
                className="flex items-center justify-center rounded-md p-2.5 text-quaternary hover:bg-secondary"
              >
                <ThumbsDown className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Báo cáo"
                className="flex items-center justify-center rounded-md p-2.5 text-quaternary hover:bg-secondary"
              >
                <Flag className="h-5 w-5" aria-hidden="true" />
              </button>

              <Button
                variant={done ? 'secondary' : 'primary'}
                className="ml-auto"
                onClick={() => progress.toggleComplete(currentLesson.lesson.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {done ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
              </Button>

              <Button variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <ListVideo className="h-4 w-4" />
                Danh sách bài
              </Button>
            </div>

            {/* Figma info nav (node 204:4690): previous / next lesson. */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-6">
              {previous ? (
                <Link
                  to={'/learn/' + course.slug + '/' + previous.lesson.id}
                  aria-label="Bài trước"
                  className="inline-flex items-center gap-sm rounded-md border border-button-secondary bg-button-secondary px-xl py-[10px] text-md font-semibold text-button-secondary-fg shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Bài trước
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to={'/learn/' + course.slug + '/' + next.lesson.id}
                  aria-label="Bài tiếp theo"
                  className="ml-auto inline-flex items-center gap-sm rounded-md border border-button-secondary bg-button-secondary px-xl py-[10px] text-md font-semibold text-button-secondary-fg shadow-xs"
                >
                  Chuyển sang bài tiếp theo
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      <FloatingChatbot />

      <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Danh sách bài học" side="left">
        <LessonSidebar
          course={course}
          activeLessonId={currentLesson.lesson.id}
          progress={progress}
          onNavigate={() => setSidebarOpen(false)}
        />
      </Drawer>
    </div>
  );
}
