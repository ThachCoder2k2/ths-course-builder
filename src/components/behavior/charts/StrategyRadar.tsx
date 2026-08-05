import { useState } from 'react';
import { clamp, polar, polygonPoints, round } from '../../../lib/svg';
import { BRAND, INK, GRID, AXIS } from '../../analytics/palette';
import { pct } from '../../../behavior/format';
import type { RadarAxis } from '../../../behavior/types';

/**
 * Strategy radar — the learner's study "fingerprint" across a few habits
 * (regularity, focus, review, persistence…). Each axis runs 0..1; the filled
 * shape shows how balanced the current strategy is. Round, even shape = steady
 * across the board; a lopsided shape = leaning hard on one or two habits.
 * Plot only — the surrounding tile supplies the strategy name and the blurb.
 */

const VW = 360; // wider than tall so the left/right axis labels never clip
const VH = 300;
const CX = VW / 2;
const CY = VH / 2;
const R = 92; // radius of the outermost (100%) ring
const LABEL_GAP = 16; // how far axis labels sit outside the ring
const RINGS = [0.25, 0.5, 0.75, 1] as const;

export function StrategyRadar({ axes }: { axes: RadarAxis[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = axes.length;
  if (n < 3) return null;

  // Geometry for every axis: evenly spaced around the circle, first one at top.
  const spokes = axes.map((axis, i) => {
    const deg = -90 + (360 / n) * i;
    const r = (deg * Math.PI) / 180;
    const cos = Math.cos(r);
    const sin = Math.sin(r);
    const v = clamp(axis.value, 0, 1);
    return {
      axis,
      deg,
      cos,
      sin,
      v,
      value: polar(CX, CY, R * v, deg),
      label: polar(CX, CY, R + LABEL_GAP, deg),
    };
  });

  const valuePoly = polygonPoints(spokes.map((s) => s.value));

  return (
    <div className="flex flex-col gap-lg">
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Chân dung cách học của bạn theo ${n} thói quen`} className="mx-auto block h-auto w-full max-w-[420px]">
        {/* concentric rings — 25 / 50 / 75 / 100% guides */}
        {RINGS.map((level) => (
          <polygon
            key={level}
            points={polygonPoints(spokes.map((s) => polar(CX, CY, R * level, s.deg)))}
            fill="none"
            stroke={GRID}
            strokeWidth={1}
          />
        ))}

        {/* spokes out to each axis vertex */}
        {spokes.map((s, i) => (
          <line key={`spoke-${i}`} x1={CX} y1={CY} x2={round(polar(CX, CY, R, s.deg).x)} y2={round(polar(CX, CY, R, s.deg).y)} stroke={AXIS} strokeWidth={1} />
        ))}

        {/* the learner's shape */}
        <polygon points={valuePoly} fill={BRAND.blue} fillOpacity={0.15} stroke={BRAND.blue} strokeWidth={2} strokeLinejoin="round" />

        {/* vertex dots + hover read-out */}
        {spokes.map((s, i) => (
          <circle
            key={`dot-${i}`}
            cx={round(s.value.x)}
            cy={round(s.value.y)}
            r={hover === i ? 4.5 : 3}
            fill={BRAND.blue}
            stroke="#FFFFFF"
            strokeWidth={1}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <title>{`${s.axis.label}: ${pct(s.v)}`}</title>
          </circle>
        ))}

        {/* axis labels, anchored so they open away from the plot */}
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
              fontSize={11}
              fontWeight={hover === i ? 600 : 500}
              fill={INK.secondary}
            >
              {s.axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
