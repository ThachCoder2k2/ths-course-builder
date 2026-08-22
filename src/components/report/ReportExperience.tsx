import { useMemo, useState } from 'react';
import Avatar from '../ui/Avatar';
import avatarUser from '../../assets/avatar-user.png';
import { ReportCard } from './ReportCard';
import { RhythmCard } from './RhythmCard';
import { MetricTiles } from './MetricTiles';
import { RANGE_TABS, RangeTabs, type RangeKey } from './RangeTabs';
import { CourseTableCard } from './CourseTableCard';
import { NextActionsCard } from './NextActionsCard';
import { TimeDonut } from './charts/TimeDonut';
import { BarList, type BarRow } from './charts/BarList';
import { Reveal } from '../ui/Reveal';
import { EmptyState } from './EmptyState';
import { StrategyRadar } from './charts/StrategyRadar';
import { getBehaviorData } from '../../behavior/seed';
import { goldenHours, strategyFingerprint, twinForecast } from '../../behavior/selectors';
import { courseTable, currentStreak, overviewStats, recurringStumbles, scope, timeSplit, topicStrength } from '../../behavior/overview';
import { daHocHetBai } from '../../behavior/completion';
import { COURSES, NOW, SPAN_DAYS, START } from '../../behavior/catalog';
import { scrollToTop } from '../../lib/motion';

const MS_DAY = 86400000;
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const START_MIDNIGHT = midnight(START);

/** ngày thật → chỉ số ngày kể từ mốc bắt đầu của dữ liệu */
const dayIndexOf = (d: Date): number => Math.round((midnight(d) - START_MIDNIGHT) / MS_DAY);
/** chỉ số ngày → ngày thật */
const dateOfDayIndex = (i: number): Date => new Date(START_MIDNIGHT + i * MS_DAY);

const dmy = (d: Date): string => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
const monthLabel = (d: Date): string => `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Cách đọc khoảng đang xem. Mốc 12 tháng đọc theo tháng cho gọn (đúng như thiết kế),
 * còn khoảng gói trong một ngày thì ghi đúng một ngày — "20/08 – 20/08" là câu vô nghĩa.
 */
function describeRange(from: Date, to: Date, byMonth: boolean): string {
  if (sameDay(from, to)) return dmy(from);
  if (byMonth) return `${monthLabel(from)} – ${monthLabel(to)}`;
  return `${dmy(from)} – ${dmy(to)}`;
}

/** "7 giờ 52 phút" / "45 phút" */
function studyTime(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} giờ` : `${h} giờ ${String(rest).padStart(2, '0')} phút`;
}

/**
 * "Học tập của tôi" — báo cáo gộp mọi khoá: ba con số mở đầu, chân dung cách học,
 * lịch nhịp học, mạnh yếu theo chủ đề, chỗ hay vấp, bảng khoá học và việc nên làm tiếp.
 *
 * Toàn bộ số liệu đọc ra từ log hành vi trong `src/behavior` chứ không cắm số cứng, và
 * mọi thẻ đều đọc từ đúng một biến `scoped` — nên đổi bộ lọc là cả trang kể lại cùng một
 * câu chuyện của đúng khoảng đó, không có thẻ nào nói theo mốc thời gian riêng.
 */
