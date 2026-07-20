import CardGrid from '../home/CardGrid';
import { getRelatedCourses } from '../../mock';

export default function RelatedCourses({ courseId }: { courseId: string }) {
  const related = getRelatedCourses(courseId, 4);
  if (related.length === 0) return null;

  return <CardGrid title="Khoá học liên quan" courses={related} />;
}
