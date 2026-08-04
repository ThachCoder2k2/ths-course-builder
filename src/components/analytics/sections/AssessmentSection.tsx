import { Section } from '../Section';
import { ChartCard } from '../charts/ChartCard';
import { BarChart } from '../charts/BarChart';
import { RadarChart } from '../charts/RadarChart';
import { ScatterPlot, type ScatterPoint } from '../charts/ScatterPlot';
import { RadialRing } from '../charts/gauges';
import { AiInsightCard, AiAnnotation } from '../AiInsightCard';
import { BRAND } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

export function AssessmentSection({ a }: { a: LearnerAnalytics }) {
  const s = a.assessment;
  const avg = Math.round(s.quizzes.reduce((n, q) => n + q.score, 0) / s.quizzes.length);
  const calibrationPoints: ScatterPoint[] = s.calibration.map((c) => ({
    label: c.bucket,
    x: Math.round(c.predicted * 100),
    y: Math.round(c.actual * 100),
    tone: c.actual < c.predicted - 0.05 ? 'danger' : c.actual > c.predicted + 0.05 ? 'good' : 'neutral',
  }));

  return (
    <Section index={3} id="danh-gia" title="Đánh giá & Năng lực" subtitle="Tín hiệu năng lực “sạch” từ quiz/bộ đề: tách hiểu thật khỏi đoán mò, khoanh chủ đề yếu và hiểu lầm cụ thể.">
      <AiInsightCard label="Hiểu lầm">
        Ở phần Học máy, bạn hay lẫn giữa học có giám sát và không giám sát, và chọn nhầm chỉ số để đánh giá mô hình. Nắm lại cách chọn chỉ số cho
        đúng bài toán thì điểm phần này sẽ khá lên thấy rõ. Phần Đạo đức AI đang thấp nhất, làm lại một bài kiểm tra ngắn sẽ giúp bạn chắc hơn.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard
          title="Điểm các bài kiểm tra"
          subtitle="Điểm phần trăm mỗi bài quiz/bộ đề"
          aside={
            <span className="inline-flex flex-col items-center">
              <RadialRing value={avg} size={64} stroke={8} centerLabel={`${avg}`} />
              <span className="mt-xs text-xs text-tertiary">Điểm TB</span>
            </span>
          }
        >
          <BarChart ariaLabel="Điểm các bài kiểm tra" data={s.quizzes.map((q) => ({ label: q.quiz, values: [q.score] }))} colors={[BRAND.blue]} max={100} />
        </ChartCard>

        <ChartCard title="Độ chính xác theo chủ đề" subtitle="Phần trăm câu đúng theo từng chủ đề">
          <RadarChart ariaLabel="Độ chính xác theo chủ đề" axes={s.topicAccuracy.map((t) => t.topic)} series={[{ name: 'Độ chính xác', color: BRAND.blue, values: s.topicAccuracy.map((t) => t.accuracy) }]} />
        </ChartCard>

        <ChartCard
          title="Bản đồ câu hỏi"
          subtitle="Độ khó và mức phân biệt của từng câu"
          note={<AiAnnotation>Góc dưới-phải là câu “khó nhưng không phân biệt” — thường là câu dễ đoán hoặc mơ hồ, nên xem lại.</AiAnnotation>}
        >
          <ScatterPlot
            ariaLabel="Bản đồ câu hỏi theo độ khó và độ phân biệt"
            points={s.itemMap}
            quadrant
            xLabel="Độ khó →"
            yLabel="Độ phân biệt →"
            legend={[
              { label: 'Tốt', tone: 'good' },
              { label: 'Trung tính', tone: 'neutral' },
              { label: 'Cần xem lại', tone: 'warning' },
              { label: 'Có vấn đề', tone: 'danger' },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Độ chuẩn xác của tự tin"
          subtitle="Mức tự tin dự đoán so với kết quả thực"
          note={<AiAnnotation>Điểm nằm dưới đường chéo nghĩa là bạn tự tin hơn thực tế — nên chèn thêm câu kiểm chứng trước khi qua bài.</AiAnnotation>}
        >
          <ScatterPlot
            ariaLabel="Độ chuẩn xác của tự tin so với kết quả thực"
            points={calibrationPoints}
            refLine
            xLabel="Tự tin dự đoán (%)"
            yLabel="Đúng thực tế (%)"
            legend={[
              { label: 'Tự tin hơn thực tế', tone: 'danger' },
              { label: 'Khá sát', tone: 'neutral' },
              { label: 'Khiêm tốn hơn', tone: 'good' },
            ]}
          />
        </ChartCard>
      </div>
    </Section>
  );
}
