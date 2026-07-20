import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * Figma: `_Dropdown header navigation trigger` (node 182:11792).
 * Label is Text md/Semibold in button-tertiary-fg, followed by a 20px chevron-down.
 */
export default function NavDropdown({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-xs text-md font-semibold text-button-tertiary-fg"
      >
        {label}
        <ChevronDown className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+12px)] z-50 min-w-[240px] rounded-xl border border-secondary bg-primary p-md shadow-sm"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
