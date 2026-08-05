import type { ReactNode } from 'react';
import { BookOpen, Clock3, Flame, GraduationCap } from 'lucide-react';
import { TileCard } from '../TileCard';
import { useFilters } from '../FilterContext';
import { TOPIC_NAME, type LearnerData } from '../../../mock/analytics';
import { momentum, streak, weeklyAvgMinutes } from '../../../lib/analyticsSelectors';

function Kpi({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone?: 'good' | 'warn' }) {
  return (
    <div className="flex items-center gap-md rounded-xl border border-secondary bg-secondary/50 p-md">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-secondary">{icon}</span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-xs text-tertiary">{label}</span>
        <span className={`text-md font-semibold tabular-nums ${tone === 'warn' ? 'text-warning-700' : tone === 'good' ? 'text-success-600' : 'text-primary'}`}>{value}</span>
      </span>
    </div>
  );
}

export function StatusTile({ data }: { data: LearnerData }) {
  const f = useFilters();
  const win = { from: f.from, to: f.to, topic: f.topic };
  const goal = data.learner.goalWeeklyMinutes;
  const weekly = weeklyAvgMinutes(data, win);
  const mo = momentum(data, win);
  const st = streak(data);
  const topics = f.topic ? data.topics.filter((t) => t.slug === f.topic) : data.topics;
  const activeCourses = data.courses.filter((c) => c.status === 'active' && (!f.topic || c.topic === f.topic)).length;
  const avgMastery = Math.round(topics.reduce((n, t) => n + t.mastery, 0) / topics.length);
  const weakestTopic = [...topics].sort((a, b) => a.mastery - b.mastery)[0];
  const overconf = [...data.calibration]
    .filter((c) => !f.topic || c.topic === f.topic)
    .map((c) => ({ ...c, gap: c.confidence - c.accuracy }))
    .sort((a, b) => b.gap - a.gap)[0];

  const paceLow = weekly < goal * 0.85 || mo < -15;
  const status = paceLow ? { label: 'Cần chú ý', tone: 'warn' as const } : { label: 'Đúng nhịp', tone: 'good' as const };

  let takeaway: ReactNode;
  if (paceLow) {
    const gapMin = Math.max(0, goal - weekly);
    takeaway = (
      <>
        Nhịp học tuần này đang chậm hơn mục tiêu{mo < 0 ? ` và giảm ${Math.abs(mo)}% so với tuần trước` : ''}. Học thêm khoảng <b>{gapMin} phút</b> tuần này là kịp lại.
      </>
    );
  } else if (overconf && overconf.gap > 12) {
    takeaway = (
      <>
        Bạn đang tự tin hơn thực lực ở <b>{TOPIC_NAME[overconf.topic]}</b> (tự tin {overconf.confidence}% nhưng đúng {overconf.accuracy}%). Làm lại một bài kiểm tra ngắn để chắc lại.
      </>
    );
  } else {
    takeaway = (
      <>
        Bạn đang đúng nhịp. Điểm yếu nhất lúc này là <b>{weakestTopic.name}</b> (mức nắm {weakestTopic.mastery}%) — dồn thêm một chút cho môn này.
      </>
    );
  }

  return (
    <TileCard
      title="Trạng thái học tập"
      subtitle={f.topic ? `Đang xem: ${TOPIC_NAME[f.topic]}` : 'Nhìn nhanh: bạn đang ổn hay cần chú ý'}
      info={{
        what: 'Đánh giá nhanh bạn đang đúng nhịp hay cần chú ý, so với mục tiêu bạn tự đặt — kèm đúng một việc nên làm.',
        how: 'Nhìn vào nhịp học so với mục tiêu tuần, đà so với chính bạn, mức nắm và độ chuẩn xác của tự tin, rồi nêu yếu tố yếu nhất.',
        formula: 'Đúng nhịp khi phút/tuần ≥ 85% mục tiêu và đà ≥ −15%; nếu không → Cần chú ý.',
      }}
      takeaway={takeaway}
    >
      <div className="flex flex-col gap-lg">
        <span className={`inline-flex w-fit items-center gap-xs rounded-pill px-lg py-xs text-sm font-semibold ${status.tone === 'warn' ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-600'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status.label}
        </span>
        <div className="grid grid-cols-2 gap-md">
          <Kpi icon={<Clock3 className="h-5 w-5" />} label="Phút học / tuần" value={`${weekly} / ${goal}`} tone={weekly >= goal * 0.85 ? 'good' : 'warn'} />
          <Kpi icon={<Flame className="h-5 w-5" />} label="Chuỗi ngày học" value={`${st} ngày`} />
          <Kpi icon={<BookOpen className="h-5 w-5" />} label="Khóa đang học" value={`${activeCourses}`} />
          <Kpi icon={<GraduationCap className="h-5 w-5" />} label="Mức nắm trung bình" value={`${avgMastery}%`} />
        </div>
      </div>
    </TileCard>
  );
}
