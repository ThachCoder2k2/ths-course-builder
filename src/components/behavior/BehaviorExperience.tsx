import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, GraduationCap, Sparkles, Target, Timer, TrendingDown, TrendingUp, X } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { Reveal } from '../analytics/Reveal';
import { TileCard } from '../analytics/TileCard';
import { PrereqGraph } from '../analytics/charts/PrereqGraph';
import { ArcGauge } from '../analytics/charts/gauges';
import { getBehaviorData } from '../../behavior/seed';
import { conceptMapOf, focusBreakdown, forgetting, goldenHours, slipGap, strategyFingerprint, twinForecast } from '../../behavior/selectors';
import { courseTable, lessonRows, masteryOverMonths, overviewStats, recurringStumbles, rhythm, scope, spanMonths, topicStrength } from '../../behavior/overview';
import { COURSE_BY_ID } from '../../behavior/catalog';
import { minutesLabel, pct } from '../../behavior/format';
import { STATUS } from '../analytics/palette';
import type { NextAction, TwinFactor } from '../../behavior/types';
import type { Statement } from '../../behavior/events';
import { FilterBar } from './FilterBar';
import { YearCalendar } from './charts/YearCalendar';
import { FocusWaterfall } from './charts/FocusWaterfall';
import { SlipGapScatter } from './charts/SlipGapScatter';
import { ForgettingCurveChart } from './charts/ForgettingCurveChart';
import { StrategyRadar } from './charts/StrategyRadar';
import { TrendLine } from './charts/TrendLine';
import { TopicStrengthBars } from './charts/TopicStrengthBars';
import { RecurringStumbleBars } from './charts/RecurringStumbleBars';
import { CourseTable } from './charts/CourseTable';
import { LessonList } from './charts/LessonList';

function Section({ tag, title, subtitle, children }: { tag: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-xl">
      <Reveal>
        <header className="flex flex-col gap-xxs">
          <span className="flex flex-wrap items-center gap-md">
            <span className="flex h-7 items-center justify-center rounded-full bg-brand-900 px-md text-xs font-bold uppercase tracking-wide text-white">{tag}</span>
            <h2 className="text-display-xs font-semibold text-primary">{title}</h2>
          </span>
          <p className="text-md text-tertiary sm:pl-[calc(1.75rem+0.5rem)]">{subtitle}</p>
        </header>
      </Reveal>
      {children}
    </section>
  );
}

function Kpi({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center gap-md rounded-xl border border-secondary bg-white/70 p-md">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-secondary">{icon}</span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-xs text-tertiary">{label}</span>
        <span className="text-md font-semibold tabular-nums text-primary">{value}</span>
        {hint ? <span className="truncate text-[11px] text-quaternary">{hint}</span> : null}
      </span>
    </div>
  );
}

const ACTION_TONE: Record<NextAction['kind'], string> = { review: STATUS.warning, redo: STATUS.danger, resume: '#0D67F7', next: STATUS.good, habit: '#7A5AF8' };
function ActionRow({ a }: { a: NextAction }) {
  const body = (
    <div className="flex items-start gap-md rounded-lg border border-secondary bg-white p-md transition hover:border-brand-alt">
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ACTION_TONE[a.kind] }} />
      <span className="flex min-w-0 flex-1 flex-col gap-xxs">
        <span className="flex items-center gap-xs text-sm font-semibold text-primary">
          {a.label}
          {a.courseSlug ? <ArrowRight className="h-3.5 w-3.5 text-quaternary" aria-hidden="true" /> : null}
        </span>
        <span className="text-xs leading-relaxed text-tertiary">{a.why}</span>
        <span className="mt-xxs flex items-center gap-md">
          <span className="inline-flex items-center rounded-pill bg-secondary px-md py-[1px] text-[11px] font-medium text-tertiary">~{a.minutes} phút</span>
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
            <span className="block h-full rounded-full" style={{ width: `${Math.round(a.impact * 100)}%`, background: ACTION_TONE[a.kind] }} />
          </span>
        </span>
      </span>
    </div>
  );
  return a.courseSlug ? <Link to={`/courses/${a.courseSlug}`}>{body}</Link> : body;
}

