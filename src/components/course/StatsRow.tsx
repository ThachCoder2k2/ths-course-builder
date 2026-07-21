import { LEVEL_LABEL, type Course } from '../../mock/types';

/**
 * Figma: `Container` (node 184:4582) — the floating metric card that overlaps
 * the hero's lower edge. bg-secondary, radius-2xl, px-7xl py-xl, wrapping with
 * 64px row / 32px column gaps. Three flex-1 metric items (a 4th is hidden in
 * Figma): a Display xl number in brand-tertiary_alt over a Text lg/Semibold
 * label. Container inset px-8 (container-padding-desktop).
 */
export default function StatsRow({ course }: { course: Course }) {
  const metrics = [
    { value: course.rating.toFixed(1), label: 'Đánh giá cho khoá học' },
    { value: LEVEL_LABEL[course.level], label: 'Trình độ của khoá học' },
    { value: course.durationHours + 'h', label: 'Thời gian ước tính hoàn thành' },
  ];

  return (
    <div className="px-4xl">
      <dl className="flex w-full flex-wrap items-start justify-center gap-x-4xl gap-y-7xl rounded-2xl bg-secondary px-7xl py-xl">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex min-w-[240px] flex-1 flex-col items-center gap-2xl"
          >
            <div className="flex w-full flex-col items-center gap-lg">
              <dd className="w-full text-center text-display-xl text-brand-tertiary">
                {metric.value}
              </dd>
              <dt className="w-full text-center text-lg font-semibold text-primary">
                {metric.label}
              </dt>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
