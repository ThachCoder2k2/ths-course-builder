import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Flame, GraduationCap, ListChecks, Moon, Target } from 'lucide-react';
import Avatar from '../../ui/Avatar';
import { Reveal } from '../Reveal';
import { ArcGauge, RadialRing } from '../charts/gauges';
import { Sparkline } from '../charts/Sparkline';
import { StatCard } from '../StatCard';
import { AiInsightCard } from '../AiInsightCard';
import { InfoTip } from '../InfoTip';
import { BRAND, SERIES, STATUS } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

const STATUS_PILL: Record<LearnerAnalytics['learner']['status'], { label: string; cls: string }> = {
  'on-track': { label: 'Đúng nhịp', cls: 'bg-success-50 text-success-600' },
  attention: { label: 'Cần chú ý', cls: 'bg-warning-50 text-warning-700' },
  'at-risk': { label: 'Nguy cơ bỏ dở', cls: 'bg-error-50 text-error-700' },
};

function Tile({ title, onClick, to, children }: { title: string; onClick?: () => void; to?: string; children: ReactNode }) {
  const cls =
    'group flex h-full w-full flex-col gap-lg rounded-card border border-secondary bg-primary p-xl text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand-alt hover:shadow-pop';
  const inner = (
    <>
      <span className="flex items-center justify-between">
        <span className="text-sm font-medium text-tertiary">{title}</span>
        <ArrowRight className="h-4 w-4 text-quaternary transition group-hover:translate-x-0.5 group-hover:text-brand-secondary" aria-hidden="true" />
      </span>
      {children}
    </>
  );
  return (
    <Reveal className="h-full">
      {to ? (
        <Link to={to} className={cls}>
          {inner}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={cls}>
          {inner}
        </button>
      )}
    </Reveal>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-xxs">
      <div className="flex items-center justify-between text-xs">
        <span className="min-w-0 truncate text-secondary">{label}</span>
        <span className="shrink-0 font-semibold tabular-nums text-primary">{value}%</span>
      </div>
      <span className="h-1.5 w-full overflow-hidden rounded-pill bg-gray-200">
        <span className="block h-full rounded-pill" style={{ width: `${value}%`, background: color }} />
      </span>
    </div>
  );
}

