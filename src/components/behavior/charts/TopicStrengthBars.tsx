import { cat } from '../../analytics/palette';
import { minutesLabel, pct } from '../../../behavior/format';
import type { TopicStrength } from '../../../behavior/types';

/**
 * TopicStrengthBars — mức nắm vững theo từng chủ đề, xếp từ mạnh nhất xuống.
 * Mỗi hàng là một chủ đề: tên bên trái, thanh lấp đầy theo mức nắm vững, và số
 * phần trăm bên phải. Dưới tên có một dòng nhỏ nhắc số khóa và thời gian đã học.
 * Dựng bằng flex (không phải SVG) cho danh sách thanh gọn và sắc nét.
 */
export function TopicStrengthBars({ data }: { data: TopicStrength[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-tertiary">Chưa có dữ liệu theo chủ đề.</p>;
  }

  return (
    <ul className="flex flex-col gap-sm">
      {data.map((row, i) => {
        const fill = Math.max(0, Math.min(1, row.mastery));
        return (
          <li
            key={row.topic}
            title={`${row.name}: nắm ${pct(row.mastery)}`}
            className="flex min-h-[44px] items-center gap-md"
          >
            {/* tên chủ đề + dòng phụ nhắc số khóa / thời gian học */}
            <div className="w-[140px] shrink-0">
              <p className="truncate text-sm font-medium text-secondary">{row.name}</p>
              <p className="text-xs text-quaternary tabular-nums">
                {row.courses} khóa · {minutesLabel(row.minutes)}
              </p>
            </div>

            {/* thanh nền + phần lấp đầy theo mức nắm vững */}
            <div className="h-3 flex-1 overflow-hidden rounded-pill bg-gray-200">
              <div
                className="h-full rounded-pill"
                style={{ width: `${fill * 100}%`, background: cat(i) }}
              />
            </div>

            {/* con số phần trăm, canh phải */}
            <span className="w-12 shrink-0 text-right text-sm font-semibold text-primary tabular-nums">
              {pct(row.mastery)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