export function ReportExperience() {
  const data = useMemo(() => getBehaviorData('hieu'), []);
  const sts = data.statements;

  const [range, setRange] = useState<RangeKey>('month');
  const [custom, setCustom] = useState<{ from: Date; to: Date }>(() => ({
    from: new Date(midnight(NOW) - 29 * MS_DAY),
    to: new Date(midnight(NOW)),
  }));

  // Đổi bộ lọc là cả trang đổi dữ liệu, nên đưa về đầu để đọc lại từ ba con số mở đầu.
  // Đứng nguyên ở giữa trang thì cái thẻ đang xem đã là dữ liệu khác mất rồi.
  const pickRange = (key: RangeKey) => {
    setRange(key);
    scrollToTop();
  };

  const { fromDay, toDay, fromDate, toDate, rangeLabel } = useMemo(() => {
    const todayIdx = dayIndexOf(NOW);
    if (range === 'custom') {
      const lo = Math.max(0, Math.min(dayIndexOf(custom.from), dayIndexOf(custom.to)));
      const hi = Math.min(SPAN_DAYS, Math.max(dayIndexOf(custom.from), dayIndexOf(custom.to)));
      return {
        fromDay: lo,
        toDay: hi,
        fromDate: dateOfDayIndex(lo),
        toDate: dateOfDayIndex(hi),
        rangeLabel: describeRange(dateOfDayIndex(lo), dateOfDayIndex(hi), false),
      };
    }
    const days = RANGE_TABS.find((t) => t.key === range)?.days ?? 30;
    const lo = Number.isFinite(days) ? Math.max(0, todayIdx - (days - 1)) : 0;
    const a = dateOfDayIndex(lo);
    const b = dateOfDayIndex(todayIdx);
    return {
      fromDay: lo,
      toDay: todayIdx,
      fromDate: a,
      toDate: b,
      rangeLabel: describeRange(a, b, range === 'year'),
    };
  }, [range, custom]);

  // Một nguồn duy nhất cho cả trang: mọi thẻ, biểu đồ và con số đều đọc từ đây, nên
  // đổi bộ lọc là cả trang kể lại cùng một câu chuyện của đúng khoảng đó.
  const scoped = useMemo(() => scope(sts, { fromDay, toDay, courseId: null }), [sts, fromDay, toDay]);
  const spanDays = toDay - fromDay + 1;

  const hasData = scoped.length > 0;
  const stats = useMemo(() => overviewStats(scoped), [scoped]);
  const strat = useMemo(() => strategyFingerprint(scoped, spanDays), [scoped, spanDays]);
  const split = useMemo(() => timeSplit(scoped), [scoped]);
  const streak = useMemo(() => currentStreak(scoped, toDay), [scoped, toDay]);
  const golden = useMemo(() => goldenHours(scoped), [scoped]);
  const topics = useMemo(() => topicStrength(scoped), [scoped]);
  const stumbles = useMemo(() => recurringStumbles(scoped), [scoped]);
  const rows = useMemo(() => courseTable(scoped), [scoped]);

  // Khoá nào đã đi hết bài thì có báo cáo cuối khoá để mở. Tính trên TOÀN BỘ dữ liệu, không
  // theo khoảng lọc đang chọn: học xong từ tháng trước thì lọc "7 ngày" vẫn phải mở được.
  const slugCoBaoCao = useMemo(() => {
    const toanBo = scope(sts, { fromDay: 0, toDay: SPAN_DAYS + 1, courseId: null });
    return new Set(COURSES.filter((c) => daHocHetBai(toanBo, c.id)).map((c) => c.slug));
  }, [sts]);
  const forecast = useMemo(() => twinForecast(scoped), [scoped]);

  const topicRows: BarRow[] = topics.map((t, i) => ({
    id: t.topic,
    title: t.name,
    note: `${t.courses} khoá · ${studyTime(t.minutes)}`,
    value: t.mastery,
    family: i,
  }));

  const maxStumble = Math.max(1, ...stumbles.map((s) => s.score));
  // lệch hệ màu so với thẻ chủ đề để hai thẻ cạnh nhau không trông như một
  const stumbleRows: BarRow[] = stumbles.map((s, i) => ({
    id: `${s.conceptLabel}-${i}`,
    title: s.conceptLabel,
    note: s.courseTitle,
    value: s.score / maxStumble,
    family: i + 4,
  }));

  return (
    <div className="mx-auto w-full max-w-content px-4 pb-9xl pt-2xl lg:px-4xl">
      <div className="flex flex-col gap-2xl">
        {/* Tên và bộ lọc dính lại khi cuộn. Ngoài chuyện tiện, nó còn chữa cú nhảy về đầu
            trang: bấm chuột làm nút nhận focus, và trình duyệt sẽ cuộn phần tử đang focus
            vào tầm nhìn — nút nằm trên đỉnh document thì cả trang bị kéo lên. Dính lại
            thì nút luôn ở trong tầm nhìn nên không còn gì để cuộn. */}
        <div className="rp-sticky sticky top-20 z-30 -mx-4 flex flex-col gap-lg border-b border-secondary bg-primary px-4 pb-lg pt-md lg:-mx-4xl lg:px-4xl">
          <header className="flex items-center gap-xl">
            <Avatar name={data.learner.name} src={avatarUser} size="md" className="border-[0.75px] border-[rgba(0,0,0,0.08)]" />
            <h1 className="text-lg font-semibold text-primary">{data.learner.name}</h1>
          </header>

          <RangeTabs
            value={range}
            onChange={pickRange}
            from={fromDate}
            to={toDate}
            min={dateOfDayIndex(0)}
            max={new Date(midnight(NOW))}
            onApplyCustom={(a, b) => {
              setCustom({ from: a, to: b });
              setRange('custom');
              scrollToTop();
            }}
            rangeLabel={rangeLabel}
          />
        </div>

        <Reveal>
          <MetricTiles coursesStudied={stats.coursesTouched} coursesTotal={COURSES.length} focusHours={stats.focusHours} longestStreak={stats.longestStreak} />
        </Reveal>

        {/* cách bạn học, và thời gian học rơi vào những việc gì */}
        <div className="grid grid-cols-1 gap-2xl lg:grid-cols-2">
          <Reveal className="flex" order={0}>
            {/* Không có hành vi nào trong khoảng thì đừng vẽ radar: các trục sẽ về 0 trừ
                "Làm đúng" (mặc định 0.5 khi chưa có câu nào), thành ra một cái gai vô nghĩa. */}
            <ReportCard
              title="Chân dung người học"
              subtitle={hasData ? strat.label : 'Chưa có dữ liệu'}
              bodyClassName="justify-center"
              className="flex-1"
            >
              {hasData ? <StrategyRadar axes={strat.axes} /> : <EmptyState text="Chưa có buổi học nào để dựng chân dung" />}
            </ReportCard>
          </Reveal>

          <Reveal className="flex" order={1}>
            <ReportCard title="Phân bố thời gian học" subtitle="Thời gian học thật rơi vào những việc gì" bodyClassName="justify-center gap-xl" className="flex-1">
              <TimeDonut slices={split} />
            </ReportCard>
          </Reveal>
        </div>

        {/* nhịp học */}
        <Reveal>
          <RhythmCard
            scoped={scoped}
            fromDate={fromDate}
            toDate={toDate}
            streak={streak}
            golden={golden}
            focusMinutes={stats.focusHours * 60}
          />
        </Reveal>

        {/* mạnh yếu và chỗ vấp */}
        <div className="grid grid-cols-1 gap-2xl lg:grid-cols-2">
          <Reveal className="flex" order={0}>
            <ReportCard title="Mạnh - yếu theo chủ đề" subtitle="Xếp từ chắc nhất xuống" className="flex-1">
              <BarList rows={topicRows} />
            </ReportCard>
          </Reveal>
          <Reveal className="flex" order={1}>
            <ReportCard title="Chỗ hay vấp lặp lại" subtitle="Những khái niệm bạn phải xem lại nhiều nhất" className="flex-1">
              <BarList rows={stumbleRows} />
            </ReportCard>
          </Reveal>
        </div>

        {/* bảng khoá học + việc nên làm */}
        {/* Chia 2/3 + 1/3 chỉ từ xl: ở 1024px cột 2/3 hẹp hơn bảng sáu cột nên bảng phải
            được cả bề rộng, không thì lại sinh cuộn ngang. */}
        {/* items-start: thiết kế để hai thẻ cao khác nhau (bảng 568, việc nên làm 465),
            không kéo bằng nhau. Kéo bằng thì thẻ việc nên làm chừa hơn 300px trắng ở dưới. */}
        <div className="grid grid-cols-1 items-start gap-2xl xl:grid-cols-3">
          <Reveal className="flex xl:col-span-2" order={0}>
            <CourseTableCard rows={rows} slugCoBaoCao={slugCoBaoCao} />
          </Reveal>
          <Reveal className="flex" order={1}>
            <NextActionsCard actions={forecast.actions} />
          </Reveal>
        </div>

      </div>
    </div>
  );
}
