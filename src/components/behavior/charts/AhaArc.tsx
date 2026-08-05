import { scaleLinear, smoothPath, areaPath, round } from '../../../lib/svg';
import { BRAND, INK, GRID, STATUS } from '../../analytics/palette';
import type { AhaMoment } from '../../../behavior/types';

/**
 * The "aha" arc — a tension line that climbs while the learner wrestles with a hard
 * bit (rewind, pause, hint), then drops sharply the moment it clicks. Anchored on
 * real events so it reads as true, not decorative.
 */
export function AhaArc({ moment }: { moment: AhaMoment }) {
  const pts = moment.points;
  if (pts.length < 2) return null;
  const W = 640;
  const H = 200;
  const P = { l: 16, r: 16, t: 22, b: 26 };
  const t0 = pts[0].t;
  const t1 = pts[pts.length - 1].t;
  const x = scaleLinear(t0, t1, P.l, W - P.r);
  const y = scaleLinear(0, 1, H - P.b, P.t);
  const xy = pts.map((p) => ({ x: x(p.t), y: y(p.tension) }));
  const aha = xy[moment.ahaIndex] ?? xy[xy.length - 2];
  const peak = pts.reduce((best, p, i) => (p.tension > pts[best].tension ? i : best), 0);

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diễn biến lúc bạn hiểu ra một chỗ khó" className="block h-auto w-full" style={{ minWidth: 520 }}>
          {/* baseline */}
          <line x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} stroke={GRID} strokeWidth={1} />
          <path d={areaPath(xy, H - P.b, true)} fill={BRAND.orange} opacity={0.1} />
          <path d={smoothPath(xy)} fill="none" stroke={BRAND.orange} strokeWidth={2.5} strokeLinecap="round" />
          {/* điểm khó nhất */}
          <circle cx={round(xy[peak].x)} cy={round(xy[peak].y)} r={3} fill={STATUS.warning} />
          <text x={round(xy[peak].x)} y={round(xy[peak].y) - 8} textAnchor="middle" fontSize={10} fill={INK.tertiary}>
            khó nhất
          </text>
          {/* điểm hiểu ra */}
          <line x1={round(aha.x)} y1={P.t - 6} x2={round(aha.x)} y2={H - P.b} stroke={BRAND.navy} strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={round(aha.x)} cy={round(aha.y)} r={5} fill={BRAND.navy} stroke="#fff" strokeWidth={1.5} />
          <text x={round(aha.x)} y={P.t - 10} textAnchor="middle" fontSize={11} fontWeight={700} fill={BRAND.navy}>
            Hiểu ra
          </text>
          {/* axis hints */}
          <text x={P.l} y={H - 8} fontSize={10} fill={INK.quaternary}>
            lúc đầu: còn lúng túng
          </text>
          <text x={W - P.r} y={H - 8} textAnchor="end" fontSize={10} fill={INK.quaternary}>
            sau khi hiểu: nhẹ nhõm
          </text>
        </svg>
      </div>
      <p className="rounded-lg border-l-2 border-brand-500 bg-accent-blue px-lg py-md text-sm leading-relaxed text-secondary">{moment.caption}</p>
    </div>
  );
}
