import { useState } from 'react';
import { clamp, polar, polygonPoints, round } from '../../lib/svg';

/**
 * Radar hai lớp của màn báo cáo cuối khoá (Figma node 432:6863, thẻ "Competency profile").
 *
 * Khác với `StrategyRadar` ở trang Học tập của tôi — thẻ đó một lớp, màu #0BA5EC. Thẻ này
 * thiết kế vẽ HAI hình lồng nhau, nên tách thành component riêng thay vì nhồi thêm cờ vào
 * component cũ:
 *
 *   - hình ngoài viền hồng #EE46BC, nền #FCDAF2
 *   - hình trong viền xanh #3992E3, nền #D5CCEF
 *
 * Cả bốn mã màu đo từng điểm ảnh trên ảnh xuất của frame. Nền hình trong vẽ đè lên nền
 * hình ngoài nên #D5CCEF chính là màu nhìn thấy ở vùng lồng nhau — dùng đúng màu đó làm
 * nền đặc thì ra y hệt ảnh, khỏi phải đoán độ mờ của hai lớp.
 *
 * Thiết kế ghi giá trị ngay dưới tên trục ("Listening / 0-100") và có mốc số dọc theo trục
 * đứng, nên giữ cả hai. Tên trục là tên chương thật; nhãn dài thì ngắt hai dòng.
 */

const NGOAI_NET = '#EE46BC';
const NGOAI_NEN = '#FCDAF2';
const TRONG_NET = '#3992E3';
const TRONG_NEN = '#D5CCEF';
const LUOI = '#F5F5F5';
const CHU = '#535862';
const CHU_MO = '#717680';

const R = 118;
const LABEL_GAP = 26;
const LINE_H = 17;
const RINGS = [0.2, 0.4, 0.6, 0.8, 1] as const;

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

export interface TrucNangLuc {
  label: string;
  /** 0..1 — hình trong: mức nắm */
  nam: number;
  /** 0..1 — hình ngoài: phần nội dung đã đi qua */
  tienDo: number;
}

export function CompetencyRadar({ truc }: { truc: TrucNangLuc[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = truc.length;
  if (n < 3) return null;

  const dong = truc.map((t) => ngatDong(t.label, 12));
  const VW = 560;
  const VH = 420;
  const CX = VW / 2;
  const CY = VH / 2;

  const nan = truc.map((t, i) => {
    const deg = -90 + (360 / n) * i;
    const rad = (deg * Math.PI) / 180;
    return {
      t,
      deg,
      cos: Math.cos(rad),
      sin: Math.sin(rad),
      nam: clamp(t.nam, 0, 1),
      tienDo: clamp(t.tienDo, 0, 1),
      dinhNam: polar(CX, CY, R * clamp(t.nam, 0, 1), deg),
      dinhTienDo: polar(CX, CY, R * clamp(t.tienDo, 0, 1), deg),
      nhan: polar(CX, CY, R + LABEL_GAP, deg),
    };
  });

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      role="img"
      aria-label={`Chân dung năng lực theo ${n} chương của khoá`}
      className="mx-auto block h-auto w-full max-w-[560px]"
    >
      {RINGS.map((level) => (
        <polygon
          key={level}
          points={polygonPoints(nan.map((s) => polar(CX, CY, R * level, s.deg)))}
          fill="none"
          stroke={LUOI}
          strokeWidth={1}
        />
      ))}
      {nan.map((s, i) => (
        <line
          key={`nan-${i}`}
          x1={CX}
          y1={CY}
          x2={round(polar(CX, CY, R, s.deg).x)}
          y2={round(polar(CX, CY, R, s.deg).y)}
          stroke={LUOI}
          strokeWidth={1}
        />
      ))}

      {/* Hình ngoài vẽ trước, hình trong vẽ sau và đè lên — đúng thứ tự của thiết kế. */}
      <polygon className="rp-fade" points={polygonPoints(nan.map((s) => s.dinhTienDo))} fill={NGOAI_NEN} />
      <polygon
        className="rp-draw"
        points={polygonPoints(nan.map((s) => s.dinhTienDo))}
        pathLength={1}
        fill="none"
        stroke={NGOAI_NET}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <polygon className="rp-fade" points={polygonPoints(nan.map((s) => s.dinhNam))} fill={TRONG_NEN} />
      <polygon
        className="rp-draw"
        points={polygonPoints(nan.map((s) => s.dinhNam))}
        pathLength={1}
        fill="none"
        stroke={TRONG_NET}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {nan.map((s, i) => (
        <circle
          className="rp-fade"
          key={`dinh-${i}`}
          cx={round(s.dinhNam.x)}
          cy={round(s.dinhNam.y)}
          r={hover === i ? 5.5 : 4}
          fill={TRONG_NET}
          stroke="#FFFFFF"
          strokeWidth={1.5}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <title>{`${s.t.label}: nắm ${Math.round(s.nam * 100)}/100, đã đi qua ${Math.round(s.tienDo * 100)}%`}</title>
        </circle>
      ))}

      {/* Mốc số dọc theo trục đứng, đúng chỗ thiết kế đặt. Vẽ SAU hai hình, không thì
          nền của chúng che mất số — thiết kế cũng để số nằm trên nền. Bỏ mốc 0 ở tâm. */}
      {RINGS.map((level) => (
        <text
          key={`moc-${level}`}
          x={CX + 6}
          y={round(CY - R * level)}
          dominantBaseline="middle"
          fill={CHU_MO}
          className="text-[11px]"
        >
          {Math.round(level * 100)}
        </text>
      ))}

      {/* Tên trục, rồi giá trị ngay dưới — thiết kế ghi "83/100". */}
      {nan.map((s, i) => {
        const anchor = Math.abs(s.cos) < 0.35 ? 'middle' : s.cos > 0 ? 'start' : 'end';
        const lines = dong[i];
        // Cả khối chữ (tên + dòng giá trị) phải nằm về phía NGOÀI điểm neo.
        const soDong = lines.length + 1;
        const baseline = Math.abs(s.sin) < 0.35 ? 'middle' : s.sin > 0 ? 'hanging' : 'auto';
        const dy0 = Math.abs(s.sin) < 0.35 ? -((soDong - 1) * LINE_H) / 2 : s.sin > 0 ? 0 : -((soDong - 1) * LINE_H);
        return (
          <text
            key={`nhan-${i}`}
            x={round(s.nhan.x)}
            y={round(s.nhan.y)}
            textAnchor={anchor}
            dominantBaseline={baseline}
            className="text-[14px]"
          >
            {lines.map((line, j) => (
              <tspan
                key={`${line}-${j}`}
                x={round(s.nhan.x)}
                dy={j === 0 ? dy0 : LINE_H}
                fill={CHU}
                fontWeight={hover === i ? 600 : 500}
              >
                {line}
              </tspan>
            ))}
            <tspan x={round(s.nhan.x)} dy={LINE_H} fill={CHU_MO} className="text-[12px]">
              {Math.round(s.nam * 100)}/100
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
