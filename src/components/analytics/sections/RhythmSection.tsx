import { Flame, TrendingUp } from 'lucide-react';
import { Section } from '../Section';
import { ChartCard } from '../charts/ChartCard';
import { BarChart } from '../charts/BarChart';
import { CalendarHeatmap } from '../charts/CalendarHeatmap';
import { PolarClock } from '../charts/PolarClock';
import { RadialRing } from '../charts/gauges';
import { AiInsightCard } from '../AiInsightCard';
import { BRAND, SERIES } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

export function RhythmSection({ a }: { a: LearnerAnalytics }) {
  const r = a.rhythm;
  return (
    <Section index={4} id="nhip-hoc" title="Thời gian, Nhịp & Thói quen" subtitle="Bạn học khi nào và đều đặn ra sao — để nhắc đúng khoảnh khắc và giữ được nhịp.">
      <AiInsightCard label="Nhịp học">
        Bạn học tập trung nhất vào khoảng 21–23 giờ các ngày trong tuần, còn cuối tuần thường nghỉ. Vậy Course AI sẽ nhắc bài mới vào tối đầu
        tuần cho hợp với bạn, tránh nhắc vào lúc bạn ít học.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard
          title="Lịch học 13 tuần gần nhất"
          subtitle="Mỗi ô là một ngày; màu đậm = học nhiều"
          className="lg:col-span-2"
          aside={
            <span className="inline-flex items-center gap-lg">
              <span className="inline-flex items-center gap-xs rounded-pill bg-warning-50 px-lg py-xs text-sm font-semibold text-warning-700">
                <Flame className="h-4 w-4" aria-hidden="true" />
                Chuỗi {a.kpis.streak.value} ngày
              </span>
              <span className="text-sm text-tertiary">Kỷ lục {a.kpis.streak.record} ngày</span>
            </span>
          }
        >
          <CalendarHeatmap days={r.calendar} />
        </ChartCard>

        <ChartCard title="Phút học mỗi tuần" subtitle="So với mục tiêu tuần">
          <BarChart
            ariaLabel="Phút học mỗi tuần so với mục tiêu"
            data={r.weekly.map((w) => ({ label: w.week.replace('Tuần ', 'T'), values: [w.minutes] }))}
            colors={[SERIES.green]}
            max={400}
            unit=" phút"
            goal={{ value: r.weeklyGoal, label: `Mục tiêu ${r.weeklyGoal}` }}
            showValues={false}
          />
        </ChartCard>

        <ChartCard title="Khung giờ vàng" subtitle="Phân bố hoạt động theo 24 giờ">
          <PolarClock data={r.clock} />
        </ChartCard>

        <ChartCard title="Độ đều đặn & đà học" subtitle="Bạn học đều hay dồn cục" className="lg:col-span-2">
          <div className="flex flex-col items-center justify-center gap-2xl py-md sm:flex-row sm:gap-6xl">
            <div className="flex flex-col items-center gap-md">
              <RadialRing value={r.consistency} size={120} stroke={12} centerLabel={`${r.consistency}`} color={BRAND.blue} />
              <span className="text-sm font-medium text-secondary">Chỉ số đều đặn</span>
              <span className="text-xs text-tertiary">Học khá đều trong 28 ngày qua</span>
            </div>
            <div className="flex flex-col items-center gap-md">
              <span className="inline-flex items-center gap-xs text-display-sm font-semibold tabular-nums text-success-600">
                <TrendingUp className="h-7 w-7" aria-hidden="true" />+{r.momentum}%
              </span>
              <span className="text-sm font-medium text-secondary">Đà học</span>
              <span className="text-xs text-tertiary">Nhiều hơn so với 7 ngày trước</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </Section>
  );
}
