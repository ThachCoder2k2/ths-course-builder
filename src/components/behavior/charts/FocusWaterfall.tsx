import { scaleLinear } from '../../../lib/svg';
import { SERIES, STATUS, INK, AXIS } from '../../analytics/palette';
import { minutesLabel, pct } from '../../../behavior/format';
import type { FocusBreakdown } from '../../../behavior/types';

const W = 620;
const LABEL_W = 132; // left column for step names
const PAD_R = 84; // right room for the value at the end of each bar
const PAD_T = 12;
const ROW = 32;
const BAR_H = 18;
const PLOT_X0 = LABEL_W;
const PLOT_X1 = W - PAD_R;

/** One drawn row: where the bar sits on the minute axis and how to colour it. */
interface Row {
  label: string;
  kind: 'total' | 'loss' | 'result';
  minutes: number; // abs(delta) — what the value text shows
  x0: number; // running total at the bar's left edge (minutes)
  x1: number; // running total at the bar's right edge (minutes)
  fill: string;
}

/**
 * Horizontal waterfall: how "thời gian mở bài" drains — qua ngồi im rồi rời tab —
 * xuống còn "phút tập trung thật". Bar mở đầu (xám) và bar kết quả (xanh) chạy từ mốc 0;
 * hai bar mất mát trôi nổi ngay tại mốc running total, nối nhau bằng vạch mảnh.
 */
export function FocusWaterfall({ data }: { data: FocusBreakdown }) {
  if (data.steps.length === 0 || data.openMinutes <= 0) return null;

  const x = scaleLinear(0, data.openMinutes, PLOT_X0, PLOT_X1);

  // Walk the steps, tracking the running total so each 'loss' floats where it happens.
  let running = 0;
  let lossSeen = 0;
  const rows: Row[] = data.steps.map((s) => {
    const minutes = Math.abs(s.delta);
    if (s.kind === 'total') {
      running = minutes;
      return { label: s.label, kind: s.kind, minutes, x0: 0, x1: minutes, fill: INK.quaternary };
    }
    if (s.kind === 'loss') {
      const right = running;
      running = running + s.delta; // delta is negative → running shrinks
      // First loss = "Ngồi im" (cam ấm), second = "Rời tab" (tím) — hai màu bình lặng, tách bạch.
      const fill = lossSeen === 0 ? STATUS.warning : SERIES.violet;
      lossSeen += 1;
      return { label: s.label, kind: s.kind, minutes, x0: running, x1: right, fill };
    }
    return { label: s.label, kind: s.kind, minutes, x0: 0, x1: minutes, fill: STATUS.good };
  });

  const H = PAD_T + rows.length * ROW + 8;
  const barY = (i: number) => PAD_T + i * ROW + (ROW - BAR_H) / 2;
  const rowMid = (i: number) => PAD_T + i * ROW + ROW / 2;
  // A waterfall connector sits at the running total handed off to the next step.
  const handoffX = (r: Row) => (r.kind === 'total' ? r.x1 : r.x0);

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Phân rã thời gian mở bài thành số phút tập trung thật"
          className="block h-auto w-full"
          style={{ minWidth: 540 }}
        >
          {/* single axis: the 0 origin every bar is measured from */}
          <line x1={PLOT_X0} y1={PAD_T} x2={PLOT_X0} y2={PAD_T + rows.length * ROW} stroke={AXIS} strokeWidth={1} />

          {/* thin cascade connectors between consecutive rows */}
          {rows.slice(0, -1).map((r, i) => {
            const cx = x(handoffX(r));
            return (
              <line
                key={`c${i}`}
                x1={cx}
                y1={barY(i) + BAR_H}
                x2={cx}
                y2={barY(i + 1)}
                stroke={AXIS}
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            );
          })}

          {rows.map((r, i) => {
            const bx = x(r.x0);
            const bw = Math.max(2, x(r.x1) - x(r.x0));
            const endX = x(r.x1);
            const isEmphasis = r.kind === 'total' || r.kind === 'result';
            const valueText = r.kind === 'loss' ? `−${minutesLabel(r.minutes)}` : minutesLabel(r.minutes);
            return (
              <g key={i}>
                {/* step name at the left */}
                <text
                  x={LABEL_W - 12}
                  y={rowMid(i)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={isEmphasis ? 600 : 500}
                  fill={isEmphasis ? INK.primary : INK.tertiary}
                >
                  {r.label}
                </text>

                {/* the bar */}
                <rect x={bx} y={barY(i)} width={bw} height={BAR_H} rx={3} fill={r.fill}>
                  <title>{titleFor(r)}</title>
                </rect>

                {/* value at the end of the bar */}
                <text
                  x={endX + 8}
                  y={rowMid(i)}
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={r.kind === 'result' ? 600 : 500}
                  fill={r.kind === 'result' ? STATUS.good : INK.secondary}
                  className="tabular-nums"
                >
                  {valueText}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-sm text-secondary">
        Tập trung thật <span className="font-semibold tabular-nums text-primary">{pct(data.focusRate)}</span> thời gian mở bài.
      </p>
    </div>
  );
}

/** Plain-Vietnamese hover text describing each segment of the waterfall. */
function titleFor(r: Row): string {
  const amount = minutesLabel(r.minutes);
  if (r.kind === 'total') return `Bạn mở bài tổng cộng ${amount}.`;
  if (r.kind === 'result') return `Còn lại ${amount} tập trung thật.`;
  // loss
  if (r.label.includes('tab') || r.label.toLowerCase().includes('rời')) {
    return `Rời tab ${amount} — chuyển sang cửa sổ khác.`;
  }
  return `Ngồi im ${amount} — màn hình mở nhưng không thao tác.`;
}
