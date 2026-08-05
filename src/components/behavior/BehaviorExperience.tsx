import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, GraduationCap, Sparkles, Target, Timer, TrendingDown, TrendingUp } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { Reveal } from '../analytics/Reveal';
import { TileCard } from '../analytics/TileCard';
import { PrereqGraph } from '../analytics/charts/PrereqGraph';
import { CalendarHeatmap } from '../analytics/charts/CalendarHeatmap';
import { ArcGauge } from '../analytics/charts/gauges';
import { getBehaviorData } from '../../behavior/seed';
import { ahaMoments, confusionMap, conceptMapOf, focusBreakdown, forgetting, goldenHours, sessionReplay, slipGap, strategyFingerprint, twinForecast, watchCoverage } from '../../behavior/selectors';
import { courseTable, lessonRows, masteryOverMonths, overviewStats, recurringStumbles, rhythm, scope, topicStrength, videoIdOfConcept } from '../../behavior/overview';
import { CONCEPTS_OF, CONCEPT_BY_ID, COURSE_BY_ID } from '../../behavior/catalog';
import { minutesLabel, pct } from '../../behavior/format';
import { STATUS } from '../analytics/palette';
import type { NextAction } from '../../behavior/types';
import { FilterBar, RANGE_DAYS, type RangePreset } from './FilterBar';
import { ConfusionHeatmap } from './charts/ConfusionHeatmap';
import { SessionReplay } from './charts/SessionReplay';
import { AhaArc } from './charts/AhaArc';
import { TwinHorizon } from './charts/TwinHorizon';
import { WatchCoverageBar } from './charts/WatchCoverageBar';
import { GoldenHoursHeatmap } from './charts/GoldenHoursHeatmap';
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

const TOPIC_TAG: Record<string, string> = { ai: 'Trí tuệ nhân tạo', data: 'Phân tích dữ liệu', web: 'Lập trình web', english: 'Tiếng Anh', pm: 'Kỹ năng & Quản lý' };

export function BehaviorExperience() {
  const data = useMemo(() => getBehaviorData('hieu'), []);
  const sts = data.statements;

  const [range, setRange] = useState<RangePreset>('365');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [conceptId, setConceptId] = useState<string | null>(null);
  const rangeDays = RANGE_DAYS[range];

  const scopedRange = useMemo(() => scope(sts, { rangeDays, courseId: null, conceptId: null }), [sts, rangeDays]);
  const scopedCourse = useMemo(() => (courseId ? scope(sts, { rangeDays, courseId, conceptId: null }) : scopedRange), [sts, rangeDays, courseId, scopedRange]);
  const lessonScoped = useMemo(() => (conceptId ? scope(sts, { rangeDays: null, courseId, conceptId }) : []), [sts, courseId, conceptId]);

  const mode: 'overview' | 'course' | 'lesson' = conceptId ? 'lesson' : courseId ? 'course' : 'overview';

  // header KPIs are the learner's overall picture for the time range (identity),
  // not re-scoped by course — the filter narrows the body, not who you are.
  const stats = useMemo(() => overviewStats(scopedRange), [scopedRange]);
  const courses = useMemo(() => courseTable(scopedRange), [scopedRange]);
  const courseOpts = courses.map((c) => ({ value: c.id, label: c.title }));
  const lessonOpts = courseId ? CONCEPTS_OF(courseId).map((c) => ({ value: c.id, label: `Bài ${c.col + 1}: ${c.label}` })) : [];
  const courseName = courseId ? COURSE_BY_ID[courseId]?.title ?? null : null;
  const lessonName = conceptId ? CONCEPT_BY_ID[conceptId]?.label ?? null : null;

  // đổi bộ lọc → đưa về đầu trang để đọc lại báo cáo từ đầu
  const scrollTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const onRange = (r: RangePreset) => {
    setRange(r);
    scrollTop();
  };
  const onCourse = (id: string | null) => {
    setCourseId(id);
    setConceptId(null);
    scrollTop();
  };
  const onConcept = (id: string | null) => {
    setConceptId(id);
    scrollTop();
  };

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

      <FilterBar
        range={range}
        onRange={onRange}
        courseId={courseId}
        onCourse={onCourse}
        conceptId={conceptId}
        onConcept={onConcept}
        courses={courseOpts}
        lessons={lessonOpts}
        courseName={courseName}
        lessonName={lessonName}
      />

      <div className="flex flex-col gap-7xl">
        {mode === 'overview' ? <OverviewMode scoped={scopedRange} onPickCourse={onCourse} /> : null}
        {mode === 'course' ? <CourseMode scoped={scopedCourse} courseId={courseId!} onPickLesson={onConcept} /> : null}
        {mode === 'lesson' ? <LessonMode scoped={lessonScoped} conceptId={conceptId!} /> : null}
      </div>
    </div>
  );
}

