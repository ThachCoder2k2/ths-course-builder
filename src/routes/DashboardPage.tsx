import CourseSection from '../components/home/CourseSection';
import FeaturedTabsSection from '../components/home/FeaturedTabsSection';
import TabbedCourseSection from '../components/home/TabbedCourseSection';
import ListingColumns from '../components/home/ListingColumns';
import CTABanner from '../components/home/CTABanner';
import TopicPillGrid from '../components/home/TopicPillGrid';
import DashboardBanner from '../components/home/DashboardBanner';
import { HeroWash } from '../components/home/HeroWash';
import { Mascot } from '../components/home/Mascot';
import { getCourses, getFeaturedCourses } from '../mock';

/**
 * Trang chủ, theo thiết kế Figma node 550:11174.
 *
 * Thiết kế gói toàn bộ phần nội dung vào một khối tên "Testimonial section"
 * (`550:11205`, 1920 × 3151) và đặt ảnh nền lên chính khối đó — tức dải nền trải từ ngay
 * dưới thanh đầu trang xuống hết nội dung rồi DỪNG ở băng chuyền tin. Ở đây dựng lại đúng
 * cấu trúc ấy: một lớp bọc `relative` chứa mọi mục nằm trên băng chuyền, `HeroWash` phủ
 * kín lớp bọc đó. Bản trước phủ cứng 1200px nên nửa dưới trang trắng trơn.
 *
 * Các mục nội dung rộng 1440 lùi vào 32px. Hai khối chạy tràn viền (khối mời xây lộ trình
 * và băng chuyền tin) nằm ngoài khung nội dung để trải hết bề ngang.
 *
 * Con mascot đứng ở lề trái trong khe giữa mục 2 và mục 3, chỉ hiện từ 1920px trở lên vì
 * hẹp hơn thì máng lề không đủ chỗ cho nó đứng mà không đè lên nội dung.
 */
export default function DashboardPage() {
  const courses = getCourses();

  return (
    <div data-testid="page-dashboard" className="relative flex flex-col">
      <div className="relative isolate flex flex-col">
        <HeroWash />

        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7xl px-4 pt-7xl lg:px-4xl">
          <CourseSection title="Khoá học nổi bật" courses={getFeaturedCourses(4)} showNext />

          <FeaturedTabsSection courses={courses} batDau={4} />

          {/* Mốc cao 0 đánh dấu khe giữa mục 2 và mục 3 — con robot neo vào đây. Phải nằm
              đúng chỗ này trong luồng DOM, không phải treo bằng toạ độ tính từ đỉnh trang. */}
          <Mascot />

          <TabbedCourseSection
            title="Những khoá học giúp bạn mở khoá kĩ năng mới"
            courses={courses}
            batDau={8}
          />

          <ListingColumns />
        </div>

        <div className="pt-7xl">
          <CTABanner />
        </div>

        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7xl px-4 pb-9xl pt-7xl lg:px-4xl">
          {/* Lát khoá chọn tay, không phải slice liền: kho có 13 tranh cho 14 khoá nên khoá
              thứ 13 dùng chung ảnh với khoá thứ 0. Bộ 12/13/2/3 tránh được việc hai khoá
              đó đứng cùng một hàng. */}
          <CourseSection title="Khoá học đang được học nhiều" courses={[courses[12], courses[13], courses[2], courses[3]]} showNext />

          <TopicPillGrid />
        </div>
      </div>

      <DashboardBanner />
    </div>
  );
}
