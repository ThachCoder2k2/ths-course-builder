import { useState } from 'react';
import { clamp, polar, polygonPoints, round } from '../../../lib/svg';
import { pct } from '../../../behavior/format';
import type { RadarAxis } from '../../../behavior/types';

/**
 * Chân dung cách học — mỗi trục là một thói quen, chạy từ 0 tới 100%. Hình càng tròn
 * đều là học càng cân; hình lệch hẳn về một phía là đang dựa vào một hai thói quen.
 *
 * Màu, cỡ chữ và các mốc trên trục dọc lấy đúng theo thiết kế: đường lưới #F5F5F5,
 * đường dữ liệu #0BA5EC, nhãn trục 14/20.
 */

const SERIES = '#0BA5EC';
const RING_STROKE = '#F5F5F5';
const LABEL_INK = '#535862';

const R = 118;
const LABEL_GAP = 24;
const LINE_H = 18;
const RINGS = [0.2, 0.4, 0.6, 0.8, 1] as const;
/**
 * Chặn bề rộng SVG quanh cỡ viewBox (max-w ở dưới). Để `w-full` trơn thì ở khổ
 * 768 hệ số phóng lên 1.5 và nhãn trục thành 21px — to hơn cả tiêu đề thẻ; chiều cao thẻ
 * cũng chạy theo bề rộng chứ không theo nội dung, sinh ra thẻ 537px cho hình 268px.
 */

/** Ngắt nhãn dài thành hai dòng ở khoảng trắng gần giữa nhất; nhãn ngắn để nguyên. */
function ngatDong(label: string, nguong: number): string[] {
  if (label.length <= nguong) return [label];
  const giua = label.length / 2;
  let cat = -1;
  for (let i = 0; i < label.length; i += 1) {
    if (label[i] !== ' ') continue;
    if (cat === -1 || Math.abs(i - giua) < Math.abs(cat - giua)) cat = i;
  }
  return cat === -1 ? [label] : [label.slice(0, cat), label.slice(cat + 1)];
}

export function StrategyRadar({ axes }: { axes: RadarAxis[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = axes.length;
  if (n < 3) return null;

  /**
   * Nhãn trục là TÊN THẬT (tên chương, tên thói quen), không phải mã C1..C5 — thiết kế
   * ghi thẳng tên lên trục. Trước đây tôi đổi sang C1..C5 rồi thêm một danh sách chú
   * giải bên dưới để khỏi bị mép thẻ cắt chữ; cái danh sách đó không có trong thiết kế.
   *
   * Nên chỗ hẹp thì giải quyết bằng ngắt dòng và nới khung, không bằng đổi tên trục.
   * Khung chỉ nới khi thật sự có nhãn dài, để radar thói quen ở trang Học tập của tôi
   * (nhãn hai ba chữ) giữ đúng tỉ lệ của thiết kế.
   */
  const nguong = 12;
  const dong = axes.map((a) => ngatDong(a.label, nguong));
  // Chỉ nới khung khi có nhãn THẬT SỰ phải ngắt dòng. Nới theo độ dài thô thì radar
  // thói quen ở trang Học tập của tôi (nhãn dài nhất 'Chủ động hỏi') cũng bị nới, mà
  // hình học của radar đó đang khớp thiết kế 506:4930.
  const nhanDai = dong.some((d) => d.length > 1);

  const VW = nhanDai ? 520 : 460;
  const VH = nhanDai ? 380 : 340;
  const CX = VW / 2;
  const CY = VH / 2 + 6;
  const MAX_W = nhanDai ? 'max-w-[520px]' : 'max-w-[440px]';

  const spokes = axes.map((axis, i) => {
    const deg = -90 + (360 / n) * i;
    const r = (deg * Math.PI) / 180;
    const v = clamp(axis.value, 0, 1);
    return {
      axis,
      deg,
      cos: Math.cos(r),
      sin: Math.sin(r),
      v,
      value: polar(CX, CY, R * v, deg),
      label: polar(CX, CY, R + LABEL_GAP, deg),
    };
  });

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      role="img"
      aria-label={`Chân dung cách học của bạn theo ${n} thói quen`}
      className={`mx-auto block h-auto w-full ${MAX_W}`}
    >
      {/* lưới: năm vòng 20 / 40 / 60 / 80 / 100% */}
      {RINGS.map((level) => (
        <polygon
          key={level}
          points={polygonPoints(spokes.map((s) => polar(CX, CY, R * level, s.deg)))}
          fill="none"
          stroke={RING_STROKE}
          strokeWidth={1}
        />
      ))}

      {/* nan hoa ra từng đỉnh */}
      {spokes.map((s, i) => (
        <line
          key={`spoke-${i}`}
          x1={CX}
          y1={CY}
          x2={round(polar(CX, CY, R, s.deg).x)}
          y2={round(polar(CX, CY, R, s.deg).y)}
          stroke={RING_STROKE}
          strokeWidth={1}
        />
      ))}

      {/* hình của người học: nền hiện lên sau khi viền đã vẽ xong một vòng */}
      <polygon className="rp-fade" points={polygonPoints(spokes.map((s) => s.value))} fill={SERIES} fillOpacity={0.24} />
      <polygon
        className="rp-draw"
        points={polygonPoints(spokes.map((s) => s.value))}
        pathLength={1}
        fill="none"
        stroke={SERIES}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* đỉnh + số hiện khi trỏ vào */}
      {spokes.map((s, i) => (
        <circle
          className="rp-fade"
          key={`dot-${i}`}
          cx={round(s.value.x)}
          cy={round(s.value.y)}
          r={hover === i ? 5.5 : 4}
          fill={SERIES}
          stroke="#FFFFFF"
          strokeWidth={1.5}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <title>{`${s.axis.label}: ${pct(s.v)}`}</title>
        </circle>
      ))}

      {/* nhãn trục, neo hướng ra ngoài để không đè lên hình */}
      {spokes.map((s, i) => {
        const anchor = Math.abs(s.cos) < 0.35 ? 'middle' : s.cos > 0 ? 'start' : 'end';
        const lines = dong[i];
        // Cả khối nhãn phải nằm về phía NGOÀI của điểm neo, nên dòng đầu bị dịch lên
        // theo số dòng: trục trên thì đẩy hết lên, trục ngang thì căn giữa, trục dưới
        // thì để nguyên rồi chạy xuống.
        const baseline = Math.abs(s.sin) < 0.35 ? 'middle' : s.sin > 0 ? 'hanging' : 'auto';
        const dy0 =
          lines.length === 1 ? 0 : Math.abs(s.sin) < 0.35 ? -((lines.length - 1) * LINE_H) / 2 : s.sin > 0 ? 0 : -((lines.length - 1) * LINE_H);
        return (
          <text
            key={`label-${i}`}
            x={round(s.label.x)}
            y={round(s.label.y)}
            textAnchor={anchor}
            dominantBaseline={baseline}
            fontSize={14}
            fontWeight={hover === i ? 600 : 500}
            fill={LABEL_INK}
          >
            {lines.map((line, j) => (
              <tspan key={line + j} x={round(s.label.x)} dy={j === 0 ? dy0 : LINE_H}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}
