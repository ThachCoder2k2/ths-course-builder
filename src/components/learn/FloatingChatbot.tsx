import botGlyph from '../../assets/icons/course-ai.svg';

/**
 * Figma: `Chatbot AI` (node 211:9764) + tooltip (211:10281) — the assistant
 * button pinned top-right of the player frame: a 64px white circle (border,
 * shadow-lg) holding the downloaded bot glyph, with a dark "Course AI" chip
 * beneath. Clicking it opens the Course AI side panel (node 211:10427).
 */
export default function FloatingChatbot({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fixed right-6 top-[104px] z-20 flex flex-col items-center gap-md">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Mở Course AI"
        className="flex h-16 w-16 items-center justify-center rounded-full border border-primary bg-white shadow-lg transition-transform hover:scale-105"
      >
        {/* Figma: 42px glyph inside the 64px circle. */}
        <img src={botGlyph} alt="" className="h-[42px] w-[42px]" />
      </button>
      <span className="rounded-md px-md py-xs text-xs font-semibold text-white [background-color:#0A0D12]">
        Course AI
      </span>
    </div>
  );
}
