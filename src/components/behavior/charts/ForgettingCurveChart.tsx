import { scaleLinear, clamp, smoothPath } from '../../../lib/svg';
import { cat, INK, GRID, AXIS } from '../../analytics/palette';
import { pct } from '../../../behavior/format';
import type { Forgetting, ForgettingLine } from '../../../behavior/types';

const W = 640;
const H = 240;
const PAD = { l: 34, r: 96, t: 14, b: 26 };
const PLOT_L = PAD.l;
const PLOT_R = W - PAD.r;
const PLOT_T = PAD.t;
const PLOT_B = H - PAD.b;

const X_MAX = 14; // forecast horizon: 14 ngày tới
const THRESHOLD = 0.5; // ngưỡng nên ôn lại
const MAX_LINES = 4;
const LABEL_GAP = 24; // chống chồng chữ cho nhãn hai dòng bên phải
const LABEL_MAX_CHARS = 14;

function truncate(label: string): string {
  return label.length > LABEL_MAX_CHARS ? `${label.slice(0, LABEL_MAX_CHARS - 1)}…` : label;
}

function dueMessage(dueInDays: number): string {
  const d = Math.round(dueInDays);
  if (d <= 0) return 'nên ôn ngay';
  return `nên ôn sau ${d} ngày`;
}

interface DrawnLine {
  key: string;
  color: string;
  concept: string;
  courseTitle: string;
  retentionNow: number;
  dueInDays: number;
  path: string;
  endX: number;
  endY: number;
}

/**
 * Đường cong quên riêng cho từng người học. Mỗi đường là một khái niệm: mức còn
 * nhớ (%) tụt dần theo ngày. Vạch ngang nét đứt là ngưỡng 50% — chạm tới đó thì
 * nên ôn lại; vạch dọc "hôm nay" chia phần đã học với phần dự đoán sắp tới. Chấm
 * rỗng đánh dấu đúng lúc mỗi khái niệm rơi xuống ngưỡng.
 */
