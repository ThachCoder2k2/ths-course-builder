import CourseSection from '../components/home/CourseSection';
import FeaturedTabsSection from '../components/home/FeaturedTabsSection';
import TabbedCourseSection from '../components/home/TabbedCourseSection';
import ListingColumns from '../components/home/ListingColumns';
import CTABanner from '../components/home/CTABanner';
import TopicPillGrid from '../components/home/TopicPillGrid';
import DashboardBanner from '../components/home/DashboardBanner';
import { getCourses, getFeaturedCourses } from '../mock';

/**
 * Figma: `Sau đăng nhập` (node 177:2981).
 *
 * Main content (node 177:3007) puts its sections in a 1440-wide container
 * inset 32px — so 1376 content — separated by 64px. The CTA section
 * (179:5458) and the Banner (177:2985) are full-bleed 1920 and therefore sit
 * outside that container.
 */
export default function DashboardPage() {
  return (
    <div data-testid="page-dashboard" className="flex flex-col">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7xl px-4 pt-7xl lg:px-4xl">
        {/* Figma 179:4442 */}
        <CourseSection title="Khoá học nổi bật" courses={getFeaturedCourses(3)} />

        {/* Figma 179:4444 */}
        <FeaturedTabsSection courses={getCourses()} />

        {/* Figma 179:4624 */}
        <TabbedCourseSection
          title="Những khoá học giúp bạn mở khoá kĩ năng mới"
          courses={getCourses()}
        />

        {/* Figma 179:5518 */}
        <ListingColumns />
      </div>

      {/* Figma 179:5458 — full-bleed */}
      <div className="pt-7xl">
        <CTABanner />
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7xl px-4 pb-9xl pt-7xl lg:px-4xl">
        {/* Figma 179:5208 */}
        <CourseSection title="Khoá học nổi bật" courses={getCourses().slice(3, 6)} showNext />

        {/* Figma 179:7785 */}
        <TopicPillGrid />
      </div>

      {/* Figma 177:2985 — full-bleed */}
      <DashboardBanner />
    </div>
  );
}
