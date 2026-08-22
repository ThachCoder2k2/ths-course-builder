import type { ThanhBai } from '../../behavior/completion';

/**
 * Cặp thanh so thời gian học thực tế với thời gian chuẩn của từng bài
 * (Figma node 432:6863, khối cuối trang).
 *
 * Thiết kế gọi thanh nhạt là "thời gian học chuẩn". Khoá thật không có số liệu chuẩn nào,
 * nên ở đây "chuẩn" là ĐỘ DÀI VIDEO của bài — tức thời gian tối thiểu để đi hết bài đó.
 * Thanh đậm là thời gian thật sự bỏ ra, gồm cả những lúc tua lại và dừng ngẫm.
 *
 * Số đo lấy từ ảnh xuất của frame: thanh cao 14, khe giữa hai thanh 3, bước dòng 51;
 * thanh đậm #20447E, thanh nhạt #E9EAEB, vạch chia dọc #E9EAEB ở các mốc trừ mốc 0.
 *
 * Ba chỗ trước đây tôi tự thêm, giờ bỏ: thanh đỏ khi vượt 35% độ dài bài (thiết kế không
 * có thanh đỏ nào và cái ngưỡng 35% là tôi tự đặt), dòng "N/M phút" ở cuối mỗi dòng, và
 * mục thứ ba trong phần chú thích. Thiết kế chỉ có hai mục chú thích, đặt giữa.
 *
 * `BarList` của trang báo cáo chung chỉ vẽ một thanh mỗi dòng nên không dùng lại được.
 */

const DAM = '#20447E';
const NHAT = '#E9EAEB';

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
    <div className="flex w-full flex-col gap-2xl">
      <ul className="flex flex-col gap-2xl">
        {rows.map((r) => (
          <li key={r.conceptId} className="flex items-center gap-lg">
            {/* Cột nhãn rộng cố định ~180px như thiết kế (nhãn kết thúc ở 478, vùng thanh
                bắt đầu ở 486 trên khung 1920). Để 30% bề rộng thẻ thì ở khổ rộng cột nhãn
                phình ra hơn 300px và hở một khoảng trống to giữa chữ với thanh. */}
            <span
              className="min-w-0 shrink-0 basis-[104px] truncate text-right text-xs text-tertiary sm:basis-[180px]"
              title={r.label}
            >
              {r.label}
            </span>
            {/* Vạch chia dọc vẽ trong chính vùng thanh, nằm dưới thanh — thiết kế có
                các đường mảnh chạy suốt chiều cao khối, không có vạch ở mốc 0. */}
            <span className="relative flex min-w-0 flex-1 flex-col gap-[3px]">
              <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                {vach.slice(1).map((v) => (
                  <span
                    key={v}
                    className="absolute top-[-10px] bottom-[-10px] w-px"
                    style={{ left: `${(v / tran) * 100}%`, background: NHAT }}
                  />
                ))}
              </span>
              <span className="flex h-[14px] items-center">
                <span
                  className="cp-bar h-[14px] rounded-full"
                  style={{ width: `${(r.thucTe / tran) * 100}%`, background: DAM }}
                />
              </span>
              <span className="flex h-[14px] items-center">
                <span
                  className="cp-bar h-[14px] rounded-full"
                  style={{ width: `${(r.chuan / tran) * 100}%`, background: NHAT }}
                />
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* Số mốc đặt dưới danh sách, thẳng lề với vùng thanh. */}
      <div className="flex items-center gap-lg" aria-hidden="true">
        <span className="shrink-0 basis-[104px] sm:basis-[180px]" />
        <span className="relative flex min-w-0 flex-1 justify-between">
          {vach.map((v) => (
            <span key={v} className="text-xs text-quaternary">
              {v}
            </span>
          ))}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2xl text-xs text-tertiary">
        <span className="flex items-center gap-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: DAM }} aria-hidden="true" />
          Thời gian học thực tế
        </span>
        <span className="flex items-center gap-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: NHAT }} aria-hidden="true" />
          Thời gian học chuẩn
        </span>
      </div>
    </div>
  );
}
