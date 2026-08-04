import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

export interface MetricInfo {
  /** what the metric shows */
  what: string;
  /** how it is measured */
  how: string;
  /** concise professional formula / rule */
  formula?: string;
}

interface Pos {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

/**
 * A small "(i)" that explains a metric. The popover is portalled to <body> and
 * positioned with viewport-clamped fixed coordinates, so it never clips or gets
 * trapped inside a card — flipping above the icon when there isn't room below.
 */
export function InfoTip({ info, label }: { info: MetricInfo; label?: string }) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const open = hovered || pinned;
  const ref = useRef<HTMLSpanElement>(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(304, vw - 24);
    const left = Math.min(Math.max(12, r.left), vw - width - 12);
    const spaceBelow = vh - r.bottom;
    if (spaceBelow < 240 && r.top > spaceBelow) {
      setPos({ left, width, bottom: vh - r.top + 8, maxHeight: r.top - 16 });
    } else {
      setPos({ left, width, top: r.bottom + 8, maxHeight: spaceBelow - 16 });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!pinned) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPinned(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinned(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pinned]);

  return (
    <span ref={ref} className="relative inline-flex" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        type="button"
        aria-label={label ? `Giải thích chỉ số: ${label}` : 'Giải thích chỉ số'}
        aria-expanded={open}
        onClick={() => setPinned((p) => !p)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-quaternary outline-none transition hover:text-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Info className="h-[15px] w-[15px]" aria-hidden="true" />
      </button>
      {open && pos && typeof document !== 'undefined'
        ? createPortal(
            <span
              role="tooltip"
              style={{ position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight }}
              className="dv-bubble dv-scroll z-[60] overflow-y-auto rounded-xl border border-secondary bg-primary p-lg text-left font-normal shadow-lg"
            >
              <span className="flex flex-col gap-md">
                <span className="flex flex-col gap-xxs">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-secondary">Thể hiện</span>
                  <span className="text-sm leading-relaxed text-secondary">{info.what}</span>
                </span>
                <span className="flex flex-col gap-xxs">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-secondary">Cách đo</span>
                  <span className="text-sm leading-relaxed text-secondary">{info.how}</span>
                </span>
                {info.formula ? (
                  <span className="flex flex-col gap-xxs">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-secondary">Công thức</span>
                    <span className="block overflow-x-auto rounded-md bg-secondary px-md py-xs font-mono text-xs leading-relaxed text-primary">{info.formula}</span>
                  </span>
                ) : null}
              </span>
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
