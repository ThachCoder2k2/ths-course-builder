import { Link } from 'react-router-dom';
import { Section } from '../Section';
import { ChartCard } from '../charts/ChartCard';
import { BarChart } from '../charts/BarChart';
import { RadarChart } from '../charts/RadarChart';
import { ScatterPlot, type ScatterPoint } from '../charts/ScatterPlot';
import { RadialRing } from '../charts/gauges';
import { AiInsightCard, AiAnnotation } from '../AiInsightCard';
import { BRAND, cat } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

export function AssessmentSection({ a }: { a: LearnerAnalytics }) {
  const s = a.assessment;
  const topicIndex = (name: string) => a.topics.findIndex((t) => t.name === name);
  const quizColors = s.quizzes.map((q) => cat(topicIndex(q.topic)));
  const usedTopics = a.topics.filter((t) => s.quizzes.some((q) => q.topic === t.name));
  const avg = Math.round(s.quizzes.reduce((n, q) => n + q.score, 0) / s.quizzes.length);
  const calibrationPoints: ScatterPoint[] = s.calibration.map((c) => ({
    label: c.bucket,
    x: Math.round(c.predicted * 100),
    y: Math.round(c.actual * 100),
    tone: c.actual < c.predicted - 0.05 ? 'danger' : c.actual > c.predicted + 0.05 ? 'good' : 'neutral',
  }));

  return (
    <Section index={3} id="danh-gia" title="Đánh giá & Năng lực" subtitle="Kết quả quiz và bộ đề cho thấy bạn thật sự hiểu tới đâu (không phải đoán trúng), phần nào còn yếu và hay nhầm ở đâu.">
      <AiInsightCard label="Điểm cần lưu ý">
        Ở phần Học máy bạn hay lẫn giữa học có giám sát và không giám sát, và chọn nhầm chỉ số để đánh giá mô hình. Hai bài điểm thấp nhất là
        Giao tiếp công việc và Cấu trúc bài nói — chủ đề còn mới nên cần thêm thời gian; làm lại một bài ngắn sẽ giúp bạn chắc hơn.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard
          title="Điểm các bài kiểm tra"
          subtitle="Tô màu theo chủ đề"
          info={{
            what: 'Điểm phần trăm của mỗi bài kiểm tra/bộ đề, tô màu theo chủ đề; vòng bên cạnh là điểm trung bình mọi bài.',
            how: 'Lấy điểm lượt làm gần nhất của mỗi bài; điểm trung bình là trung bình cộng của tất cả các bài.',
            formula: 'Điểm bài = số câu đúng / tổng số câu × 100%; Trung bình = Σ điểm các bài / số bài.',
          }}
          aside={
            <span className="inline-flex flex-col items-center">
              <RadialRing value={avg} size={64} stroke={8} centerLabel={`${avg}`} />
              <span className="mt-xs text-xs text-tertiary">Điểm TB</span>
            </span>
          }
          note={
            <ul className="flex flex-wrap items-center gap-x-lg gap-y-xs">
              {usedTopics.map((t, i) => (
                <li key={t.slug}>
                  <Link to={`/topics/${t.slug}`} className="flex items-center gap-xs text-xs font-medium text-tertiary hover:text-brand-secondary">
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: cat(a.topics.indexOf(t)) }} />
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          }
        >
          <BarChart ariaLabel="Điểm các bài kiểm tra theo chủ đề" data={s.quizzes.map((q) => ({ label: q.quiz, values: [q.score] }))} colors={quizColors} max={100} unit=" điểm" rotateLabels />
        </ChartCard>

        <ChartCard
          title="Độ chính xác theo chủ đề"
          subtitle="Phần trăm câu đúng của từng chủ đề"
          info={{
            what: 'Tỷ lệ bạn trả lời đúng ở từng chủ đề.',
            how: 'Gộp mọi câu hỏi thuộc một chủ đề rồi tính phần trăm câu đúng.',
            formula: 'Độ chính xác chủ đề = số câu đúng của chủ đề / tổng số câu của chủ đề × 100%.',
          }}
        >
          <RadarChart ariaLabel="Độ chính xác theo chủ đề" axes={a.topics.map((t) => t.name)} series={[{ name: 'Độ chính xác', color: BRAND.blue, values: a.topics.map((t) => t.accuracy) }]} />
        </ChartCard>

        <ChartCard
          title="Tự tin có khớp với kết quả không"
          subtitle="Mức tự tin dự đoán so với kết quả thực"
          className="lg:col-span-2"
          info={{
            what: 'Mức tự tin bạn dự đoán có khớp với kết quả thực tế không.',
            how: 'Ở mỗi nhóm mức tự tin, so tỉ lệ bạn nghĩ mình đúng với tỉ lệ đúng thật. Đường chéo nghĩa là khớp hoàn hảo.',
            formula: 'Điểm dưới đường chéo = tự tin hơn thực lực; trên đường chéo = khiêm tốn hơn thực lực.',
          }}
          note={<AiAnnotation>Điểm nằm dưới đường chéo nghĩa là bạn tự tin hơn thực lực — nên tự kiểm tra lại vài câu trước khi sang bài mới.</AiAnnotation>}
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
