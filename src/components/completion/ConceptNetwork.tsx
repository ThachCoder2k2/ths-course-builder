import { useId } from 'react';
import type { BaoCaoKhoa, NutSoDo } from '../../behavior/completion';

/**
 * Sơ đồ mạng lưới các bài trong khoá (Figma node 432:6863, khối bên trái hàng đầu).
 *
 * Thiết kế gốc cho độ to của nút là "trọng số chủ đề trong cấu trúc điểm thi TSA". Khoá
 * thật không có dữ liệu đề thi, nên ở đây độ to là PHẦN BÀI ĐÓ CHIẾM TRONG KHOÁ, tính
 * theo độ dài video — một con số có thật và cũng nói đúng chuyện "bài này nặng cỡ nào".
 *
 * Ba màu nút lấy đúng từ ảnh xuất của frame (đo từng điểm ảnh): xanh #75E0A7 khi đã vững,
 * cam #F7B27A khi tạm được, vàng #FDE272 khi còn yếu. Nút KHÔNG có viền — trước đây tôi
 * thêm viền đậm cho mỗi bậc và lấy cam #FEC84B, cả hai đều không đúng thiết kế.
 *
 * Vẽ bằng SVG tự dựng, không thêm thư viện — cùng cách với các biểu đồ khác trong dự án.
 * Vị trí nút tính sẵn ở `completion.ts` và có test canh việc không tràn khung, không đè nhau.
 */

/** Ba bậc màu theo mức nắm, đo từ ảnh xuất của frame 432:6863. */
function bacMau(nam: number): { to: string; ten: string } {
  if (nam >= 0.75) return { to: '#75E0A7', ten: 'đã vững' };
  if (nam >= 0.5) return { to: '#F7B27A', ten: 'tạm được' };
  return { to: '#FDE272', ten: 'còn yếu' };
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
          return (
            <line
              key={`${e.from}->${e.to}`}
              x1={a.x + (dx / d) * (a.r + 2)}
              y1={a.y + (dy / d) * (a.r + 2)}
              x2={b.x - (dx / d) * (b.r + 6)}
              y2={b.y - (dy / d) * (b.r + 6)}
              stroke="#E9EAEB"
              strokeWidth={1.5}
              markerEnd={`url(#${mui})`}
            />
          );
        })}

        {/* Vòng tròn: vẽ HẾT trước, rồi mới vẽ nhãn ở lượt sau. Trước đây nhãn nằm cùng
            nhóm với nút của nó nên những nút vẽ sau che mất chữ — chính lỗi che chữ ở
            khối trọng số. SVG không có z-index, thứ tự vẽ là thứ tự duy nhất. */}
        {bc.nut.map((n) => {
          const chon = n.id === dangChon.id;
          return (
            <g key={n.id}>
              {/* vòng trong suốt rộng hơn làm vùng trỏ chuột cho <title> */}
              <circle cx={n.x} cy={n.y} r={Math.max(n.r, 22)} fill="transparent" />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={bacMau(n.mastery).to}
                className="cn-vong"
                /* Thiết kế là ảnh tĩnh nên không vẽ trạng thái đang chọn. Nhưng sơ đồ này
                   bấm được thật, không có dấu gì thì bấm xong chẳng biết đã chọn cái nào —
                   nên giữ một vòng xanh thương hiệu, và chỉ ở nút đang chọn. */
                stroke={chon ? '#0D67F7' : 'none'}
                strokeWidth={chon ? 3 : 0}
              />
              <title>{`${n.label} — ${bacMau(n.mastery).ten}, nắm ${Math.round(n.mastery * 100)}%, chiếm ${Math.round(n.phan * 100)}% khoá`}</title>
            </g>
          );
        })}

        {/* Nhãn của MỌI bài, ghi giữa nút như thiết kế. Nhãn rộng hơn nút là bình thường —
            trong thiết kế cũng vậy. Viền trắng mảnh (paint-order) để chữ còn đọc được ở
            chỗ nó chạy qua một đường nối hay mép nút bên cạnh. */}
        {bc.nut.map((n) => (
          <text
            key={`nhan-${n.id}`}
            x={n.x}
            y={n.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="cn-chu text-[13px] font-semibold"
            fill="#181D27"
            stroke="#FFFFFF"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {n.label}
          </text>
        ))}
      </svg>

      {/*
        Đích bấm là HTML nằm NGOÀI thẻ SVG, định vị theo phần trăm, và rộng ĐÚNG BẰNG vòng
        tròn của nó.

        Hai lần sai trước ở chỗ này, ghi lại để khỏi lặp. Lần đầu đặt trong `foreignObject`
        bên trong SVG — sai đơn vị, vì SVG có viewBox 960×320 và bị co theo bề rộng thẻ nên
        44 là 44 đơn vị viewBox chứ không phải 44 pixel; ở 390px tỉ lệ co còn 0.34 nên nút
        chỉ còn 15px. Lần hai ép cứng 44px — thì các nút ĐÈ LÊN NHAU và có nút không bấm
        được, vì 14 nút × 44px là 616px, rộng hơn cả màn hình 390px.

        Nên ở đây đích bấm bằng đúng vòng tròn — vòng tròn thì có test canh không đè nhau.
        Đủ ngưỡng chạm là việc của trang báo cáo: nó khoá bề rộng tối thiểu của sơ đồ và cho
        cuộn ngang, nên nút không bao giờ co xuống dưới cỡ chạm được.
      */}
      {bc.nut.map((n) => (
        <button
          key={`hit-${n.id}`}
          type="button"
          onClick={() => onChon(n)}
          aria-pressed={n.id === dangChon.id}
          aria-label={`${n.label} — nắm ${Math.round(n.mastery * 100)}%, chiếm ${Math.round(n.phan * 100)}% khoá`}
          style={{
            left: `${(n.x / bc.khungRong) * 100}%`,
            top: `${(n.y / bc.khungCao) * 100}%`,
            width: `${((n.r * 2) / bc.khungRong) * 100}%`,
            aspectRatio: '1',
          }}
          className="ln-focus absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-transparent"
        />
      ))}
    </div>
  );
}
