import { Check } from 'lucide-react';

/**
 * Figma: `Section` (node 182:11941) — "Bạn sẽ học được gì?".
 * Display xs heading over a wrapping grid of `_Feature text` items (gap 32row /
 * 64col, each flex-1 min-w-320): a 24px brand check beside a Text xl/Semibold
 * outcome. Figma pairs each with a Text md description; the mock carries only
 * the outcome string, so no description is rendered.
 */
export default function LearnList({ points }: { points: string[] }) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <h2 className="w-full text-display-xs text-primary">Bạn sẽ học được gì?</h2>

      <div className="flex w-full max-w-content flex-wrap items-start gap-x-7xl gap-y-4xl">
        {points.map((point) => (
          <div key={point} className="flex min-w-[320px] flex-1 flex-col items-start gap-2xl">
            <div className="flex w-full items-center gap-md">
              <Check className="h-6 w-6 shrink-0 text-brand-tertiary" aria-hidden="true" />
              <p className="text-xl font-semibold text-primary">{point}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