export function ForgettingCurveChart({ data }: { data: Forgetting }) {
  const source = data.dueSoon.length > 0 ? data.dueSoon : data.lines;
  const lines = source.slice(0, MAX_LINES);
  if (lines.length === 0) return null;

  const allDays = lines.flatMap((l) => l.points.map((p) => p.day));
  const minDay = allDays.length > 0 ? Math.min(...allDays) : 0;
  const xMin = Math.min(0, minDay); // luôn để "hôm nay" (ngày 0) nằm trong khung

  const x = scaleLinear(xMin, X_MAX, PLOT_L, PLOT_R);
  const y = scaleLinear(0, 1, PLOT_B, PLOT_T);

  const drawn: DrawnLine[] = lines
    .map((line: ForgettingLine, i) => {
      const inRange = line.points
        .filter((p) => p.day >= xMin && p.day <= X_MAX)
        .sort((a, b) => a.day - b.day);
      if (inRange.length < 2) return null;
      const pts = inRange.map((p) => ({ x: x(p.day), y: y(clamp(p.retention, 0, 1)) }));
      const last = pts[pts.length - 1];
      return {
        key: `${line.conceptLabel}-${i}`,
        color: cat(i),
        concept: line.conceptLabel,
        courseTitle: line.courseTitle,
        retentionNow: line.retentionNow,
        dueInDays: line.dueInDays,
        path: smoothPath(pts),
        endX: last.x,
        endY: last.y,
      };
    })
    .filter((d): d is DrawnLine => d !== null);

  if (drawn.length === 0) return null;

  // Vị trí nhãn bên phải, đẩy nhau ra để không chồng lên nhau.
  const labels = drawn
    .map((d) => ({ ...d, ly: clamp(d.endY, PLOT_T + 8, PLOT_B - 8) }))
    .sort((a, b) => a.ly - b.ly);
  for (let k = 1; k < labels.length; k++) {
    if (labels[k].ly - labels[k - 1].ly < LABEL_GAP) {
      labels[k].ly = labels[k - 1].ly + LABEL_GAP;
    }
  }
  const overflow = labels.length > 0 ? labels[labels.length - 1].ly - (PLOT_B - 8) : 0;
  if (overflow > 0) labels.forEach((l) => (l.ly -= overflow));

  const yTicks: { t: number; label: string }[] = [
    { t: 0, label: '0%' },
    { t: 0.5, label: '50%' },
    { t: 1, label: '100%' },
  ];
  const todayX = x(0);
  const thresholdY = y(THRESHOLD);

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Đường cong quên: mức còn nhớ của từng khái niệm giảm dần theo ngày"
          className="block h-auto w-full"
          style={{ minWidth: 520 }}
        >
          {/* Vùng dự đoán (từ hôm nay trở đi) */}
          <rect x={todayX} y={PLOT_T} width={PLOT_R - todayX} height={PLOT_B - PLOT_T} fill={GRID} opacity={0.4} />
          <text x={todayX + 4} y={PLOT_T + 11} fontSize={10} fill={INK.quinary}>
            dự đoán
          </text>

          {/* Lưới ngang 0% và 100% */}
          {yTicks
            .filter((tk) => tk.t !== THRESHOLD)
            .map((tk) => (
              <line key={`g${tk.t}`} x1={PLOT_L} y1={y(tk.t)} x2={PLOT_R} y2={y(tk.t)} stroke={GRID} strokeWidth={1} />
            ))}

          {/* Ngưỡng nên ôn 50% (nét đứt) */}
          <line
            x1={PLOT_L}
            y1={thresholdY}
            x2={PLOT_R}
            y2={thresholdY}
            stroke={AXIS}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text x={PLOT_L + 3} y={thresholdY - 5} fontSize={10} fill={INK.quaternary}>
            ngưỡng nên ôn
          </text>

          {/* Vạch "hôm nay" tại ngày 0 */}
          <line x1={todayX} y1={PLOT_T} x2={todayX} y2={PLOT_B} stroke={AXIS} strokeWidth={1} />
          <text x={todayX} y={PLOT_B + 15} fontSize={10} fill={INK.quaternary} textAnchor="middle">
            hôm nay
          </text>

          {/* Nhãn trục tung */}
          {yTicks.map((tk) => (
            <text
              key={`t${tk.t}`}
              x={PLOT_L - 6}
              y={y(tk.t) + 3}
              fontSize={10}
              fill={INK.quaternary}
              textAnchor="end"
              className="tabular-nums"
            >
              {tk.label}
            </text>
          ))}

          {/* Các đường cong quên */}
          {drawn.map((d) => (
            <path key={d.key} d={d.path} fill="none" stroke={d.color} strokeWidth={2} strokeLinecap="round" />
          ))}

          {/* Điểm nên ôn: nơi đường chạm ngưỡng 50% */}
          {drawn.map((d) => {
            if (d.dueInDays < xMin || d.dueInDays > X_MAX) return null;
            const cx = x(clamp(d.dueInDays, xMin, X_MAX));
            return (
              <circle key={`due${d.key}`} cx={cx} cy={thresholdY} r={3.5} fill="#FFFFFF" stroke={d.color} strokeWidth={1.5}>
                <title>{`${d.concept} · ${dueMessage(d.dueInDays)}`}</title>
              </circle>
            );
          })}

          {/* Chấm cuối đường + đường dẫn tới nhãn */}
          {labels.map((d) => (
            <g key={`end${d.key}`}>
              <line x1={d.endX} y1={d.endY} x2={PLOT_R + 4} y2={d.ly} stroke={d.color} strokeWidth={1} opacity={0.45} />
              <circle cx={d.endX} cy={d.endY} r={2.5} fill={d.color}>
                <title>{`${d.concept} · ${d.courseTitle} · còn nhớ ${pct(d.retentionNow)} · ${dueMessage(d.dueInDays)}`}</title>
              </circle>
            </g>
          ))}

          {/* Nhãn trực tiếp bên phải (thay cho chú thích) */}
          {labels.map((d) => (
            <g key={`lbl${d.key}`}>
              <text x={PLOT_R + 8} y={d.ly} fontSize={11} fontWeight={600} fill={d.color}>
                {truncate(d.concept)}
              </text>
              <text x={PLOT_R + 8} y={d.ly + 12} fontSize={10} fill={INK.quaternary} className="tabular-nums">
                {`còn ${pct(d.retentionNow)}`}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="text-xs text-tertiary">
        Mỗi đường là mức còn nhớ của một khái niệm, giảm dần theo ngày. Chấm rỗng trên vạch nét đứt là lúc kiến thức rơi
        xuống ngưỡng 50% — nên ôn lại quanh mốc đó để nhớ lâu hơn.
      </p>
    </div>
  );
}
