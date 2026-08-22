import { describe, expect, it } from 'vitest';
import { courseImage } from './courseImage';
import { getCourses, getFeaturedCourses } from '../../mock';

/**
 * Kho tranh ít hơn số khoá một tấm, nên đúng một cặp khoá phải dùng chung ảnh. Test này
 * canh việc cặp đó không bao giờ rơi vào cùng một hàng bốn thẻ — cái lỗi đã từng thấy là
 * bốn hàng trên trang chủ hiện y hệt cùng bốn tấm ảnh.
 *
 * Cách chia khoá dưới đây phải khớp với DashboardPage.tsx. Đổi ở đó mà quên sửa đây thì
 * test đỏ, đúng ý muốn: nó nhắc rằng bảng gán ảnh được chọn tay theo đúng cách chia này.
 */
describe('courseImage', () => {
  const courses = getCourses();
  const noiBat = getFeaturedCourses(4);
  const conLai = courses.filter((c) => !noiBat.some((n) => n.id === c.id));
  const lay = (batDau: number, n = 4) =>
    Array.from({ length: n }, (_, i) => conLai[(batDau + i) % conLai.length]).filter(Boolean);

  const cacHang = [
    { ten: 'Khoá học nổi bật', khoa: noiBat },
    { ten: 'Giáo trình theo cấp độ', khoa: lay(0) },
    { ten: 'Mở khoá kĩ năng mới', khoa: lay(4) },
    { ten: 'Đang được học nhiều', khoa: lay(8) },
  ];

  it.each(cacHang)('$ten: bốn thẻ trong hàng dùng bốn ảnh khác nhau', ({ khoa }) => {
    const anh = khoa.map((c) => courseImage(c.id));
    expect(anh).toHaveLength(4);
    expect(new Set(anh).size).toBe(4);
  });

  it('hai mục cạnh nhau không dùng lại cùng một khoá', () => {
    for (let i = 0; i < cacHang.length - 1; i += 1) {
      const a = new Set(cacHang[i].khoa.map((c) => c.id));
      const trung = cacHang[i + 1].khoa.filter((c) => a.has(c.id));
      expect(trung, `"${cacHang[i].ten}" và "${cacHang[i + 1].ten}" dùng lại khoá`).toHaveLength(0);
    }
  });

  it('cùng một khoá thì luôn cùng một ảnh, ở bất cứ chỗ nào', () => {
    for (const c of courses) expect(courseImage(c.id)).toBe(courseImage(c.id));
  });

  it('không còn dùng tấm ảnh có logo VNPT/oneSKILL', () => {
    const dung = courses.map((c) => courseImage(c.id));
    expect(dung.some((a) => a.includes('elearning'))).toBe(false);
  });
});
