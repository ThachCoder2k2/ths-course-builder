import { CalendarRange, Filter, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { dateOf, TODAY, TOPICS, type TopicSlug } from '../../mock/analytics';
import { useFilters, type Preset } from './FilterContext';

const PRESETS: { value: Preset; label: string }[] = [
  { value: '7', label: '7 ngày' },
  { value: '30', label: '30 ngày' },
  { value: '90', label: '90 ngày' },
  { value: '365', label: '1 năm' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgoOf = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return Math.round((TODAY.getTime() - dt.getTime()) / 86400000);
};
const shortLabel = (from: number, to: number) => `${dateOf(from).getDate()}/${dateOf(from).getMonth() + 1} – ${dateOf(to).getDate()}/${dateOf(to).getMonth() + 1}`;

export function FilterBar() {
  const f = useFilters();
  const minDate = fmt(dateOf(364));
  const maxDate = fmt(dateOf(0));
  const topicName = f.topic ? TOPICS.find((t) => t.slug === f.topic)?.name : 'Mọi chủ đề';
  const rangeLabel = f.preset === 'custom' ? shortLabel(f.from, f.to) : `${f.rangeDays} ngày qua`;

  return (
    <div className="sticky top-[76px] z-30 -mx-4 mb-2xl border-b border-secondary bg-white/90 px-4 py-lg backdrop-blur lg:top-[84px]">
      <div className="flex flex-wrap items-center gap-lg">
        <span className="inline-flex items-center gap-xs text-sm font-semibold text-secondary">
          <CalendarRange className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
          Khoảng thời gian
        </span>
        <div className="inline-flex flex-wrap rounded-lg border border-secondary bg-secondary p-[2px]">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => f.setPreset(p.value)}
              aria-pressed={f.preset === p.value}
              className={cn('rounded-md px-lg py-xs text-xs font-semibold transition', f.preset === p.value ? 'bg-primary text-brand-secondary shadow-xs' : 'text-tertiary hover:text-secondary')}
            >
              {p.label}
            </button>
          ))}
        </div>

        {f.preset === 'custom' ? (
          <span className="inline-flex items-center gap-xs text-sm text-tertiary">
            <label className="inline-flex items-center gap-xs">
              Từ
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={fmt(dateOf(f.from))}
                onChange={(e) => f.setCustom(daysAgoOf(e.target.value), f.to)}
                className="rounded-md border border-primary bg-primary px-md py-xxs text-sm text-primary shadow-xs outline-none focus:border-brand"
              />
            </label>
            <label className="inline-flex items-center gap-xs">
              đến
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={fmt(dateOf(f.to))}
                onChange={(e) => f.setCustom(f.from, daysAgoOf(e.target.value))}
                className="rounded-md border border-primary bg-primary px-md py-xxs text-sm text-primary shadow-xs outline-none focus:border-brand"
              />
            </label>
          </span>
        ) : null}

        <span className="inline-flex items-center gap-xs">
          <Filter className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
          <label htmlFor="topic-filter" className="sr-only">
            Lọc theo chủ đề
          </label>
          <select
            id="topic-filter"
            value={f.topic ?? ''}
            onChange={(e) => f.setTopic((e.target.value || null) as TopicSlug | null)}
            className="rounded-md border border-primary bg-primary px-md py-xs text-sm font-medium text-primary shadow-xs outline-none focus:border-brand"
          >
            <option value="">Mọi chủ đề</option>
            {TOPICS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </span>

        <span className="ml-auto inline-flex items-center gap-xs rounded-pill bg-brand-50 px-lg py-xs text-sm font-medium text-brand-secondary">
          Đang xem: {topicName} · {rangeLabel}
          {f.topic ? (
            <button type="button" onClick={() => f.setTopic(null)} aria-label="Bỏ lọc chủ đề" className="ml-xxs rounded-full p-[2px] hover:bg-brand-200">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </span>
      </div>
    </div>
  );
}
