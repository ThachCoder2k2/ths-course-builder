import { useId } from 'react';
import { cn } from '../../lib/cn';
import type { BaoCaoKhoa, NutSoDo } from '../../behavior/completion';

/**
 * Sơ đồ mạng lưới các bài trong khoá (Figma node 432:6863, khối bên trái hàng đầu).
 *
 * Thiết kế gốc cho độ to của nút là "trọng số chủ đề trong cấu trúc điểm thi TSA". Khoá
 * thật không có dữ liệu đề thi, nên ở đây độ to là PHẦN BÀI ĐÓ CHIẾM TRONG KHOÁ, tính
 * theo độ dài video — một con số có thật và cũng nói đúng chuyện "bài này nặng cỡ nào".
 *
 * Màu theo mức nắm, ba bậc như thiết kế: xanh đã vững, cam tạm được, vàng còn yếu.
 *
 * Vẽ bằng SVG tự dựng, không thêm thư viện — cùng cách với các biểu đồ khác trong dự án.
 * Vị trí nút tính sẵn ở `completion.ts` và có test canh việc không tràn khung, không đè nhau.
 */

/** Ba bậc màu theo mức nắm. Lấy từ bảng màu của dự án, không phải mã màu tự nghĩ. */
function bacMau(nam: number): { to: string; vien: string; ten: string } {
  if (nam >= 0.75) return { to: '#75E0A7', vien: '#17B26A', ten: 'đã vững' };
  if (nam >= 0.5) return { to: '#FEC84B', vien: '#F79009', ten: 'tạm được' };
  return { to: '#FDE272', vien: '#EAAA08', ten: 'còn yếu' };
}

export function ConceptNetwork({
  bc,
  dangChon,
  onChon,
}: {
  bc: BaoCaoKhoa;
  dangChon: NutSoDo;
  onChon: (nut: NutSoDo) => void;
}) {
  const mui = useId();
  const theoId = new Map(bc.nut.map((n) => [n.id, n]));

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${bc.khungRong} ${bc.khungCao}`}
        className="h-auto w-full"
        role="group"
        aria-label={`Sơ đồ ${bc.soBai} bài của khoá, xếp theo chương`}
      >
      <defs>
        <marker id={mui} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="#D5D7DA" />
        </marker>
      </defs>

      {/* Cạnh vẽ trước để nút nằm trên. Mũi tên chỉ hướng học, dừng ở mép nút chứ không
          chọc vào giữa — nên phải rút ngắn đoạn thẳng đúng bán kính hai đầu. */}
      {bc.canh.map((e) => {
        const a = theoId.get(e.from);
        const b = theoId.get(e.to);
        if (!a || !b) return null;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const x1 = a.x + (dx / d) * (a.r + 2);
        const y1 = a.y + (dy / d) * (a.r + 2);
        const x2 = b.x - (dx / d) * (b.r + 6);
        const y2 = b.y - (dy / d) * (b.r + 6);
        return (
          <line
            key={`${e.from}->${e.to}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#E9EAEB"
            strokeWidth={1.5}
            markerEnd={`url(#${mui})`}
          />
        );
      })}

      {bc.nut.map((n) => {
        const mau = bacMau(n.mastery);
        const chon = n.id === dangChon.id;
        return (
          <g key={n.id} className="cn-nut" role="listitem">
            {/* Vòng tròn là đích bấm; bán kính nhỏ nhất 18 nên đường kính 36 — vẫn dưới
                44px của luật chạm, nên thêm một vòng trong suốt rộng hơn làm vùng bấm. */}
            <circle cx={n.x} cy={n.y} r={Math.max(n.r, 22)} fill="transparent" />
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={mau.to}
              stroke={chon ? '#0D67F7' : mau.vien}
              strokeWidth={chon ? 3 : 1.5}
              className="cn-vong"
            />
            {/* CHỈ ghi nhãn cho nút đang chọn. Mười bốn nhãn 11px trong khung 960×320 thì
                đè lên nhau không cách nào tránh — và dải nhãn bên dưới đã liệt kê đủ tên
                mọi bài, nên nhãn trên sơ đồ chỉ để xác nhận "đang xem cái này". */}
            {chon ? (
              <text
                x={n.x}
                y={n.y + n.r + 15}
                textAnchor="middle"
                className="cn-chu fill-[#0D67F7] text-[12px] font-semibold"
              >
                {n.label}
              </text>
            ) : null}
            {/* Đặt <title> để trỏ chuột vào có chú thích, và trình đọc màn hình đọc được. */}
            <title>{`${n.label} — ${mau.ten}, nắm ${Math.round(n.mastery * 100)}%, chiếm ${Math.round(n.phan * 100)}% khoá`}</title>
          </g>
        );
      })}

      </svg>

      {/*
        Đích bấm là HTML nằm NGOÀI thẻ SVG, định vị theo phần trăm, và rộng ĐÚNG BẰNG vòng
        tròn của nó.

        Hai lần sai trước ở chỗ này, ghi lại để khỏi lặp. Lần đầu đặt trong `foreignObject`
        bên trong SVG — sai đơn vị, vì SVG có viewBox 960×320 và bị co theo bề rộng thẻ nên
        44 là 44 đơn vị viewBox chứ không phải 44 pixel; ở 390px tỉ lệ co còn 0.34 nên nút
        chỉ còn 15px. Lần hai ép cứng 44px — thì các nút ĐÈ LÊN NHAU và có nút không bấm
        được, vì 14 nút × 44px là 616px, rộng hơn cả màn hình 390px.

        Nên ở đây đích bấm bằng đúng vòng tròn (vòng tròn thì có test canh không đè nhau),
        và đường chọn bảo đảm đủ 44px là dải nhãn bên dưới — xem `onChon` ở trang báo cáo.
      */}
      {bc.nut.map((n) => (
        <button
          key={`hit-${n.id}`}
          type="button"
          tabIndex={-1}
          onClick={() => onChon(n)}
          aria-hidden="true"
          style={{
            left: `${(n.x / bc.khungRong) * 100}%`,
            top: `${(n.y / bc.khungCao) * 100}%`,
            width: `${(n.r * 2 / bc.khungRong) * 100}%`,
            aspectRatio: '1',
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-transparent"
        />
      ))}
    </div>
  );
}
