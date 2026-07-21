import { useParams } from 'react-router-dom';
import CourseHero from '../components/course/CourseHero';
import StatsRow from '../components/course/StatsRow';
import CourseTabs from '../components/course/CourseTabs';
import LearnList from '../components/course/LearnList';
import SkillsList from '../components/course/SkillsList';
import CurriculumAccordion from '../components/course/CurriculumAccordion';
import RelatedCourses from '../components/course/RelatedCourses';
import NotFound from './NotFound';
import { getCourseBySlug } from '../mock';

/**
 * Figma: `Chi tiết khoá học` (node 182:11923).
 * Hero header (183:6357) with a floating metric card (184:4582) overlapping its
 * lower edge, then a 1440-container main section (tabs 184:8403, feature grid
 * 182:11941, content+image 182:11991, lesson list 184:10201) and the related
 * courses section (184:10744). Figma carries no instructor card here.
 */
export default function CourseDetailPage() {
  const { slug } = useParams();
  const course = slug ? getCourseBySlug(slug) : undefined;

  if (!course) return <NotFound />;

  return (
    <div data-testid="page-course" className="flex flex-col pb-9xl">
      {/* Figma 182:12813: hero inset 48px from the header. */}
      <div className="px-4 pt-12 lg:px-12">
        <CourseHero course={course} />
      </div>

      <div className="relative z-10 mx-auto -mt-[58px] w-full max-w-content px-4 lg:px-8">
        <StatsRow course={course} />
      </div>

      <div className="mx-auto mt-7xl flex w-full max-w-[1440px] flex-col gap-7xl px-4 lg:px-8">
        <CourseTabs />

        <section id="learn">
          <LearnList points={course.learnPoints} />
        </section>

        <section id="skills">
          <SkillsList course={course} />
        </section>

        <section id="curriculum" className="flex w-full flex-col gap-xl">
          <h2 className="w-full text-display-xs text-primary">Cấu trúc của khoá học</h2>
          <CurriculumAccordion course={course} />
        </section>

        <RelatedCourses courseId={course.id} />
      </div>
    </div>
  );
}
