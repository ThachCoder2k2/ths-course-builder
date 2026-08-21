import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { CardBadge, ReportCard } from './ReportCard';
import { EmptyState } from './EmptyState';
import { RhythmHeatmap } from './charts/RhythmHeatmap';
import { coarsenByGroup, dropHint, rhythmMatrix, type RhythmMode } from '../../behavior/rhythm';
import { useMediaQuery } from '../../lib/useMediaQuery';
import type { Statement } from '../../behavior/events';
import { NOW } from '../../behavior/catalog';
import type { GoldenHours } from '../../behavior/types';

/**
 * Chữ trên thẻ đổi theo kiểu lưới đang vẽ. Xem đúng một ngày thì biểu đồ nói về giờ
 * trong ngày, chứ không còn là nhịp học nữa — để nguyên tiêu đề cũ thì tiêu đề nói một
 * chuyện mà hình vẽ nói chuyện khác.
 */
const COPY: Record<RhythmMode, { title: string; subtitle: string }> = {
  hour: { title: 'Giờ học trong ngày', subtitle: 'Mỗi ô là một giờ, ô càng đậm là học càng lâu' },
  dayHour: { title: 'Khung giờ học trong tuần', subtitle: 'Mỗi ô là một khung bốn giờ của một ngày' },
  weekday: { title: 'Nhịp độ học của bạn', subtitle: 'Mỗi ô là một ngày, xếp theo tuần' },
  month: { title: 'Nhịp độ học của bạn', subtitle: 'Mỗi ô là một ngày, xếp theo từng tháng' },
};

/** "2 giờ 10 phút" */
function hoursWord(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} giờ` : `${h} giờ ${rest} phút`;
}

const isToday = (d: Date) =>
  d.getFullYear() === NOW.getFullYear() && d.getMonth() === NOW.getMonth() && d.getDate() === NOW.getDate();

/**
 * Câu đúc kết dưới lưới. Ở mốc ngắn, nhắc lại "học nhiều nhất vào quãng 21h" là kể lại
 * đúng cái hình bên trên, nên thay bằng con số mà hình không nói được: tổng thời gian học.
 */
function takeaway(mode: RhythmMode, golden: GoldenHours, focusMinutes: number, day: Date): string {
  if (mode === 'hour') {
    // Xem một ngày trong quá khứ thì gọi đúng ngày đó, đừng gọi là "hôm nay".
    const when = isToday(day) ? 'Hôm nay' : `Ngày ${day.getDate()}/${day.getMonth() + 1}`;
    return `${when} bạn học ${hoursWord(focusMinutes)}, dồn vào quãng ${golden.peakLabel}.`;
  }
  if (mode === 'dayHour') return `Mấy ngày này bạn học đều nhất vào quãng ${golden.peakLabel}.`;
  return `Trong tuần, bạn học tập trung nhất vào quãng ${golden.peakLabel}.`;
}

export function RhythmCard({
  scoped,
  fromDate,
  toDate,
  streak,
  golden,
  focusMinutes,
}: {
  scoped: Statement[];
  fromDate: Date;
  toDate: Date;
  streak: number;
  golden: GoldenHours;
  focusMinutes: number;
}) {
  // Lưới ngày của cả năm cần hơn sáu chục cột; dưới 1280px thì gộp mỗi tháng thành một
  // cột thay vì bắt kéo ngang một lưới mà ô đã nhỏ đến mức không trỏ vào được.
  const wide = useMediaQuery('(min-width: 1280px)');
  const raw = useMemo(() => rhythmMatrix(scoped, fromDate, toDate), [scoped, fromDate, toDate]);
  const coarse = raw.mode === 'month' && !wide;
  const matrix = useMemo(() => (coarse ? coarsenByGroup(raw) : raw), [coarse, raw]);
  const drop = useMemo(() => dropHint(scoped, raw.mode), [scoped, raw.mode]);
  const copy = COPY[raw.mode];
  const subtitle = coarse ? 'Mỗi ô là tổng thời gian học của một thứ trong tháng' : copy.subtitle;
  const hasData = scoped.length > 0;

  return (
    <ReportCard
      title={copy.title}
      subtitle={subtitle}
      badge={streak > 0 ? <CardBadge>Chuỗi {streak} ngày</CardBadge> : undefined}
      bodyClassName="gap-xl"
    >
      {hasData ? (
        <>
          <RhythmHeatmap matrix={matrix} />
          {drop ? (
            <p className="flex items-start gap-md text-sm text-secondary">
              <AlertCircle className="mt-xxs h-5 w-5 shrink-0 text-error-600" aria-hidden="true" />
              <span>
                Có {drop.count} lần bỏ dở giữa bài {drop.when} — xem lại mấy bài đó khi rảnh.
              </span>
            </p>
          ) : null}
          <p className="rounded-lg bg-secondary px-xl py-lg text-sm leading-relaxed text-secondary">
            {takeaway(raw.mode, golden, focusMinutes, fromDate)}
          </p>
        </>
      ) : (
        <EmptyState text="Khoảng này bạn chưa có buổi học nào" />
      )}
    </ReportCard>
  );
}
