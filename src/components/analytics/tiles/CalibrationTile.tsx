import { TileCard } from '../TileCard';
import { useFilters } from '../FilterContext';
import { TOPIC_NAME, type LearnerData } from '../../../mock/analytics';

export function CalibrationTile({ data }: { data: LearnerData }) {
  const f = useFilters();
  const rows = data.calibration
    .filter((c) => !f.topic || c.topic === f.topic)
    .map((c) => ({ ...c, gap: c.confidence - c.accuracy }))
    .sort((a, b) => b.gap - a.gap);
  const worst = rows[0];
  const overconfident = rows.filter((r) => r.gap > 8);

  return (
    <TileCard
      title="Tự tin có khớp với thực tế không"
      subtitle="Chỉ để nhắc nhẹ — không dùng để chấm điểm bạn"
      info={{
        what: 'Chỗ nào bạn đang chủ quan: tự tin cao hơn kết quả thực tế.',
        how: 'So mức tự tin bạn tự khai với điểm đúng thực tế ở từng chủ đề. Chênh dương lớn nghĩa là đang tự tin hơn thực lực.',
        formula: 'Chênh lệch = tự tin − điểm thực; chênh > 8 điểm đáng để tự kiểm tra lại.',
      }}
      takeaway={
        worst && worst.gap > 8 ? (
          <>
            Bạn đang tự tin hơn thực lực nhất ở <b>{TOPIC_NAME[worst.topic]}</b> (tự tin {worst.confidence}% · đúng {worst.accuracy}%). Làm một bài kiểm tra ngắn để chắc lại trước khi đi tiếp.
          </>
        ) : (
          <>Tự tin của bạn khá khớp với kết quả thực — cứ giữ nhịp học như hiện tại.</>
        )
      }
    >
      <ul className="flex flex-col gap-md pt-xs">
        {(overconfident.length ? overconfident : rows.slice(0, 3)).map((r) => (
          <li key={r.topic} className="flex flex-col gap-xs">
            <div className="flex items-center justify-between text-sm">
              <span className="min-w-0 truncate text-secondary">{TOPIC_NAME[r.topic]}</span>
              <span className="shrink-0 text-xs text-tertiary">
                tự tin <span className="font-semibold text-primary tabular-nums">{r.confidence}%</span> · đúng <span className="font-semibold text-primary tabular-nums">{r.accuracy}%</span>
              </span>
            </div>
            <span className="relative flex h-2 w-full overflow-hidden rounded-pill bg-gray-200">
              <span className="block h-full rounded-pill" style={{ width: `${r.accuracy}%`, background: '#099250' }} />
              <span className="absolute top-[-2px] h-[12px] w-[2px] rounded bg-[#DC6803]" style={{ left: `calc(${r.confidence}% - 1px)` }} title={`Tự tin ${r.confidence}%`} />
            </span>
          </li>
        ))}
      </ul>
    </TileCard>
  );
}
