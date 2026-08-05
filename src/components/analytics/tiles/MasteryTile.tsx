import { useState } from 'react';
import { cn } from '../../../lib/cn';
import { TileCard, Segmented } from '../TileCard';
import { useFilters } from '../FilterContext';
import { cat } from '../palette';
import { TOPICS, type LearnerData } from '../../../mock/analytics';

const topicColor = (slug: string) => cat(TOPICS.findIndex((t) => t.slug === slug));
type Mode = 'mastery' | 'coverage';

export function MasteryTile({ data }: { data: LearnerData }) {
  const f = useFilters();
  const [mode, setMode] = useState<Mode>('mastery');
  const weakest = [...data.topics].sort((a, b) => a.mastery - b.mastery)[0];

  return (
    <TileCard
      title="Mức nắm theo chủ đề"
      subtitle={mode === 'mastery' ? 'Bạn hiểu chắc tới đâu ở mỗi chủ đề (so với mục tiêu)' : 'Bạn đã đi được bao nhiêu phần khái niệm ở mỗi chủ đề'}
      info={{
        what: 'Mức bạn thật sự nắm được ở mỗi chủ đề — “hiểu thật”, không phải chỉ “đã xem”.',
        how: 'Ước lượng từ kết quả làm bài và độ ổn định qua các lần ôn (knowledge tracing). Bấm một chủ đề để lọc cả bảng theo chủ đề đó.',
        formula: 'Mức nắm = trung bình xác suất đã nắm các khái niệm của chủ đề (0–100); vạch mờ là mục tiêu bạn đặt.',
      }}
      controls={
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'mastery', label: 'Mức nắm' },
            { value: 'coverage', label: 'Độ phủ' },
          ]}
        />
      }
      takeaway={
        <>
          Yếu nhất là <b>{weakest.name}</b> — mức nắm {weakest.mastery}%, còn cách mục tiêu {Math.max(0, weakest.target - weakest.mastery)} điểm. Ưu tiên môn này khi có thời gian.
        </>
      }
    >
      <ul className="flex flex-col gap-lg pt-xs">
        {data.topics.map((t) => {
          const val = mode === 'mastery' ? t.mastery : Math.round(t.coverage * 100);
          const dim = f.topic != null && f.topic !== t.slug;
          const active = f.topic === t.slug;
          return (
            <li key={t.slug} className={cn('transition', dim && 'opacity-40')}>
              <button type="button" onClick={() => f.toggleTopic(t.slug)} aria-pressed={active} className={cn('flex w-full flex-col gap-xs rounded-lg p-xs text-left transition hover:bg-secondary', active && 'bg-brand-50')}>
                <div className="flex items-center justify-between text-sm">
                  <span className={cn('flex items-center gap-xs', active ? 'font-semibold text-brand-secondary' : 'text-secondary')}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: topicColor(t.slug) }} />
                    {t.name}
                  </span>
                  <span className="tabular-nums font-semibold text-primary">{val}%</span>
                </div>
                <span className="relative h-2.5 w-full overflow-hidden rounded-pill bg-gray-200">
                  <span className="block h-full rounded-pill" style={{ width: `${val}%`, background: topicColor(t.slug) }} />
                  {mode === 'mastery' ? <span className="absolute top-[-2px] h-[14px] w-[2px] rounded bg-gray-500" style={{ left: `calc(${t.target}% - 1px)` }} title={`Mục tiêu ${t.target}%`} /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </TileCard>
  );
}
