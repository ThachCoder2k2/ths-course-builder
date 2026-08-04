import type { ReactNode } from 'react';
import { ListChecks, MousePointerClick, PlayCircle } from 'lucide-react';
import { Section } from '../Section';
import { ChartCard, Legend } from '../charts/ChartCard';
import { RadarChart } from '../charts/RadarChart';
import { Donut } from '../charts/Donut';
import { Treemap } from '../charts/Treemap';
import { Stepper } from '../charts/simple';
import { AiInsightCard } from '../AiInsightCard';
import { BRAND, CATEGORICAL, SERIES, STATUS } from '../palette';
import { scaleLinear, smoothPath, ticks } from '../../../lib/svg';
import type { LearnerAnalytics, Recommendation, ZpdPoint } from '../../../mock/analytics';

const KIND_ICON: Record<Recommendation['kind'], ReactNode> = {
  video: <PlayCircle className="h-5 w-5" aria-hidden="true" />,
  interactive: <MousePointerClick className="h-5 w-5" aria-hidden="true" />,
  quiz: <ListChecks className="h-5 w-5" aria-hidden="true" />,
};

function RecommendationList({ items }: { items: Recommendation[] }) {
  return (
    <ol className="flex flex-col gap-lg">
      {items.map((r, i) => (
        <li key={r.title} className="flex items-start gap-lg rounded-xl border border-secondary bg-primary p-xl">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white tabular-nums">{i + 1}</span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-secondary">{KIND_ICON[r.kind]}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-xs">
            <span className="text-md font-semibold text-primary">{r.title}</span>
            <span className="text-sm text-tertiary">{r.reason}</span>
            {r.needsReview ? <span className="mt-xxs w-fit rounded-md bg-warning-50 px-md py-xxs text-xs font-medium text-warning-700">{r.needsReview}</span> : null}
          </div>
          <span className="flex shrink-0 flex-col items-end gap-xxs">
            <span className="text-lg font-semibold tabular-nums text-brand-secondary">{r.fit}%</span>
            <span className="text-xs text-quaternary">phù hợp</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function ZpdChart({ points, band }: { points: ZpdPoint[]; band: [number, number] }) {
  const W = 540;
  const H = 240;
  const P = { l: 40, r: 16, t: 16, b: 34 };
  const x = scaleLinear(0, 100, P.l, W - P.r);
  const y = scaleLinear(0, 100, H - P.b, P.t);
  const pts = points.map((p) => ({ x: x(p.difficulty), y: y(p.accuracy) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vùng vừa sức: tỉ lệ đúng theo độ khó" className="block h-auto w-full">
      {ticks(100, 4).map((t) => (
        <g key={t}>
          <line x1={P.l} y1={y(t)} x2={W - P.r} y2={y(t)} stroke="#E9EAEB" strokeWidth={1} />
          <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#717680" className="tabular-nums">
            {t}
          </text>
        </g>
      ))}
      <rect x={x(band[0])} y={P.t} width={x(band[1]) - x(band[0])} height={H - P.b - P.t} fill={STATUS.good} opacity={0.1} />
      <text x={(x(band[0]) + x(band[1])) / 2} y={P.t + 14} textAnchor="middle" fontSize={11} fontWeight={600} fill="#067647">
        Vừa sức
      </text>
      <path d={smoothPath(pts)} fill="none" stroke={BRAND.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(p.difficulty)} cy={y(p.accuracy)} r={3.5} fill="#fff" stroke={BRAND.blue} strokeWidth={2}>
          <title>{`Độ khó ${p.difficulty} → đúng ${p.accuracy}%`}</title>
        </circle>
      ))}
      {[0, 25, 50, 75, 100].map((t) => (
        <text key={t} x={x(t)} y={H - 12} textAnchor="middle" fontSize={11} fill="#717680" className="tabular-nums">
          {t}
        </text>
      ))}
      <text x={(P.l + W - P.r) / 2} y={H - 1} textAnchor="middle" fontSize={11} fontWeight={500} fill="#717680">
        Độ khó →
      </text>
      <line x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} stroke="#D5D7DA" strokeWidth={1} />
    </svg>
  );
}

export function RecommendationSection({ a }: { a: LearnerAnalytics }) {
  const rc = a.recommend;
  return (
    <Section index={6} id="goi-y" title="Cá nhân hóa & Gợi ý cho bạn" subtitle="Gộp mọi tín hiệu ở trên thành một kế hoạch học tiếp cụ thể — trong chính các khóa của bạn.">
      <AiInsightCard
        label="Kế hoạch học tiếp"
        highlight
        actions={[
          'Ôn nhanh “Đánh giá mô hình” khoảng 10 phút để gỡ mắt xích đang chặn.',
          'Học bài “Phân loại với học có giám sát” — vừa sức và lấp đúng chỗ yếu.',
          'Cuối tuần làm lại bài kiểm tra “Đạo đức AI” để chắc phần điểm thấp nhất.',
        ]}
      >
        Bước hợp lý nhất tiếp theo là bài vừa sức với bạn (dạng gần giống bạn đang đúng khoảng 78%) và lấp đúng chỗ còn yếu. Trước khi vào, ôn
        nhanh phần nền là học sẽ nhẹ hơn nhiều.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard title="Nội dung nên học tiếp" subtitle="Xếp theo mức phù hợp với bạn ngay bây giờ" className="lg:col-span-2">
          <RecommendationList items={rc.next} />
        </ChartCard>

        <ChartCard title="Vùng vừa sức (ZPD)" subtitle="Độ khó cho tỉ lệ đúng khoảng 70–85% là tối ưu">
          <ZpdChart points={rc.zpd} band={rc.zpdBand} />
        </ChartCard>

        <ChartCard
          title="Bản đồ khuyết kỹ năng"
          subtitle="Khoảng cách giữa mức hiện tại và mục tiêu"
          note={<Legend items={[{ label: 'Hiện tại', color: BRAND.blue }, { label: 'Mục tiêu', color: SERIES.violet, dashed: true }]} />}
        >
          <RadarChart
            ariaLabel="Bản đồ khuyết kỹ năng"
            axes={rc.skillGap.map((s) => s.skill)}
            series={[
              { name: 'Hiện tại', color: BRAND.blue, values: rc.skillGap.map((s) => s.current) },
              { name: 'Mục tiêu', color: SERIES.violet, values: rc.skillGap.map((s) => s.target), fill: false, dashed: true },
            ]}
          />
        </ChartCard>

        <ChartCard title="Định dạng học ưa thích" subtitle="Tỉ trọng học liệu bạn thực sự hoàn tất">
          <Donut data={rc.formatPref} colors={[...CATEGORICAL]} centerLabel="Video" centerSub="ưa thích nhất" />
        </ChartCard>

        <ChartCard title="Chủ đề bạn quan tâm" subtitle="Trọng số quan tâm theo lĩnh vực">
          <Treemap data={rc.topicAffinity} colors={[...CATEGORICAL]} />
        </ChartCard>

        <ChartCard title="Độ sẵn sàng lên cấp" subtitle="Bạn đang ở đâu trên hành trình Cơ bản → Nâng cao" className="lg:col-span-2">
          <div className="px-md py-lg">
            <Stepper steps={rc.levelUp.steps} current={rc.levelUp.current} />
          </div>
        </ChartCard>
      </div>
    </Section>
  );
}
