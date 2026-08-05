import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { scaleLinear } from '../../../lib/svg';
import { INK, STATUS, BRAND, SERIES } from '../../analytics/palette';
import { clock } from '../../../behavior/format';
import type { SessionReplay as Replay, StruggleState, EventTone } from '../../../behavior/types';

const STATE: Record<StruggleState, { color: string; label: string }> = {
  flow: { color: SERIES.blue, label: 'Trôi chảy' },
  productive: { color: STATUS.good, label: 'Khó nhưng gỡ được' },
  exploring: { color: STATUS.warning, label: 'Dò dẫm' },
  wheelspin: { color: STATUS.danger, label: 'Loay hoay chưa ra' },
  idle: { color: STATUS.neutral, label: 'Ngồi không' },
};
const TONE: Record<EventTone, string> = { good: STATUS.good, warn: STATUS.warning, bad: STATUS.danger, neutral: INK.quaternary };

const PLAY_MS = 7000;

/** Journey replay — scrub or play a session and watch struggle turn into an aha. */
export function SessionReplay({ replay }: { replay: Replay }) {
  const [t, setT] = useState(0); // 0..1 through the session
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number>(0);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      if (!last.current) last.current = now;
      const dt = now - last.current;
      last.current = now;
      setT((prev) => {
        const next = prev + dt / PLAY_MS;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  useEffect(() => {
    last.current = 0;
  }, [playing]);

  const W = 720;
  const PADL = 6;
  const PADR = 6;
  const x = useMemo(() => scaleLinear(replay.start, replay.end, PADL, W - PADR), [replay.start, replay.end]);
  const nowT = replay.start + t * (replay.end - replay.start);
  const RIB_Y = 6;
  const RIB_H = 26;
  const EV_Y = RIB_Y + RIB_H + 14;
  const H = EV_Y + 16;

  const curState = replay.slices.find((s) => nowT >= s.tStart && nowT <= s.tEnd)?.state ?? replay.slices[0]?.state ?? 'flow';
  const curEvent = [...replay.events].reverse().find((e) => e.t <= nowT) ?? null;
  const ahaX = replay.ahaT != null ? x(replay.ahaT) : null;

  const restart = () => {
    setT(0);
    setPlaying(true);
  };

  return (
    <div className="flex flex-col gap-lg">
      <div className="-mx-md overflow-x-auto px-md">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Tua lại buổi học" className="block h-auto w-full" style={{ minWidth: 560 }}>
          {/* struggle ribbon */}
          {replay.slices.map((s, i) => (
            <rect key={i} x={x(s.tStart)} y={RIB_Y} width={Math.max(1, x(s.tEnd) - x(s.tStart))} height={RIB_H} fill={STATE[s.state].color} opacity={0.9}>
              <title>{`${STATE[s.state].label} · ${clock(s.tStart - replay.start)}`}</title>
            </rect>
          ))}
          {/* event dots */}
          {replay.events.map((e, i) => (
            <circle key={i} cx={x(e.t)} cy={EV_Y} r={2.6} fill={TONE[e.tone]}>
              <title>{`${e.label}`}</title>
            </circle>
          ))}
          {/* aha marker */}
          {ahaX != null ? (
            <g>
              <line x1={ahaX} y1={RIB_Y - 4} x2={ahaX} y2={EV_Y + 6} stroke={BRAND.orange} strokeWidth={1.5} strokeDasharray="2 2" />
              <circle cx={ahaX} cy={RIB_Y - 6} r={4} fill={BRAND.orange} stroke="#fff" strokeWidth={1} />
            </g>
          ) : null}
          {/* playhead */}
          <line x1={x(nowT)} y1={0} x2={x(nowT)} y2={EV_Y + 8} stroke={INK.primary} strokeWidth={1.5} />
          <circle cx={x(nowT)} cy={RIB_Y + RIB_H / 2} r={3} fill={INK.primary} />
        </svg>
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-md">
        <button
          type="button"
          onClick={() => (t >= 1 ? restart() : setPlaying((p) => !p))}
          className="inline-flex items-center gap-xs rounded-btn bg-button-primary px-lg py-xs text-sm font-semibold text-white transition hover:opacity-90"
        >
          {t >= 1 ? <RotateCcw className="h-4 w-4" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {t >= 1 ? 'Xem lại' : playing ? 'Tạm dừng' : 'Tua lại buổi học'}
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(t * 1000)}
          onChange={(e) => {
            setPlaying(false);
            setT(Number(e.target.value) / 1000);
          }}
          aria-label="Thanh tua buổi học"
          className="h-1.5 flex-1 min-w-[140px] cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand-900"
        />
        <span className="tabular-nums text-xs text-tertiary">
          {clock(nowT - replay.start)} / {clock(replay.end - replay.start)}
        </span>
      </div>

      {/* now read-out */}
      <div className="flex flex-wrap items-center gap-md rounded-lg border border-secondary bg-secondary/60 px-lg py-md text-sm">
        <span className="inline-flex items-center gap-xs rounded-pill px-md py-xxs text-xs font-semibold" style={{ background: `${STATE[curState].color}1A`, color: STATE[curState].color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATE[curState].color }} />
          {STATE[curState].label}
        </span>
        {curEvent ? <span className="text-secondary">{curEvent.label}</span> : <span className="text-tertiary">Bấm “Tua lại” để xem buổi học diễn ra thế nào.</span>}
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-lg text-xs text-tertiary">
        {Object.values(STATE).map((s) => (
          <span key={s.label} className="inline-flex items-center gap-xs">
            <span className="h-2.5 w-3.5 rounded-[2px]" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
