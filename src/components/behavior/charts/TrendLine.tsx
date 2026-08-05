import { scaleLinear, smoothPath, areaPath } from '../../../lib/svg';
import { SERIES, INK, GRID, AXIS } from '../../analytics/palette';
import { minutesLabel, pct } from '../../../behavior/format';
import type { MonthPoint } from '../../../behavior/types';

const W = 640;
const H = 210;
const PAD = { l: 34, r: 56, t: 14, b: 24 };
const PLOT_L = PAD.l;
const PLOT_R = W - PAD.r;
const PLOT_T = PAD.t;
const PLOT_B = H - PAD.b;

const AREA_OPACITY = 0.1;
const MIN_LABEL_GAP = 40; // px tối thiểu giữa hai nhãn tháng trước khi bắt đầu thưa bớt
const DOT_R = 2.5;

const clampMastery = (m: number): number => Math.max(0, Math.min(1, m));

const yTicks = [0, 0.5, 1];

/**
 * Đường tiến bộ: tỉ lệ làm đúng trung bình, cộng dồn theo từng tháng. Đường xanh
 * mượt cùng vùng nền nhạt cho thấy xu hướng; ba vạch ngang 0% / 50% / 100% làm
 * mốc đọc. Chấm ở mỗi tháng, riêng tháng gần nhất được ghi thẳng con số bên cạnh
 * để khỏi phải dò trục. Đi lên tức là đang khá dần.
 */
export function TrendLine({ data }: { data: MonthPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-tertiary">Chưa đủ dữ liệu để vẽ tiến bộ.</p>;
  }

  const single = data.length === 1;
  const x = single ? () => (PLOT_L + PLOT_R) / 2 : scaleLinear(0, data.length - 1, PLOT_L, PLOT_R);
  const y = scaleLinear(0, 1, PLOT_B, PLOT_T);

  const pts = data.map((d, i) => ({ x: x(i), y: y(clampMastery(d.mastery)) }));
  const last = pts[pts.length - 1];
  const lastPoint = data[data.length - 1];

  // Thưa bớt nhãn tháng khi chật: giữ khoảng cách tối thiểu, luôn giữ tháng cuối.
  const spacing = single ? PLOT_R - PLOT_L : (PLOT_R - PLOT_L) / (data.length - 1);
  const step = Math.max(1, Math.ceil(MIN_LABEL_GAP / spacing));
  const showLabel = (i: number): boolean =>
    i === data.length - 1 || (i % step === 0 && data.length - 1 - i >= step);

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Tiến bộ: tỉ lệ làm đúng trung bình cộng dồn theo từng tháng"
          className="block h-auto w-full"
          style={{ minWidth: 420 }}
        >
          {/* Vạch mốc ngang: 0% là đường trục, 50% / 100% là lưới nền mờ */}
          {yTicks.map((t) => (
            <line
              key={`g${t}`}
              x1={PLOT_L}
              y1={y(t)}
              x2={PLOT_R}
              y2={y(t)}
              stroke={t === 0 ? AXIS : GRID}
              strokeWidth={1}
            />
          ))}

          {/* Nhãn trục tung */}
          {yTicks.map((t) => (
            <text
              key={`t${t}`}
              x={PLOT_L - 6}
              y={y(t) + 3}
              fontSize={10}
              fill={INK.quaternary}
              textAnchor="end"
              className="tabular-nums"
            >
              {pct(t)}
            </text>
          ))}

          {/* Vùng nền nhạt + đường xu hướng (chỉ vẽ khi có từ hai tháng) */}
          {!single && (
            <>
              <path d={areaPath(pts, PLOT_B)} fill={SERIES.blue} opacity={AREA_OPACITY} />
              <path
                d={smoothPath(pts)}
                fill="none"
                stroke={SERIES.blue}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Nhãn tháng dưới trục */}
          {data.map((d, i) =>
            showLabel(i) ? (
              <text
                key={`x${i}`}
                x={pts[i].x}
                y={PLOT_B + 15}
                fontSize={10}
                fill={INK.quaternary}
                textAnchor="middle"
              >
                {d.label}
              </text>
            ) : null,
          )}

          {/* Chấm mỗi tháng — tháng gần nhất to hơn một chút */}
          {data.map((d, i) => (
            <circle
              key={`d${i}`}
              cx={pts[i].x}
              cy={pts[i].y}
              r={i === data.length - 1 ? 3 : DOT_R}
              fill={SERIES.blue}
            >
              <title>{`${d.label}: ${pct(d.mastery)} đúng · ${minutesLabel(d.minutes)}`}</title>
            </circle>
          ))}

          {/* Ghi thẳng con số cho tháng gần nhất (thay cho chú thích) */}
          <text
            x={last.x + 8}
            y={last.y + 4}
            fontSize={12}
            fontWeight={600}
            fill={SERIES.blue}
            className="tabular-nums"
          >
            {pct(lastPoint.mastery)}
          </text>
        </svg>
      </div>

      <p className="text-xs text-tertiary">
        Tỉ lệ làm đúng trung bình, cộng dồn theo từng tháng — đi lên là đang khá dần.
      </p>
    </div>
  );
}
