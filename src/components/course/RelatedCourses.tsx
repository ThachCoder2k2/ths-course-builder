import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import CourseCard from '../home/CourseCard';
import { getCourseById, getRelatedCourses, getTopics } from '../../mock';

/**
 * Figma: `Section` (node 184:10744) — "Khoá học liên quan".
 * Display xs heading over a three-column Blog post card row (gap-4xl) and a
 * centred tertiary "Xem thêm khoá học" button (arrow-down) below.
 */
export default function RelatedCourses({ courseId }: { courseId: string }) {
  const related = getRelatedCourses(courseId, 3);
  // Chủ đề đầu tiên của khoá đang xem; khoá không gắn chủ đề nào thì mở cả thư viện.
  const topic = getTopics().find((t) => getCourseById(courseId)?.topicIds.includes(t.id));
  const den = topic ? `/tim-kiem?chu-de=${topic.slug}` : '/tim-kiem';
  if (related.length === 0) return null;

  return (
    <section className="flex w-full flex-col gap-2xl">
      <h2 className="w-full text-display-xs text-primary">Khoá học liên quan</h2>

      <div className="flex w-full items-start gap-4xl">
        {related.map((course) => (
          <div key={course.id} className="flex min-w-px flex-1 flex-col">
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      {/* Nút này trước đây không có việc gì. Giờ nó mở trang tìm kiếm đã lọc sẵn theo chủ
          đề của chính khoá đang xem — tức "thêm khoá như khoá này", đúng nghĩa cái nhãn. */}
      <div className="flex w-full justify-start">
        <Link
          to={den}
          className="ln-press ln-focus-flat flex items-center justify-center gap-sm rounded-full px-xl py-[10px] text-md font-semibold text-brand-900"
        >
          Xem thêm khoá học
          <ArrowDown className="h-5 w-5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
