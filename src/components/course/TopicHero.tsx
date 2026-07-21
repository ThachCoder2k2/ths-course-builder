import type { Topic } from '../../mock/types';

/**
 * Figma: `Hero header section` (node 181:7288) — 424px.
 * A soft top-to-white gradient wash over a faint grid, py-9xl, centred. The
 * heading (Display xl 60/72, tracking-tight) reads "Chủ đề " in secondary with
 * the topic name in a purple→blue gradient; a Text xl description sits below,
 * max-w-768. The nav that Figma nests here is our shared PageShell chrome and
 * is not re-rendered.
 */
export default function TopicHero({ topic }: { topic: Topic }) {
  return (
    <section className="relative isolate flex w-full flex-col items-center overflow-hidden bg-gradient-to-b from-brand-50 to-white py-9xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(10,13,18,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,13,18,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(1000px_circle_at_center_top,black,transparent)]"
      />

      <div className="relative flex w-full max-w-content flex-col items-center gap-4xl px-8">
        <div className="flex w-full max-w-[1024px] flex-col items-center gap-3xl">
          <h1 className="w-full text-center text-display-xl text-secondary">
            Chủ đề{' '}
            <span className="bg-gradient-to-l from-[#6a11cb] to-[#2575fc] bg-clip-text text-transparent">
              {topic.title}
            </span>
          </h1>
          <p className="w-full max-w-width-xl text-center text-xl text-tertiary">
            {topic.description}
          </p>
        </div>
      </div>
    </section>
  );
}
