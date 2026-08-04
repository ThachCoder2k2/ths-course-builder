import { CalendarClock } from 'lucide-react';
import { Section } from '../Section';
import { ChartCard, Legend } from '../charts/ChartCard';
import { RadialRing } from '../charts/gauges';
import { LineChart } from '../charts/LineChart';
import { Pyramid } from '../charts/simple';
import { BadgeShelf } from '../charts/simple';
import { AiInsightCard } from '../AiInsightCard';
import { BRAND, cat, SERIES } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

export function ProgressSection({ a }: { a: LearnerAnalytics }) {
  const p = a.progress;
  const labels = p.velocity.map((v) => v.week);
  const pyramidRows = [...p.levels].reverse().map((l) => ({
    label: l.level,
    value: Math.round((l.mastered / l.total) * 100),
    sub: `${l.mastered}/${l.total}`,
  }));

  return (
    <Section index={1} id="tien-do" title="Tiến độ & Kết quả" subtitle="Bạn đã đi tới đâu trong các khóa của mình, chất lượng ra sao và dự kiến hoàn thành khi nào.">
      <AiInsightCard label="Tiến độ">
        Khóa “AI từ cơ bản đến thực tiễn” bạn đã đi được {p.courses[0].progress}%, chỉ còn vài bài nữa. Nếu giữ nhịp học đều như mấy tuần gần
        đây, khoảng ngày {p.etaLabel} là bạn hoàn thành.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard title="Tiến độ từng khóa" subtitle="Phần trăm bài đã hoàn thành trong mỗi khóa">
          <div className="flex flex-wrap justify-around gap-lg pt-md">
            {p.courses.map((c, i) => (
              <RadialRing key={c.title} value={c.progress} label={c.title} color={cat(i)} />
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Độ sâu thành thạo theo cấp độ"
          subtitle="Số khái niệm đã làm chủ ở mỗi bậc"
          note={<p className="text-sm text-tertiary">Nền tảng đã vững; phần Trung cấp và Nâng cao còn nhiều dư địa để tiến tiếp.</p>}
        >
          <Pyramid rows={pyramidRows} />
        </ChartCard>

        <ChartCard
          title="Vận tốc học & dự kiến hoàn thành"
          subtitle="Số bài tích lũy theo tuần"
          className="lg:col-span-2"
          aside={
            <span className="inline-flex items-center gap-xs rounded-pill bg-brand-50 px-lg py-xs text-sm font-semibold text-brand-secondary">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              Dự kiến xong {p.etaLabel} · còn {p.daysLeft} ngày
            </span>
          }
          note={<Legend items={[{ label: 'Thực tế', color: BRAND.blue }, { label: 'Kế hoạch', color: SERIES.greenBlue, dashed: true }, { label: 'Dự phóng', color: SERIES.orange, dashed: true }]} />}
        >
          <LineChart
            ariaLabel="Vận tốc học theo tuần so với kế hoạch và dự phóng"
            labels={labels}
            unit=" bài"
            yMax={30}
            yTicks={6}
            series={[
              { name: 'Thực tế', color: BRAND.blue, points: p.velocity.map((v) => v.actual), area: true },
              { name: 'Kế hoạch', color: SERIES.greenBlue, points: p.velocity.map((v) => v.planned), dashed: true },
              { name: 'Dự phóng', color: SERIES.orange, points: p.velocity.map((v) => v.projected), dashed: true },
            ]}
          />
        </ChartCard>

        <ChartCard title="Chứng chỉ & huy hiệu" subtitle="Cột mốc bạn đã đạt được" className="lg:col-span-2">
          <BadgeShelf badges={p.badges} />
        </ChartCard>
      </div>
    </Section>
  );
}
