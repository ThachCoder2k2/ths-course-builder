import ContinueLearning from '../components/home/ContinueLearning';
import CourseSection from '../components/home/CourseSection';
import FeaturedTabsSection from '../components/home/FeaturedTabsSection';
import CTABanner from '../components/home/CTABanner';
import CollectionGrid from '../components/home/CollectionGrid';
import { getCourses, getFeaturedCourses } from '../mock';

/**
 * Figma: `Sau đăng nhập` (node 177:2981).
 * Section order follows the frame: greeting, course sections, CTA, banner.
 * Sections still on the invented layout are marked below.
 */
export default function DashboardPage() {
  return (
    <div data-testid="page-dashboard" className="mx-auto flex max-w-content flex-col gap-6xl px-4 py-6xl lg:px-4xl">
      {/* Figma 179:4442 — exact */}
      <CourseSection title="Khoá học nổi bật" courses={getFeaturedCourses(3)} />

      {/* Figma 179:4444 — exact */}
      <FeaturedTabsSection
        title="Học theo cấp độ"
        supportingText="Chọn cấp độ phù hợp với bạn và bắt đầu từ những khoá học nền tảng nhất."
      />

      {/* Figma 179:4624 — not yet rebuilt */}
      <ContinueLearning />

      {/* Figma 179:5518 — not yet rebuilt */}
      <CourseSection title="Khoá học mới" courses={getCourses().slice(3, 6)} />

      {/* Figma 179:5459 CTA — not yet rebuilt */}
      <CTABanner />

      {/* Figma 179:5208 / 179:7785 — not yet rebuilt */}
      <CollectionGrid />
    </div>
  );
}
