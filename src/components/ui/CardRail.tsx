import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/motion';

/**
 * Hàng thẻ: cuộn ngang ở khung hẹp, lưới bốn cột ở khung rộng.
 *
 * Vì sao đổi: lưới cũ sụp thành MỘT cột dọc ở khung hẹp, nên ở 390px trang chủ cao
 * 12.165px — gần mười hai màn hình cho một trang giới thiệu. Người dùng phải quẹt qua
 * hàng chục thẻ mới tới được mục sau. Xếp ngang thì mỗi mục cao đúng một thẻ.
 *
 * Ba điều bắt buộc, lấy từ ui-ux-pro-max:
 * - `gesture-alternative`: không được chỉ dựa vào quẹt. Luôn có hai nút bấm thấy được,
 *   mỗi nút 44×44 theo `touch-target-size`, và tự tắt khi hết đường.
 * - `swipe-clarity`: phải hé thẻ kế tiếp ra, người ta mới biết còn nữa. Bề rộng thẻ tính
 *   ra từ chỗ trống sao cho luôn hé đúng 1/4 thẻ, chứ không chốt cứng một con số rồi để
 *   phần hé thành số dư ngẫu nhiên.
 * - `scroll-behavior`: vùng cuộn lồng nhau không được cản cuộn dọc của trang. Dùng
 *   `overscroll-x-contain` để cú quẹt ngang không lọt ra thành cử chỉ lùi trang, và chỉ
 *   cuộn trục ngang nên quẹt dọc vẫn đi thẳng xuống trang.
 *
 * Từ 1280px trở lên thì thành lưới bốn cột đúng như thiết kế, và hai nút biến mất.
 */
export default function CardRail({
  children,
  nhan,
  className,
  style,
}: {
  children: ReactNode;
  /** Tên của hàng, đọc lên cho người dùng trình đọc màn hình. */
  nhan: string;
  className?: string;
  /** Dùng để truyền biến CSS xuống, ví dụ hướng vào của cú đổi tab. */
  style?: CSSProperties;
}) {
  const ray = useRef<HTMLDivElement>(null);
  const khung = useRef(0);
  const [dauRay, setDauRay] = useState(true);
  const [cuoiRay, setCuoiRay] = useState(true);
  const reduced = useReducedMotion();

  const doNgay = useCallback(() => {
    const el = ray.current;
    if (!el) return;
    // Ngưỡng 8px chứ không 1px: ở chế độ lưới còn dư vài pixel do làm tròn, để 1px thì
    // hai nút vẫn được dựng ra rồi mới bị `xl:hidden` che — dựng thừa không lý do.
    const con = el.scrollWidth - el.clientWidth;
    setDauRay(el.scrollLeft <= 8);
    setCuoiRay(con <= 8 || el.scrollLeft >= con - 8);
  }, []);

  const doLai = useCallback(() => {
    if (khung.current) return;
    khung.current = requestAnimationFrame(() => {
      khung.current = 0;
      doNgay();
    });
  }, [doNgay]);

  useEffect(() => {
    doNgay();
    const el = ray.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(doNgay);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (khung.current) cancelAnimationFrame(khung.current);
    };
  }, [doNgay]);

  const day = (huong: number) => {
    const el = ray.current;
    if (!el || typeof el.scrollBy !== 'function') return;
    // Dịch theo bề rộng một thẻ cộng khoảng cách, đọc từ chính thẻ đầu.
    const buoc = (el.firstElementChild?.clientWidth ?? el.clientWidth * 0.8) + 24;
    el.scrollBy({ left: huong * buoc, behavior: reduced ? 'auto' : 'smooth' });
  };

  const conDuong = !dauRay || !cuoiRay;

  return (
    <div className="relative w-full">
      <div
        ref={ray}
        onScroll={doLai}
        style={style}
        tabIndex={0}
        role="group"
        aria-label={nhan}
        className={cn(
          'ln-shelf flex snap-x snap-mandatory gap-3xl overflow-x-auto overscroll-x-contain pb-xs',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
          // Từ xl thành lưới bốn cột như thiết kế; bỏ luôn việc cuộn và bám điểm.
          'xl:grid xl:grid-cols-4 xl:overflow-x-visible xl:pb-0 xl:[scroll-snap-type:none]',
          !dauRay && 'ln-shelf-mo-trai',
          className,
        )}
      >
        {children}
      </div>

      {/* Hai nút chỉ có ở khung hẹp — từ xl là lưới, không còn gì để dịch. Ẩn hẳn khi cả
          hàng đã vừa màn hình, chứ không để hai nút tắt tịt gây tưởng là lỗi. */}
      {conDuong ? (
        <div className="mt-lg flex items-center justify-end gap-md xl:hidden">
          <button
            type="button"
            onClick={() => day(-1)}
            disabled={dauRay}
            aria-label={`Xem thẻ trước trong ${nhan}`}
            className="ln-focus-flat flex h-11 w-11 items-center justify-center rounded-full bg-primary text-secondary shadow-xs-ring-primary transition-opacity disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => day(1)}
            disabled={cuoiRay}
            aria-label={`Xem thẻ sau trong ${nhan}`}
            className="ln-focus-flat flex h-11 w-11 items-center justify-center rounded-full bg-primary text-secondary shadow-xs-ring-primary transition-opacity disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
