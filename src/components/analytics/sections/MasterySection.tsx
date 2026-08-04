import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Section } from '../Section';
import { ChartCard, Legend } from '../charts/ChartCard';
import { RadarChart } from '../charts/RadarChart';
import { PrereqGraph } from '../charts/PrereqGraph';
import { Pyramid } from '../charts/simple';
import { AiInsightCard, AiAnnotation } from '../AiInsightCard';
import { BRAND, sequential, SERIES, STATUS } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

function CoverageBars({ topics }: { topics: LearnerAnalytics['topics'] }) {
  return (
    <ul className="dv-scroll flex max-h-[360px] flex-col gap-md overflow-y-auto pr-xs pt-xs">
      {topics.map((t) => {
        const pct = Math.round(t.coverage * 100);
        return (
          <li key={t.slug}>
            <Link to={`/topics/${t.slug}`} className="group flex flex-col gap-xs rounded-lg p-xs transition hover:bg-secondary">
              <div className="flex items-center justify-between text-sm">
                <span className="flex min-w-0 items-center gap-xs truncate text-secondary">
                  {t.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-quaternary opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-primary">{pct}%</span>
              </div>
              <span className="h-2.5 w-full overflow-hidden rounded-pill bg-gray-200">
                <span className="block h-full rounded-pill" style={{ width: `${pct}%`, background: sequential(t.coverage) }} />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MasterySection({ a }: { a: LearnerAnalytics }) {
  const m = a.mastery;
  const bloomRows = [...m.bloom].reverse().map((b) => ({ label: b.level, value: b.value }));

  return (
    <Section index={2} id="thanh-thao" title="Bản đồ thành thạo & Tri thức" subtitle="Phân biệt “đã xem” với “thật sự nắm” — bạn mạnh chủ đề nào, còn hổng ở đâu và vì sao.">
      <AiInsightCard label="Chẩn đoán">
        Bạn nắm khá chắc phần Trí tuệ nhân tạo và Khoa học dữ liệu, nhưng Tiếng Anh và Thuyết trình còn mới nên độ phủ thấp. Riêng trong khóa AI,
        mảng Học máy đang yếu chủ yếu vì bài “Đánh giá mô hình” chưa vững — nên quay lại bài đó trước khi học tiếp.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard
          title="Mức nắm theo chủ đề"
          subtitle="Hiện tại so với mục tiêu"
          info={{
            what: 'Mức nắm trung bình của bạn ở từng chủ đề, so với mục tiêu bạn đặt ra.',
            how: 'Mỗi trục là một chủ đề; giá trị là độ nắm trung bình các khái niệm của chủ đề đó. Đường nét đứt là mục tiêu.',
            formula: 'Mức nắm chủ đề = trung bình độ nắm các khái niệm thuộc chủ đề (thang 0–100).',
          }}
          note={<Legend items={[{ label: 'Hiện tại', color: BRAND.blue }, { label: 'Mục tiêu', color: SERIES.violet, dashed: true }]} />}
        >
          <RadarChart
            ariaLabel="Mức nắm theo chủ đề: hiện tại so với mục tiêu"
            axes={a.topics.map((t) => t.name)}
            series={[
              { name: 'Hiện tại', color: BRAND.blue, values: a.topics.map((t) => t.mastery) },
              { name: 'Mục tiêu', color: SERIES.violet, values: a.topics.map((t) => t.target), fill: false, dashed: true },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Mức nắm từng chủ đề"
          subtitle="Tỷ lệ khái niệm đã nắm · bấm để mở chủ đề"
          info={{
            what: 'Tỷ lệ khái niệm bạn đã nắm được trong mỗi chủ đề.',
            how: 'Số khái niệm đã đạt chia cho tổng số khái niệm của các khóa thuộc chủ đề. Bấm một dòng để mở trang chủ đề.',
            formula: 'Độ phủ chủ đề = khái niệm đã đạt / tổng khái niệm của chủ đề × 100%.',
          }}
        >
          <CoverageBars topics={a.topics} />
        </ChartCard>

        <ChartCard
          title="Bản đồ kiến thức tiên quyết"
          subtitle={`Trong khóa: ${m.prereqCourse}`}
          className="lg:col-span-2"
          info={{
            what: 'Khái niệm nền nào đang chặn phần bạn sắp học, trong khóa trọng tâm.',
            how: 'Mỗi ô là một khái niệm, tô màu theo mức nắm; mũi tên nối khái niệm nền tới khái niệm phụ thuộc nó.',
            formula: 'Ô đỏ = mức nắm dưới 45%, cam = 45–70%, xanh = từ 70% trở lên.',
          }}
          aside={
            <Link to={`/courses/${m.prereqCourseSlug}`} className="inline-flex items-center gap-xs rounded-pill bg-brand-50 px-lg py-xs text-sm font-semibold text-brand-secondary hover:bg-brand-200">
              Xem khóa <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
          note={
            <div className="flex flex-col gap-lg">
              <Legend items={[{ label: 'Vững', color: STATUS.good }, { label: 'Cần củng cố', color: STATUS.warning }, { label: 'Lỗ hổng', color: STATUS.danger }]} />
              <AiAnnotation>“AI tạo sinh (LLM)” đang bị chặn bởi “Đánh giá mô hình” — mắt xích yếu nhất. Củng cố nó sẽ mở thông cả nhánh sau.</AiAnnotation>
            </div>
          }
        >
          <PrereqGraph nodes={m.prereqNodes} edges={m.prereqEdges} />
        </ChartCard>

        <ChartCard
          title="Các bậc tư duy bạn đang dùng"
          subtitle="Theo thang Bloom, từ Nhớ đến Sáng tạo"
          className="lg:col-span-2"
          info={{
            what: 'Bạn đang tư duy chủ yếu ở những bậc nào theo thang Bloom (Nhớ → Sáng tạo).',
            how: 'Gộp hoạt động và độ đúng theo 6 bậc; bậc thấp thường cao hơn bậc cao, tạo hình kim tự tháp.',
            formula: 'Mỗi bậc = tỉ lệ hoạt động/độ đúng ở bậc đó (thang 0–100).',
          }}
        >
          <Pyramid rows={bloomRows} unit="" />
        </ChartCard>
      </div>
    </Section>
  );
}
