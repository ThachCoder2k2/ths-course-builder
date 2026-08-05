/** Small Vietnamese formatters shared across the behaviour dashboard. */

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** seconds → m:ss (video positions). */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}

/** minutes → "1 giờ 05" / "45 phút". */
export function minutesLabel(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  if (m < 60) return `${m} phút`;
  return `${Math.floor(m / 60)} giờ ${pad2(m % 60)}`;
}

export const WEEKDAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

/** Date → "5/8". */
export function shortDate(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** Date → "T3, 5/8". */
export function dayLabel(d: Date): string {
  return `${WEEKDAY_VI[d.getDay()]}, ${shortDate(d)}`;
}

/** whole-day difference from `now` → "hôm nay" / "hôm qua" / "N ngày trước". */
export function relDay(then: Date, now: Date): string {
  const a = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((b - a) / 86400000);
  if (days <= 0) return 'hôm nay';
  if (days === 1) return 'hôm qua';
  if (days < 7) return `${days} ngày trước`;
  if (days < 14) return 'tuần trước';
  return `${Math.round(days / 7)} tuần trước`;
}

/** clamp to [0,1] and format as an integer percent. */
export function pct(t: number): string {
  return `${Math.round(Math.max(0, Math.min(1, t)) * 100)}%`;
}
