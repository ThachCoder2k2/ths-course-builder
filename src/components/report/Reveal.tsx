import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { prefersReducedMotion } from '../../lib/motion';

/**
 * Báo một phần tử đã lọt vào khung nhìn — chỉ báo một lần rồi thôi, để nội dung
 * không nhấp nháy mỗi lần cuộn qua cuộn lại.
 */
export function useInView<T extends HTMLElement>(): { ref: React.RefObject<T>; inView: boolean } {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}

/**
 * Thẻ trôi lên nhẹ khi cuộn tới. Chỉ dùng opacity và transform nên không gây giật
 * layout; `order` làm các thẻ trong cùng một hàng lần lượt hiện ra thay vì bật cùng lúc.
 */
export function Reveal({ children, order = 0, className }: { children: ReactNode; order?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn('rp-reveal min-w-0', inView && 'rp-in', className)}
      style={{ transitionDelay: `${Math.min(order, 4) * 45}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Số đếm lên tới giá trị thật. Chỉ dùng cho ba con số đầu trang — đó là chỗ mắt người
 * xem dừng lại đầu tiên; đếm ở mọi con số trên trang thì thành nhiễu.
 */
export function CountUp({ to, decimals = 0, suffix = '', duration = 620 }: { to: number; decimals?: number; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? to : 0));

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setShown(to);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      // ease-out: nhanh lúc đầu, dịu lại lúc cuối
      setShown(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}
