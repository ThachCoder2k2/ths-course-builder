import { Bot } from 'lucide-react';

/**
 * Figma: `Chatbot AI` (node 211:9764) + tooltip (211:10281) — the assistant
 * button pinned top-right of the player frame (Frame 20 at x1832, y~104): a
 * 64px white circle (border, shadow-lg) with the bot glyph in brand, and a
 * dark "Course AI" chip beneath it.
 */
export default function FloatingChatbot() {
  return (
    <div className="fixed right-6 top-[104px] z-20 flex flex-col items-center gap-md">
      <button
        type="button"
        aria-label="Trợ lý AI"
        className="flex h-16 w-16 items-center justify-center rounded-full border border-primary bg-white text-brand-tertiary shadow-lg transition-transform hover:scale-105"
      >
        <Bot className="h-[42px] w-[42px]" aria-hidden="true" />
      </button>
      <span className="rounded-md bg-primary-solid px-md py-xs text-xs font-semibold text-white [background-color:#0A0D12]">
        Course AI
      </span>
    </div>
  );
}
