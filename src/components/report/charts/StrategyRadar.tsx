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

const VW = 460;
const VH = 340;
const CX = VW / 2;
const CY = VH / 2 + 6;
const R = 118;
const LABEL_GAP = 24;
const RINGS = [0.2, 0.4, 0.6, 0.8, 1] as const;

export function StrategyRadar({ axes }: { axes: RadarAxis[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = axes.length;
  if (n < 3) return null;

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
      className="mx-auto block h-auto w-full"
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
        const baseline = Math.abs(s.sin) < 0.35 ? 'middle' : s.sin > 0 ? 'hanging' : 'auto';
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
            {s.axis.label}
          </text>
        );
      })}
    </svg>
  );
}
