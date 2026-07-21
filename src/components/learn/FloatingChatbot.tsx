import { Bot } from 'lucide-react';

/**
 * Figma: `Chatbot AI` (node 211:9764) — the floating assistant button pinned to
 * the player's bottom-right. A 64px white circle (border-primary, shadow-lg)
 * holding a bot glyph. Figma uses a custom robot illustration; a lucide Bot in
 * brand stands in for it.
 */
export default function FloatingChatbot() {
  return (
    <button
      type="button"
      aria-label="Trợ lý AI"
      className="fixed bottom-8 right-8 z-20 flex h-16 w-16 items-center justify-center rounded-full border border-primary bg-white text-brand-tertiary shadow-lg transition-transform hover:scale-105"
    >
      <Bot className="h-[42px] w-[42px]" aria-hidden="true" />
    </button>
  );
}
