import type { Topic } from '../../mock/types';

export default function TopicHero({ topic, courseCount }: { topic: Topic; courseCount: number }) {
  return (
    <section className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-tertiary">Chủ đề</p>
      <h1 className="mt-3 text-display-sm text-primary sm:text-display-lg">
        Chủ đề <span className="text-brand-600">{topic.title}</span>
      </h1>
      <p className="mt-4 text-tertiary">{topic.description}</p>
      <p className="mt-4 text-sm font-semibold text-secondary">{courseCount} khoá học</p>
    </section>
  );
}
