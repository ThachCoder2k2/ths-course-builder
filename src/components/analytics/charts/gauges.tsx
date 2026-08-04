import { arcPath, clamp } from '../../../lib/svg';
import { BRAND, GRID } from '../palette';
import { useInView } from '../../../lib/useInView';
import { useCountUp } from '../../../lib/useCountUp';

/** 270° arc gauge whose number counts up and arc sweeps in when scrolled into view. */
export function ArcGauge({
  value,
  max = 100,
  unit = '',
  sublabel,
  size = 184,
  color = BRAND.blue,
}: {
  value: number;
  max?: number;
  unit?: string;
  sublabel?: string;
  size?: number;
  color?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const START = 135;
  const SWEEP = 270;
  const { ref, inView } = useInView<HTMLDivElement>();
  const shown = useCountUp(value, inView);
  const t = clamp(shown / max, 0, 1);
  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`${value}${unit} trên ${max}`}>
        <path d={arcPath(cx, cy, r, START, START + SWEEP)} fill="none" stroke={GRID} strokeWidth={13} strokeLinecap="round" />
        {t > 0 ? <path d={arcPath(cx, cy, r, START, START + SWEEP * t)} fill="none" stroke={color} strokeWidth={13} strokeLinecap="round" /> : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[22%]">
        <span className="text-display-md font-semibold leading-none tabular-nums text-primary">
          {shown}
          <span className="text-xl font-medium text-tertiary">{unit}</span>
        </span>
        {sublabel ? <span className="mt-md max-w-full text-center text-xs leading-tight text-tertiary">{sublabel}</span> : null}
      </div>
    </div>
  );
}

/** Simple progress ring. */
export function RadialRing({
  value,
  size = 96,
  stroke = 10,
  color = BRAND.blue,
  label,
  centerLabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  centerLabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const t = clamp(value / 100, 0, 1);
  return (
    <div className="inline-flex flex-col items-center gap-md">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`${label ?? ''} ${value}%`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={GRID} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - t)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-md font-semibold tabular-nums text-primary">
          {centerLabel ?? `${value}%`}
        </div>
      </div>
      {label ? <span className="max-w-[10rem] text-center text-xs leading-tight text-tertiary">{label}</span> : null}
    </div>
  );
}
