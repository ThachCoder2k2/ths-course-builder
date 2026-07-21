import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import banner1 from '../../assets/banners/banner-1.png';
import banner2 from '../../assets/banners/banner-2.png';

/**
 * Figma: `Banner` (node 177:2985) — 1920 × 404, full-bleed.
 * gap-xl column, px-6xl pt-6xl pb-3xl. The track (node 177:3688) is a gap-xl
 * row of three 800 × 308 slides (radius-42, px-7xl py-6xl) that overflows the
 * frame, with a 152px Pagination dot group (node 177:3006) below — three
 * flex-1 8px pills, active in fg-brand-primary_alt, rest bg-quaternary.
 *
 * Each slide stacks a Display md/Bold heading directly above Text xl/Regular
 * body (no gap), then a small secondary button. Slides 1 and 2 are backed by
 * photography; slide 3 by a 158.94deg grey gradient.
 *
 * Must be rendered OUTSIDE the page content container so it spans the viewport.
 */
const HEADING = 'IEE: Đột phá vật liệu Graphene mở đường cho chip THz';
const BODY =
  'Khoá học ngoài chương trình chính quy về công nghệ lõi, tư duy hùng biện và chiến thuật trí tuệ giúp bứt phá năng lực bản thân';

interface Slide {
  id: string;
  image?: string;
  /** Inline background for the slide that carries no photography. */
  background?: string;
  headingClass: string;
  cta: string;
  ctaClass: string;
}

const SLIDES: Slide[] = [
  {
    id: 'graphene-1',
    image: banner1,
    // Gradient/Brand/900 -> 700 (45deg), painted through the heading glyphs.
    headingClass: 'bg-[linear-gradient(45deg,#20447E,#175CD3)] bg-clip-text text-transparent',
    cta: 'Bắt đầu',
    ctaClass: 'shadow-xs-ring-brand text-brand-secondary',
  },
  {
    id: 'graphene-2',
    image: banner2,
    headingClass: 'text-orange-dark-900',
    cta: 'Khám phá ngay',
    ctaClass: 'shadow-xs-ring-primary text-button-secondary-fg',
  },
  {
    id: 'graphene-3',
    background: 'linear-gradient(158.94deg, #F5F7FA 0%, #C3CFE2 100%)',
    headingClass: 'text-secondary',
    cta: 'Khám phá ngay',
    ctaClass: 'shadow-xs-ring-primary text-button-secondary-fg',
  },
];

const SLIDE_STRIDE = 816; // 800px slide + 16px gap

export default function DashboardBanner() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative isolate flex w-full flex-col items-start gap-xl overflow-hidden bg-primary px-6xl pb-3xl pt-6xl">
      <div className="w-full">
        <div
          className="flex items-start gap-xl transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${active * SLIDE_STRIDE}px)` }}
        >
          {SLIDES.map((slide) => (
            <article
              key={slide.id}
              className="relative flex w-[800px] shrink-0 flex-col items-start justify-center overflow-hidden rounded-[42px] px-7xl py-6xl"
              style={slide.background ? { backgroundImage: slide.background } : undefined}
            >
              {slide.image ? (
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}

              <div className="relative flex w-full items-center gap-4xl">
                <div className="flex min-w-px flex-1 flex-col items-start gap-3xl">
                  <div className="flex w-full flex-col items-start">
                    <h2 className={cn('w-full text-display-md font-bold', slide.headingClass)}>
                      {HEADING}
                    </h2>
                    <p className="w-full text-xl text-secondary">{BODY}</p>
                  </div>

                  <button
                    type="button"
                    className={cn(
                      'relative flex shrink-0 items-center justify-center gap-xs overflow-hidden rounded-md bg-button-secondary px-[14px] py-[10px] text-sm font-semibold',
                      slide.ctaClass,
                    )}
                  >
                    <span className="flex items-center justify-center px-xxs">{slide.cta}</span>
                    <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
                    />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex w-[152px] items-center justify-center gap-xl">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Chuyển tới banner ${index + 1}`}
            aria-current={index === active}
            className={cn(
              'h-2 min-w-px flex-1 rounded-full transition-colors',
              index === active ? 'bg-brand-500' : 'bg-quaternary',
            )}
          />
        ))}
      </div>
    </section>
  );
}
