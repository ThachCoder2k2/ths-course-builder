import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ctaIllustration from '../../assets/landing/cta-illustration.png';
import ctaHover from '../../assets/landing/cta-illustration-hover.png';
import { useInView } from '../ui/Reveal';
import { cn } from '../../lib/cn';

/** Ba chặng của lộ trình, đúng thứ tự mà câu bên trên hứa. */
const STOPS = ['Chọn chủ đề', 'Đo trình độ', 'Nhận lộ trình'];

/**
 * Khối mời xây lộ trình học. Nền đào ấm và tranh cậu bé đọc sách lấy từ thiết kế
 * (Figma node 550:11507).
 *
 * Đây là khoảnh khắc chuyển động chính của trang: khi cuộn tới, một đường nét tự vẽ từ
 * trái sang, đi qua ba chặng rồi dừng ở tranh minh hoạ. Nó nói đúng thứ mà khối này hứa —
 * một lộ trình được dựng dần — nên chuyển động ở đây mang nghĩa, không phải trang trí.
 */
export default function CTABanner() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [trongTam, setTrongTam] = useState(false);

  /**
   * `useInView` chỉ bắn một lần rồi ngắt, vì nó lo lượt hiện-khi-cuộn-tới. Chấm sáng thì
   * lặp vô hạn nên cần biết KHỐI CÒN TRÊN MÀN HAY KHÔNG, liên tục — cuộn qua rồi là dừng.
   * Dùng animation-play-state chứ không bỏ animation, để cuộn quay lại không phải chờ
   * lại một giây trễ ban đầu.
   */
  useEffect(() => {
    // Quan sát chính phần tử mà `useInView` đã gắn ref vào — khỏi cần ref thứ hai.
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setTrongTam(true);
      return;
    }
    const io = new IntersectionObserver((es) => setTrongTam(es.some((e) => e.isIntersecting)), {
      rootMargin: '0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return (
    <section className="flex w-full flex-col items-center justify-center bg-primary">
      <div className="flex w-full flex-col items-start gap-4xl px-4 lg:px-6xl">
        <div
          ref={ref}
          className={cn(
            'flex w-full flex-wrap items-center gap-x-3xl gap-y-3xl rounded-2xl bg-[#FDF0E4] px-xl py-3xl sm:px-4xl lg:px-9xl',
            inView && 'ln-in',
            trongTam && 'ln-run',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col items-start gap-xl sm:min-w-[260px]">
            <h2 className="w-full text-display-sm text-primary">
              Thiết kế lộ trình học cá nhân hoá dành cho bạn
            </h2>
            <p className="w-full text-lg text-tertiary">
              Hệ thống sẽ dựa theo nhu cầu của bạn, phân tích và xây dựng chương trình học được tổng
              hợp dành riêng phù hợp với bạn
            </p>

            {/* Lộ trình tự vẽ: đường nền mờ vẽ trước, ba chặng hiện theo sau */}
            <div className="w-full max-w-[420px]" aria-hidden="true">
              <svg viewBox="0 0 420 44" className="h-auto w-full" role="presentation">
                <path
                  d="M8 30 C 90 30, 90 14, 172 14 S 254 30, 336 30 L 412 30"
                  fill="none"
                  stroke="#F0C9A6"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <path
                  className="ln-path"
                  d="M8 30 C 90 30, 90 14, 172 14 S 254 30, 336 30 L 412 30"
                  pathLength={1}
                  fill="none"
                  stroke="#E9772C"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {[
                  { x: 8, y: 30 },
                  { x: 172, y: 14 },
                  { x: 336, y: 30 },
                ].map((p, i) => (
                  <circle
                    key={p.x}
                    className="ln-stop"
                    style={{ animationDelay: `${260 + i * 200}ms` }}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill="#E9772C"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                ))}

                {/*
                  Chấm sáng chạy lại đúng ba bước mà khối này bán: Chọn chủ đề → Đo trình
                  độ → Nhận lộ trình, cùng hướng trái sang phải với hướng đọc. Nó vá đúng
                  chỗ chết nặng nhất của trang: sau lần cuộn đầu, khối bán hàng chính
                  không còn động một pixel nào, vì đường đã vẽ xong và không chạy lại.

                  Mười mốc trong keyframes lấy trên chính đường cong này, chia theo độ dài
                  cung chứ không theo tham số Bézier — chia theo tham số thì chấm nhanh
                  chậm bất thường ở khúc uốn. Không quầng sáng, không filter: một element,
                  transform và opacity, hết.
                */}
                <circle className="ln-spark" r={3} cx={0} cy={0} fill="#E9772C" />
              </svg>
              <div className="flex justify-between text-xs font-medium text-tertiary">
                {STOPS.map((s, i) => (
                  <span key={s} className="ln-stop-label" style={{ animationDelay: `${320 + i * 200}ms` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Trước đây là `<button>` không có onClick — bấm vào đứng yên. "Xây dựng
                chương trình" thì bước đầu là chọn khoá, nên đích là trang tìm kiếm. */}
            <Link
              to="/tim-kiem"
              className="ln-press ln-focus-flat relative flex shrink-0 items-center justify-center gap-sm overflow-hidden rounded-md bg-button-secondary px-xl py-[10px] text-md font-semibold text-button-secondary-fg shadow-xs-ring-primary"
            >
              <span className="flex items-center justify-center px-xxs">
                Xây dựng chương trình cho tôi
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
              />
            </Link>
          </div>

          {/*
            Hover cậu bé đọc sách — animation thứ hai mà file Figma quy định
            (node 484:18297 → 484:18299, ON_HOVER, SMART_ANIMATE, EASE_OUT, 150ms).

            Đo hai bản vẽ thì thấy quyển sách cam đúng 120.7 × 109.3 ở bản thường và
            121.0 × 109.3 ở bản hover — tức CẬU BÉ KHÔNG TO LÊN. Khung phình 220×188 lên
            240×218.7 là vì các vạch chuyển động quanh người toả rộng ra. Nên đây không
            phải cú phóng: hai bản vẽ đổi cho nhau, canh theo quyển sách để cậu bé đứng im
            còn các vạch nở ra. Bản hover lệch (−9, −30.67) so với gốc bản thường, quy ra
            phần trăm của khung để đúng ở cả hai cỡ 152px và 188px.
          */}
          <div className="ln-cta-figure relative aspect-[220/188] h-[152px] shrink-0 self-center sm:h-[188px]">
            <img
              src={ctaIllustration}
              alt=""
              className="ln-cta-art ln-cta-rest absolute inset-0 h-full w-full object-contain"
            />
            <img
              src={ctaHover}
              alt=""
              aria-hidden="true"
              className="ln-cta-peak absolute max-w-none"
              style={{ left: '-4.09%', top: '-16.31%', width: '109.09%', height: '116.31%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
