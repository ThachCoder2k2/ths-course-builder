import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import courseAi from '../../assets/icons/course-ai.svg';

export interface CompanionProps {
  label: string;
  message: string;
  tour: boolean;
  tourIndex: number;
  tourTotal: number;
  onStartTour: () => void;
  onTourNext: () => void;
  onTourPrev: () => void;
  onTourExit: () => void;
}

/**
 * Floating Course AI. Shows a contextual note for whatever section is in view,
 * and a "Hướng dẫn tôi" guided tour that walks the learner through the dashboard.
 */
export function AiCompanion({ label, message, tour, tourIndex, tourTotal, onStartTour, onTourNext, onTourPrev, onTourExit }: CompanionProps) {
  // Default expanded on desktop, collapsed to a FAB on mobile so it never covers the last section.
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 1024);
  const expanded = open || tour;

  if (!expanded) {
    return (
      <button
        type="button"
        aria-label="Mở Course AI"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-button-primary shadow-lg transition hover:opacity-90"
      >
        <img src={courseAi} alt="" className="h-7 w-7 brightness-0 invert" />
        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#17B26A] ring-2 ring-white" />
      </button>
    );
  }

  const isLast = tourIndex + 1 >= tourTotal;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-2.5rem))]">
      <div className="overflow-hidden rounded-2xl border border-secondary bg-primary shadow-lg">
        <div className="flex items-center gap-md border-b border-secondary px-xl py-lg">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <img src={courseAi} alt="" className="h-6 w-6" />
            <span className="absolute bottom-0 right-0 h-[9px] w-[9px] rounded-full border-[1.5px] border-white bg-[#17B26A]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-semibold text-primary">Course AI</span>
            <span className="truncate text-xs text-tertiary">{tour ? `Đang hướng dẫn · ${tourIndex + 1}/${tourTotal}` : label}</span>
          </div>
          {!tour ? (
            <button type="button" aria-label="Thu nhỏ" onClick={() => setOpen(false)} className="rounded-md p-xs text-quaternary hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="px-xl py-lg">
          <p key={message} className="dv-bubble text-sm leading-relaxed text-secondary">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-md border-t border-secondary px-xl py-md">
          {tour ? (
            <>
              <button
                type="button"
                onClick={onTourPrev}
                disabled={tourIndex === 0}
                className="flex items-center gap-xxs rounded-md px-md py-md text-sm font-medium text-secondary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              <button
                type="button"
                onClick={onTourNext}
                className="flex flex-1 items-center justify-center gap-xxs rounded-md bg-button-primary px-lg py-md text-sm font-semibold text-white hover:opacity-90"
              >
                {isLast ? 'Xong' : 'Tiếp'}
                {!isLast ? <ChevronRight className="h-4 w-4" /> : null}
              </button>
              <button type="button" onClick={onTourExit} className="rounded-md px-md py-md text-sm font-medium text-tertiary hover:bg-secondary">
                Thoát
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartTour}
              className="flex w-full items-center justify-center gap-xs rounded-md bg-button-primary px-lg py-md text-sm font-semibold text-white hover:opacity-90"
            >
              <Play className="h-4 w-4" /> Hướng dẫn tôi một vòng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
