import { cn } from '../../../lib/cn';
import { EmptyState } from '../EmptyState';

/**
 * Bộ màu lấy đúng theo thiết kế: mỗi hàng dùng một họ màu Untitled UI, chữ tiêu đề
 * dùng tông 700 (đủ tương phản để đọc), thanh dùng tông 500, rãnh thanh dùng tông 100.
 */
export const BAR_FAMILIES = [
  { text: '#175CD3', bar: '#2E90FA', track: '#D1E9FF' }, // blue
  { text: '#C11574', bar: '#EE46BC', track: '#FCE7F6' }, // pink
  { text: '#3538CD', bar: '#6172F3', track: '#E0EAFF' }, // indigo
  { text: '#067647', bar: '#17B26A', track: '#DCFAE6' }, // green
  { text: '#B93815', bar: '#EF6820', track: '#FDEAD7' }, // orange
  { text: '#5925DC', bar: '#7A5AF8', track: '#ECE9FE' }, // violet
] as const;

export const barFamily = (i: number) => BAR_FAMILIES[((i % BAR_FAMILIES.length) + BAR_FAMILIES.length) % BAR_FAMILIES.length];

export interface BarRow {
  id: string;
  title: string;
  /** dòng phụ dưới tên — số khoá và giờ học, hoặc tên khoá chứa chỗ vấp */
  note: string;
  /** 0..1 */
  value: number;
  /** chỉ số họ màu; để trống thì lấy theo thứ tự hàng */
  family?: number;
}

/**
 * Danh sách thanh ngang dùng cho cả "mạnh – yếu theo chủ đề" và "chỗ hay vấp lặp lại":
 * tên ở trái, thanh ở giữa, con số ở phải. Thanh dài ngắn mới là thứ mang thông tin,
 * màu chỉ để tách hàng — nên đọc được cả khi in đen trắng.
 */
export function BarList({ rows, onSelect, className }: { rows: BarRow[]; onSelect?: (id: string) => void; className?: string }) {
  if (rows.length === 0) return <EmptyState text="Chưa đủ dữ liệu để xếp" />;

  return (
    <ul className={cn('flex flex-col gap-2xl', className)}>
      {rows.map((r, i) => {
        const c = barFamily(r.family ?? i);
        const value = Math.round(Math.max(0, Math.min(1, r.value)) * 100);
        const inner = (
          <>
            <span className="flex min-w-0 basis-[38%] flex-col text-left">
              <span className="truncate text-sm font-semibold" style={{ color: c.text }}>
                {r.title}
              </span>
              <span className="truncate text-xs text-quaternary">{r.note}</span>
            </span>
            <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-md" style={{ background: c.track }}>
              <span className="rp-bar block h-full rounded-md" style={{ width: `${value}%`, background: c.bar }} />
            </span>
            <span className="w-[38px] shrink-0 text-right text-sm font-medium tabular-nums text-primary">{value}%</span>
          </>
        );
        return (
          <li key={r.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(r.id)}
                className="flex w-full items-center gap-xl rounded-md text-left outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-alt"
              >
                {inner}
              </button>
            ) : (
              <div className="flex w-full items-center gap-xl">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
