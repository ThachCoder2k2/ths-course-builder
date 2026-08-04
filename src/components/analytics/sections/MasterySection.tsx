import { Section } from '../Section';
import { ChartCard, Legend } from '../charts/ChartCard';
import { RadarChart } from '../charts/RadarChart';
import { PrereqGraph } from '../charts/PrereqGraph';
import { Pyramid } from '../charts/simple';
import { AiInsightCard, AiAnnotation } from '../AiInsightCard';
import { BRAND, sequential, SERIES, STATUS } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

function CoverageBars({ data }: { data: LearnerAnalytics['mastery']['coverage'] }) {
  return (
    <ul className="flex flex-col gap-lg pt-xs">
      {data.map((c) => {
        const pct = Math.round(c.coverage * 100);
        return (
          <li key={c.section} className="flex flex-col gap-xs">
            <div className="flex items-center justify-between text-sm">
              <span className="min-w-0 truncate text-secondary">{c.section}</span>
              <span className="shrink-0 font-semibold tabular-nums text-primary">{pct}%</span>
            </div>
            <span className="h-2.5 w-full overflow-hidden rounded-pill bg-gray-200">
              <span className="block h-full rounded-pill" style={{ width: `${pct}%`, background: sequential(c.coverage) }} />
            </span>
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
    <Section index={2} id="thanh-thao" title="Bản đồ thành thạo & Tri thức" subtitle="Phân biệt “đã xem” với “thật sự nắm” — bạn mạnh ở đâu, còn hổng chỗ nào và vì sao.">
      <AiInsightCard label="Chẩn đoán">
        Bạn nắm khá chắc phần Nền tảng AI và Dữ liệu, nhưng mảng Học máy còn yếu — chủ yếu vì bài “Đánh giá mô hình” chưa vững. Nên quay lại
        bài đó trước khi sang phần mới, học sẽ nhẹ hơn nhiều.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard
          title="Bản đồ kỹ năng"
          subtitle="Mức hiện tại so với mục tiêu"
          note={<Legend items={[{ label: 'Hiện tại', color: BRAND.blue }, { label: 'Mục tiêu', color: SERIES.violet, dashed: true }]} />}
        >
          <RadarChart
            ariaLabel="Bản đồ kỹ năng: hiện tại so với mục tiêu"
            axes={m.skills.map((s) => s.skill)}
            series={[
              { name: 'Hiện tại', color: BRAND.blue, values: m.skills.map((s) => s.current) },
              { name: 'Mục tiêu', color: SERIES.violet, values: m.skills.map((s) => s.target), fill: false, dashed: true },
            ]}
          />
        </ChartCard>

        <ChartCard title="Độ phủ thành thạo theo phần học" subtitle="Tỷ lệ khái niệm đã đạt trong mỗi phần">
          <CoverageBars data={m.coverage} />
        </ChartCard>

        <ChartCard
          title="Bản đồ kiến thức tiên quyết"
          subtitle="Khái niệm nền nào đang chặn phần bạn sắp học"
          className="lg:col-span-2"
          note={
            <div className="flex flex-col gap-lg">
              <Legend items={[{ label: 'Vững', color: STATUS.good }, { label: 'Cần củng cố', color: STATUS.warning }, { label: 'Lỗ hổng', color: STATUS.danger }]} />
              <AiAnnotation>“AI tạo sinh (LLM)” đang bị chặn bởi “Đánh giá mô hình” — mắt xích yếu nhất. Củng cố nó sẽ mở thông cả nhánh sau.</AiAnnotation>
            </div>
          }
        >
          <PrereqGraph nodes={m.prereqNodes} edges={m.prereqEdges} />
        </ChartCard>

        <ChartCard title="Phổ nhận thức Bloom" subtitle="Bạn đang mạnh ở những bậc tư duy nào" className="lg:col-span-2">
          <Pyramid rows={bloomRows} unit="" />
        </ChartCard>
      </div>
    </Section>
  );
}
