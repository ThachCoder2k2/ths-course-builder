import { useState } from 'react';
import { TileCard, Segmented } from '../TileCard';
import { Legend } from '../charts/ChartCard';
import { BarChart } from '../charts/BarChart';
import { useFilters } from '../FilterContext';
import { BRAND, cat } from '../palette';
import { TOPICS, TOPIC_NAME, type LearnerData } from '../../../mock/analytics';
import { etaActiveCourses, minutesByBucket, momentum, weeklyAvgMinutes, weeksOnGoal, windowDays } from '../../../lib/analyticsSelectors';

export function PaceTile({ data }: { data: LearnerData }) {
  const f = useFilters();
  const win = { from: f.from, to: f.to, topic: f.topic };
  const [mode, setMode] = useState<'topic' | 'total'>('topic');
  const goal = data.learner.goalWeeklyMinutes;
  const buckets = minutesByBucket(data, win);
  const monthly = windowDays(win) > 92;
  const goalB = monthly ? Math.round((goal * 30) / 7) : goal;
  const weekly = weeklyAvgMinutes(data, win);
  const mo = momentum(data, win);
  const wog = weeksOnGoal(data, win, goal);
  const eta = etaActiveCourses(data, win);

  let barData: { label: string; values: number[] }[];
  let colors: string[];
  let seriesNames: string[];
  const stacked = !f.topic && mode === 'topic';
  if (f.topic) {
    const ti = TOPICS.findIndex((t) => t.slug === f.topic);
    barData = buckets.map((b) => ({ label: b.label, values: [b.values[ti]] }));
    colors = [cat(ti)];
    seriesNames = [TOPIC_NAME[f.topic]];
  } else if (mode === 'total') {
    barData = buckets.map((b) => ({ label: b.label, values: [b.values.reduce((n, v) => n + v, 0)] }));
    colors = [BRAND.blue];
    seriesNames = ['Tổng'];
  } else {
    barData = buckets.map((b) => ({ label: b.label, values: b.values }));
    colors = TOPICS.map((_, i) => cat(i));
    seriesNames = TOPICS.map((t) => t.name);
  }

  return (
    <TileCard
      title="Nhịp & tiến độ so với kế hoạch"
      subtitle={`Phút học theo ${monthly ? 'tháng' : 'tuần'} trong khoảng đang xem, so với mục tiêu`}
      info={{
        what: 'Bạn có giữ nhịp học như dự định không, đang khỏe lên hay nguội đi, và với nhịp này thì khi nào xong các khóa đang học.',
        how: 'Cộng phút học theo tuần/tháng trong khoảng đang xem; “đúng nhịp” đếm số kỳ đạt mục tiêu; “đà” so 7 ngày gần nhất với 7 ngày trước; ngày dự kiến ước từ số bài còn lại và tốc độ gần đây.',
        formula: 'Đà = (phút 7 ngày này − 7 ngày trước) / 7 ngày trước; Ngày xong ≈ số bài còn lại / (phút tuần ÷ ~18).',
      }}
      controls={
        !f.topic ? (
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'topic', label: 'Theo chủ đề' },
              { value: 'total', label: 'Tổng' },
            ]}
          />
        ) : undefined
      }
      takeaway={
        mo < -10 ? (
          <>
            Nhịp đang chậm lại {Math.abs(mo)}% so với tuần trước. Đặt một buổi ngắn tối nay để không rơi nhịp — bạn đạt mục tiêu {wog.met}/{wog.total} kỳ gần đây.
          </>
        ) : (
          <>
            Bạn đang giữ nhịp tốt ({mo >= 0 ? `+${mo}%` : `${mo}%`} so với tuần trước) và đạt mục tiêu {wog.met}/{wog.total} kỳ. Với nhịp này, các khóa đang học xong khoảng <b>{eta.label}</b>.
          </>
        )
      }
    >
      <div className="flex flex-col gap-lg">
        <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
          {[
            { label: 'Phút / tuần', value: `${weekly}`, sub: `mục tiêu ${goal}` },
            { label: 'Đúng nhịp', value: `${wog.met}/${wog.total}`, sub: 'kỳ đạt mục tiêu' },
            { label: 'Đà học', value: mo >= 0 ? `+${mo}%` : `${mo}%`, sub: 'so 7 ngày trước' },
            { label: 'Dự kiến xong', value: eta.label, sub: `${eta.remainingLessons} bài còn lại` },
          ].map((k) => (
            <div key={k.label} className="flex flex-col rounded-xl border border-secondary bg-secondary/50 p-md">
              <span className="text-xs text-tertiary">{k.label}</span>
              <span className="text-md font-semibold tabular-nums text-primary">{k.value}</span>
              <span className="text-xs text-quaternary">{k.sub}</span>
            </div>
          ))}
        </div>
        {stacked ? <Legend items={TOPICS.map((t, i) => ({ label: t.name, color: cat(i) }))} /> : null}
        <BarChart ariaLabel="Phút học theo thời gian so với mục tiêu" data={barData} colors={colors} seriesNames={seriesNames} stacked={stacked} unit=" phút" goal={{ value: goalB, label: `Mục tiêu ${goalB}` }} showValues={false} />
      </div>
    </TileCard>
  );
}
