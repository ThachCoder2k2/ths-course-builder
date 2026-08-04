import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

export interface MetricInfo {
  /** what the metric shows */
  what: string;
  /** how it is measured */
  how: string;
  /** concise professional formula / rule */
  formula?: string;
}

/** A small "(i)" that explains a metric — what it shows, how it's measured, and its formula. */
export function InfoTip({ info, label }: { info: MetricInfo; label?: string }) {
  // hovered = pointer/focus over it; pinned = tapped/clicked open. Either shows it.
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;
  const ref = useRef<HTMLSpanElement>(null);

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
      {open ? (
        <span
          role="tooltip"
          className="dv-bubble absolute left-0 top-[calc(100%+8px)] z-40 w-[min(20rem,calc(100vw-2.5rem))] rounded-xl border border-secondary bg-primary p-lg text-left font-normal shadow-lg"
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
        </span>
      ) : null}
    </span>
  );
}
