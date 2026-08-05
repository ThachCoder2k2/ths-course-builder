import { scaleLinear, smoothPath, areaPath, clamp } from '../../../lib/svg';
import { SERIES, INK, GRID, AXIS, STATUS } from '../../analytics/palette';
import { pct } from '../../../behavior/format';
import type { AbandonCurve, SurvivalPoint } from '../../../behavior/types';

const W = 640;
const H = 220;
const PAD = { l: 30, r: 14, t: 14, b: 26 };
const PLOT_L = PAD.l;
const PLOT_R = W - PAD.r;
const PLOT_T = PAD.t;
const PLOT_B = H - PAD.b;
const Y_GRID = [0, 25, 50, 75, 100];
const X_TICKS = [0, 50, 100];

/** % người còn xem tại một mốc thời lượng, nội suy tuyến tính từ các điểm đã có. */
function stillAt(points: SurvivalPoint[], posPct: number): number {
  if (points.length === 0) return 0;
  if (posPct <= points[0].posPct) return points[0].stillPct;
  const last = points[points.length - 1];
  if (posPct >= last.posPct) return last.stillPct;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (posPct <= b.posPct) {
      const span = b.posPct - a.posPct || 1;
      return a.stillPct + ((posPct - a.posPct) / span) * (b.stillPct - a.stillPct);
    }
  }
  return last.stillPct;
}

/**
 * Đường "còn lại" (survival curve). X = phần trăm thời lượng video đã trôi qua,
 * Y = phần trăm người học vẫn còn xem. Đường đi xuống cho thấy người ta rơi rụng
 * ở đâu; chấm vàng đánh dấu những khúc tụt mạnh, vạch đứt là mốc quá nửa đã rời.
 */
export function AbandonCurveChart({ data }: { data: AbandonCurve }) {
  const x = scaleLinear(0, 100, PLOT_L, PLOT_R);
  const y = scaleLinear(0, 100, PLOT_B, PLOT_T);

  const pts = data.points.map((p) => ({ x: x(p.posPct), y: y(p.stillPct) }));
  const hasMedian = data.medianPct != null;
  const median = Math.round(data.medianPct ?? 0);
  const mx = x(data.medianPct ?? 0);
  const medianAnchor = (data.medianPct ?? 0) > 65 ? 'end' : 'start';
  const medianLabelX = (data.medianPct ?? 0) > 65 ? mx - 5 : mx + 5;

  const cliffs = data.cliffs.slice(0, 3);
  const yCaptionCy = (PLOT_T + PLOT_B) / 2;

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Đường phần trăm người học còn xem theo thời lượng video"
          className="block h-auto w-full"
          style={{ minWidth: 520 }}
        >
          {/* Y gridlines (recessive) — mốc 0/25/50/75/100 */}
          {Y_GRID.map((g) => (
            <line key={g} x1={PLOT_L} x2={PLOT_R} y1={y(g)} y2={y(g)} stroke={GRID} strokeWidth={1} />
          ))}

          {/* Vùng tô nhẹ dưới đường */}
          {pts.length > 0 ? <path d={areaPath(pts, PLOT_B, true)} fill={SERIES.blue} fillOpacity={0.12} stroke="none" /> : null}

          {/* Đường còn xem */}
          {pts.length > 1 ? (
            <path d={smoothPath(pts)} fill="none" stroke={SERIES.blue} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
              <title>Đường còn xem: bắt đầu ở đầu video và giảm dần khi người học lần lượt rời đi.</title>
            </path>
          ) : null}

          {/* Trục X (trục duy nhất có nhãn) */}
          <line x1={PLOT_L} x2={PLOT_R} y1={PLOT_B} y2={PLOT_B} stroke={AXIS} strokeWidth={1} />
          {X_TICKS.map((v) => {
            const tx = x(v);
            const anchor = v === 0 ? 'start' : v === 100 ? 'end' : 'middle';
            return (
              <g key={v}>
                <line x1={tx} x2={tx} y1={PLOT_B} y2={PLOT_B + 3} stroke={AXIS} strokeWidth={1} />
                <text className="tabular-nums" x={tx} y={PLOT_B + 15} textAnchor={anchor} fontSize={10} fill={INK.quaternary}>
                  {pct(v / 100)}
                </text>
              </g>
            );
          })}

          {/* Chú thích trục Y */}
          <text
            x={11}
            y={yCaptionCy}
            transform={`rotate(-90 11 ${yCaptionCy})`}
            textAnchor="middle"
            fontSize={10}
            fill={INK.quaternary}
          >
            % còn xem
          </text>

          {/* Vạch đứt: mốc quá nửa đã rời (chỉ hiện khi thật sự có quá nửa rời giữa chừng) */}
          {hasMedian ? (
            <>
              <line x1={mx} x2={mx} y1={PLOT_T} y2={PLOT_B} stroke={INK.quaternary} strokeWidth={1} strokeDasharray="3 3">
                <title>{`Quá nửa người xem đã rời quanh mốc ${median}% thời lượng video.`}</title>
              </line>
              <text className="tabular-nums" x={medianLabelX} y={PLOT_T - 4} textAnchor={medianAnchor} fontSize={10} fontWeight={600} fill={INK.tertiary}>
                {`một nửa rời ở ~${median}%`}
              </text>
            </>
          ) : null}

          {/* Các khúc tụt mạnh */}
          {cliffs.map((c, i) => {
            const cx = x(c.posPct);
            const cy = y(stillAt(data.points, c.posPct));
            const anchor = c.posPct > 80 ? 'end' : c.posPct < 20 ? 'start' : 'middle';
            const ly = clamp(cy - 12, PLOT_T + 12, PLOT_B - 4);
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={4.5} fill="#fff" stroke={STATUS.warning} strokeWidth={2}>
                  <title>{`${c.label} · khúc tụt quanh ${Math.round(c.posPct)}% video`}</title>
                </circle>
                <circle cx={cx} cy={cy} r={1.6} fill={STATUS.warning} />
                <text x={cx} y={ly} textAnchor={anchor} fontSize={10} fill={INK.tertiary}>
                  {c.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-tertiary">
        Đường cho biết còn bao nhiêu phần trăm người học đang xem tại mỗi mốc thời lượng video; càng về sau càng ít người theo tới cùng.
      </p>
    </div>
  );
}
