/**
 * Derived data shapes — the contract between the selectors (which read the event
 * log) and the chart/tile components (which draw them). Charts never touch raw
 * Statements; they only ever receive these.
 */
import type { Verb } from './events';
import type { TopicSlug } from './catalog';

// ---------- Journey timeline ----------
export type MarkerKind = 'aha' | 'struggle' | 'abandon' | 'quiz' | 'milestone';
export interface JourneyMarker {
  kind: MarkerKind;
  t: number;
  label: string;
}
export interface JourneySession {
  id: string;
  start: number;
  end: number;
  date: Date;
  courseId: string;
  courseTitle: string;
  topic: TopicSlug;
  /** minutes per lane */
  lanes: { video: number; quiz: number; reading: number };
  focusMinutes: number;
  openMinutes: number;
  eventCount: number;
  markers: JourneyMarker[];
  dominant: 'video' | 'quiz' | 'reading';
  /** 0..1 shading for the row */
  intensity: number;
}
export interface JourneyDay {
  date: Date;
  label: string;
  minutes: number;
  sessions: JourneySession[];
}

// ---------- Confusion heatmap ----------
export interface HeatLane {
  key: string;
  label: string;
}
export interface HeatBin {
  startS: number;
  endS: number;
}
export interface Hotspot {
  binIndex: number;
  timeS: number;
  intensity: number;
  reason: string;
}
export interface ConfusionMap {
  videoId: string;
  videoTitle: string;
  courseId: string;
  courseTitle: string;
  durationS: number;
  bins: HeatBin[];
  lanes: HeatLane[];
  /** cells[lane][bin], normalized 0..1 */
  cells: number[][];
  hotspots: Hotspot[];
  peakBin: number;
}

// ---------- Session replay ----------
export type StruggleState = 'flow' | 'productive' | 'exploring' | 'wheelspin' | 'idle';
export interface ReplaySlice {
  tStart: number;
  tEnd: number;
  state: StruggleState;
}
export type EventTone = 'neutral' | 'good' | 'warn' | 'bad';
export interface ReplayEvent {
  t: number;
  verb: Verb;
  label: string;
  pos?: number;
  tone: EventTone;
}
export interface SessionReplay {
  sessionId: string;
  start: number;
  end: number;
  date: Date;
  courseTitle: string;
  slices: ReplaySlice[];
  events: ReplayEvent[];
  ahaT: number | null;
  summary: string;
}

// ---------- Aha arc ----------
export interface AhaPoint {
  t: number;
  tension: number;
}
export interface AhaMoment {
  sessionId: string;
  date: Date;
  conceptLabel: string;
  courseTitle: string;
  points: AhaPoint[];
  ahaIndex: number;
  struggleSeconds: number;
  rewinds: number;
  caption: string;
}

// ---------- Twin forecast ----------
export interface TwinFactor {
  label: string;
  weight: number; // 0..1 relative contribution
  dir: 'up' | 'down'; // pushes risk up / down
}
export interface HorizonBand {
  day: number;
  date: Date;
  stuck: number;
  forget: number;
  dropout: number;
}
export type ActionKind = 'review' | 'redo' | 'resume' | 'next' | 'habit';
export interface NextAction {
  id: string;
  label: string;
  why: string;
  impact: number; // 0..1
  minutes: number;
  kind: ActionKind;
  courseSlug?: string;
}
export interface TwinForecast {
  dropoutRisk: number;
  trend: number; // pct vs previous window
  factors: TwinFactor[];
  horizon: HorizonBand[];
  nextConceptLabel: string;
  forgetConceptLabel: string;
  actions: NextAction[];
}

// ---------- Watch coverage ----------
export type CoverageKind = 'watched' | 'rewatched' | 'skimmed' | 'skipped' | 'unwatched';
export interface CoverageSeg {
  startS: number;
  endS: number;
  kind: CoverageKind;
}
export interface WatchCoverage {
  videoId: string;
  videoTitle: string;
  durationS: number;
  segments: CoverageSeg[];
  watchedPct: number;
  rewatchedPct: number;
  skippedPct: number;
}

