import { describe, expect, it } from 'vitest';
import { courseImage } from './courseImage';
import { getCourses, getFeaturedCourses } from '../../mock';

/**
 * Kho tranh ít hơn số khoá một tấm, nên đúng một cặp khoá phải dùng chung ảnh. Test này
 * canh việc cặp đó không bao giờ rơi vào cùng một hàng bốn thẻ — cái lỗi đã từng thấy là
 * bốn hàng trên trang chủ hiện y hệt cùng bốn tấm ảnh.
 *
 * Các lát khoá dưới đây phải khớp với DashboardPage.tsx. Đổi ở đó mà quên sửa đây thì test
 * đỏ, đúng ý muốn: nó nhắc rằng bảng gán ảnh được chọn tay theo đúng những lát này.
 */
describe('courseImage', () => {
  const courses = getCourses();
  const cacHang: { ten: string; khoa: typeof courses }[] = [
    { ten: 'Khoá học nổi bật', khoa: getFeaturedCourses(4) },
    { ten: 'Giáo trình theo cấp độ', khoa: [4, 5, 6, 7].map((i) => courses[i]) },
    { ten: 'Mở khoá kĩ năng mới', khoa: [8, 9, 10, 11].map((i) => courses[i]) },
    { ten: 'Đang được học nhiều', khoa: [12, 13, 2, 3].map((i) => courses[i]) },
  ];

  it.each(cacHang)('$ten: bốn thẻ trong hàng dùng bốn ảnh khác nhau', ({ khoa }) => {
    const anh = khoa.filter(Boolean).map((c) => courseImage(c.id));
    expect(anh).toHaveLength(4);
    expect(new Set(anh).size).toBe(4);
  });

  it('cùng một khoá thì luôn cùng một ảnh, ở bất cứ chỗ nào', () => {
    for (const c of courses) expect(courseImage(c.id)).toBe(courseImage(c.id));
  });

  it('không còn dùng tấm ảnh có logo VNPT/oneSKILL', () => {
    const dung = courses.map((c) => courseImage(c.id));
    expect(dung.some((a) => a.includes('elearning'))).toBe(false);
  });
});
