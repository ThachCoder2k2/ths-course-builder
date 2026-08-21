import { cn } from '../../lib/cn';
import { DateRangePicker } from './DateRangePicker';

/** Các mốc thời gian xem báo cáo. `custom` mở lịch chọn khoảng ngày. */
export type RangeKey = 'all' | 'custom' | 'year' | 'month' | 'week' | 'day';

export const RANGE_TABS: { key: RangeKey; label: string; days: number }[] = [
  { key: 'all', label: 'Tất cả', days: Number.POSITIVE_INFINITY },
  { key: 'custom', label: 'Tuỳ chỉnh', days: 30 },
  { key: 'year', label: '12 tháng', days: 365 },
  { key: 'month', label: '30 ngày', days: 30 },
  { key: 'week', label: '7 ngày', days: 7 },
  { key: 'day', label: '24 giờ', days: 1 },
];

/**
 * Chọn khoảng thời gian: bốn mốc sẵn bên trái, nút mở lịch bên phải. Nút lịch luôn bấm
 * được và luôn hiện đúng khoảng đang xem — chọn một khoảng riêng trong lịch thì tab tự
 * nhảy về "Tuỳ chỉnh", nên hai bên không bao giờ nói hai chuyện khác nhau.
 */
export function RangeTabs({
  value,
  onChange,
  from,
  to,
  min,
  max,
  onApplyCustom,
  rangeLabel,
}: {
  value: RangeKey;
  onChange: (key: RangeKey) => void;
  from: Date;
  to: Date;
  min: Date;
  max: Date;
  onApplyCustom: (from: Date, to: Date) => void;
  rangeLabel: string;
}) {
  return (
    <div className="flex flex-col gap-lg lg:flex-row lg:items-center lg:justify-between">
      {/* Xuống dòng khi hẹp, không cuộn ngang: dải sáu mốc mà phải kéo mới thấy hết thì
          người dùng dễ tưởng chỉ có bốn mốc. */}
      <div className="inline-flex flex-wrap gap-xxs rounded-md bg-secondary p-0 ring-1 ring-secondary" role="tablist" aria-label="Khoảng thời gian">
          {RANGE_TABS.map((t) => {
            const active = t.key === value;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(t.key)}
                className={cn(
                  'whitespace-nowrap rounded-md px-lg py-md text-sm font-semibold transition',
                  active ? 'bg-primary text-secondary shadow-xs ring-1 ring-primary' : 'text-quaternary hover:text-secondary',
                )}
              >
                {t.label}
              </button>
            );
          })}
      </div>

      <DateRangePicker from={from} to={to} min={min} max={max} label={rangeLabel} onApply={onApplyCustom} />
    </div>
  );
}
