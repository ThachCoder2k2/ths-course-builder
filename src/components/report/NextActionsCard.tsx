import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { EmptyState } from './EmptyState';
import type { NextAction } from '../../behavior/types';

/** Vòng số thứ tự: ba việc đầu được tô màu riêng, từ việc thứ tư trở đi để xám. */
const RANK_STYLE = [
  { bg: '#FEF0C7', fg: '#DC6803' },
  { bg: '#D3E9FD', fg: '#055BE6' },
  { bg: '#D3F8DF', fg: '#079455' },
  { bg: '#D5D7DA', fg: '#FFFFFF' },
];

/** Màu điểm ưu tiên: càng gấp càng nóng. */
function scoreColor(score: number): string {
  if (score >= 90) return '#D92D20';
  if (score >= 75) return '#0D67F7';
  if (score >= 50) return '#079455';
  return '#535862';
}

/**
 * Những việc nên làm trước, xếp theo mức giúp ích. Điểm ưu tiên lấy từ chính dự báo
 * bên cạnh, nên hai thẻ luôn nói cùng một câu chuyện.
 *
 * Mỗi dòng có ĐÚNG bốn phần như Figma 506:5743: vòng số thứ tự 40px, tên việc, điểm
 * kèm chữ "Ưu tiên", mũi tên. Trước đây tôi thêm một câu giải thích và một chip "~N phút"
 * cho mỗi dòng — cả hai đều KHÔNG có trong thiết kế, và cái chip còn là thứ mượn từ thẻ
 * "Lộ trình gợi ý" ở khối khác. Đã bỏ.
 */
export function NextActionsCard({ actions }: { actions: NextAction[] }) {
  // Danh sách bị chặn bề rộng khi thẻ chưa chia 1/3 cột (dưới xl): để tràn thì cụm
  // điểm ưu tiên trôi cách tên việc cả nghìn px, mắt không nối được hai bên với nhau.

  return (
    <ReportCard
      title="Việc nên làm tiếp"
      subtitle="Duy trì - nắm vững - phát triển"
      bodyClassName="gap-3xl"
    >
      {actions.length === 0 ? (
        <EmptyState text="Chưa có việc nào cần làm gấp" />
      ) : (
        <ol className="flex max-w-[620px] flex-col gap-3xl xl:max-w-none">
          {actions.map((a, i) => {
            const rank = RANK_STYLE[Math.min(i, RANK_STYLE.length - 1)];
            const score = Math.round(a.impact * 100);
            const body = (
              <span className="flex w-full items-center gap-md">
                <span className="flex min-w-0 flex-1 items-center gap-md">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
                    style={{ background: rank.bg, color: rank.fg }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 text-sm font-medium text-primary">{a.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-lg">
                  <span className="flex flex-col items-end">
                    <span className="text-lg font-semibold tabular-nums" style={{ color: scoreColor(score) }}>
                      {score}
                    </span>
                    <span className="text-xs text-fg-quinary">Ưu tiên</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-fg-quinary transition group-hover:text-brand-secondary" aria-hidden="true" />
                </span>
              </span>
            );
            return (
              <li key={a.id}>
                {a.courseSlug ? (
                  <Link to={`/courses/${a.courseSlug}`} className="group flex rounded-md outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-alt">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ol>
      )}
    </ReportCard>
  );
}
