import { cn } from '../../lib/cn';
import type { ThanhBai } from '../../behavior/completion';

/**
 * Cặp thanh so thời gian học thực tế với thời gian chuẩn của từng bài
 * (Figma node 432:6863, khối cuối trang).
 *
 * Thiết kế gọi thanh nhạt là "thời gian học chuẩn". Khoá thật không có số liệu chuẩn nào,
 * nên ở đây "chuẩn" là ĐỘ DÀI VIDEO của bài — tức thời gian tối thiểu để đi hết bài đó.
 * Thanh đậm là thời gian thật sự bỏ ra, gồm cả những lúc tua lại và dừng ngẫm.
 *
 * Đọc ra được ngay: bài nào thanh đậm dài hơn hẳn thanh nhạt là bài phải vật lộn.
 *
 * `BarList` của trang báo cáo chung chỉ vẽ một thanh mỗi dòng nên không dùng lại được.
 */
export function PairedBars({ rows }: { rows: ThanhBai[] }) {
  const max = Math.max(1, ...rows.flatMap((r) => [r.thucTe, r.chuan]));
  /**
   * Bước chia chọn theo chính khoảng giá trị, không chốt cứng 50 phút.
   *
   * Chốt 50 thì một khoá có bài dài nhất 11 phút vẫn bị trục kéo tới 50, và mọi thanh dồn
   * vào một phần năm bề rộng — nhìn như tất cả đều bằng nhau, đúng thứ biểu đồ này cần nói
   * khác đi. Chọn bước sao cho trục có 4–6 mốc là đọc thoải mái nhất.
   */
  const buoc = max <= 12 ? 2 : max <= 30 ? 5 : max <= 60 ? 10 : max <= 150 ? 25 : 50;
  const tran = Math.max(buoc, Math.ceil(max / buoc) * buoc);
  const vach = Array.from({ length: Math.floor(tran / buoc) + 1 }, (_, i) => i * buoc);

  return (
    <div className="flex w-full flex-col gap-xl">
      <ul className="flex flex-col gap-lg">
        {rows.map((r) => {
          const vuot = r.thucTe > r.chuan * 1.35;
          return (
            <li key={r.conceptId} className="flex items-center gap-lg">
              <span className="min-w-0 shrink-0 basis-[34%] truncate text-right text-sm text-tertiary" title={r.label}>
                {r.label}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-xxs">
                <span className="flex h-2 items-center">
                  <span
                    className={cn('cp-bar h-2 rounded-full', vuot ? 'bg-[#B42318]' : 'bg-[#20447E]')}
                    style={{ width: `${(r.thucTe / tran) * 100}%` }}
                  />
                </span>
                <span className="flex h-2 items-center">
                  <span className="cp-bar h-2 rounded-full bg-[#E9EAEB]" style={{ width: `${(r.chuan / tran) * 100}%` }} />
                </span>
              </span>
              <span className="w-[92px] shrink-0 text-right text-xs text-quaternary">
                {r.thucTe}/{r.chuan} phút
              </span>
            </li>
          );
        })}
      </ul>

      {/* Vạch chia đặt dưới danh sách chứ không vẽ đè lên các thanh: kẻ dọc chạy qua thanh
          làm thanh trông như bị chia đoạn, khó đọc hơn là giúp đọc. */}
      <div className="flex items-center gap-lg" aria-hidden="true">
        <span className="shrink-0 basis-[34%]" />
        <span className="relative flex min-w-0 flex-1 justify-between border-t border-secondary pt-xs">
          {vach.map((v) => (
            <span key={v} className="text-xs text-quaternary">
              {v}
            </span>
          ))}
        </span>
        <span className="w-[92px] shrink-0" />
      </div>

      <div className="flex flex-wrap items-center gap-xl pl-[34%] text-xs text-tertiary">
        <span className="flex items-center gap-sm">
          <span className="h-2 w-4 rounded-full bg-[#20447E]" aria-hidden="true" />
          Thời gian học thực tế
        </span>
        <span className="flex items-center gap-sm">
          <span className="h-2 w-4 rounded-full bg-[#E9EAEB]" aria-hidden="true" />
          Độ dài bài giảng
        </span>
        <span className="flex items-center gap-sm">
          <span className="h-2 w-4 rounded-full bg-[#B42318]" aria-hidden="true" />
          Vượt hơn 35% so với độ dài bài
        </span>
      </div>
    </div>
  );
}
