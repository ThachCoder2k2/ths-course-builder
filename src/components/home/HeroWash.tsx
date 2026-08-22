import { useEffect, useRef, useState } from 'react';
import wash from '../../assets/landing/bg-wash.jpg';
import { prefersReducedMotion } from '../../lib/motion';
import { ngheCuon } from '../../lib/scrollBus';
import { cn } from '../../lib/cn';

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
 *
 * Thêm một lớp trôi ngang rất chậm (44s một vòng, khoảng 1.1px/s) để trang không bao giờ
 * đứng im hoàn toàn. Chậm dưới ngưỡng ý thức: mắt chỉ thấy "đang sống", không bắt được nó
 * đi đâu. Ra khỏi khung nhìn là dừng hẳn animation, không phải chỉ ẩn — animation đang
 * dừng thì bộ ghép ảnh không tick nữa, đây là phần tiết pin.
 */

/** Phần dư trên–dưới để cú dịch parallax không bao giờ hở mép. Dịch tối đa 1600×0.08=128px. */
const DU = 140;

export function HeroWash() {
  const ref = useRef<HTMLImageElement>(null);
  const hop = useRef<HTMLDivElement>(null);
  const [trongTam, setTrongTam] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    return ngheCuon(({ y }) => {
      const el = ref.current;
      // Chỉ tính khi dải nền còn trong tầm; cuộn qua rồi thì thôi cho khỏi tốn.
      if (!el || y > 1600) return;
      el.style.transform = `translate3d(0, ${(y * 0.08).toFixed(1)}px, 0)`;
    });
  }, []);

  useEffect(() => {
    const el = hop.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setTrongTam(true);
      return;
    }
    const io = new IntersectionObserver((es) => setTrongTam(es.some((e) => e.isIntersecting)), {
      rootMargin: '10% 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={hop}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', trongTam && 'ln-run')}
    >
      {/* Lớp riêng cho cú trôi ngang. Không gộp vào chính thẻ ảnh: ảnh đang giữ transform
          của parallax, hai transform trên một node thì cái sau ghi đè cái trước. */}
      <div className="ln-wash-drift h-full w-full">
        <img
          ref={ref}
          src={wash}
          alt=""
          style={{ top: -DU, height: `calc(100% + ${DU * 2}px)` }}
          className="ln-wash absolute inset-x-0 w-full object-cover object-top"
        />
      </div>
    </div>
  );
}
