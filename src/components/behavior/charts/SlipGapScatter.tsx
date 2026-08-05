import { scaleLinear, clamp } from '../../../lib/svg';
import { SERIES, BRAND, STATUS, INK, GRID, AXIS } from '../../analytics/palette';
import type { SlipGap, QuadKind } from '../../../behavior/types';

/**
 * Slip-vs-gap scatter — a diagnostic. X = how long the learner took to answer
 * (giây, clamp về 45). The plot splits into two bands: câu làm đúng ở trên,
 * câu làm sai ở dưới. Cùng một điểm sai nhưng trả lời rất nhanh thường là
 * "nhầm do vội"; sai mà loay hoay lâu thường là "chưa hiểu". Bốn góc được gắn
 * nhãn nhẹ để đọc nhanh, hai chip bên dưới tóm tắt số câu cần lưu ý.
 */

const CAP = 45; // giây — câu nào lâu hơn cũng gom về mốc 45 để nhìn được cả bảng
const W = 640;
const H = 260;
const PAD_L = 78; // chừa chỗ cho nhãn "Làm đúng" / "Làm sai" bên trái
const PAD_R = 22;
const PAD_T = 30;
const PAD_B = 40;
const R = 4;

const PLOT_RIGHT = W - PAD_R;
const PLOT_BOTTOM = H - PAD_B;
const MID_Y = (PAD_T + PLOT_BOTTOM) / 2;
const TOP_CY = (PAD_T + MID_Y) / 2;
const BOT_CY = (MID_Y + PLOT_BOTTOM) / 2;
const USABLE_HALF = (MID_Y - PAD_T) / 2 - R - 6;

const xScale = scaleLinear(0, CAP, PAD_L, PLOT_RIGHT);
const TICKS = [0, 15, 30, 45];

const QUAD_FILL: Record<QuadKind, string> = {
  slip: STATUS.danger, // sai + nhanh → nhầm do vội
  gap: BRAND.orange, // sai + chậm → chưa hiểu
  fluent: STATUS.good, // đúng + nhanh → thành thạo
  effortful: SERIES.blue, // đúng + chậm → chắc nhưng chậm
};

/** Deterministic vertical jitter in [-1, 1) so điểm không đè lên nhau (no Math.random). */
function jitter(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

export function SlipGapScatter({ data }: { data: SlipGap }) {
  const xMed = xScale(clamp(data.medianLatencyS, 0, CAP));
  const medS = Math.round(clamp(data.medianLatencyS, 0, CAP));
  const medLabelX = clamp(xMed, PAD_L + 74, PLOT_RIGHT - 74);

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Biểu đồ phân loại câu trả lời theo thời gian và đúng/sai"
          className="block h-auto w-full"
          style={{ minWidth: 560 }}
        >
          {/* mốc thời gian dọc — nền mờ */}
          {TICKS.map((t) => (
            <line key={`g${t}`} x1={xScale(t)} y1={PAD_T} x2={xScale(t)} y2={PLOT_BOTTOM} stroke={GRID} strokeWidth={1} />
          ))}

          {/* vạch ngăn giữa "làm đúng" và "làm sai" */}
          <line x1={PAD_L} y1={MID_Y} x2={PLOT_RIGHT} y2={MID_Y} stroke={AXIS} strokeWidth={1} />

          {/* nhãn hai băng bên trái */}
          <text x={PAD_L - 12} y={TOP_CY + 4} textAnchor="end" fontSize={11} fontWeight={600} fill={INK.secondary}>
            Làm đúng
          </text>
          <text x={PAD_L - 12} y={BOT_CY + 4} textAnchor="end" fontSize={11} fontWeight={600} fill={INK.secondary}>
            Làm sai
          </text>

          {/* nhãn bốn góc — chữ nhạt, đọc nhanh */}
          <text x={PAD_L + 8} y={PAD_T + 15} textAnchor="start" fontSize={11} fill={INK.quaternary}>
            Thành thạo
          </text>
          <text x={PLOT_RIGHT - 8} y={PAD_T + 15} textAnchor="end" fontSize={11} fill={INK.quaternary}>
            Chắc nhưng chậm
          </text>
          <text x={PAD_L + 8} y={PLOT_BOTTOM - 9} textAnchor="start" fontSize={11} fill={INK.quaternary}>
            Nhầm do vội
          </text>
          <text x={PLOT_RIGHT - 8} y={PLOT_BOTTOM - 9} textAnchor="end" fontSize={11} fill={INK.quaternary}>
            Chưa hiểu
          </text>

          {/* đường trung vị thời gian trả lời */}
          <line x1={xMed} y1={PAD_T} x2={xMed} y2={PLOT_BOTTOM} stroke={INK.quaternary} strokeWidth={1} strokeDasharray="4 4">
            <title>{`Trung vị thời gian trả lời: ${medS} giây`}</title>
          </line>
          <text x={medLabelX} y={PAD_T - 11} textAnchor="middle" fontSize={11} fill={INK.quaternary}>
            {`nhanh ⟵  ${medS}s  ⟶ chậm`}
          </text>

          {/* trục thời gian (một trục duy nhất) */}
          <line x1={PAD_L} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} stroke={AXIS} strokeWidth={1} />
          {TICKS.map((t) => (
            <text key={`t${t}`} x={xScale(t)} y={PLOT_BOTTOM + 16} textAnchor="middle" fontSize={10} fill={INK.quaternary} className="tabular-nums">
              {t === CAP ? '45+' : String(t)}
            </text>
          ))}
          <text x={(PAD_L + PLOT_RIGHT) / 2} y={H - 8} textAnchor="middle" fontSize={10} fill={INK.quaternary}>
            Thời gian trả lời (giây)
          </text>

          {/* từng câu trả lời */}
          {data.points.map((p, i) => {
            const cx = xScale(clamp(p.latencyS, 0, CAP));
            const cy = (p.correct ? TOP_CY : BOT_CY) + jitter(i) * USABLE_HALF;
            return (
              <circle key={i} cx={cx} cy={cy} r={R} fill={QUAD_FILL[p.quad]} stroke="#FFFFFF" strokeWidth={1} opacity={0.9}>
                <title>{`${p.conceptLabel} · ${Math.round(p.latencyS)}s · ${p.correct ? 'đúng' : 'sai'}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      {/* hai nhóm cần lưu ý */}
      <div className="flex flex-wrap items-center gap-xs">
        <span className="text-xs font-medium text-tertiary">Cần ưu tiên xem lại:</span>
        <span className="inline-flex items-center gap-xs rounded-pill border border-secondary bg-secondary px-md py-xxs text-xs font-semibold text-secondary">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS.danger }} aria-hidden />
          <span>Nhầm do vội:</span>
          <span className="tabular-nums">{data.counts.slip}</span>
        </span>
        <span className="inline-flex items-center gap-xs rounded-pill border border-secondary bg-secondary px-md py-xxs text-xs font-semibold text-secondary">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: BRAND.orange }} aria-hidden />
          <span>Chưa hiểu:</span>
          <span className="tabular-nums">{data.counts.gap}</span>
        </span>
      </div>
    </div>
  );
}