// ---------- Abandon / survival ----------
export interface SurvivalPoint {
  posPct: number;
  stillPct: number;
}
export interface AbandonCurve {
  points: SurvivalPoint[];
  cliffs: { posPct: number; label: string }[];
  medianPct: number | null;
}

// ---------- Golden hours ----------
export interface GoldenCell {
  hour: number;
  weekday: number;
  focus: number;
}
export interface GoldenHours {
  cells: GoldenCell[];
  peakHour: number;
  peakLabel: string;
  max: number;
  byHour: number[];
}

// ---------- Focus waterfall ----------
export interface FocusStep {
  label: string;
  delta: number;
  kind: 'total' | 'loss' | 'result';
}
export interface FocusBreakdown {
  openMinutes: number;
  idleMinutes: number;
  blurMinutes: number;
  focusMinutes: number;
  steps: FocusStep[];
  focusRate: number;
}

// ---------- Slip vs gap ----------
export type QuadKind = 'slip' | 'gap' | 'fluent' | 'effortful';
export interface QuizPoint {
  latencyS: number;
  correct: boolean;
  conceptLabel: string;
  quad: QuadKind;
}
export interface SlipGap {
  points: QuizPoint[];
  counts: Record<QuadKind, number>;
  medianLatencyS: number;
  slipShare: number;
  gapShare: number;
}

// ---------- Forgetting curve ----------
export interface RetentionPoint {
  day: number;
  retention: number;
}
export interface ForgettingLine {
  conceptLabel: string;
  courseTitle: string;
  points: RetentionPoint[];
  dueInDays: number;
  retentionNow: number;
}
export interface Forgetting {
  lines: ForgettingLine[];
  dueSoon: ForgettingLine[];
}

// ---------- Strategy fingerprint ----------
export interface RadarAxis {
  key: string;
  label: string;
  value: number; // 0..1
}
export interface StrategyFingerprint {
  axes: RadarAxis[];
  label: string;
  blurb: string;
}

// ---------- Concept map ----------
export interface ConceptNode {
  id: string;
  label: string;
  mastery: number;
  col: number;
  row: number;
}
export interface ConceptEdge {
  from: string;
  to: string;
}
export interface ConceptMap {
  courseTitle: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  blocked: string[];
}

// ---------- Overview / cross-course / longitudinal ----------
export interface OverviewStats {
  focusHours: number;
  coursesTouched: number;
  coursesDone: number;
  activeDays: number;
  ahaCount: number;
  longestStreak: number;
}
export interface HeatDay {
  daysAgo: number;
  minutes: number;
}
export interface MonthPoint {
  label: string;
  mastery: number; // 0..1 running accuracy up to that month
  minutes: number;
}
export interface TopicStrength {
  topic: TopicSlug;
  name: string;
  mastery: number; // 0..1
  minutes: number;
  courses: number;
}
export type CourseStatus = 'done' | 'active' | 'paused';
export interface CourseRow {
  id: string;
  slug: string;
  title: string;
  topic: TopicSlug;
  page: boolean;
  progress: number; // 0..1 concepts passed / total
  mastery: number; // 0..1
  minutes: number;
  ahaCount: number;
  status: CourseStatus;
  lastActiveDaysAgo: number;
  conceptsTotal: number;
}
export interface RecurringStumble {
  conceptLabel: string;
  courseTitle: string;
  topic: TopicSlug;
  score: number; // relative struggle
}
export interface LessonRow {
  conceptId: string;
  label: string;
  order: number;
  mastery: number;
  watched: boolean;
  struggle: number;
}

// ---------- Headline pulse ----------
export interface Pulse {
  focusMinutes7: number;
  activeDays7: number;
  ahaCount: number;
  strugglesResolved: number;
  strugglesOpen: number;
  streak: number;
}
