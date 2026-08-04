import { Section } from '../Section';
import { ChartCard } from '../charts/ChartCard';
import { ArcGauge } from '../charts/gauges';
import { Sparkline } from '../charts/Sparkline';
import { RadarChart } from '../charts/RadarChart';
import { ScatterPlot } from '../charts/ScatterPlot';
import { LineChart } from '../charts/LineChart';
import { AiInsightCard, AiAnnotation } from '../AiInsightCard';
import { BRAND, SERIES } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

export function MindsetSection({ a }: { a: LearnerAnalytics }) {
  const m = a.mindset;
  return (
    <Section index={5} id="cam-xuc" title="Cảm xúc, Động lực & Siêu nhận thức" subtitle="Trạng thái bên trong khi học — để chọn đúng giọng động viên và mức hỗ trợ cho bạn.">
      <AiInsightCard label="Động viên">
        Có vài bài bạn thấy khó và suýt bỏ giữa chừng, nhưng bạn đã quay lại làm cho xong — điều đó đáng quý hơn cả điểm số. Đừng vội đánh giá
        mình qua một bài làm sai; nhìn tổng thể bạn đang tiến đều.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard title="Mức tự tin" subtitle="Tự tin cảm nhận về mức nắm bài">
          <div className="flex flex-col items-center gap-lg">
            <ArcGauge value={m.confidence} sublabel="đang nhích lên đều" color={BRAND.blue} size={168} />
            <Sparkline data={m.confidenceSpark} width={220} height={44} color={BRAND.blue} />
          </div>
        </ChartCard>

        <ChartCard
          title="Ảo tưởng đã hiểu"
          subtitle="Tự tin cao nhưng điểm thực chưa theo kịp"
          note={<AiAnnotation>Góc dưới-phải là vùng “tưởng đã hiểu”. “Đạo đức AI” đang ở đó — nên ôn lại trước khi qua bài.</AiAnnotation>}
        >
          <ScatterPlot
            ariaLabel="Tự tin so với điểm thực theo từng chủ đề"
            points={m.illusion}
            quadrant
            xLabel="Mức tự tin →"
            yLabel="Điểm thực tế →"
            legend={[
              { label: 'Nắm chắc', tone: 'good' },
              { label: 'Ổn', tone: 'neutral' },
              { label: 'Cần để ý', tone: 'warning' },
              { label: 'Tưởng đã hiểu', tone: 'danger' },
            ]}
          />
        </ChartCard>

        <ChartCard title="Năng lực tự điều chỉnh học tập" subtitle="Lập kế hoạch · theo dõi · kiểm soát">
          <RadarChart ariaLabel="Năng lực tự điều chỉnh học tập" axes={m.selfReg.map((s) => s.axis)} series={[{ name: 'Tự điều chỉnh', color: SERIES.violet, values: m.selfReg.map((s) => s.value) }]} />
        </ChartCard>

        <ChartCard title="Quỹ đạo cảm xúc" subtitle="Diễn biến tâm trạng khi học trong tuần">
          <LineChart ariaLabel="Diễn biến tâm trạng khi học trong tuần" labels={m.mood.map((d) => d.label)} yMax={5} yTicks={5} series={[{ name: 'Tâm trạng', color: SERIES.orange, points: m.mood.map((d) => d.value), area: true }]} />
        </ChartCard>
      </div>
    </Section>
  );
}
