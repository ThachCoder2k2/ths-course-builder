import { scaleLinear } from '../../../lib/svg';
import { SERIES, BRAND, GRID, INK } from '../../analytics/palette';
import { clock } from '../../../behavior/format';
import type { CoverageKind, WatchCoverage } from '../../../behavior/types';

/** Plain-Vietnamese name for each kind of viewing. */
const KIND_LABEL: Record<CoverageKind, string> = {
  watched: 'Đã xem',
  rewatched: 'Xem lại',
  skimmed: 'Tua nhanh',
  skipped: 'Bỏ qua',
  unwatched: 'Chưa xem tới',
};

/**
 * Fill per kind. Darker navy = the part watched more than once; light gray =
 * the part that was skipped, so it barely reads as "watched" at all.
 */
const KIND_FILL: Record<CoverageKind, string> = {
  watched: SERIES.blue,
  rewatched: BRAND.navy,
  skimmed: SERIES.violet,
  skipped: GRID,
  unwatched: '#F2F4F7',
};

const KIND_ORDER: CoverageKind[] = ['watched', 'rewatched', 'skimmed', 'skipped', 'unwatched'];

const W = 600;
const BAR_H = 22;
const BAR_Y = 6;
const GAP = 2;
const TICK_Y = BAR_Y + BAR_H + 14;
const H = TICK_Y + 6;

/**
 * WatchCoverageBar — one video read as a single progress bar along its own time.
 * Each stretch of the bar is coloured by how the learner actually watched it:
 * xem thật, xem lại, tua nhanh, hay bỏ qua. Below sits a legend and a one-line
 * summary so the teacher can see at a glance how much of the video really landed.
 */
export function WatchCoverageBar({ data }: { data: WatchCoverage }) {
  const toX = scaleLinear(0, data.durationS, 0, W);

  return (
    <div className="flex flex-col gap-lg">
      <p className="text-sm font-medium text-secondary">{data.videoTitle}</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Mức độ xem video ${data.videoTitle}`}
        className="block h-auto w-full"
      >
        {/* faint track behind the segments, so any un-covered time still reads as a bar */}
        <rect x={0} y={BAR_Y} width={W} height={BAR_H} rx={4} fill="#F2F4F7" />

        {data.segments.map((seg, i) => {
          const x0 = toX(seg.startS);
          const x1 = toX(seg.endS);
          const isLast = i === data.segments.length - 1;
          const w = Math.max(0, x1 - x0 - (isLast ? 0 : GAP));
          return (
            <rect key={i} x={x0} y={BAR_Y} width={w} height={BAR_H} rx={3} fill={KIND_FILL[seg.kind]}>
              <title>{`${KIND_LABEL[seg.kind]} · ${clock(seg.startS)}–${clock(seg.endS)}`}</title>
            </rect>
          );
        })}

        {/* time ticks under the bar: start and full length */}
        <text x={0} y={TICK_Y} textAnchor="start" fontSize={10} fill={INK.quaternary} className="tabular-nums">
          {clock(0)}
        </text>
        <text x={W} y={TICK_Y} textAnchor="end" fontSize={10} fill={INK.quaternary} className="tabular-nums">
          {clock(data.durationS)}
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-md">
        {KIND_ORDER.map((kind) => (
          <span key={kind} className="inline-flex items-center gap-xs text-xs text-tertiary">
            <span className="h-3 w-3 rounded-[3px]" style={{ background: KIND_FILL[kind] }} />
            {KIND_LABEL[kind]}
          </span>
        ))}
      </div>

      <p className="text-sm text-tertiary tabular-nums">
        Đã xem thật {data.watchedPct}% bài · tua lại {data.rewatchedPct}% · bỏ qua {data.skippedPct}%
      </p>
    </div>
  );
}
