import { ArrowRight } from 'lucide-react';
import ctaIllustration from '../../assets/illustrations/cta-learning-path.svg';

/**
 * Figma: `CTA section` (node 179:5458) — 1920 × 208, full-bleed.
 * bg-primary wrapper; Container (179:5459) px-6xl; Content (179:5460) is a
 * bg-tertiary radius-2xl card, px-9xl py-4xl, wrapping with row-gap 32 /
 * column-gap 24, holding a flex-1 text block (Display sm/Semibold heading,
 * Text xl/Regular supporting copy, secondary button with the skeuomorphic
 * inner border) beside the 120px flaticon illustration (node 179:5464).
 *
 * Must be rendered OUTSIDE the page content container so it spans the viewport.
 */
export default function CTABanner() {
  return (
    <section className="flex w-full flex-col items-center justify-center bg-primary">
      <div className="flex w-full flex-col items-start gap-4xl px-6xl">
        <div className="flex w-full flex-wrap items-center gap-x-3xl gap-y-4xl rounded-2xl bg-tertiary px-9xl py-4xl">
          <div className="flex min-w-px flex-1 flex-col items-start gap-xl">
            <h2 className="w-full text-display-sm text-primary">
              Thiết kế lộ trình học cá nhân hoá dành cho bạn
            </h2>
            <p className="w-full text-xl text-tertiary">
              Hệ thống sẽ dựa theo nhu cầu của bạn, phân tích và xây dựng chương trình học được tổng
              hợp dành riêng phù hợp với bạn
            </p>

            <button
              type="button"
              className="relative flex shrink-0 items-center justify-center gap-sm overflow-hidden rounded-md bg-button-secondary px-xl py-[10px] text-md font-semibold text-button-secondary-fg shadow-xs-ring-primary"
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

          <img src={ctaIllustration} alt="" className="h-[120px] w-[120px] shrink-0" />
        </div>
      </div>
    </section>
  );
}
