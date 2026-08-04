import { areaPath, scaleLinear, smoothPath } from '../../../lib/svg';
import { BRAND } from '../palette';

/** Compact trend line for KPI cards. Decorative — the KPI number carries the meaning. */
export function Sparkline({
  data,
  width = 132,
  height = 36,
  color = BRAND.blue,
  fill = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const sx = scaleLinear(0, Math.max(1, data.length - 1), 2, width - 2);
  const sy = scaleLinear(min, max === min ? min + 1 : max, height - 4, 4);
  const pts = data.map((d, i) => ({ x: sx(i), y: sy(d) }));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true" className="overflow-visible">
      {fill ? <path d={areaPath(pts, height, true)} fill={color} opacity={0.1} /> : null}
      <path d={smoothPath(pts)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
