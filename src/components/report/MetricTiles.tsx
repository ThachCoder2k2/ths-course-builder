import { Flame, GraduationCap, Timer } from 'lucide-react';
import { CountUp } from '../ui/Reveal';

interface Tile {
  label: string;
  value: string;
  /** phần số để chạy đếm lên; phần chữ đứng yên */
  count?: { to: number; decimals?: number; suffix?: string };
  bg: string;
  iconBg: string;
  fg: string;
  icon: typeof Flame;
}

/** Ba con số mở đầu báo cáo, mỗi ô một tông màu riêng theo thiết kế. */
export function MetricTiles({
  coursesStudied,
  coursesTotal,
  focusHours,
  longestStreak,
}: {
  coursesStudied: number;
  coursesTotal: number;
  focusHours: number;
  longestStreak: number;
}) {
  const tiles: Tile[] = [
    {
      label: 'Khoá đã học',
      value: `${coursesStudied}/${coursesTotal}`,
      count: { to: coursesStudied, suffix: `/${coursesTotal}` },
      bg: '#F4F3FF',
      iconBg: '#D9D6FE',
      fg: '#6938EF',
      icon: GraduationCap,
    },
    {
      label: 'Giờ học',
      value: focusHours.toFixed(1),
      count: { to: focusHours, decimals: 1 },
      bg: '#F0F6FE',
      iconBg: '#D3E9FD',
      fg: '#0D67F7',
      icon: Timer,
    },
    {
      label: 'Giữ chuỗi dài nhất',
      value: `${longestStreak} ngày`,
      count: { to: longestStreak, suffix: ' ngày' },
      bg: '#ECFDF3',
      iconBg: '#DCFAE6',
      fg: '#079455',
      icon: Flame,
    },
  ];

  // Chia ba cột từ 726px, không phải 640px: ở 640-725px nhãn bị cắt và con số "6 ngày"
  // tách dòng giữa số và chữ, cả hàng đội thêm 38px.
  return (
    <div className="grid grid-cols-1 gap-2xl min-[726px]:grid-cols-3">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div key={t.label} className="flex items-center gap-xl rounded-xl p-2xl" style={{ background: t.bg }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: t.iconBg }}>
              <Icon className="h-5 w-5" style={{ color: t.fg }} aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col gap-md">
              <span className="truncate text-sm font-semibold" style={{ color: t.fg }}>
                {t.label}
              </span>
              <span data-kpi className="whitespace-nowrap text-display-sm font-semibold tabular-nums" style={{ color: t.fg }}>
                {t.count ? <CountUp to={t.count.to} decimals={t.count.decimals} suffix={t.count.suffix} /> : t.value}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
