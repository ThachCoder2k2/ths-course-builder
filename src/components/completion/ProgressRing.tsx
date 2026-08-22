/**
 * Vòng tiến trình một giá trị (Figma node 432:6863, thẻ "Tiến trình khoá học tổng quan").
 *
 * Dự án đã có `TimeDonut` nhưng nó là donut nhiều lát cho việc chia thời gian, không dùng
 * lại được cho một con số duy nhất — nên dựng riêng, vẫn SVG tự vẽ, không thêm thư viện.
 *
 * Số đo lấy từ ảnh xuất của frame: đường kính ngoài 200, nét 20, máng #E9EAEB, vạch chạy
 * #0D67F7, đầu vạch tròn, bắt đầu từ đỉnh và chạy theo chiều kim đồng hồ.
 *
 * Chữ giữa vòng là "Trọng số hoàn thành" đúng như thiết kế: đây là phần NỘI DUNG đã đi
 * qua (tính theo độ dài video), không phải mức nắm. Hai thứ đó khác nhau và màn này nói
 * cả hai — vòng này là hoàn thành, còn radar và sơ đồ mới là mức nắm.
 */
const CO = 200;
const DAY = 20;
const BAN_KINH = (CO - DAY) / 2;
const CHU_VI = 2 * Math.PI * BAN_KINH;

export function ProgressRing({ giaTri, nhan }: { giaTri: number; nhan: string }) {
  const p = Math.min(1, Math.max(0, giaTri));
  const phanTram = Math.round(p * 100);

  return (
    <svg
      viewBox={`0 0 ${CO} ${CO}`}
      className="h-auto w-[200px] max-w-full"
      role="img"
      aria-label={`${nhan}: ${phanTram}%`}
    >
      <circle cx={CO / 2} cy={CO / 2} r={BAN_KINH} fill="none" stroke="#E9EAEB" strokeWidth={DAY} />
      {/* Quay -90° để vạch bắt đầu từ đỉnh, đúng như thiết kế. */}
      <circle
        cx={CO / 2}
        cy={CO / 2}
        r={BAN_KINH}
        fill="none"
        stroke="#0D67F7"
        strokeWidth={DAY}
        strokeLinecap="round"
        transform={`rotate(-90 ${CO / 2} ${CO / 2})`}
        strokeDasharray={CHU_VI}
        strokeDashoffset={CHU_VI * (1 - p)}
        className="cp-ring"
      />
      <text x={CO / 2} y={CO / 2 - 8} textAnchor="middle" fill="#535862" className="text-[13px]">
        {nhan}
      </text>
      <text x={CO / 2} y={CO / 2 + 24} textAnchor="middle" fill="#181D27" className="text-[30px] font-bold">
        {phanTram}%
      </text>
    </svg>
  );
}
