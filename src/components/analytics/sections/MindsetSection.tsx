import { Section } from '../Section';
import { ChartCard } from '../charts/ChartCard';
import { ArcGauge } from '../charts/gauges';
import { Sparkline } from '../charts/Sparkline';
import { RadarChart } from '../charts/RadarChart';
import { ScatterPlot, type ScatterPoint } from '../charts/ScatterPlot';
import { LineChart } from '../charts/LineChart';
import { AiInsightCard, AiAnnotation } from '../AiInsightCard';
import { BRAND, SERIES } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

export function MindsetSection({ a }: { a: LearnerAnalytics }) {
  const m = a.mindset;
  const illusion: ScatterPoint[] = a.topics.map((t) => {
    const gap = t.confidence - t.accuracy;
    const tone = gap > 10 ? 'danger' : gap > 4 ? 'warning' : gap < -4 ? 'good' : 'neutral';
    return { label: t.name, x: t.confidence, y: t.accuracy, tone };
  });

  return (
    <Section index={5} id="cam-xuc" title="Cảm xúc, Động lực & Cách bạn tự học" subtitle="Trạng thái bên trong khi học — để chọn đúng giọng động viên và mức hỗ trợ cho bạn.">
      <AiInsightCard label="Động viên">
        Có vài bài bạn thấy khó và suýt bỏ giữa chừng, nhưng bạn đã quay lại làm cho xong — điều đó đáng quý hơn cả điểm số. Ở vài chủ đề mới,
        bạn tự tin hơn kết quả thực một chút, nên kiểm tra lại nhẹ nhàng trước khi đi tiếp là vừa.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard
          title="Mức tự tin"
          subtitle="Cảm nhận của bạn về mức nắm bài"
          info={{
            what: 'Cảm nhận của bạn về mức nắm bài, trung bình trên các chủ đề.',
            how: 'Lấy từ mức tự tin bạn tự khai trước và sau mỗi bài, quy về thang 100.',
            formula: 'Tự tin = trung bình mức tự tin tự khai gần đây (0–100).',
          }}
        >
          <div className="flex flex-col items-center gap-lg">
            <ArcGauge value={m.confidence} sublabel="đang nhích lên đều" color={BRAND.blue} size={168} />
            <Sparkline data={m.confidenceSpark} width={220} height={44} color={BRAND.blue} />
          </div>
        </ChartCard>

        <ChartCard
          title="Tự tin so với thực tế theo chủ đề"
          subtitle="Mỗi điểm là một chủ đề bạn đang học"
          info={{
            what: 'So mức tự tin của bạn với điểm thực tế ở từng chủ đề.',
            how: 'Trục ngang là mức tự tin, trục dọc là điểm thực. Góc dưới-phải là vùng “tưởng đã hiểu”.',
            formula: 'Chênh lệch = tự tin − điểm thực; chênh dương lớn nghĩa là tự tin hơn thực lực.',
          }}
          note={<AiAnnotation>Tiếng Anh và Thuyết trình đang ở vùng “tưởng đã hiểu” — tự tin cao hơn điểm thật, nên ôn lại trước khi đi tiếp.</AiAnnotation>}
        >
          <ScatterPlot
            ariaLabel="Tự tin so với điểm thực theo từng chủ đề"
            points={illusion}
            quadrant
            xLabel="Mức tự tin →"
            yLabel="Điểm thực tế →"
            legend={[
              { label: 'Nắm chắc', tone: 'good' },
              { label: 'Khá sát', tone: 'neutral' },
              { label: 'Cần để ý', tone: 'warning' },
              { label: 'Tưởng đã hiểu', tone: 'danger' },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Cách bạn tự quản việc học"
          subtitle="Lập kế hoạch · theo dõi · điều chỉnh"
          info={{
            what: 'Bạn tự quản việc học tốt tới đâu ở ba khâu: lập kế hoạch, theo dõi, điều chỉnh.',
            how: 'Suy từ hành vi: có đặt lịch/mục tiêu không, có tự kiểm tra tiến độ không, và có chỉnh cách học khi cần không.',
            formula: 'Mỗi trục là điểm 0–100 cho một khâu tự điều chỉnh.',
          }}
        >
          <RadarChart ariaLabel="Cách bạn tự quản việc học" axes={m.selfReg.map((x) => x.axis)} series={[{ name: 'Tự điều chỉnh', color: SERIES.violet, values: m.selfReg.map((x) => x.value) }]} />
        </ChartCard>

        <ChartCard
          title="Tâm trạng theo tuần"
          subtitle="Cảm xúc khi học thay đổi ra sao"
          info={{
            what: 'Tâm trạng khi học của bạn thay đổi ra sao trong tuần.',
            how: 'Lấy từ lần bạn tự đánh giá cảm xúc sau buổi học, theo thang 1–5.',
            formula: 'Giá trị mỗi ngày = mức tâm trạng tự khai (1 thấp → 5 cao).',
          }}
        >
          <LineChart ariaLabel="Tâm trạng khi học theo tuần" labels={m.mood.map((d) => d.label)} yMax={5} yTicks={5} series={[{ name: 'Tâm trạng', color: SERIES.orange, points: m.mood.map((d) => d.value), area: true }]} />
        </ChartCard>
      </div>
    </Section>
  );
}
