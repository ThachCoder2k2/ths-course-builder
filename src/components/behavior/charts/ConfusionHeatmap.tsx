import { useState } from 'react';
import { cn } from '../../../lib/cn';
import { sequential, INK, BRAND } from '../../analytics/palette';
import { clock } from '../../../behavior/format';
import type { ConfusionMap } from '../../../behavior/types';

const EMPTY = '#F2F4F7';
const fillFor = (t: number) => (t <= 0 ? EMPTY : sequential(0.18 + 0.82 * t));

/**
 * Confusion heatmap — the flagship. X = video time (bins), Y = a few behaviour
 * lanes (rewind / pause / slow down / hint). A darker cell = more people got
 * stuck there. Hot columns are the exact seconds to fix. Click a column to jump.
 */
export function ConfusionHeatmap({ map, onSeek, activeBin }: { map: ConfusionMap; onSeek?: (bin: number) => void; activeBin?: number | null }) {
  const [hover, setHover] = useState<{ lane: number; bin: number } | null>(null);
  const n = map.bins.length;
  const CW = 16;
  const GAP = 2;
  const LANE_H = 26;
  const LABEL_W = 92;
  const gridW = n * (CW + GAP);
  const W = LABEL_W + gridW + 12;
  const topStrip = 16;
  const H = topStrip + 10 + map.lanes.length * (LANE_H + GAP) + 22;
  const colSum = map.bins.map((_, b) => map.cells.reduce((s, row) => s + row[b], 0) / map.lanes.length);

  const tickIdx = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1];

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bản đồ chỗ vấp trong video ${map.videoTitle}`} className="block h-auto w-full" style={{ minWidth: Math.min(680, W) }}>
          {/* column-heat strip on top — where confusion piles up */}
          {map.bins.map((_, b) => (
            <rect key={`c${b}`} x={LABEL_W + b * (CW + GAP)} y={0} width={CW} height={topStrip - 3} rx={2} fill={fillFor(colSum[b])} opacity={0.9} />
          ))}
          {/* lane rows */}
          {map.lanes.map((lane, li) => {
            const y = topStrip + 10 + li * (LANE_H + GAP);
            return (
              <g key={lane.key}>
                <text x={LABEL_W - 8} y={y + LANE_H / 2 + 4} textAnchor="end" fontSize={11} fontWeight={600} fill={INK.secondary}>
                  {lane.label}
                </text>
                {map.bins.map((bin, b) => {
                  const v = map.cells[li][b];
                  const on = hover && hover.lane === li && hover.bin === b;
                  const activ = activeBin === b;
                  return (
                    <rect
                      key={b}
                      x={LABEL_W + b * (CW + GAP)}
                      y={y}
                      width={CW}
                      height={LANE_H}
                      rx={3}
                      fill={fillFor(v)}
                      stroke={on ? BRAND.blue : activ ? BRAND.navy : 'transparent'}
                      strokeWidth={on || activ ? 1.5 : 0}
                      className={onSeek ? 'cursor-pointer' : undefined}
                      onMouseEnter={() => setHover({ lane: li, bin: b })}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => onSeek?.(b)}
                    >
                      <title>{`${lane.label} · ${clock(bin.startS)}–${clock(bin.endS)}`}</title>
                    </rect>
                  );
                })}
              </g>
            );
          })}
          {/* time axis */}
          {tickIdx.map((b) => (
            <text key={b} x={LABEL_W + b * (CW + GAP) + CW / 2} y={H - 6} textAnchor="middle" fontSize={10} fill={INK.quaternary}>
              {clock(map.bins[b].startS)}
            </text>
          ))}
        </svg>
      </div>

      {/* hotspots — the seconds worth fixing */}
      {map.hotspots.length > 0 ? (
        <div className="flex flex-wrap items-center gap-xs">
          <span className="text-xs font-medium text-tertiary">Chỗ vấp nhiều nhất:</span>
          {map.hotspots.map((h) => (
            <button
              key={h.binIndex}
              type="button"
              onClick={() => onSeek?.(h.binIndex)}
              className={cn(
                'inline-flex items-center gap-xs rounded-pill border px-md py-xxs text-xs font-semibold transition',
                activeBin === h.binIndex ? 'border-brand bg-brand-50 text-brand-secondary' : 'border-secondary bg-secondary text-secondary hover:border-brand-alt',
              )}
            >
              <span className="tabular-nums">{clock(h.timeS)}</span>
              <span className="font-normal text-tertiary">· {h.reason}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-xs text-xs text-quaternary">
        <span>Ít vấp</span>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <span key={t} className="h-3 w-3 rounded-[3px]" style={{ background: fillFor(t) }} />
        ))}
        <span>Vấp nhiều</span>
      </div>
    </div>
  );
}
