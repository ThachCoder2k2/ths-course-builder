import type { Topic } from '../../mock/types';
import heroBg from '../../assets/heroes/topic-hero.png';

/**
 * Figma: `Hero header section` (node 181:7288) — 424px.
 * A photographic soft-blue background (downloaded from the node) under a
 * transparent→white gradient (from ~2.8%) and a faint grid, py-9xl, centred.
 * The heading (Display xl 60/72, tracking-tight) reads "Chủ đề " in secondary
 * with the topic name in a purple→blue gradient; a Text xl description sits
 * below, max-w-768. The nav Figma nests here is our shared PageShell chrome.
 */
export default function TopicHero({ topic }: { topic: Topic }) {
  return (
    <section className="relative isolate -mt-[76px] flex w-full flex-col items-center overflow-hidden pb-9xl pt-[172px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* The blue wash lives at the image top; crop from the top, not centre. */}
        <img src={heroBg} alt="" className="h-full w-full object-cover object-top" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 2.77%, #FFFFFF 100%)' }}
        />
      </div>
      {/* Untitled UI grid pattern — 96px cells, masked to the top centre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(10,13,18,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,13,18,0.05)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(1200px_circle_at_center_top,black,transparent)]"
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
