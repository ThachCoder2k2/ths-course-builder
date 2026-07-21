/**
 * Embeds a self-contained interactive course module (served from
 * `public/courses/*.html`) full-bleed in the learn page, in place of the video
 * player. The module drives its own board, chapter nav and progress; `step`
 * deep-links straight to a given lesson via the `?step=N` query the modules
 * were patched to read. `key` on the iframe forces a reload when the target
 * changes so sidebar navigation lands on the right lesson.
 */
export default function CourseEmbed({
  src,
  step,
  title,
}: {
  src: string;
  step: number;
  title: string;
}) {
  const url = step > 0 ? `${src}?step=${step}` : src;
  return (
    <iframe
      key={url}
      src={url}
      title={title}
      className="min-h-0 w-full flex-1 border-0 bg-primary"
      allow="fullscreen"
    />
  );
}
