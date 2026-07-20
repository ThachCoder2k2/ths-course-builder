import { Check } from 'lucide-react';

export default function LearnList({ points }: { points: string[] }) {
  return (
    <section>
      <h2 className="mb-4 text-h2 text-primary">Bạn sẽ học được gì?</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {points.map((point) => (
          <li key={point} className="flex gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-success-600" aria-hidden="true" />
            <span className="text-sm text-secondary">{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