function factorTag(f: TwinFactor): { text: string; cls: string } {
  if (f.dir === 'up' && f.weight > 0.5) return { text: 'Đang kéo lùi', cls: 'bg-error-50 text-error-600' };
  if (f.dir === 'up' && f.weight > 0.25) return { text: 'Cần để ý', cls: 'bg-warning-50 text-warning-700' };
  return { text: 'Ổn', cls: 'bg-success-50 text-success-600' };
}

function ForecastItem({ tone, title, children }: { tone: string; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-xxs rounded-lg border-l-2 bg-secondary/50 px-lg py-md sm:flex-row sm:items-baseline sm:gap-md" style={{ borderColor: tone }}>
      <span className="shrink-0 text-xs font-semibold" style={{ color: tone }}>
        {title}
      </span>
      <span className="text-sm leading-relaxed text-secondary">{children}</span>
    </div>
  );
}

export function BehaviorExperience() {
  const data = useMemo(() => getBehaviorData('hieu'), []);
  const sts = data.statements;
  const months = useMemo(() => spanMonths(), []);

  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(months.length - 1);
  const [modalCourse, setModalCourse] = useState<string | null>(null);

  const fromDay = months[fromIdx]?.startDay ?? 0;
  const toDay = months[toIdx]?.endDay ?? 365;

  const scrollTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const onWindow = (from: number, to: number) => {
    setFromIdx(from);
    setToIdx(to);
    scrollTop();
  };

  const scopedRange = useMemo(() => scope(sts, { fromDay, toDay, courseId: null }), [sts, fromDay, toDay]);
  const stats = useMemo(() => overviewStats(scopedRange), [scopedRange]);

  return (
    <div className="mx-auto w-full max-w-content px-4 pb-9xl pt-lg lg:px-4xl">
      {/* header */}
      <Reveal>
        <div className="flex flex-col gap-lg rounded-card border border-brand-200 bg-[linear-gradient(120deg,#F0F6FE_0%,#F4F3FF_100%)] p-xl shadow-sm sm:p-3xl">
          <div className="flex flex-col gap-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-xl">
              <Avatar name={data.learner.name} size="lg" className="border-[0.75px] border-[rgba(0,0,0,0.08)]" />
              <div className="flex flex-col gap-xxs">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">Học tập của tôi · dựa trên cách bạn thực sự học</span>
                <h1 className="text-display-sm font-semibold text-primary">{data.learner.name}</h1>
                <p className="max-w-paragraph text-sm text-tertiary">{data.learner.tagline}</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-xs rounded-pill bg-white px-lg py-xs text-sm font-medium text-secondary shadow-xs">
              <Target className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
              {data.learner.joinedLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
            <Kpi icon={<Timer className="h-5 w-5" />} label="Giờ học thật" value={`${stats.focusHours} giờ`} hint={`${stats.activeDays} ngày có học`} />
            <Kpi icon={<GraduationCap className="h-5 w-5" />} label="Khóa đã học" value={`${stats.coursesDone}/${stats.coursesTouched}`} hint="hoàn thành / đã đụng tới" />
            <Kpi icon={<Sparkles className="h-5 w-5" />} label="Số lần hiểu ra chỗ khó" value={`${stats.ahaCount} lần`} hint="sau khi cố xem lại" />
            <Kpi icon={<Flame className="h-5 w-5" />} label="Chuỗi ngày dài nhất" value={`${stats.longestStreak} ngày`} />
          </div>
        </div>
      </Reveal>

      <FilterBar months={months} fromIdx={fromIdx} toIdx={toIdx} onWindow={onWindow} />

      <div className="flex flex-col gap-7xl">
        <OverviewMode scoped={scopedRange} allSts={sts} fromDay={fromDay} toDay={toDay} onPickCourse={setModalCourse} />
      </div>

      {modalCourse ? <CourseDetailModal courseId={modalCourse} sts={sts} fromDay={fromDay} toDay={toDay} onClose={() => setModalCourse(null)} /> : null}
    </div>
  );
}

// ---------------- OVERVIEW (tổng hợp) ----------------
function OverviewMode({ scoped, allSts, fromDay, toDay, onPickCourse }: { scoped: Statement[]; allSts: Statement[]; fromDay: number; toDay: number; onPickCourse: (id: string) => void }) {
  const strat = useMemo(() => strategyFingerprint(scoped), [scoped]);
  const golden = useMemo(() => goldenHours(scoped), [scoped]);
  const focus = useMemo(() => focusBreakdown(scoped), [scoped]);
  const months = useMemo(() => masteryOverMonths(scoped), [scoped]);
  const days = useMemo(() => rhythm(scoped, fromDay, toDay), [scoped, fromDay, toDay]);
  const topics = useMemo(() => topicStrength(scoped), [scoped]);
  const stumbles = useMemo(() => recurringStumbles(scoped), [scoped]);
  const sg = useMemo(() => slipGap(scoped), [scoped]);
  const fg = useMemo(() => forgetting(allSts), [allSts]); // forward-looking → dùng dữ liệu mới nhất
  const rows = useMemo(() => courseTable(scoped), [scoped]);
  const twin = useMemo(() => twinForecast(allSts), [allSts]); // dự đoán từ giờ, không phụ thuộc khoảng đang xem
  const riskColor = twin.dropoutRisk < 0.34 ? STATUS.good : twin.dropoutRisk < 0.6 ? STATUS.warning : STATUS.danger;

  return (
    <>
      <Section tag="Cách học" title="Cách bạn học" subtitle="Chân dung cách bạn học và số phút thực sự tập trung — gộp trên mọi khóa.">
        <div className="grid gap-xl lg:grid-cols-2">
          <TileCard title="Chân dung người học" subtitle={strat.label} info={{ what: 'Một hình vẽ nhanh về cách bạn học, so với chính bạn.', how: 'Đo vài thói quen từ hành vi: hay xem lại, học đều, kiên trì, làm đúng, chủ động hỏi, tập trung.' }} takeaway={<>{strat.blurb}</>}>
            <StrategyRadar axes={strat.axes} />
          </TileCard>
          <TileCard title="Phút tập trung thật" subtitle={`Tập trung ${pct(focus.focusRate)} thời gian mở bài`} info={{ what: 'Trong thời gian mở bài, bao nhiêu là học thật.', how: 'Lấy thời gian mở bài trừ đi lúc ngồi không và lúc rời sang tab khác.' }}>
            <FocusWaterfall data={focus} />
          </TileCard>
        </div>
      </Section>

      <Section tag="Tiến bộ" title="Bạn khá lên tới đâu" subtitle="Gộp mọi khóa: bạn làm đúng bài nhiều dần lên không, và học có đều không.">
        <TileCard title="Tiến bộ theo tháng" subtitle="Tỉ lệ làm đúng bài, gộp mọi khóa" info={{ what: 'Bạn làm bài đúng dần lên theo thời gian chưa.', how: 'Tỉ lệ câu đúng trên tổng số câu đã làm, tính theo từng tháng, gộp mọi khóa.' }}>
          <TrendLine data={months} />
        </TileCard>
        <TileCard title="Nhịp học của bạn" subtitle={`Mỗi ô là một ngày · đậm là học nhiều · học vào nhất lúc ${golden.peakLabel}`} info={{ what: 'Bạn học đều hay dồn cục, có quãng nghỉ dài không — và khung giờ nào học nhiều nhất.', how: 'Tô đậm nhạt theo số phút tập trung mỗi ngày; nhãn tháng ở trên, thứ trong tuần ở bên trái.' }} takeaway={<>Trong tuần, bạn học tập trung nhất vào quãng <b>{golden.peakLabel}</b>.</>}>
          <YearCalendar days={days} />
        </TileCard>
      </Section>

      <Section tag="Mạnh & yếu" title="Bạn mạnh yếu môn nào, hay vấp kiểu gì" subtitle="So các chủ đề và những chỗ bạn vấp đi vấp lại qua nhiều khóa.">
        <div className="grid gap-xl lg:grid-cols-2">
          <TileCard title="Mạnh – yếu theo chủ đề" subtitle="Xếp từ chắc nhất xuống" info={{ what: 'Chủ đề nào bạn nắm chắc, chủ đề nào còn đuối.', how: 'Trung bình mức làm đúng bài của các khóa trong từng chủ đề.' }}>
            <TopicStrengthBars data={topics} />
          </TileCard>
          <TileCard title="Chỗ hay vấp lặp lại" subtitle="Những khái niệm bạn phải xem lại nhiều nhất" info={{ what: 'Kiểu nội dung bạn cứ mắc đi mắc lại, dù ở khóa nào.', how: 'Gom số lần tua lại, dừng, xin gợi ý, bỏ dở quanh từng khái niệm trên mọi khóa.' }}>
            <RecurringStumbleBars data={stumbles} />
          </TileCard>
        </div>
      </Section>

      <Section tag="Chẩn đoán" title="Vì sao sai, và sắp quên gì" subtitle="Tách lỗi do vội với lỗi do chưa hiểu, và canh lúc kiến thức sắp mờ để nhắc ôn.">
        <div className="grid gap-xl lg:grid-cols-2">
          <TileCard title="Nhầm do vội hay chưa hiểu" subtitle={`Nhầm do vội ${sg.counts.slip} câu · chưa hiểu ${sg.counts.gap} câu`} info={{ what: 'Lỗi sai là do bấm vội hay do chưa nắm bài.', how: 'Với mỗi câu, nhìn thời gian suy nghĩ và đúng/sai.' }}>
            <SlipGapScatter data={sg} />
          </TileCard>
          <TileCard title="Sắp quên gì?" subtitle="Những khái niệm nên ôn lại sớm" info={{ what: 'Kiến thức nào đang mờ dần và nên ôn trước.', how: 'Mỗi khái niệm nhớ lâu hay mau tuỳ độ khó và số lần ôn.' }} takeaway={fg.dueSoon[0] ? (fg.dueSoon[0].dueInDays <= 0 ? <>Nên ôn <b>{fg.dueSoon[0].conceptLabel}</b> <b>ngay hôm nay</b> — kiến thức này đang mờ dần rồi.</> : <>Nên ôn <b>{fg.dueSoon[0].conceptLabel}</b> trong khoảng <b>{fg.dueSoon[0].dueInDays} ngày</b> tới.</>) : undefined}>
            <ForgettingCurveChart data={fg} />
          </TileCard>
        </div>
      </Section>

      <Section tag="Khóa học" title="Các khóa của bạn" subtitle="Toàn bộ khóa bạn đã học trong khoảng này — bấm một khóa để mở chi tiết ngay tại đây.">
        <TileCard title="Danh sách khóa" subtitle={`${rows.length} khóa`} info={{ what: 'Bảng gộp mọi khóa: tiến độ, mức nắm, giờ học, trạng thái.', how: 'Mỗi dòng là một khóa bạn từng học trong khoảng thời gian đang chọn.' }}>
          <div className="dv-scroll max-h-[520px] overflow-y-auto">
            <CourseTable rows={rows} onPick={onPickCourse} />
          </div>
        </TileCard>
      </Section>

      <Section tag="Dự đoán" title="Dự đoán từ thói quen học của bạn" subtitle="Nhìn thói quen để đoán trước: sắp vấp ở đâu, sắp quên gì, nguy cơ bỏ — kèm việc nên làm.">
        <div className="grid gap-xl lg:grid-cols-2">
          <TileCard title="Dự báo 14 ngày tới" subtitle={`Nguy cơ bỏ dở đang ${twin.dropoutRisk < 0.34 ? 'thấp' : twin.dropoutRisk < 0.6 ? 'ở mức trung bình' : 'cao'}`} info={{ what: 'Ước lượng nguy cơ bỏ giữa chừng và những gì sắp cản bạn.', how: 'Kết hợp số ngày chưa học lại, tỉ lệ làm đúng gần đây, số bài bỏ dở và độ đều đặn.' }}>
            <div className="flex flex-col gap-xl">
              <div className="flex flex-col items-center gap-xl sm:flex-row">
                <ArcGauge value={Math.round(twin.dropoutRisk * 100)} max={100} unit="%" color={riskColor} sublabel="nguy cơ bỏ dở" size={168} />
                <div className="flex min-w-0 flex-1 flex-col gap-sm">
                  <span className="flex items-center gap-xs text-sm font-medium text-secondary">
                    {twin.trend > 3 ? <TrendingUp className="h-4 w-4 text-warning-600" /> : twin.trend < -3 ? <TrendingDown className="h-4 w-4 text-success-600" /> : null}
                    {twin.trend > 3 ? 'Nhích lên một chút so với 2 tuần trước' : twin.trend < -3 ? 'Dịu đi một chút so với 2 tuần trước' : 'Gần như không đổi so với 2 tuần trước'}
                  </span>
                  <p className="mt-xs text-xs font-medium text-tertiary">Vì sao có con số này:</p>
                  {twin.factors.slice(0, 4).map((f) => {
                    const tag = factorTag(f);
                    return (
                      <span key={f.label} className="flex items-center justify-between gap-md">
                        <span className="flex min-w-0 flex-col">
                          <span className="text-sm font-medium text-primary">{f.label}</span>
                          <span className="text-xs text-tertiary">{f.detail}</span>
                        </span>
                        <span className={`shrink-0 rounded-pill px-md py-xxs text-xs font-semibold ${tag.cls}`}>{tag.text}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-md border-t border-secondary pt-lg">
                <p className="text-sm font-semibold text-primary">Sắp tới có thể gặp</p>
                <ForecastItem tone={STATUS.warning} title="Dễ vấp">
                  khả năng vấp ở <b>{twin.nextConceptLabel}</b> — phần trước chưa thật vững.
                </ForecastItem>
                <ForecastItem tone="#7A5AF8" title="Sắp quên">
                  {fg.dueSoon[0] ? (
                    <>
                      <b>{fg.dueSoon[0].conceptLabel}</b> {fg.dueSoon[0].dueInDays <= 0 ? 'nên ôn ngay hôm nay.' : `sẽ mờ dần trong khoảng ${fg.dueSoon[0].dueInDays} ngày tới.`}
                    </>
                  ) : (
                    <>chưa có kiến thức nào sắp quên gấp.</>
                  )}
                </ForecastItem>
                <ForecastItem tone={riskColor} title="Nguy cơ bỏ dở">
                  đang ở mức <b>{twin.dropoutRisk < 0.34 ? 'thấp' : twin.dropoutRisk < 0.6 ? 'trung bình' : 'cao'}</b>.
                </ForecastItem>
              </div>
            </div>
          </TileCard>
          <TileCard title="Việc nên làm tiếp" subtitle="Xếp theo mức giúp ích, kèm lý do bằng lời thường" info={{ what: 'Vài việc cụ thể nên làm ngay để giữ nhịp và gỡ chỗ khó.', how: 'Rút ra từ chính dự báo bên cạnh.' }}>
            <div className="flex flex-col gap-md">
              {twin.actions.map((a) => <ActionRow key={a.id} a={a} />)}
              {twin.actions.length === 0 ? <p className="text-sm text-tertiary">Bạn đang đúng nhịp — chưa có việc gì gấp.</p> : null}
            </div>
          </TileCard>
        </div>
      </Section>
    </>
  );
}

// ---------------- COURSE DETAIL (modal woven into the general report) ----------------
function CourseDetailModal({ courseId, sts, fromDay, toDay, onClose }: { courseId: string; sts: Statement[]; fromDay: number; toDay: number; onClose: () => void }) {
  const scoped = useMemo(() => scope(sts, { fromDay, toDay, courseId }), [sts, fromDay, toDay, courseId]);
  const lessons = useMemo(() => lessonRows(scoped, courseId), [scoped, courseId]);
  const strat = useMemo(() => strategyFingerprint(scoped), [scoped]);
  const sg = useMemo(() => slipGap(scoped), [scoped]);
  const fg = useMemo(() => forgetting(scoped), [scoped]);
  const cmap = useMemo(() => conceptMapOf(scoped, courseId), [scoped, courseId]);
  const course = COURSE_BY_ID[courseId];
  const hrefFor = (conceptId: string) => `/learn/${course?.slug ?? ''}/${encodeURIComponent(conceptId)}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={`Chi tiết khóa ${course?.title ?? ''}`} className="dv-bubble my-auto flex w-full max-w-[960px] flex-col gap-xl rounded-card border border-secondary bg-primary p-xl shadow-lg sm:p-3xl">
        <div className="flex items-start justify-between gap-md">
          <div className="flex min-w-0 flex-col gap-xxs">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">Chi tiết khóa</span>
            <h2 className="text-display-xs font-semibold text-primary">{course?.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-secondary bg-white text-tertiary transition hover:bg-secondary">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <TileCard title="Các bài của khóa" subtitle={`${lessons.length} bài · bấm một bài để mở báo cáo chi tiết của bài đó`} info={{ what: 'Danh sách bài trong khóa và mức bạn nắm từng bài.', how: 'Mức nắm lấy từ kết quả làm bài của bài đó.' }}>
          <LessonList rows={lessons} hrefFor={hrefFor} />
        </TileCard>

        <TileCard title="Chân dung cách học khóa này" subtitle={strat.label} info={{ what: 'Cách bạn học riêng trong khóa này.', how: 'Đo các thói quen từ hành vi trong khóa.' }} takeaway={<>{strat.blurb}</>}>
          <StrategyRadar axes={strat.axes} />
        </TileCard>

        <TileCard title="Nhầm do vội hay chưa hiểu" subtitle={`Nhầm do vội ${sg.counts.slip} · chưa hiểu ${sg.counts.gap}`} info={{ what: 'Lỗi sai do vội hay do chưa nắm bài, trong khóa này.', how: 'Nhìn thời gian suy nghĩ và đúng/sai mỗi câu.' }}>
          <SlipGapScatter data={sg} />
        </TileCard>

        <TileCard title="Sắp quên gì trong khóa" subtitle="Khái niệm nên ôn lại sớm" info={{ what: 'Kiến thức của khóa đang mờ dần.', how: 'Tuỳ độ khó và số lần ôn của từng khái niệm.' }}>
          <ForgettingCurveChart data={fg} />
        </TileCard>

        {cmap ? (
          <TileCard title="Bản đồ khái niệm" subtitle="Xanh là đã nắm, cam/đỏ là còn yếu" info={{ what: 'Sơ đồ các khái niệm và thứ tự nên học.', how: 'Tô mỗi khái niệm theo mức làm đúng bài của nó.' }} takeaway={cmap.blocked.length > 0 ? <>Có <b>{cmap.blocked.length}</b> phần đang bị chặn vì phần trước chưa vững.</> : undefined}>
            <PrereqGraph nodes={cmap.nodes} edges={cmap.edges} />
          </TileCard>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