// ---------------- OVERVIEW ----------------
function OverviewMode({ scoped, onPickCourse }: { scoped: import('../../behavior/events').Statement[]; onPickCourse: (id: string) => void }) {
  const strat = useMemo(() => strategyFingerprint(scoped), [scoped]);
  const golden = useMemo(() => goldenHours(scoped), [scoped]);
  const focus = useMemo(() => focusBreakdown(scoped, 365), [scoped]);
  const months = useMemo(() => masteryOverMonths(scoped), [scoped]);
  const days = useMemo(() => rhythm(scoped, 365), [scoped]);
  const topics = useMemo(() => topicStrength(scoped), [scoped]);
  const stumbles = useMemo(() => recurringStumbles(scoped), [scoped]);
  const sg = useMemo(() => slipGap(scoped), [scoped]);
  const fg = useMemo(() => forgetting(scoped), [scoped]);
  const rows = useMemo(() => courseTable(scoped), [scoped]);
  const twin = useMemo(() => twinForecast(scoped), [scoped]);
  const riskColor = twin.dropoutRisk < 0.34 ? STATUS.good : twin.dropoutRisk < 0.6 ? STATUS.warning : STATUS.danger;

  return (
    <>
      <Section tag="Cách học" title="Cách bạn học" subtitle="Chân dung cách bạn học, khung giờ học vào nhất và số phút thực sự tập trung — gộp trên mọi khóa.">
        <div className="grid gap-xl lg:grid-cols-3">
          <TileCard title="Chân dung người học" subtitle={strat.label} info={{ what: 'Một hình vẽ nhanh về cách bạn học, so với chính bạn.', how: 'Đo vài thói quen từ hành vi: hay xem lại, học đều, kiên trì, làm đúng, chủ động hỏi, tập trung.' }} takeaway={<>{strat.blurb}</>}>
            <StrategyRadar axes={strat.axes} />
          </TileCard>
          <TileCard title="Giờ vàng của bạn" subtitle={`Học vào nhất lúc ${golden.peakLabel}`} info={{ what: 'Khung giờ trong tuần bạn học tập trung nhất.', how: 'Cộng số phút tập trung theo từng giờ và từng thứ.' }}>
            <GoldenHoursHeatmap data={golden} />
          </TileCard>
          <TileCard title="Phút tập trung thật" subtitle={`Tập trung ${pct(focus.focusRate)} thời gian mở bài`} info={{ what: 'Trong thời gian mở bài, bao nhiêu là học thật.', how: 'Lấy thời gian mở bài trừ đi lúc ngồi không và lúc rời sang tab khác.' }}>
            <FocusWaterfall data={focus} />
          </TileCard>
        </div>
      </Section>

      <Section tag="Tiến bộ" title="Bạn khá lên tới đâu" subtitle="Đường tiến bộ và nhịp học cả quãng — nhìn được mình đi lên hay chững lại.">
        <div className="grid gap-xl lg:grid-cols-2">
          <TileCard title="Tiến bộ theo tháng" subtitle="Tỉ lệ làm đúng cộng dồn" info={{ what: 'Bạn làm bài đúng dần lên theo thời gian chưa.', how: 'Cộng dồn số câu đúng trên tổng số câu đã làm, tính theo từng tháng.' }}>
            <TrendLine data={months} />
          </TileCard>
          <TileCard title="Nhịp học của bạn" subtitle="Mỗi ô là một ngày · đậm là học nhiều" info={{ what: 'Bạn học đều hay dồn cục, có quãng nghỉ dài không.', how: 'Tô đậm nhạt theo số phút tập trung mỗi ngày.' }}>
            <CalendarHeatmap days={days} />
          </TileCard>
        </div>
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

      <Section tag="Khóa học" title="Các khóa của bạn" subtitle="Toàn bộ khóa bạn đã học trong khoảng này — bấm một khóa để xem riêng.">
        <TileCard title="Danh sách khóa" subtitle={`${rows.length} khóa`} info={{ what: 'Bảng gộp mọi khóa: tiến độ, mức nắm, giờ học, trạng thái.', how: 'Mỗi dòng là một khóa bạn từng học trong khoảng thời gian đang chọn.' }}>
          <CourseTable rows={rows} onPick={onPickCourse} />
        </TileCard>
      </Section>

      <Section tag="Dự đoán" title="Dự đoán từ thói quen học của bạn" subtitle="Nhìn thói quen để đoán trước: sắp vấp ở đâu, sắp quên gì, nguy cơ bỏ — kèm việc nên làm.">
        <div className="grid gap-xl lg:grid-cols-2">
          <TileCard title="Dự báo 14 ngày tới" subtitle={`Nguy cơ bỏ dở đang ${twin.dropoutRisk < 0.34 ? 'thấp' : twin.dropoutRisk < 0.6 ? 'ở mức trung bình' : 'cao'}`} info={{ what: 'Ước lượng nguy cơ bỏ giữa chừng và những gì sắp cản bạn.', how: 'Kết hợp số ngày chưa học lại, tỉ lệ làm đúng gần đây, số bài bỏ dở và độ đều đặn.' }}>
            <div className="flex flex-col gap-xl">
              <div className="flex flex-col items-center gap-lg sm:flex-row">
                <ArcGauge value={Math.round(twin.dropoutRisk * 100)} max={100} unit="%" color={riskColor} sublabel="nguy cơ bỏ dở" size={168} />
                <div className="flex min-w-0 flex-1 flex-col gap-md">
                  <span className="flex items-center gap-xs text-sm font-medium text-secondary">
                    {twin.trend >= 0 ? <TrendingUp className="h-4 w-4 text-warning-600" /> : <TrendingDown className="h-4 w-4 text-success-600" />}
                    {twin.trend >= 0 ? `Nhích lên ${twin.trend}%` : `Giảm ${Math.abs(twin.trend)}%`} so với trước
                  </span>
                  {twin.factors.slice(0, 4).map((f) => (
                    <span key={f.label} className="flex flex-col gap-xxs">
                      <span className="flex items-center justify-between text-xs text-tertiary">
                        <span>{f.label}</span>
                        <span className="tabular-nums">{Math.round(f.weight * 100)}%</span>
                      </span>
                      <span className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <span className="block h-full rounded-full" style={{ width: `${Math.round(f.weight * 100)}%`, background: f.dir === 'up' ? STATUS.warning : STATUS.good }} />
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <TwinHorizon horizon={twin.horizon} />
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

// ---------------- COURSE ----------------
function CourseMode({ scoped, courseId, onPickLesson }: { scoped: import('../../behavior/events').Statement[]; courseId: string; onPickLesson: (id: string) => void }) {
  const lessons = useMemo(() => lessonRows(scoped, courseId), [scoped, courseId]);
  const strat = useMemo(() => strategyFingerprint(scoped), [scoped]);
  const sg = useMemo(() => slipGap(scoped), [scoped]);
  const fg = useMemo(() => forgetting(scoped), [scoped]);
  const cmap = useMemo(() => conceptMapOf(scoped, courseId), [scoped, courseId]);
  const course = COURSE_BY_ID[courseId];

  return (
    <>
      <Section tag="Trong khóa" title={`Bài trong khóa “${course?.title ?? ''}”`} subtitle="Từng bài, mức bạn đã nắm và chỗ hay vấp — bấm một bài để xem chi tiết khoảnh khắc.">
        <TileCard title="Các bài của khóa" subtitle={`${lessons.length} bài`} info={{ what: 'Danh sách bài trong khóa và mức bạn nắm từng bài.', how: 'Mức nắm lấy từ kết quả làm bài của bài đó.' }}>
          <LessonList rows={lessons} onPick={onPickLesson} />
        </TileCard>
      </Section>

      <Section tag="Cách học" title="Cách bạn học khóa này" subtitle="Chân dung cách học và những lỗi hay gặp, tính riêng cho khóa này.">
        <div className="grid gap-xl lg:grid-cols-3">
          <TileCard title="Chân dung người học" subtitle={strat.label} info={{ what: 'Cách bạn học riêng trong khóa này.', how: 'Đo các thói quen từ hành vi trong khóa.' }} takeaway={<>{strat.blurb}</>}>
            <StrategyRadar axes={strat.axes} />
          </TileCard>
          <TileCard title="Nhầm do vội hay chưa hiểu" subtitle={`Nhầm do vội ${sg.counts.slip} · chưa hiểu ${sg.counts.gap}`} info={{ what: 'Lỗi sai do vội hay do chưa nắm bài, trong khóa này.', how: 'Nhìn thời gian suy nghĩ và đúng/sai mỗi câu.' }}>
            <SlipGapScatter data={sg} />
          </TileCard>
          <TileCard title="Sắp quên gì?" subtitle="Khái niệm nên ôn lại sớm" info={{ what: 'Kiến thức của khóa đang mờ dần.', how: 'Tuỳ độ khó và số lần ôn của từng khái niệm.' }}>
            <ForgettingCurveChart data={fg} />
          </TileCard>
        </div>
      </Section>

      {cmap ? (
        <Section tag="Bản đồ" title="Bản đồ khái niệm" subtitle="Các phần kiến thức nối nhau — tô theo mức bạn đã nắm.">
          <TileCard title={`Trong khóa “${cmap.courseTitle}”`} subtitle="Xanh là đã nắm, cam/đỏ là còn yếu" info={{ what: 'Sơ đồ các khái niệm và thứ tự nên học.', how: 'Tô mỗi khái niệm theo mức làm đúng bài của nó.' }} takeaway={cmap.blocked.length > 0 ? <>Có <b>{cmap.blocked.length}</b> phần đang bị chặn vì phần trước chưa vững.</> : undefined}>
            <PrereqGraph nodes={cmap.nodes} edges={cmap.edges} />
          </TileCard>
        </Section>
      ) : null}
    </>
  );
}

// ---------------- LESSON ----------------
function LessonMode({ scoped, conceptId }: { scoped: import('../../behavior/events').Statement[]; conceptId: string }) {
  const videoId = videoIdOfConcept(conceptId);
  const hero = useMemo(() => confusionMap(scoped, videoId), [scoped, videoId]);
  const cover = useMemo(() => watchCoverage(scoped, videoId), [scoped, videoId]);
  const replay = useMemo(() => sessionReplay(scoped), [scoped]);
  const aha = useMemo(() => ahaMoments(scoped)[0] ?? null, [scoped]);
  const concept = CONCEPT_BY_ID[conceptId];

  return (
    <>
      <Section tag="Chỗ vấp" title={`Chỗ vấp trong bài “${concept?.label ?? ''}”`} subtitle="Đúng giây phút bạn hay dừng, tua lại, xin gợi ý — chỗ đậm màu là chỗ khó nhất.">
        {hero ? (
          <TileCard title={`Bản đồ chỗ vấp · ${hero.videoTitle}`} subtitle={`${hero.courseTitle} · chỗ đậm là nơi bạn dừng và tua lại nhiều nhất`} info={{ what: 'Chỗ nào trong video bạn hay dừng, tua lại, giảm tốc hay xin gợi ý.', how: 'Trải video theo trục thời gian, đếm số lần mỗi thao tác rơi vào từng đoạn ngắn.' }}>
            <ConfusionHeatmap map={hero} />
          </TileCard>
        ) : (
          <TileCard title="Chưa đủ dữ liệu" subtitle={concept?.label ?? ''}>
            <p className="text-sm text-tertiary">Bài này chưa có đủ thao tác để dựng bản đồ chỗ vấp.</p>
          </TileCard>
        )}
        {cover ? (
          <TileCard title="Bạn xem thật hay chỉ mở cho có" subtitle={hero?.videoTitle ?? ''} info={{ what: 'Phần nào của video bạn thực sự xem, phần nào tua nhanh hay bỏ qua.', how: 'Dựng lại từ các đoạn đã phát, chỗ tua lại và chỗ nhảy qua.' }}>
            <WatchCoverageBar data={cover} />
          </TileCard>
        ) : null}
      </Section>

      {aha ? (
        <Section tag="Hiểu ra" title="Lúc bạn hiểu ra bài này" subtitle="Lúc bạn đang lúng túng rồi làm đúng bài ngay sau đó.">
          <TileCard title={`Lúc bạn hiểu ra “${aha.conceptLabel}”`} subtitle={`tua lại ${aha.rewinds} lần rồi làm được`} info={{ what: 'Thời điểm chỗ khó bỗng hiểu ra.', how: 'Nhìn ra từ việc tua lại nhiều lần rồi làm đúng bài ngay sau.' }}>
            <AhaArc moment={aha} />
          </TileCard>
        </Section>
      ) : null}

      {replay ? (
        <Section tag="Tua lại" title="Xem lại buổi học bài này" subtitle="Kéo thanh tua để xem chỗ nào khó nhưng gỡ được, chỗ nào loay hoay chưa ra.">
          <TileCard title={`Buổi học · ${replay.courseTitle}`} subtitle={replay.summary} info={{ what: 'Diễn biến khi bạn học bài này, tua lại được.', how: 'Xâu chuỗi các thao tác theo thứ tự, tô màu theo trạng thái.' }}>
            <SessionReplay replay={replay} />
          </TileCard>
        </Section>
      ) : null}
    </>
  );
}
