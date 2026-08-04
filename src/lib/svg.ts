/**
 * Tiny hand-rolled SVG geometry helpers for the learner-analytics charts.
 * No chart library — everything is drawn from these primitives so the visuals
 * sit exactly on the Untitled UI token system (see components/analytics/palette).
 */

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export interface Pt {
  x: number;
  y: number;
}

/** Maps a value from a data domain to a pixel range. */
export function scaleLinear(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
  const dd = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / dd) * (r1 - r0);
}

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Point on a circle. 0deg = 3 o'clock, angles increase clockwise (SVG y-down). */
export function polar(cx: number, cy: number, r: number, deg: number): Pt {
  return { x: cx + r * Math.cos(rad(deg)), y: cy + r * Math.sin(rad(deg)) };
}

/** SVG arc stroke path between two angles (degrees). */
export function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`;
}

export function linePath(pts: Pt[]): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'} ${round(p.x)} ${round(p.y)}`).join(' ');
}

/** Catmull-Rom → cubic-bezier smoothing for pleasant trend lines. */
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 3) return linePath(pts);
  let d = `M ${round(pts[0].x)} ${round(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2.x)} ${round(p2.y)}`;
  }
  return d;
}

export function areaPath(pts: Pt[], baseY: number, smooth = true): string {
  if (pts.length === 0) return '';
  const top = smooth ? smoothPath(pts) : linePath(pts);
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${top} L ${round(last.x)} ${round(baseY)} L ${round(first.x)} ${round(baseY)} Z`;
}

/** Rounds a raw max up to a friendly axis bound. */
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const n = v / base;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * base;
}

export function ticks(max: number, count = 4): number[] {
  return range(count + 1).map((i) => (max / count) * i);
}

export const round = (n: number) => Math.round(n * 100) / 100;

/** SVG points attr for a polygon. */
export function polygonPoints(pts: Pt[]): string {
  return pts.map((p) => `${round(p.x)},${round(p.y)}`).join(' ');
}
