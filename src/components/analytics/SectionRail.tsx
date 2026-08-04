import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface RailSection {
  id: string;
  label: string;
  Icon: LucideIcon;
}

/** Scrollspy navigation: a sticky vertical rail on desktop, a sticky chip scroller on mobile. */
export function SectionRail({
  sections,
  activeId,
  onJump,
  variant,
}: {
  sections: RailSection[];
  activeId: string;
  onJump: (id: string) => void;
  variant: 'desktop' | 'mobile';
}) {
  if (variant === 'desktop') {
    return (
      <nav aria-label="Mục lục bảng phân tích" className="sticky top-28 hidden h-fit w-[196px] shrink-0 flex-col gap-xxs lg:flex">
        <span className="px-lg pb-xs text-xs font-semibold uppercase tracking-wide text-quaternary">Bảng phân tích</span>
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onJump(s.id)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'flex items-center gap-md rounded-md px-lg py-md text-sm transition',
                active ? 'bg-brand-50 font-semibold text-brand-secondary' : 'text-tertiary hover:bg-secondary hover:text-secondary',
              )}
            >
              <s.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate">{s.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Mục lục bảng phân tích"
      className="sticky top-[76px] z-30 -mx-4 mb-xl flex gap-xs overflow-x-auto border-b border-secondary bg-white/90 px-4 py-md backdrop-blur lg:hidden"
    >
      {sections.map((s) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onJump(s.id)}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-xs rounded-pill border px-lg py-xs text-sm transition',
              active ? 'border-brand bg-brand-50 font-semibold text-brand-secondary' : 'border-secondary text-tertiary',
            )}
          >
            <s.Icon className="h-4 w-4" aria-hidden="true" />
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
