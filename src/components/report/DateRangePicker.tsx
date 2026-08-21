import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dmy = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

/** Lưới sáu tuần của một tháng, bắt đầu từ thứ Hai; ngày của tháng khác vẫn hiện nhưng để mờ. */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // T2 = 0
  const start = new Date(year, month, 1 - lead);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

interface MonthProps {
  year: number;
  month: number;
  from: Date | null;
  to: Date | null;
  hover: Date | null;
  min: Date;
  max: Date;
  onPick: (d: Date) => void;
  onHover: (d: Date | null) => void;
}

function MonthView({ year, month, from, to, hover, min, max, onPick, onHover }: MonthProps) {
  const days = useMemo(() => monthGrid(year, month), [year, month]);
  // Khi mới chọn được đầu khoảng, dùng ngày đang trỏ chuột làm cuối tạm để người dùng
  // thấy trước khoảng mình sắp chọn.
  const end = to ?? (from && hover && hover.getTime() > from.getTime() ? hover : null);

  const state = (d: Date) => {
    if (!from) return 'none' as const;
    const t = midnight(d).getTime();
    const a = midnight(from).getTime();
    const b = end ? midnight(end).getTime() : a;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (t < lo || t > hi) return 'none' as const;
    if (t === lo && t === hi) return 'single' as const;
    if (t === lo) return 'start' as const;
    if (t === hi) return 'end' as const;
    return 'mid' as const;
  };

  return (
    <div className="flex min-w-[252px] flex-1 flex-col gap-lg">
      <div className="text-center text-sm font-semibold text-primary">
        tháng {month + 1} / {year}
      </div>
      <div className="grid grid-cols-7 gap-y-xxs">
        {WEEKDAYS.map((w) => (
          <div key={w} className="flex h-9 items-center justify-center text-xs font-medium text-tertiary">
            {w}
          </div>
        ))}
        {days.map((d, i) => {
          const outside = d.getMonth() !== month;
          const disabled = d.getTime() < midnight(min).getTime() || d.getTime() > midnight(max).getTime();
          const st = state(d);
          const selected = st === 'start' || st === 'end' || st === 'single';
          // Bo tròn ở hai đầu khoảng và ở hai đầu mỗi hàng tuần, để dải chọn đọc thành
          // từng vệt liền mạch theo tuần thay vì một khối vuông chạy tràn qua các hàng.
          const col = i % 7;
          const band = st !== 'none';
          const roundL = band && (st === 'start' || st === 'single' || col === 0);
          const roundR = band && (st === 'end' || st === 'single' || col === 6);
          return (
            <div
              key={d.toISOString()}
              className={cn(
                'flex h-9 items-center justify-center',
                band && 'bg-utility-brand-50',
                roundL && 'rounded-l-full',
                roundR && 'rounded-r-full',
              )}
            >
              {/* Ngày của tháng khác vẫn hiện cho lịch liền mạch, nhưng không bấm được: nó
                  xuất hiện ở cả hai bảng nên để bấm thì cùng một ngày có hai chỗ chọn. */}
              {outside ? (
                <span className="flex h-9 w-9 items-center justify-center text-sm tabular-nums text-fg-quinary" aria-hidden="true">
                  {d.getDate()}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(d)}
                  onMouseEnter={() => onHover(d)}
                  onMouseLeave={() => onHover(null)}
                  aria-label={dmy(d)}
                  aria-pressed={selected}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums text-secondary transition',
                    disabled && 'cursor-not-allowed opacity-40',
                    !disabled && !selected && 'hover:bg-tertiary',
                    selected && 'bg-brand-500 font-semibold text-white',
                  )}
                >
                  {d.getDate()}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Chọn khoảng thời gian bằng lịch hai tháng: bấm ngày đầu, rồi bấm ngày cuối. Khoảng
 * đang chọn được tô liền một dải, hai đầu bo tròn. Chỉ khi bấm "Xác nhận" thì báo cáo
 * mới tính lại — nhờ vậy đang chọn dở dang không làm cả trang nhảy số.
 */
export function DateRangePicker({
  from,
  to,
  min,
  max,
  label,
  onApply,
}: {
  from: Date;
  to: Date;
  min: Date;
  max: Date;
  /** chữ hiện trên nút — trang tự quyết định cách đọc khoảng đang chọn */
  label: string;
  onApply: (from: Date, to: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState<Date | null>(from);
  const [draftTo, setDraftTo] = useState<Date | null>(to);
  const [hover, setHover] = useState<Date | null>(null);
  const [anchor, setAnchor] = useState(() => new Date(to.getFullYear(), to.getMonth() - 1, 1));
  const box = useRef<HTMLDivElement>(null);

  // Mở lại thì bắt đầu từ đúng khoảng đang áp dụng, không giữ lựa chọn dở của lần trước.
  useEffect(() => {
    if (!open) return;
    setDraftFrom(from);
    setDraftTo(to);
    setHover(null);
    setAnchor(new Date(to.getFullYear(), to.getMonth() - 1, 1));
  }, [open, from, to]);

  // Bấm ra ngoài hoặc bấm Esc thì đóng và bỏ lựa chọn dở.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (d: Date) => {
    const day = midnight(d);
    if (!draftFrom || draftTo) {
      setDraftFrom(day);
      setDraftTo(null);
      return;
    }
    if (day.getTime() < draftFrom.getTime()) {
      setDraftTo(draftFrom);
      setDraftFrom(day);
      return;
    }
    setDraftTo(day);
  };

  const ready = draftFrom !== null && draftTo !== null;
  const draftLabel = draftFrom ? `${dmy(draftFrom)}${draftTo ? ` – ${dmy(draftTo)}` : ' – …'}` : '';

  const second = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  const canPrev = new Date(anchor.getFullYear(), anchor.getMonth(), 1).getTime() > midnight(min).getTime();
  const canNext = second.getTime() < new Date(max.getFullYear(), max.getMonth(), 1).getTime();

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Khoảng thời gian: ${label}. Bấm để chọn khoảng khác`}
        className="flex h-10 items-center gap-xs rounded-md bg-primary px-[14px] text-sm font-semibold text-secondary shadow-xs ring-1 ring-primary transition hover:bg-secondary"
      >
        <Calendar className="h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
        <span className="whitespace-nowrap px-xxs">{label}</span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-secondary transition-transform duration-200', open && '-rotate-180')} aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Chọn khoảng thời gian"
          className="absolute right-0 z-40 mt-md flex w-[min(92vw,600px)] flex-col gap-2xl rounded-xl bg-primary p-2xl shadow-lg ring-1 ring-secondary"
        >
          <div className="flex items-center justify-between gap-md">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}
              aria-label="Tháng trước"
              className="flex h-9 w-9 items-center justify-center rounded-md text-secondary ring-1 ring-primary transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-xs text-tertiary">Bấm ngày bắt đầu rồi bấm ngày kết thúc</span>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}
              aria-label="Tháng sau"
              className="flex h-9 w-9 items-center justify-center rounded-md text-secondary ring-1 ring-primary transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-3xl sm:flex-row">
            <MonthView
              year={anchor.getFullYear()}
              month={anchor.getMonth()}
              from={draftFrom}
              to={draftTo}
              hover={hover}
              min={min}
              max={max}
              onPick={pick}
              onHover={setHover}
            />
            <MonthView
              year={second.getFullYear()}
              month={second.getMonth()}
              from={draftFrom}
              to={draftTo}
              hover={hover}
              min={min}
              max={max}
              onPick={pick}
              onHover={setHover}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-lg border-t border-secondary pt-xl">
            <span className="inline-flex items-center rounded-md bg-secondary px-lg py-md text-sm font-medium tabular-nums text-secondary ring-1 ring-secondary">
              {draftLabel || 'Chưa chọn ngày nào'}
            </span>
            <span className="flex gap-lg">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-btn bg-primary px-xl py-md text-sm font-semibold text-secondary shadow-xs ring-1 ring-primary transition hover:bg-secondary"
              >
                Huỷ
              </button>
              <button
                type="button"
                disabled={!ready}
                onClick={() => {
                  if (!draftFrom || !draftTo) return;
                  onApply(draftFrom, draftTo);
                  setOpen(false);
                }}
                className="rounded-btn bg-button-primary px-xl py-md text-sm font-semibold text-white shadow-xs transition hover:opacity-90 disabled:opacity-40"
              >
                Xác nhận
              </button>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
