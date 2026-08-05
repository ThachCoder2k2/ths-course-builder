import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ListChecks, MousePointerClick, PlayCircle } from 'lucide-react';
import { TileCard } from '../TileCard';
import { useFilters } from '../FilterContext';
import { TOPIC_NAME, type LearnerData, type Recommendation } from '../../../mock/analytics';

const KIND_ICON: Record<Recommendation['kind'], ReactNode> = {
  video: <PlayCircle className="h-5 w-5" aria-hidden="true" />,
  interactive: <MousePointerClick className="h-5 w-5" aria-hidden="true" />,
  quiz: <ListChecks className="h-5 w-5" aria-hidden="true" />,
};
const zpd = (d: number) => (d < 45 ? { label: 'Dễ', cls: 'bg-success-50 text-success-600' } : d <= 80 ? { label: 'Vừa sức', cls: 'bg-brand-50 text-brand-secondary' } : { label: 'Khó', cls: 'bg-warning-50 text-warning-700' });

export function NextBestTile({ data }: { data: LearnerData }) {
  const f = useFilters();
  const items = data.recommendations.filter((r) => !f.topic || r.topic === f.topic);
  const top = items[0];

  return (
    <TileCard
      title="Nên học tiếp"
      subtitle="Xếp theo mức phù hợp với bạn lúc này · bấm để mở khóa"
      info={{
        what: 'Bài/khóa nên học tiếp, xếp theo mức phù hợp — vừa sức và lấp đúng chỗ còn yếu.',
        how: 'Gộp chỗ yếu (mức nắm thấp), độ vừa sức (không quá dễ/khó) và điều kiện tiên quyết đã đủ. Bấm một mục để mở khóa.',
        formula: 'Phù hợp = trọng số(lấp lỗ hổng, vừa sức ≈ đúng 70–85%, đủ tiên quyết); độ khó ~70–80 là vừa sức.',
      }}
      takeaway={
        top ? (
          <>
            Bước hợp lý nhất: <b>{top.title}</b> ({TOPIC_NAME[top.topic]}). {top.unlockFrom ? <>Ôn nhanh “{top.unlockFrom}” trước cho đỡ nặng.</> : null}
          </>
        ) : (
          <>Không có gợi ý cho chủ đề đang lọc — bỏ lọc để xem tất cả.</>
        )
      }
      action={top ? <Link to={`/courses/${top.courseSlug}`} className="inline-flex items-center gap-xs rounded-btn bg-button-primary px-lg py-md text-sm font-semibold text-white transition hover:opacity-90">Học ngay <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link> : undefined}
    >
      <ol className="dv-scroll flex max-h-[420px] flex-col gap-md overflow-y-auto pr-xs">
        {items.map((r, i) => {
          const z = zpd(r.difficulty);
          return (
            <li key={r.title}>
              <Link to={`/courses/${r.courseSlug}`} className="group flex items-start gap-md rounded-xl border border-secondary bg-primary p-lg transition hover:-translate-y-0.5 hover:border-brand-alt hover:shadow-pop">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white tabular-nums">{i + 1}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-secondary">{KIND_ICON[r.kind]}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-xxs">
                  <span className="flex items-center gap-xs text-sm font-semibold text-primary">
                    {r.title}
                    <ArrowUpRight className="h-4 w-4 text-quaternary opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                  </span>
                  <span className="flex flex-wrap items-center gap-xs text-xs">
                    <span className="text-brand-secondary">{TOPIC_NAME[r.topic]}</span>
                    <span className={`rounded-pill px-md py-[1px] font-medium ${z.cls}`}>{z.label}</span>
                  </span>
                  <span className="text-sm text-tertiary">{r.reason}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="text-md font-semibold tabular-nums text-brand-secondary">{r.fit}%</span>
                  <span className="text-xs text-quaternary">phù hợp</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </TileCard>
  );
}
