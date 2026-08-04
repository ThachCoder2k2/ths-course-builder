import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ListChecks, Lock, MousePointerClick, PlayCircle } from 'lucide-react';
import { Section } from '../Section';
import { ChartCard } from '../charts/ChartCard';
import { Donut } from '../charts/Donut';
import { Treemap } from '../charts/Treemap';
import { AiInsightCard } from '../AiInsightCard';
import { BRAND, CATEGORICAL, cat, STATUS } from '../palette';
import { scaleLinear, smoothPath, ticks } from '../../../lib/svg';
import { LEVELS, type LearnerAnalytics, type Recommendation, type ZpdPoint } from '../../../mock/analytics';

const KIND_ICON: Record<Recommendation['kind'], ReactNode> = {
  video: <PlayCircle className="h-5 w-5" aria-hidden="true" />,
  interactive: <MousePointerClick className="h-5 w-5" aria-hidden="true" />,
  quiz: <ListChecks className="h-5 w-5" aria-hidden="true" />,
};

function RecommendationList({ items }: { items: Recommendation[] }) {
  return (
    <ol className="dv-scroll flex max-h-[440px] flex-col gap-lg overflow-y-auto pr-xs">
      {items.map((r, i) => (
        <li key={r.title}>
          <Link to={`/courses/${r.courseSlug}`} className="group flex items-start gap-lg rounded-xl border border-secondary bg-primary p-xl transition hover:-translate-y-0.5 hover:border-brand-alt hover:shadow-pop">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white tabular-nums">{i + 1}</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-secondary">{KIND_ICON[r.kind]}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-xs">
              <span className="flex items-center gap-xs text-md font-semibold text-primary">
                {r.title}
                <ArrowUpRight className="h-4 w-4 text-quaternary opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-brand-secondary">{r.topic}</span>
              <span className="text-sm text-tertiary">{r.reason}</span>
              {r.needsReview ? <span className="mt-xxs w-fit rounded-md bg-warning-50 px-md py-xxs text-xs font-medium text-warning-700">{r.needsReview}</span> : null}
            </div>
            <span className="flex shrink-0 flex-col items-end gap-xxs">
              <span className="text-lg font-semibold tabular-nums text-brand-secondary">{r.fit}%</span>
              <span className="text-xs text-quaternary">phù hợp</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function GapBars({ topics }: { topics: LearnerAnalytics['topics'] }) {
  const gaps = topics.map((t) => ({ ...t, gap: t.target - t.mastery })).sort((x, y) => y.gap - x.gap);
  return (
    <ul className="dv-scroll flex max-h-[360px] flex-col gap-lg overflow-y-auto pr-xs pt-xs">
      {gaps.map((t) => (
        <li key={t.slug}>
          <Link to={`/topics/${t.slug}`} className="group flex flex-col gap-xs rounded-lg p-xs transition hover:bg-secondary">
            <div className="flex items-center justify-between text-sm">
              <span className="flex min-w-0 items-center gap-xs truncate text-secondary">
                {t.name}
                <ArrowUpRight className="h-3.5 w-3.5 text-quaternary opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
              </span>
              <span className="shrink-0 text-xs font-semibold text-warning-700">còn {t.gap} điểm</span>
            </div>
            <span className="flex h-2.5 w-full overflow-hidden rounded-pill bg-gray-200">
              <span className="block h-full rounded-l-pill" style={{ width: `${t.mastery}%`, background: BRAND.blue }} />
              <span className="block h-full" style={{ width: `${t.gap}%`, background: '#FEDF89' }} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function LevelUp({ topics }: { topics: LearnerAnalytics['topics'] }) {
  return (
    <ul className="dv-scroll flex max-h-[360px] flex-col gap-lg overflow-y-auto pr-xs">
      {topics.map((t) => {
        const next = LEVELS[t.level.current + 1];
        return (
          <li key={t.slug} className="flex items-center gap-lg">
            <span className="w-40 shrink-0 truncate text-sm font-medium text-secondary">{t.name}</span>
            <span className="flex items-center gap-xs">
              {LEVELS.map((_, i) => (
                <span
                  key={i}
                  className={
                    i < t.level.current
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white'
                      : i === t.level.current
                        ? 'flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-secondary ring-2 ring-brand-500'
                        : 'flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-quaternary'
                  }
                >
                  {i < t.level.current ? <Check className="h-3.5 w-3.5" /> : i === t.level.current ? <span className="text-[11px] font-bold">{i + 1}</span> : <Lock className="h-3 w-3" />}
                </span>
              ))}
            </span>
            <span className="min-w-0 flex-1 text-right text-xs text-tertiary">
              {next ? (
                <>
                  Sẵn sàng <span className="font-semibold tabular-nums text-brand-secondary">{t.level.readiness}%</span> lên {next}
                </>
              ) : (
                'Đã ở mức cao nhất'
              )}
            </span>
          </li>
        );
      })}
    </ul>
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
    <div className="-mx-md overflow-x-auto px-md">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vùng vừa sức: tỉ lệ đúng theo độ khó" className="block h-auto w-full min-w-[440px]">
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
        <path className="dv-draw" pathLength={1} d={smoothPath(pts)} fill="none" stroke={BRAND.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} className="dv-pop" cx={x(p.difficulty)} cy={y(p.accuracy)} r={3.5} fill="#fff" stroke={BRAND.blue} strokeWidth={2}>
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
    </div>
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
          'Học “Phân loại với học có giám sát” — vừa sức và lấp đúng chỗ yếu.',
          'Dành 15 phút cho Tiếng Anh giao tiếp — chủ đề đang cách mục tiêu xa nhất.',
        ]}
      >
        Bước hợp lý tiếp theo là một bài vừa sức — cùng dạng với những câu bạn đang làm đúng khoảng 78% — và lấp đúng chỗ còn yếu. Ôn nhanh
        phần nền trước khi vào thì học sẽ nhẹ hơn nhiều.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard
          title="Nội dung nên học tiếp"
          subtitle="Xếp theo mức phù hợp · bấm để mở khóa"
          className="lg:col-span-2"
          info={{
            what: 'Danh sách bài/khóa nên học tiếp, xếp theo mức phù hợp với bạn lúc này.',
            how: 'Gộp lỗ hổng kiến thức, độ vừa sức và chủ đề bạn quan tâm để chấm điểm mỗi ứng viên. Bấm một dòng để mở khóa.',
            formula: 'Phù hợp = trọng số(lấp lỗ hổng, vừa sức ZPD, ái lực chủ đề); càng cao càng nên học trước.',
          }}
        >
          <RecommendationList items={rc.next} />
        </ChartCard>

        <ChartCard
          title="Vùng vừa sức (ZPD)"
          subtitle="Độ khó cho tỉ lệ đúng ~70–85% là tối ưu"
          info={{
            what: 'Độ khó nào là “vừa sức” với bạn nhất.',
            how: 'Đối chiếu tỉ lệ trả lời đúng theo độ khó; vùng tô xanh là nơi bạn đúng khoảng 70–85%.',
            formula: 'Vừa sức khi tỉ lệ đúng ≈ 70–85% — đủ thách thức mà không gây nản.',
          }}
        >
          <ZpdChart points={rc.zpd} band={rc.zpdBand} />
        </ChartCard>

        <ChartCard
          title="Khoảng cách kỹ năng"
          subtitle="Chủ đề còn cách mục tiêu bao nhiêu · bấm để mở chủ đề"
          info={{
            what: 'Mỗi chủ đề còn cách mục tiêu bao nhiêu, xếp chủ đề hở nhiều nhất lên đầu.',
            how: 'Lấy mục tiêu trừ mức nắm hiện tại của từng chủ đề. Bấm một dòng để mở trang chủ đề.',
            formula: 'Khoảng cách = mục tiêu − mức nắm hiện tại (điểm).',
          }}
        >
          <GapBars topics={a.topics} />
        </ChartCard>

        <ChartCard
          title="Định dạng học ưa thích"
          subtitle="Tỉ lệ học liệu bạn thực sự học hết"
          info={{
            what: 'Tỉ lệ học liệu bạn thực sự học hết theo từng định dạng.',
            how: 'Chia thời lượng đã hoàn tất theo video, bài tương tác và tài liệu.',
            formula: 'Tỉ trọng = thời lượng hoàn tất của định dạng / tổng thời lượng hoàn tất.',
          }}
        >
          <Donut data={rc.formatPref} colors={[...CATEGORICAL]} centerLabel="Video" centerSub="ưa thích nhất" />
        </ChartCard>

        <ChartCard
          title="Chủ đề bạn quan tâm"
          subtitle="Mức quan tâm theo lĩnh vực · bấm chip để mở chủ đề"
          info={{
            what: 'Mức bạn quan tâm tới từng lĩnh vực.',
            how: 'Cân nhắc thời gian học, mức hoàn thành, đánh giá và bình luận của mỗi chủ đề.',
            formula: 'Ái lực = trọng số(thời gian, hoàn thành, tương tác) theo chủ đề.',
          }}
          note={
            <ul className="flex flex-wrap gap-xs">
              {a.topics.map((t, i) => (
                <li key={t.slug}>
                  <Link to={`/topics/${t.slug}`} className="inline-flex items-center gap-xs rounded-pill border border-secondary px-lg py-xxs text-xs font-medium text-tertiary hover:border-brand-alt hover:text-brand-secondary">
                    <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: cat(i) }} />
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          }
        >
          <Treemap data={a.topics.map((t) => ({ label: t.name, value: t.affinity }))} colors={a.topics.map((_, i) => cat(i))} />
        </ChartCard>

        <ChartCard
          title="Độ sẵn sàng lên cấp"
          subtitle="Theo từng chủ đề"
          className="lg:col-span-2"
          info={{
            what: 'Bạn đang ở cấp nào và còn bao xa để lên cấp, cho từng chủ đề.',
            how: 'Dựa trên năng lực tích lũy của mỗi chủ đề so với ngưỡng lên cấp kế tiếp.',
            formula: 'Sẵn sàng lên cấp = năng lực hiện tại / ngưỡng cấp kế tiếp × 100%.',
          }}
        >
          <LevelUp topics={a.topics} />
        </ChartCard>
      </div>
    </Section>
  );
}
