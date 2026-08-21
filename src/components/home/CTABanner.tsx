import { ArrowRight } from 'lucide-react';
import ctaIllustration from '../../assets/landing/cta-illustration.png';
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

  return (
    <section className="flex w-full flex-col items-center justify-center bg-primary">
      <div className="flex w-full flex-col items-start gap-4xl px-4 lg:px-6xl">
        <div
          ref={ref}
          className={cn(
            'flex w-full flex-wrap items-center gap-x-3xl gap-y-3xl rounded-2xl bg-[#FDF0E4] px-xl py-3xl sm:px-4xl lg:px-9xl',
            inView && 'ln-in',
          )}
        >
          <div className="flex min-w-[260px] flex-1 flex-col items-start gap-xl">
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
              </svg>
              <div className="flex justify-between text-xs font-medium text-tertiary">
                {STOPS.map((s, i) => (
                  <span key={s} className="ln-stop-label" style={{ animationDelay: `${320 + i * 200}ms` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="relative flex shrink-0 items-center justify-center gap-sm overflow-hidden rounded-md bg-button-secondary px-xl py-[10px] text-md font-semibold text-button-secondary-fg shadow-xs-ring-primary transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center px-xxs">
                Xây dựng chương trình cho tôi
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
              />
            </button>
          </div>

          <img
            src={ctaIllustration}
            alt=""
            className="ln-cta-art h-[152px] w-auto shrink-0 self-center sm:h-[188px]"
          />
        </div>
      </div>
    </section>
  );
}
