import CourseSection from '../components/home/CourseSection';
import FeaturedTabsSection from '../components/home/FeaturedTabsSection';
import TabbedCourseSection from '../components/home/TabbedCourseSection';
import ListingColumns from '../components/home/ListingColumns';
import CTABanner from '../components/home/CTABanner';
import TopicPillGrid from '../components/home/TopicPillGrid';
import DashboardBanner from '../components/home/DashboardBanner';
import { getCourses, getFeaturedCourses } from '../mock';
import heroWash from '../assets/heroes/topic-hero.png';

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
    <div data-testid="page-dashboard" className="relative flex flex-col">
      {/* Figma 177:2982 background — hero wash behind the transparent nav band
          plus the masked grid bleeding into the content. */}
      {/* Calibrated to the Figma render: wash starts ~50% white (232,238,248
          at the top) and is fully white by the band's end; the #E9EAEB grid
          lives only in the nav band. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-[76px] h-[76px] overflow-hidden">
        <img src={heroWash} alt="" className="h-full w-full object-cover object-top" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, #FFFFFF 100%)' }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[76px] h-[100px] bg-[linear-gradient(to_right,#E9EAEB_1px,transparent_1px),linear-gradient(to_bottom,#E9EAEB_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9),transparent)]"
      />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7xl px-4 pt-7xl lg:px-4xl">
        {/* Figma 179:4442 — the render shows the circular next arrow here too. */}
        <CourseSection title="Khoá học nổi bật" courses={getFeaturedCourses(3)} showNext />

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
