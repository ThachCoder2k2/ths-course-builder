import { useEffect, useRef } from 'react';
import wash from '../../assets/landing/bg-wash.jpg';
import { prefersReducedMotion } from '../../lib/motion';

/**
 * Dải nền của trang chủ.
 *
 * Trong thiết kế đây là ảnh nền của node `550:11205 Testimonial section` — khung
 * 1920 × 3151, tức trải từ ngay dưới thanh đầu trang xuống hết phần nội dung, dừng ở
 * băng chuyền tin. Ảnh gốc 4096 × 2300 với `scaleMode: FILL`, nên khi phủ một khung cao
 * như vậy nó bị phóng 1.37 lần và chỉ còn thấy 34% bề ngang ở giữa — kết quả là một dải
 * gần như trắng, chỉ hơi phớt hồng ở sát đỉnh, và KHÔNG chênh màu trái–phải.
 *
 * Bản trước sai ba chỗ: lấy số của node khác (`550:11206 Background pattern`, 1920 × 1440),
 * chỉ phủ 1200px nên nửa dưới trang trắng trơn, và dùng một bản cắt khác của ảnh nên lộ
 * hồng ở góc trái và xám-lục ở góc phải — đo được (255,239,240) so với (244,243,241) trên
 * cùng một hàng, trong khi thiết kế chênh gần như bằng không.
 *
 * Ảnh dịch chậm hơn nội dung một nhịp khi cuộn (8%). Giữ rất nhẹ vì parallax thuộc nhóm
 * dễ gây chóng; tắt hẳn khi người dùng bật giảm chuyển động.
 */

/** Phần dư trên–dưới để cú dịch parallax không bao giờ hở mép. Dịch tối đa 1600×0.08=128px. */
const DU = 140;

export function HeroWash() {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // Chỉ tính khi dải nền còn trong tầm; cuộn qua rồi thì thôi cho khỏi tốn.
        const y = window.scrollY;
        if (y > 1600) return;
        el.style.transform = `translate3d(0, ${(y * 0.08).toFixed(1)}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <img
        ref={ref}
        src={wash}
        alt=""
        style={{ top: -DU, height: `calc(100% + ${DU * 2}px)` }}
        className="ln-wash absolute inset-x-0 w-full object-cover object-top"
      />
    </div>
  );
}
