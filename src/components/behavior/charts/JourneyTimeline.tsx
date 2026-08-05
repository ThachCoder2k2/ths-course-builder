import { useState } from 'react';
import { SERIES, INK, GRID, STATUS, BRAND } from '../../analytics/palette';
import { dayLabel, minutesLabel } from '../../../behavior/format';
import type { JourneyDay, JourneySession } from '../../../behavior/types';

const MARKER: Record<string, { color: string; label: string }> = {
  aha: { color: BRAND.orange, label: 'Hiểu ra' },
  struggle: { color: STATUS.warning, label: 'Vấp' },
  abandon: { color: STATUS.danger, label: 'Bỏ dở' },
};

/**
 * The journey spine — one column per day across the whole span. Bar height = real
 * focus minutes (video + practice), dots above = the moments that matter. Click a
 * day to load it into the replay + confusion views below.
 */
export function JourneyTimeline({ days, onPick, selectedId }: { days: JourneyDay[]; onPick?: (s: JourneySession) => void; selectedId?: string | null }) {
  const [hover, setHover] = useState<JourneySession | null>(null);
  if (days.length === 0) return null;
  const first = days[0].date;
  const last = days[days.length - 1].date;
  const spanDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / 86400000));
  const COL = 15;
  const GAPX = 3;
  const nCols = spanDays + 1;
  const gridW = nCols * (COL + GAPX);
  const PAD_L = 8;
  const PAD_T = 20;
  const BAR_H = 104;
  const W = PAD_L + gridW + 8;
  const H = PAD_T + BAR_H + 26;
  const maxMin = Math.max(30, ...days.map((d) => d.minutes));

  const colOf = (d: Date) => Math.round((d.getTime() - first.getTime()) / 86400000);
  const bySession = days.flatMap((d) => d.sessions.map((s) => ({ day: d, s })));
  const shown = hover ?? bySession.find((x) => x.s.id === selectedId)?.s ?? null;

  // week separators (every 7 cols)
  const weekLines = Array.from({ length: Math.ceil(nCols / 7) }, (_, i) => i * 7);

  return (
    <div className="flex flex-col gap-md">
      <div className="-mx-md overflow-x-auto px-md">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dòng thời gian học theo ngày" className="block h-auto w-full" style={{ minWidth: Math.min(720, W) }}>
          {weekLines.map((c) => (
            <line key={c} x1={PAD_L + c * (COL + GAPX) - GAPX / 2} y1={PAD_T} x2={PAD_L + c * (COL + GAPX) - GAPX / 2} y2={PAD_T + BAR_H} stroke={GRID} strokeWidth={1} />
          ))}
          <line x1={PAD_L} y1={PAD_T + BAR_H} x2={PAD_L + gridW} y2={PAD_T + BAR_H} stroke={GRID} strokeWidth={1} />

          {days.map((d) => {
            const col = colOf(d.date);
            const x = PAD_L + col * (COL + GAPX);
            const lanes = d.sessions.reduce(
              (a, s) => ({ video: a.video + s.lanes.video, quiz: a.quiz + s.lanes.quiz, reading: a.reading + s.lanes.reading }),
              { video: 0, quiz: 0, reading: 0 },
            );
            const total = lanes.video + lanes.quiz + lanes.reading || 1;
            const h = (Math.min(d.minutes, maxMin) / maxMin) * BAR_H;
            const vh = (lanes.video / total) * h;
            const qh = (lanes.quiz / total) * h;
            const yBase = PAD_T + BAR_H;
            // one bar per day; hover/click uses the day's longest-focus session
            const rep = d.sessions.reduce((a, b) => (b.focusMinutes > a.focusMinutes ? b : a), d.sessions[0]);
            const isSel = d.sessions.some((s) => s.id === selectedId) || (!!hover && d.sessions.some((s) => s.id === hover.id));
            const seen = new Set<string>();
            const uniqMarkers = d.sessions
              .flatMap((s) => s.markers)
              .filter((m) => MARKER[m.kind] && !seen.has(m.kind) && (seen.add(m.kind), true))
              .slice(0, 2);
            return (
              <g key={d.date.toISOString()} className={onPick ? 'cursor-pointer' : undefined} onMouseEnter={() => setHover(rep)} onMouseLeave={() => setHover(null)} onClick={() => onPick?.(rep)}>
                <rect x={x} y={yBase - vh} width={COL} height={Math.max(2, vh)} rx={2} fill={SERIES.blue} opacity={isSel ? 1 : 0.85} />
                {qh > 0.5 ? <rect x={x} y={yBase - vh - qh} width={COL} height={qh} rx={2} fill={SERIES.violet} opacity={isSel ? 1 : 0.85} /> : null}
                {isSel ? <rect x={x - 1.5} y={yBase - h - 4} width={COL + 3} height={h + 6} rx={3} fill="none" stroke={BRAND.navy} strokeWidth={1.5} /> : null}
                {uniqMarkers.map((m, mi) => (
                  <circle key={mi} cx={x + COL / 2} cy={PAD_T - 6 - mi * 7} r={3.2} fill={MARKER[m.kind].color} stroke="#fff" strokeWidth={1}>
                    <title>{`${MARKER[m.kind].label} · ${dayLabel(d.date)}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
          {/* week date labels */}
          {weekLines.map((c) => {
            const d = new Date(first.getTime() + c * 86400000);
            return (
              <text key={`l${c}`} x={PAD_L + c * (COL + GAPX)} y={H - 8} fontSize={10} fill={INK.quaternary}>
                {d.getDate()}/{d.getMonth() + 1}
              </text>
            );
          })}
        </svg>
      </div>

      {/* read-out for the hovered / selected day */}
      <div className="flex min-h-[40px] flex-wrap items-center gap-md rounded-lg border border-secondary bg-secondary/60 px-lg py-md text-sm">
        {shown ? (
          <>
            <span className="font-semibold text-primary">{dayLabel(shown.date)}</span>
            <span className="text-tertiary">·</span>
            <span className="text-secondary">{shown.courseTitle}</span>
            <span className="text-tertiary">·</span>
            <span className="tabular-nums text-secondary">{minutesLabel(shown.focusMinutes)} tập trung</span>
            {shown.markers
              .filter((m) => MARKER[m.kind])
              .map((m, i) => (
                <span key={i} className="inline-flex items-center gap-xxs rounded-pill px-md py-xxs text-xs font-semibold" style={{ background: `${MARKER[m.kind].color}1A`, color: MARKER[m.kind].color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: MARKER[m.kind].color }} />
                  {MARKER[m.kind].label}
                </span>
              ))}
          </>
        ) : (
          <span className="text-tertiary">Di chuột hoặc bấm vào một ngày để xem chi tiết buổi học đó.</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-lg text-xs text-tertiary">
        <Legend color={SERIES.blue} label="Xem video" />
        <Legend color={SERIES.violet} label="Làm bài" />
        <span className="mx-xs h-3 w-px bg-gray-200" />
        {Object.values(MARKER).map((m) => (
          <Legend key={m.label} color={m.color} label={m.label} dot />
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label, dot }: { color: string; label: string; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-xs">
      <span className={dot ? 'h-2.5 w-2.5 rounded-full' : 'h-2.5 w-3.5 rounded-[2px]'} style={{ background: color }} />
      {label}
    </span>
  );
}
