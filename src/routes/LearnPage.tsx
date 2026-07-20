import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ListVideo, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import LearnTopBar from '../components/learn/LearnTopBar';
import LessonSidebar from '../components/learn/LessonSidebar';
import LessonPanel from '../components/learn/LessonPanel';
import VideoPlayer from '../components/learn/VideoPlayer';
import NotFound from './NotFound';
import { flattenLessons, getCourseBySlug, getLesson } from '../mock';
import { useProgress } from '../lib/useProgress';

export default function LearnPage() {
  const { courseSlug, lessonId } = useParams();
  const navigate = useNavigate();

  const course = courseSlug ? getCourseBySlug(courseSlug) : undefined;
  const currentLesson = courseSlug && lessonId ? getLesson(courseSlug, lessonId) : undefined;

  const progress = useProgress(course?.id ?? '');
  const { setLast } = progress;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

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
      <LearnTopBar course={course} percent={percent} previous={previous} next={next} />

      <div className="flex min-h-0 flex-1">
        <LessonSidebar
          course={course}
          activeLessonId={currentLesson.lesson.id}
          progress={progress}
          className="hidden w-80 shrink-0 overflow-y-auto border-r border-secondary lg:block"
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <VideoPlayer src={currentLesson.lesson.videoUrl} onEnded={handleEnded} />

          <div className="mx-auto max-w-3xl px-4 py-6">
            <p className="text-sm text-tertiary">{currentLesson.section.title}</p>
            <h1 className="mt-1 text-h2 text-primary">{currentLesson.lesson.title}</h1>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant={done ? 'secondary' : 'primary'}
                onClick={() => progress.toggleComplete(currentLesson.lesson.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {done ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
              </Button>

              <Button variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <ListVideo className="h-4 w-4" />
                Danh sách bài
              </Button>

              <Button variant="ghost" className="xl:hidden" onClick={() => setPanelOpen(true)}>
                <MessageSquare className="h-4 w-4" />
                Ghi chú &amp; bình luận
              </Button>
            </div>
          </div>
        </main>

        <LessonPanel
          lesson={currentLesson.lesson}
          className="hidden w-96 shrink-0 overflow-y-auto border-l border-secondary xl:block"
        />
      </div>

      <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Danh sách bài học" side="left">
        <LessonSidebar
          course={course}
          activeLessonId={currentLesson.lesson.id}
          progress={progress}
          onNavigate={() => setSidebarOpen(false)}
        />
      </Drawer>

      <Drawer open={panelOpen} onClose={() => setPanelOpen(false)} title="Ghi chú và bình luận" side="right">
        <LessonPanel lesson={currentLesson.lesson} />
      </Drawer>
    </div>
  );
}
