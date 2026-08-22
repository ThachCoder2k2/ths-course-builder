import { useEffect, useRef, useState } from 'react';
import { ngheCuon } from '../../lib/scrollBus';

/**
 * Vạch tiến độ đọc, kiêm luôn đường kẻ chân thanh đầu trang.
 *
 * Trang chủ cao khoảng 4200px, gần bốn màn hình, mà không có dấu hiệu nào cho biết còn
 * bao xa. Vạch này không phản ứng với cuộn — nó CHÍNH LÀ vị trí cuộn.
 *
 * Đường kẻ mảnh bên dưới xuất hiện đúng khoảnh khắc thanh đầu trang bắt đầu đè lên nội
 * dung, nên nó là hậu quả của việc chồng lớp chứ không phải đường viền trang trí.
 *
 * Đặt NGOÀI thẻ header, dù nó nằm ngay dưới header. Thanh đầu trang có `backdrop-blur`,
 * và bất cứ thứ gì lên layer bên trong một tổ tiên có `backdrop-filter` đều buộc lớp mờ
 * vẽ lại mỗi khung hình — phép tính đắt nhất trên trang này. Đặt ngoài thì miễn phí.
 * `top-20` = 80px = đúng chiều cao thanh đầu trang, không đổi theo khổ màn.
 *
 * Hai ngưỡng hiện/ẩn lệch nhau (24px và 8px) để cuộn rung tay không làm nó nhấp nháy.
 */
const NGUONG_HIEN = 24;
const NGUONG_AN = 8;

export default function ReadingProgress() {
  const fill = useRef<HTMLDivElement>(null);
  const [hien, setHien] = useState(false);

  useEffect(() => {
    return ngheCuon(({ y, tien }) => {
      // Ghi thẳng vào style, không qua state: scaleX phải dính vào ngón tay. Cho nó đi
      // qua một lần render của React là nó lết theo sau một khung, thành cảm giác cao su.
      fill.current?.style.setProperty('--ln-progress', String(tien));
      setHien((truoc) => (truoc ? y > NGUONG_AN : y > NGUONG_HIEN));
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      data-hien={hien}
      className="ln-progress pointer-events-none fixed left-0 top-20 z-30 h-[3px] w-full"
    >
      <div className="absolute inset-x-0 top-[2px] h-px bg-secondary" />
      <div ref={fill} className="ln-progress-fill absolute inset-x-0 top-0 h-[2px] bg-brand-500" />
    </div>
  );
}
