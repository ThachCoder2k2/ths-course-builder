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

  /**
   * "Khoá học nổi bật" lấy theo điểm đánh giá nên không đoán trước được nó rơi vào khoá
   * nào. Các mục sau lấy từ phần CÒN LẠI, nên không bao giờ có khoá xuất hiện ở hai mục
   * cạnh nhau — trước đây "Deep Learning nâng cao" hiện ở cả hàng đầu và khối xanh.
   *
   * Lấy 8 chứ không phải 4: mũi tên bên phải hàng thẻ lật trang bốn thẻ, mà chỉ đưa cho nó
   * đúng bốn khoá thì không có trang thứ hai để lật. Hàng vẫn chỉ hiện bốn thẻ một lúc.
   */
  const noiBat = getFeaturedCourses(8);
  const conLai = courses.filter((c) => !noiBat.some((n) => n.id === c.id));
  const lay = (batDau: number, n = 4) =>
    Array.from({ length: n }, (_, i) => conLai[(batDau + i) % conLai.length]).filter(Boolean);

  return (
    <div data-testid="page-dashboard" className="relative flex flex-col">
      <div className="relative isolate flex flex-col">
        <HeroWash />

        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7xl px-4 pt-7xl lg:px-4xl">
          <CourseSection title="Khoá học nổi bật" courses={noiBat} showNext />

          <FeaturedTabsSection courses={conLai} batDau={0} />

          {/* Mốc cao 0 đánh dấu khe giữa mục 2 và mục 3 — con robot neo vào đây. Phải nằm
              đúng chỗ này trong luồng DOM, không phải treo bằng toạ độ tính từ đỉnh trang. */}
          <Mascot />

          <TabbedCourseSection
            title="Những khoá học giúp bạn mở khoá kĩ năng mới"
            courses={conLai}
            batDau={4}
          />

          <ListingColumns />
        </div>

        <div className="pt-7xl">
          <CTABanner />
        </div>

        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7xl px-4 pb-9xl pt-7xl lg:px-4xl">
          <CourseSection title="Khoá học đang được học nhiều" courses={lay(0, 8)} showNext />

          <TopicPillGrid />
        </div>
      </div>

      <DashboardBanner />
    </div>
  );
}
