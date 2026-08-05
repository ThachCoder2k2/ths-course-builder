import { range } from '../../../lib/svg';
import { sequential, BRAND, INK } from '../../analytics/palette';
import { WEEKDAY_VI } from '../../../behavior/format';
import type { GoldenHours } from '../../../behavior/types';

/**
 * Golden-hours heatmap: 7 weekday rows (CN at top) × 24 hour columns.
 * Cell shade = focus minutes relative to the busiest cell (single-hue blue).
 * The peak hour is called out with a navy column outline + a navy header tick,
 * so identity never rests on colour alone.
 */

const CELL = 13;
const GAP = 2;
const PITCH = CELL + GAP;
const LEFT = 30; // room for weekday labels
const TOP = 6;
const ROWS = 7;
const HOURS = 24;
const EMPTY = '#F2F4F7';
const MIN_SHADE = 0.15; // any real activity stays visibly darker than "nghỉ"

const GRID_BOTTOM = TOP + (ROWS - 1) * PITCH + CELL;
const W = LEFT + HOURS * PITCH;
const H = GRID_BOTTOM + 22;

const BASE_TICKS = [0, 6, 12, 18, 23];

export function GoldenHoursHeatmap({ data }: { data: GoldenHours }) {
  const max = Math.max(1, data.max);

  // Lookup grid[weekday][hour] = focus minutes (0 where no data).
  const grid: number[][] = range(ROWS).map(() => range(HOURS).map(() => 0));
  for (const c of data.cells) {
    if (c.weekday >= 0 && c.weekday < ROWS && c.hour >= 0 && c.hour < HOURS) {
      grid[c.weekday][c.hour] = c.focus;
    }
  }

  const peakInRange = data.peakHour >= 0 && data.peakHour < HOURS;
  const tickHours = Array.from(new Set(peakInRange ? [...BASE_TICKS, data.peakHour] : BASE_TICKS)).sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Khung giờ vàng theo tuần. Bạn tập trung nhất vào lúc ${data.peakLabel}.`}
          className="block h-auto w-full min-w-[640px]"
        >
          {/* peak-hour column outline (all 7 rows) */}
          {peakInRange ? (
            <rect
              x={LEFT + data.peakHour * PITCH - 1.5}
              y={TOP - 1.5}
              width={CELL + 3}
              height={(ROWS - 1) * PITCH + CELL + 3}
              rx={3}
              fill="none"
              stroke={BRAND.navy}
              strokeWidth={1.5}
            />
          ) : null}

          {/* weekday row labels (CN..T7, top to bottom) */}
          {range(ROWS).map((wd) => (
            <text
              key={`wd-${wd}`}
              x={LEFT - 8}
              y={TOP + wd * PITCH + CELL / 2 + 3.5}
              textAnchor="end"
              fontSize={10}
              fill={INK.quaternary}
            >
              {WEEKDAY_VI[wd]}
            </text>
          ))}

          {/* cells */}
          {range(ROWS).map((wd) =>
            range(HOURS).map((h) => {
              const focus = grid[wd][h];
              const fill = focus > 0 ? sequential(Math.max(MIN_SHADE, focus / max)) : EMPTY;
              const title = focus > 0 ? `${WEEKDAY_VI[wd]} ${h}h · ${focus} phút` : `${WEEKDAY_VI[wd]} ${h}h · chưa học`;
              return (
                <rect
                  key={`c-${wd}-${h}`}
                  x={LEFT + h * PITCH}
                  y={TOP + wd * PITCH}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={fill}
                >
                  <title>{title}</title>
                </rect>
              );
            }),
          )}

          {/* single axis: hour ticks under the grid (peak hour in navy) */}
          {tickHours.map((h) => {
            const isPeak = peakInRange && h === data.peakHour;
            return (
              <text
                key={`t-${h}`}
                x={LEFT + h * PITCH + CELL / 2}
                y={GRID_BOTTOM + 13}
                textAnchor="middle"
                fontSize={10}
                fontWeight={isPeak ? 600 : 400}
                fill={isPeak ? BRAND.navy : INK.quaternary}
                className="tabular-nums"
              >
                {h}h
              </text>
            );
          })}
        </svg>
      </div>

      <p className="text-sm text-secondary">
        Bạn tập trung học tốt nhất vào lúc <span className="font-semibold text-primary">{data.peakLabel}</span>.
      </p>

      <div className="flex items-center justify-end gap-xs text-xs text-quaternary">
        <span>Ít</span>
        {[EMPTY, sequential(0.25), sequential(0.5), sequential(0.75), sequential(1)].map((bg, i) => (
          <span key={i} className="h-3 w-3 rounded-[3px]" style={{ background: bg }} />
        ))}
        <span>Nhiều</span>
      </div>
    </div>
  );
}