export function BentoOverview({ a, onJump }: { a: LearnerAnalytics; onJump: (id: string) => void }) {
  const pill = STATUS_PILL[a.learner.status];
  const k = a.kpis;
  const byMastery = [...a.topics].sort((x, y) => y.mastery - x.mastery);
  const strong = byMastery[0];
  const weak = byMastery[byMastery.length - 1];
  const quizAvg = Math.round(a.assessment.quizzes.reduce((n, q) => n + q.score, 0) / a.assessment.quizzes.length);
  const top = a.recommend.next[0];

  return (
    <section id="tong-quan" className="flex scroll-mt-[132px] flex-col gap-xl lg:scroll-mt-28">
      <Reveal>
        <div className="flex flex-col gap-2xl rounded-card border border-brand-200 bg-[linear-gradient(120deg,#F0F6FE_0%,#F4F3FF_100%)] p-xl shadow-sm sm:p-3xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-xl">
            <Avatar name={a.learner.name} size="lg" className="border-[0.75px] border-[rgba(0,0,0,0.08)]" />
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-xxs">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">Học tập của tôi</span>
                <h1 className="text-display-sm font-semibold text-primary">{a.learner.name}</h1>
                <p className="text-sm text-tertiary">
                  Đang theo {a.learner.topicCount} chủ đề · trọng tâm{' '}
                  <Link to={`/courses/${a.learner.currentCourseSlug}`} className="font-medium text-brand-secondary underline-offset-2 hover:underline">
                    {a.learner.focusTopic}
                  </Link>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-xs">
                <span className={`inline-flex items-center gap-xs rounded-pill px-lg py-xs text-sm font-semibold ${pill.cls}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {pill.label}
                </span>
                <span className="inline-flex items-center gap-xs rounded-pill bg-white px-lg py-xs text-sm font-medium text-secondary shadow-xs">
                  <Moon className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
                  {a.learner.chronotype}
                </span>
                <span className="inline-flex items-center gap-xs rounded-pill bg-white px-lg py-xs text-sm font-medium text-secondary shadow-xs">
                  <Target className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
                  {a.learner.motive}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-xs">
            <span className="flex items-center gap-xs text-sm font-medium text-tertiary">
              Sức khỏe học tập
              <InfoTip
                label="Sức khỏe học tập"
                info={{
                  what: 'Một con số 0–100 tóm tắt tình trạng học của bạn trên tất cả chủ đề. Càng cao nghĩa là bạn học càng đều, tiến càng tốt và kết quả càng vững.',
                  how: 'Gộp bốn nhóm tín hiệu: mức đều đặn (chuỗi ngày, ít ngắt quãng), tiến độ hoàn thành, kết quả đánh giá (điểm quiz) và thời lượng học so với mục tiêu tuần. Mũi tên là mức đổi so với tháng trước.',
                  formula: 'Sức khỏe = 0,30×Đều đặn + 0,30×Tiến độ + 0,25×Kết quả đánh giá + 0,15×(Phút học / Mục tiêu); mỗi thành phần chuẩn hóa về 0–100.',
                }}
              />
            </span>
            <ArcGauge value={a.health.score} sublabel={`+${a.health.delta} so với tháng trước`} color={BRAND.blue} size={168} />
            <Sparkline data={a.health.trend} width={220} height={40} color={BRAND.blue} />
            <span className="max-w-[15rem] text-center text-xs text-quaternary">Tổng hợp từ mức đều đặn, tiến độ và điểm đánh giá trên mọi chủ đề</span>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Flame className="h-5 w-5" />} label="Chuỗi ngày học" value={k.streak.value} unit=" ngày" delta={k.streak.delta} deltaUnit=" ngày" spark={k.streak.spark} sparkColor={SERIES.orange} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Hoàn thành khóa" value={k.completion.value} unit="%" delta={k.completion.delta} deltaUnit="%" spark={k.completion.spark} />
        <StatCard icon={<Clock3 className="h-5 w-5" />} label="Phút học tuần này" value={k.weeklyMinutes.value} delta={k.weeklyMinutes.delta} spark={k.weeklyMinutes.spark} sparkColor={SERIES.green} />
        <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Khái niệm thành thạo" value={`${k.conceptsMastered.value}/${k.conceptsMastered.total}`} delta={k.conceptsMastered.delta} spark={k.conceptsMastered.spark} sparkColor={SERIES.violet} />
      </div>

      <div className="grid grid-cols-1 gap-xl md:grid-cols-2 lg:grid-cols-4">
        <Tile title="Thành thạo theo chủ đề" onClick={() => onJump('thanh-thao')}>
          <div className="flex flex-col gap-md">
            <MiniBar label={`Mạnh nhất · ${strong.name}`} value={strong.mastery} color={STATUS.good} />
            <MiniBar label={`Cần củng cố · ${weak.name}`} value={weak.mastery} color={STATUS.warning} />
          </div>
        </Tile>

        <Tile title="Nên học tiếp" to={`/courses/${top.courseSlug}`}>
          <div className="flex items-start gap-md">
            <span className="mt-xxs flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-secondary">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="line-clamp-2 text-sm font-semibold text-primary">{top.title}</span>
              <span className="text-xs text-brand-secondary">{top.topic} · phù hợp {top.fit}%</span>
            </div>
          </div>
        </Tile>

        <Tile title="Điểm đánh giá" onClick={() => onJump('danh-gia')}>
          <div className="flex items-center gap-lg">
            <RadialRing value={quizAvg} size={64} stroke={8} centerLabel={`${quizAvg}`} />
            <span className="text-sm text-tertiary">Điểm quiz trung bình trên {a.assessment.quizzes.length} bài, mọi chủ đề</span>
          </div>
        </Tile>

        <Tile title="Nhịp học" onClick={() => onJump('nhip-hoc')}>
          <div className="flex flex-col gap-xs">
            <span className="inline-flex items-center gap-xs text-display-xs font-semibold tabular-nums text-primary">
              <Flame className="h-6 w-6 text-brandOrange" aria-hidden="true" />
              {a.kpis.streak.value}
              <span className="text-sm font-medium text-tertiary">ngày liên tiếp</span>
            </span>
            <span className="text-xs text-tertiary">Giờ vàng của bạn: 21–23h · {k.weeklyMinutes.value} phút tuần này</span>
          </div>
        </Tile>
      </div>

      <AiInsightCard label="Tổng quan">
        Tuần này bạn học đều hơn tuần trước và giữ được chuỗi {k.streak.value} ngày. Trong {a.learner.topicCount} chủ đề đang theo, bạn vững nhất
        ở {strong.name}, còn {weak.name} thì nên dành thêm thời gian. Bấm vào từng thẻ ở trên để đi sâu, hoặc để mình dẫn bạn đi một vòng.
      </AiInsightCard>
    </section>
  );
}
