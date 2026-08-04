import type { ReactNode } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import courseAi from '../../assets/icons/course-ai.svg';
import { cn } from '../../lib/cn';
import { useInView } from '../../lib/useInView';

/**
 * The "AI đánh giá" block that opens each section. Voice: a study-coach speaking
 * to "bạn" — neutral, specific, one practical next step. Not marketing copy.
 */
export function AiInsightCard({
  label = 'Nhận định',
  children,
  actions,
  highlight = false,
}: {
  label?: string;
  children: ReactNode;
  actions?: string[];
  highlight?: boolean;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className={cn(
        'dv-reveal relative overflow-hidden rounded-card border p-3xl',
        inView && 'dv-in',
        highlight ? 'border-transparent bg-[linear-gradient(120deg,#20447E_0%,#175CD3_100%)] text-white' : 'border-brand-200 bg-[linear-gradient(120deg,#F0F6FE_0%,#F4F3FF_100%)]',
      )}
    >
      <div className="flex items-start gap-xl">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', highlight ? 'bg-white/15' : 'bg-white shadow-xs')}>
          <img src={courseAi} alt="" className="h-6 w-6" />
        </span>
        <div className="flex min-w-0 flex-col gap-md">
          <div className="flex items-center gap-md">
            <span className={cn('text-sm font-semibold', highlight ? 'text-white' : 'text-primary')}>Course AI</span>
            <span className={cn('rounded-pill px-md py-xxs text-xs font-medium', highlight ? 'bg-white/15 text-white' : 'bg-white text-brand-secondary shadow-xs')}>{label}</span>
          </div>
          <p className={cn('text-md leading-relaxed', highlight ? 'text-white/90' : 'text-secondary')}>{children}</p>
          {actions && actions.length ? (
            <ul className="mt-xs flex flex-col gap-sm">
              {actions.map((a) => (
                <li key={a} className={cn('flex items-start gap-md text-sm font-medium', highlight ? 'text-white' : 'text-brand-secondary')}>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Small AI note tucked beside a chart. */
export function AiAnnotation({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-md rounded-lg border-l-2 border-brand-500 bg-accent-blue px-lg py-md">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-secondary" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-secondary">{children}</p>
    </div>
  );
}
