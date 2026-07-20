import { useParams } from 'react-router-dom';
import CourseHero from '../components/course/CourseHero';
import LearnList from '../components/course/LearnList';
import SkillsList from '../components/course/SkillsList';
import CurriculumAccordion from '../components/course/CurriculumAccordion';
import RelatedCourses from '../components/course/RelatedCourses';
import InstructorCard from '../components/course/InstructorCard';
import NotFound from './NotFound';
import { getCourseBySlug, getInstructor } from '../mock';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const course = slug ? getCourseBySlug(slug) : undefined;

  if (!course) return <NotFound />;

  const instructor = getInstructor(course.instructorId);

  return (
    <div data-testid="page-course" className="mx-auto max-w-content space-y-12 px-4 py-8">
      <CourseHero course={course} />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="mb-4 text-h2 text-primary">Giới thiệu khoá học</h2>
            <p className="text-secondary">{course.description}</p>
          </section>

          <LearnList points={course.learnPoints} />
          <SkillsList skills={course.skills} />

          <section>
            <h2 className="mb-4 text-h2 text-primary">Nội dung khoá học</h2>
            <CurriculumAccordion course={course} />
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          {instructor ? <InstructorCard instructor={instructor} /> : null}
        </aside>
      </div>

      <RelatedCourses courseId={course.id} />
    </div>
  );
}
