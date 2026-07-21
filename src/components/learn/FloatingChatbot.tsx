import { useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import botGlyph from '../../assets/icons/course-ai.svg';

/**
 * Figma: `Chatbot AI` (node 211:9764) + tooltip (211:10281).
 * A 64px white circle with the downloaded bot glyph. The "Course AI" chip is
 * a hover tooltip, and the button is draggable anywhere in the viewport —
 * a pointer release without movement counts as a click and opens the panel.
 */
const SIZE = 64;
const CLICK_SLOP = 5;

export default function FloatingChatbot({ onOpen }: { onOpen: () => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, startX: e.clientX, startY: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < CLICK_SLOP) return;
    d.moved = true;
    setDragging(true);
    setPos({
      x: Math.min(Math.max(e.clientX - d.dx, 0), window.innerWidth - SIZE),
      y: Math.min(Math.max(e.clientY - d.dy, 0), window.innerHeight - SIZE),
    });
  };

  const onPointerUp = () => {
    const wasClick = drag.current && !drag.current.moved;
    drag.current = null;
    setDragging(false);
    if (wasClick) onOpen();
  };

  return (
    <div
      className={cn('fixed z-20', pos ? '' : 'right-6 top-[104px]')}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
    >
      <button
        type="button"
        aria-label="Mở Course AI"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={cn(
          'group relative flex h-16 w-16 touch-none items-center justify-center rounded-full border border-primary bg-white shadow-lg',
          dragging ? 'cursor-grabbing' : 'cursor-grab transition-transform hover:scale-105',
        )}
      >
        <img src={botGlyph} alt="" className="pointer-events-none h-[42px] w-[42px]" />
        {/* Figma tooltip 211:10281 — hover only. */}
        <span
          className={cn(
            'pointer-events-none absolute left-1/2 top-full mt-md -translate-x-1/2 whitespace-nowrap rounded-md px-md py-xs text-xs font-semibold text-white opacity-0 transition-opacity [background-color:#0A0D12]',
            !dragging && 'group-hover:opacity-100',
          )}
        >
          Course AI
        </span>
      </button>
    </div>
  );
}
