import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { TopicSlug } from '../../mock/analytics';

export type Preset = '7' | '30' | '90' | '365' | 'custom';
const PRESET_DAYS: Record<Exclude<Preset, 'custom'>, number> = { '7': 7, '30': 30, '90': 90, '365': 365 };

export interface FilterValue {
  preset: Preset;
  from: number; // older bound, daysAgo (inclusive)
  to: number; // newer bound, daysAgo (0 = today)
  topic: TopicSlug | null;
  rangeDays: number;
  setPreset: (p: Preset) => void;
  setCustom: (from: number, to: number) => void;
  setTopic: (t: TopicSlug | null) => void;
  toggleTopic: (t: TopicSlug) => void;
}

const Ctx = createContext<FilterValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<Preset>('30');
  const [range, setRange] = useState<{ from: number; to: number }>({ from: 29, to: 0 });
  const [topic, setTopic] = useState<TopicSlug | null>(null);

  const value = useMemo<FilterValue>(
    () => ({
      preset,
      from: range.from,
      to: range.to,
      topic,
      rangeDays: range.from - range.to + 1,
      setPreset: (p) => {
        setPresetState(p);
        if (p !== 'custom') setRange({ from: PRESET_DAYS[p] - 1, to: 0 });
      },
      setCustom: (from, to) => {
        setPresetState('custom');
        setRange({ from: Math.max(from, to), to: Math.max(0, Math.min(from, to)) });
      },
      setTopic,
      toggleTopic: (t) => setTopic((cur) => (cur === t ? null : t)),
    }),
    [preset, range, topic],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilters(): FilterValue {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFilters must be used within FilterProvider');
  return c;
}
