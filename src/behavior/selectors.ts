/**
 * Selectors — pure functions that read the raw event log and return the shapes in
 * types.ts. This is the whole point of the redesign: no metric is hard-coded, every
 * number is reduced back out of what the learner actually did.
 */
import { VERB_LABEL, type Statement } from './events';
import {
  CONCEPT_BY_ID,
  CONCEPTS_OF,
  COURSE_BY_ID,
  DAY_S,
  dateFromT,
  NOW,
  SPAN_DAYS,
  VIDEO_BY_ID,
  VIDEOS_OF,
  type Concept,
  type TopicSlug,
} from './catalog';
import { clock } from './format';
import type {
  AbandonCurve,
  AhaMoment,
  AhaPoint,
  ConceptMap,
  ConfusionMap,
  Forgetting,
  ForgettingLine,
  FocusBreakdown,
  GoldenHours,
  HeatLane,
  JourneyDay,
  JourneySession,
  NextAction,
  Pulse,
  QuadKind,
  QuizPoint,
  ReplayEvent,
  ReplaySlice,
  SessionReplay,
  SlipGap,
  StrategyFingerprint,
  StruggleState,
  SurvivalPoint,
  TwinFactor,
  TwinForecast,
  WatchCoverage,
} from './types';

const dayOf = (t: number): number => Math.floor(t / DAY_S);
const TODAY_DAY = SPAN_DAYS;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// ---------- session grouping ----------
export interface Session {
  id: string;
  start: number;
  end: number;
  statements: Statement[];
}
export function sessionsOf(sts: Statement[]): Session[] {
  const map = new Map<string, Statement[]>();
  for (const s of sts) {
    const arr = map.get(s.sessionId);
    if (arr) arr.push(s);
    else map.set(s.sessionId, [s]);
  }
  return [...map.entries()]
    .map(([id, statements]) => ({ id, statements, start: statements[0].t, end: statements[statements.length - 1].t }))
    .sort((a, b) => a.start - b.start);
}
/** in-app seconds minus idle/blur, capped so a stray gap can't inflate it */
export function focusSeconds(s: Session): number {
  const open = Math.min(s.end - s.start, 3 * 3600);
  const away = s.statements.filter((x) => x.verb === 'idled' || x.verb === 'blurred').reduce((n, x) => n + (x.durationS ?? 0), 0);
  return Math.max(30, open - away);
}

// ---------- per-video struggle & hero pick ----------
function struggleScore(sts: Statement[]): number {
  let n = 0;
  for (const s of sts) {
    if (s.verb === 'seeked' && s.dir === 'back') n += 1;
    else if (s.verb === 'paused') n += 0.5;
    else if (s.verb === 'hinted') n += 0.8;
    else if (s.verb === 'abandoned') n += 1.5;
  }
  return n;
}
export function videosByStruggle(sts: Statement[]): { videoId: string; score: number }[] {
  const byVid = new Map<string, Statement[]>();
  for (const s of sts) if (s.objectType === 'video') (byVid.get(s.objectId) ?? byVid.set(s.objectId, []).get(s.objectId)!).push(s);
  return [...byVid.entries()].map(([videoId, arr]) => ({ videoId, score: struggleScore(arr) })).sort((a, b) => b.score - a.score);
}
export function heroVideoId(sts: Statement[]): string | null {
  return videosByStruggle(sts)[0]?.videoId ?? null;
}

// ---------- concept mastery ----------
export function masteryByConcept(sts: Statement[]): Map<string, number> {
  const attempts = new Map<string, { ok: number; n: number; watched: boolean; abandoned: boolean }>();
  for (const s of sts) {
    if (s.concept == null) continue;
    const rec = attempts.get(s.concept) ?? { ok: 0, n: 0, watched: false, abandoned: false };
    if (s.verb === 'answered') {
      rec.n += 1;
      if (s.correct) rec.ok += 1;
    } else if (s.verb === 'completed') rec.watched = true;
    else if (s.verb === 'abandoned') rec.abandoned = true;
    attempts.set(s.concept, rec);
  }
  const out = new Map<string, number>();
  for (const [c, r] of attempts) {
    if (r.n > 0) out.set(c, clamp01(r.ok / r.n));
    else out.set(c, r.watched ? 0.5 : r.abandoned ? 0.25 : 0.4);
  }
  return out;
}

// ---------- 1. headline pulse ----------
export function pulse(sts: Statement[]): Pulse {
  const recent = sts.filter((s) => dayOf(s.t) >= TODAY_DAY - 6);
  const sess = sessionsOf(recent);
  const focusMinutes7 = Math.round(sess.reduce((n, s) => n + focusSeconds(s), 0) / 60);
  const activeDays7 = new Set(recent.map((s) => dayOf(s.t))).size;
  const ahas = ahaMoments(sts);
  const { resolved, open } = struggleTally(sts);
  return {
    focusMinutes7,
    activeDays7,
    ahaCount: ahas.length,
    strugglesResolved: resolved,
    strugglesOpen: open,
    streak: streakDays(sts),
  };
}
function streakDays(sts: Statement[]): number {
  const active = new Set(sts.map((s) => dayOf(s.t)));
  let n = 0;
  for (let d = TODAY_DAY; d >= 0; d--) {
    if (active.has(d)) n += 1;
    else if (d < TODAY_DAY) break;
  }
  return n;
}
function struggleTally(sts: Statement[]): { resolved: number; open: number } {
  const mastery = masteryByConcept(sts);
  const byVidSession = new Map<string, Statement[]>();
  for (const s of sts) if (s.objectType === 'video' && s.concept) {
    const k = `${s.sessionId}|${s.objectId}`;
    (byVidSession.get(k) ?? byVidSession.set(k, []).get(k)!).push(s);
  }
  let resolved = 0;
  let open = 0;
  for (const arr of byVidSession.values()) {
    const rewinds = arr.filter((x) => x.verb === 'seeked' && x.dir === 'back').length;
    if (rewinds < 2) continue;
    const concept = arr[0].concept!;
    if ((mastery.get(concept) ?? 0) >= 0.5) resolved += 1;
    else open += 1;
  }
  return { resolved, open };
}

// ---------- 2. journey timeline ----------
export function journey(sts: Statement[]): { days: JourneyDay[]; sessions: JourneySession[] } {
  const sess = sessionsOf(sts);
  const ahaByaSession = new Map(ahaMoments(sts).map((a) => [a.sessionId, a]));
  const built: JourneySession[] = sess.map((s) => {
    const lanes = { video: 0, quiz: 0, reading: 0 };
    let last = s.start;
    for (const x of s.statements) {
      const gap = Math.min(x.t - last, 300);
      if (x.objectType === 'quiz') lanes.quiz += gap;
      else if (x.objectType === 'reading') lanes.reading += gap;
      else lanes.video += gap;
      last = x.t;
    }
    const course = COURSE_BY_ID[s.statements[0].courseId];
    const markers: JourneySession['markers'] = [];
    const aha = ahaByaSession.get(s.id);
    if (aha) markers.push({ kind: 'aha', t: s.start + Math.round((s.end - s.start) * 0.6), label: 'Hiểu ra' });
    if (s.statements.some((x) => x.verb === 'abandoned')) markers.push({ kind: 'abandon', t: s.end, label: 'Bỏ dở' });
    const rewinds = s.statements.filter((x) => x.verb === 'seeked' && x.dir === 'back').length;
    if (!aha && rewinds >= 3) markers.push({ kind: 'struggle', t: s.start + Math.round((s.end - s.start) * 0.5), label: 'Vấp' });
    if (s.statements.some((x) => x.verb === 'answered' && x.correct)) markers.push({ kind: 'quiz', t: s.end, label: 'Làm đúng bài' });
    const focusMinutes = Math.round(focusSeconds(s) / 60);
    const dominant = (Object.entries(lanes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'video') as 'video' | 'quiz' | 'reading';
    return {
      id: s.id,
      start: s.start,
      end: s.end,
      date: dateFromT(s.start),
      courseId: course?.id ?? '',
      courseTitle: course?.title ?? '',
      topic: (course?.topic ?? 'ai') as TopicSlug,
      lanes: { video: Math.round(lanes.video / 60), quiz: Math.round(lanes.quiz / 60), reading: Math.round(lanes.reading / 60) },
      focusMinutes,
      openMinutes: Math.round((s.end - s.start) / 60),
      eventCount: s.statements.length,
      markers,
      dominant,
      intensity: clamp01(focusMinutes / 55),
    };
  });
  const byDay = new Map<number, JourneySession[]>();
  for (const b of built) (byDay.get(dayOf(b.start)) ?? byDay.set(dayOf(b.start), []).get(dayOf(b.start))!).push(b);
  const days: JourneyDay[] = [...byDay.entries()]
    .map(([d, list]) => ({ date: dateFromT(d * DAY_S), label: '', minutes: list.reduce((n, x) => n + x.focusMinutes, 0), sessions: list }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  return { days, sessions: built };
}

// ---------- 3. confusion heatmap ----------
const HEAT_LANES: HeatLane[] = [
  { key: 'seekback', label: 'Tua lại' },
  { key: 'pause', label: 'Dừng lại' },
  { key: 'slow', label: 'Giảm tốc' },
  { key: 'hint', label: 'Xin gợi ý' },
];
export function confusionMap(sts: Statement[], videoId?: string): ConfusionMap | null {
  const vid = videoId ?? heroVideoId(sts);
  if (!vid) return null;
  const video = VIDEO_BY_ID[vid];
  if (!video) return null;
  const evs = sts.filter((s) => s.objectType === 'video' && s.objectId === vid);
  const dur = video.durationS;
  const n = Math.max(10, Math.min(44, Math.round(dur / 6)));
  const bins = Array.from({ length: n }, (_, i) => ({ startS: (i * dur) / n, endS: ((i + 1) * dur) / n }));
  const posToBin = (pos: number) => Math.max(0, Math.min(n - 1, Math.floor((pos / dur) * n)));
  const cells = HEAT_LANES.map(() => new Array(n).fill(0));
  for (const e of evs) {
    if (e.verb === 'seeked' && e.dir === 'back') cells[0][posToBin(e.to ?? e.videoPos ?? 0)] += 1;
    else if (e.verb === 'paused') cells[1][posToBin(e.videoPos ?? 0)] += 1;
    else if (e.verb === 'ratechanged' && (e.rate ?? 1) < 1) cells[2][posToBin(e.videoPos ?? 0)] += 1;
    else if (e.verb === 'hinted') cells[3][posToBin(e.videoPos ?? 0)] += 1;
  }
  const max = Math.max(1, ...cells.flat());
  const norm = cells.map((row) => row.map((v) => v / max));
  const colSum = new Array(n).fill(0).map((_, b) => cells.reduce((s, row) => s + row[b], 0));
  const colMax = Math.max(1, ...colSum);
  const peakBin = colSum.indexOf(Math.max(...colSum));
  const order = colSum.map((v, b) => ({ b, v })).sort((a, b) => b.v - a.v).filter((x) => x.v > 0).slice(0, 3);
  const reasonOf = (b: number): string => {
    const laneIdx = cells.map((row) => row[b]).reduce((best, v, i, arr) => (v > arr[best] ? i : best), 0);
    return HEAT_LANES[laneIdx].label;
  };
  const course = COURSE_BY_ID[video.courseId];
  return {
    videoId: vid,
    videoTitle: video.title,
    courseId: video.courseId,
    courseTitle: course?.title ?? '',
    durationS: dur,
    bins,
    lanes: HEAT_LANES,
    cells: norm,
    hotspots: order.map((x) => ({ binIndex: x.b, timeS: (x.b + 0.5) * (dur / n), intensity: x.v / colMax, reason: reasonOf(x.b) })),
    peakBin,
  };
}

// ---------- 4. session replay ----------
export function signatureSessionId(sts: Statement[]): string | null {
  const aha = ahaMoments(sts)[0];
  if (aha) return aha.sessionId;
  const sess = sessionsOf(sts).sort((a, b) => b.statements.length - a.statements.length);
  return sess[0]?.id ?? null;
}
const TONE: Record<string, ReplayEvent['tone']> = {
  completed: 'good',
  focused: 'good',
  played: 'neutral',
  ratechanged: 'neutral',
  read: 'neutral',
  paused: 'warn',
  seeked: 'warn',
  hinted: 'warn',
  revisited: 'warn',
  noted: 'good',
  abandoned: 'bad',
  idled: 'bad',
  blurred: 'bad',
  answered: 'neutral',
};
export function sessionReplay(sts: Statement[], sessionId?: string): SessionReplay | null {
  const sid = sessionId ?? signatureSessionId(sts);
  if (!sid) return null;
  const sess = sessionsOf(sts).find((s) => s.id === sid);
  if (!sess) return null;
  const mastery = masteryByConcept(sts);
  const aha = ahaMoments(sts).find((a) => a.sessionId === sid) ?? null;

  const events: ReplayEvent[] = sess.statements.map((s) => ({
    t: s.t,
    verb: s.verb,
    label: VERB_LABEL[s.verb] + (s.videoPos != null && s.objectType === 'video' ? ` · ${clock(s.videoPos)}` : ''),
    pos: s.videoPos,
    tone: s.verb === 'answered' ? (s.correct ? 'good' : 'bad') : TONE[s.verb] ?? 'neutral',
  }));

  // classify each event's local state, then build contiguous slices
  const stateAt = (s: Statement): StruggleState => {
    if (s.verb === 'idled' || s.verb === 'blurred') return 'idle';
    if (s.verb === 'seeked' && s.dir === 'fwd') return 'exploring';
    if (s.verb === 'ratechanged' && (s.rate ?? 1) > 1) return 'exploring';
    if (s.verb === 'seeked' || s.verb === 'paused' || s.verb === 'hinted' || s.verb === 'revisited') {
      return (mastery.get(s.concept ?? '') ?? 0.5) >= 0.5 ? 'productive' : 'wheelspin';
    }
    if (s.verb === 'answered') return s.correct ? 'flow' : 'wheelspin';
    return 'flow';
  };
  const slices: ReplaySlice[] = [];
  let cur: StruggleState = 'flow';
  let segStart = sess.start;
  for (const s of sess.statements) {
    const st = stateAt(s);
    if (st !== cur) {
      if (s.t > segStart) slices.push({ tStart: segStart, tEnd: s.t, state: cur });
      segStart = s.t;
      cur = st;
    }
  }
  slices.push({ tStart: segStart, tEnd: sess.end, state: cur });

  const summary = aha
    ? `Bạn gặp khó ở “${aha.conceptLabel}” nhưng làm đúng bài ngay sau đó — dấu hiệu là đã hiểu ra.`
    : slices.some((s) => s.state === 'wheelspin')
      ? 'Có đoạn loay hoay chưa gỡ được — nên xem lại phần này hoặc mở gợi ý.'
      : 'Một buổi học trôi chảy, ít vấp.';

  return {
    sessionId: sid,
    start: sess.start,
    end: sess.end,
    date: dateFromT(sess.start),
    courseTitle: COURSE_BY_ID[sess.statements[0].courseId]?.title ?? '',
    slices,
    events,
    ahaT: aha ? aha.points[aha.ahaIndex]?.t ?? null : null,
    summary,
  };
}

// ---------- 5. aha moments ----------
export function ahaMoments(sts: Statement[]): AhaMoment[] {
  const mastery = masteryByConcept(sts);
  const byKey = new Map<string, Statement[]>();
  for (const s of sts) if (s.objectType === 'video' && s.concept) {
    const k = `${s.sessionId}|${s.objectId}`;
    (byKey.get(k) ?? byKey.set(k, []).get(k)!).push(s);
  }
  const out: AhaMoment[] = [];
  for (const [k, arr] of byKey) {
    const rewinds = arr.filter((x) => x.verb === 'seeked' && x.dir === 'back').length;
    const pauses = arr.filter((x) => x.verb === 'paused').length;
    const hints = arr.filter((x) => x.verb === 'hinted').length;
    const completed = arr.some((x) => x.verb === 'completed');
    const concept = arr[0].concept!;
    const resolved = (mastery.get(concept) ?? 0) >= 0.5;
    const struggle = rewinds + pauses * 0.5 + hints * 0.8;
    if (rewinds >= 2 && completed && resolved && struggle >= 2.5) {
      const [sessionId] = k.split('|');
      const start = arr[0].t;
      const end = arr[arr.length - 1].t;
      // tension arc: rises with each struggle event, drops after completion
      const points: AhaPoint[] = [];
      let tension = 0.15;
      points.push({ t: start, tension });
      for (const x of arr) {
        if (x.verb === 'seeked' && x.dir === 'back') tension = clamp01(tension + 0.18);
        else if (x.verb === 'paused') tension = clamp01(tension + 0.08);
        else if (x.verb === 'hinted') tension = clamp01(tension + 0.12);
        else if (x.verb === 'completed') tension = clamp01(tension - 0.5);
        points.push({ t: x.t, tension });
      }
      points.push({ t: end + 20, tension: clamp01(tension - 0.25) });
      const ahaIndex = points.reduce((best, p, i, a) => (i > 0 && a[i - 1].tension - p.tension > (a[best - 1]?.tension ?? a[best].tension) - a[best].tension ? i : best), points.length - 1);
      const c = CONCEPT_BY_ID[concept];
      out.push({
        sessionId,
        date: dateFromT(start),
        conceptLabel: c?.label ?? '',
        courseTitle: COURSE_BY_ID[arr[0].courseId]?.title ?? '',
        points,
        ahaIndex,
        struggleSeconds: Math.round(end - start),
        rewinds,
        caption: `Bạn tua lại ${rewinds} lần ở chỗ khó của “${c?.label ?? ''}”, rồi xem hết và làm đúng bài ngay sau đó — dấu hiệu bạn đã hiểu ra chỗ này.`,
      });
    }
  }
  return out.sort((a, b) => b.rewinds - a.rewinds || b.date.getTime() - a.date.getTime());
}

// ---------- 6. watch coverage ----------
export function watchCoverage(sts: Statement[], videoId: string): WatchCoverage | null {
  const video = VIDEO_BY_ID[videoId];
  if (!video) return null;
  const evs = sts.filter((s) => s.objectType === 'video' && s.objectId === videoId).sort((a, b) => a.t - b.t);
  const dur = video.durationS;
  const reached = Math.max(0, ...evs.map((e) => (e.verb === 'completed' ? dur : e.videoPos ?? 0)));
  const rewatched: [number, number][] = [];
  const skipped: [number, number][] = [];
  const skimmed: [number, number][] = [];
  for (const e of evs) {
    if (e.verb === 'seeked' && e.dir === 'back' && e.to != null && e.from != null) rewatched.push([e.to, e.from]);
    if (e.verb === 'seeked' && e.dir === 'fwd' && e.to != null && e.from != null) skipped.push([e.from, e.to]);
    if (e.verb === 'ratechanged' && (e.rate ?? 1) > 1) skimmed.push([e.videoPos ?? 0, Math.min(dur, (e.videoPos ?? 0) + dur * 0.15)]);
  }
  // build a per-second kind map, then compress to segments
  const step = Math.max(1, Math.round(dur / 240));
  const N = Math.ceil(dur / step);
  const kind = new Array(N).fill('unwatched') as WatchCoverage['segments'][number]['kind'][];
  for (let i = 0; i < N; i++) if (i * step <= reached) kind[i] = 'watched';
  const paint = (ranges: [number, number][], k: WatchCoverage['segments'][number]['kind']) => {
    for (const [a, b] of ranges) for (let i = Math.floor(a / step); i <= Math.floor(b / step) && i < N; i++) if (i >= 0) kind[i] = k;
  };
  paint(skimmed, 'skimmed');
  paint(skipped, 'skipped');
  paint(rewatched, 'rewatched');
  const segments: WatchCoverage['segments'] = [];
  let i = 0;
  while (i < N) {
    let j = i;
    while (j < N && kind[j] === kind[i]) j++;
    segments.push({ startS: i * step, endS: Math.min(dur, j * step), kind: kind[i] });
    i = j;
  }
  const span = (k: string) => segments.filter((s) => s.kind === k).reduce((n, s) => n + (s.endS - s.startS), 0);
  return {
    videoId,
    videoTitle: video.title,
    durationS: dur,
    segments,
    watchedPct: Math.round(((span('watched') + span('rewatched') + span('skimmed')) / dur) * 100),
    rewatchedPct: Math.round((span('rewatched') / dur) * 100),
    skippedPct: Math.round((span('skipped') / dur) * 100),
  };
}

// ---------- 7. abandon / survival ----------
export function abandonCurve(sts: Statement[]): AbandonCurve {
  const byKey = new Map<string, Statement[]>();
  for (const s of sts) if (s.objectType === 'video' && (s.verb === 'completed' || s.verb === 'abandoned' || s.verb === 'played')) {
    const k = `${s.sessionId}|${s.objectId}`;
    (byKey.get(k) ?? byKey.set(k, []).get(k)!).push(s);
  }
  const stops: number[] = [];
  for (const arr of byKey.values()) {
    const vid = VIDEO_BY_ID[arr[0].objectId];
    if (!vid) continue;
    if (arr.some((x) => x.verb === 'completed')) stops.push(1);
    else {
      const ab = arr.find((x) => x.verb === 'abandoned');
      stops.push(ab ? clamp01((ab.videoPos ?? 0) / vid.durationS) : clamp01(Math.max(...arr.map((x) => x.videoPos ?? 0)) / vid.durationS));
    }
  }
  const total = Math.max(1, stops.length);
  const points: SurvivalPoint[] = [];
  for (let p = 0; p <= 100; p += 5) {
    const still = stops.filter((x) => x >= p / 100).length / total;
    points.push({ posPct: p, stillPct: Math.round(still * 100) });
  }
  // cliffs = biggest consecutive drops
  const cliffs: AbandonCurve['cliffs'] = [];
  for (let i = 1; i < points.length; i++) {
    const drop = points[i - 1].stillPct - points[i].stillPct;
    if (drop >= 12) cliffs.push({ posPct: points[i].posPct, label: `${drop}% rời ở ~${points[i].posPct}%` });
  }
  const median = points.find((p) => p.stillPct <= 50)?.posPct ?? null;
  return { points, cliffs: cliffs.sort((a, b) => b.posPct - a.posPct).slice(0, 3), medianPct: median };
}

// ---------- 8. golden hours ----------
export function goldenHours(sts: Statement[]): GoldenHours {
  const grid = new Map<string, number>();
  const byHour = new Array(24).fill(0);
  for (const s of sessionsOf(sts)) {
    const d = dateFromT(s.start);
    const focus = focusSeconds(s) / 60;
    const key = `${d.getHours()}|${d.getDay()}`;
    grid.set(key, (grid.get(key) ?? 0) + focus);
    byHour[d.getHours()] += focus;
  }
  const cells = [...grid.entries()].map(([k, focus]) => {
    const [hour, weekday] = k.split('|').map(Number);
    return { hour, weekday, focus: Math.round(focus) };
  });
  const max = Math.max(1, ...cells.map((c) => c.focus));
  const peakHour = byHour.indexOf(Math.max(...byHour));
  return { cells, peakHour, peakLabel: `${peakHour}h–${(peakHour + 1) % 24}h`, max, byHour: byHour.map((v) => Math.round(v)) };
}

// ---------- 9. focus waterfall ----------
export function focusBreakdown(sts: Statement[], days = 14): FocusBreakdown {
  const recent = sts.filter((s) => dayOf(s.t) >= TODAY_DAY - (days - 1));
  const sess = sessionsOf(recent);
  const openMinutes = Math.round(sess.reduce((n, s) => n + Math.min(s.end - s.start, 3 * 3600), 0) / 60);
  const idleMinutes = Math.round(recent.filter((s) => s.verb === 'idled').reduce((n, s) => n + (s.durationS ?? 0), 0) / 60);
  const blurMinutes = Math.round(recent.filter((s) => s.verb === 'blurred').reduce((n, s) => n + (s.durationS ?? 0), 0) / 60);
  const focusMinutes = Math.max(0, openMinutes - idleMinutes - blurMinutes);
  return {
    openMinutes,
    idleMinutes,
    blurMinutes,
    focusMinutes,
    focusRate: openMinutes ? focusMinutes / openMinutes : 0,
    steps: [
      { label: 'Thời gian mở bài', delta: openMinutes, kind: 'total' },
      { label: 'Ngồi im', delta: -idleMinutes, kind: 'loss' },
      { label: 'Rời tab', delta: -blurMinutes, kind: 'loss' },
      { label: 'Tập trung thật', delta: focusMinutes, kind: 'result' },
    ],
  };
}

// ---------- 10. slip vs gap ----------
export function slipGap(sts: Statement[]): SlipGap {
  const answers = sts.filter((s) => s.verb === 'answered');
  const lat = answers.map((s) => (s.latencyMs ?? 0) / 1000).sort((a, b) => a - b);
  const median = lat.length ? lat[Math.floor(lat.length / 2)] : 8;
  const counts: Record<QuadKind, number> = { slip: 0, gap: 0, fluent: 0, effortful: 0 };
  const points: QuizPoint[] = answers.map((s) => {
    const latencyS = (s.latencyMs ?? 0) / 1000;
    const fast = latencyS <= median;
    const quad: QuadKind = s.correct ? (fast ? 'fluent' : 'effortful') : fast ? 'slip' : 'gap';
    counts[quad] += 1;
    return { latencyS, correct: !!s.correct, conceptLabel: CONCEPT_BY_ID[s.concept ?? '']?.label ?? '', quad };
  });
  const wrong = counts.slip + counts.gap || 1;
  return { points, counts, medianLatencyS: Math.round(median), slipShare: counts.slip / wrong, gapShare: counts.gap / wrong };
}

// ---------- 11. forgetting curve ----------
export function forgetting(sts: Statement[]): Forgetting {
  const mastery = masteryByConcept(sts);
  const lastReviewDay = new Map<string, number>();
  const reviewCount = new Map<string, number>();
  for (const s of sts) if (s.concept && (s.verb === 'completed' || s.verb === 'answered' || s.verb === 'revisited')) {
    lastReviewDay.set(s.concept, Math.max(lastReviewDay.get(s.concept) ?? 0, dayOf(s.t)));
    reviewCount.set(s.concept, (reviewCount.get(s.concept) ?? 0) + (s.verb === 'revisited' || s.verb === 'completed' ? 1 : 0));
  }
  const lines: ForgettingLine[] = [];
  for (const [conceptId, last] of lastReviewDay) {
    const c = CONCEPT_BY_ID[conceptId];
    if (!c) continue;
    const strength = c.halfLifeDays * (0.6 + 0.5 * (mastery.get(conceptId) ?? 0.5)) * (1 + 0.35 * ((reviewCount.get(conceptId) ?? 1) - 1));
    const retentionAt = (dayAbs: number) => Math.pow(0.5, Math.max(0, dayAbs - last) / strength);
    const points = [];
    for (let d = last; d <= TODAY_DAY + 14; d++) points.push({ day: d - TODAY_DAY, retention: retentionAt(d) });
    const retentionNow = retentionAt(TODAY_DAY);
    // days until retention dips below 0.5
    let dueInDays = 0;
    while (retentionAt(TODAY_DAY + dueInDays) > 0.5 && dueInDays < 30) dueInDays++;
    lines.push({ conceptLabel: c.label, courseTitle: COURSE_BY_ID[c.courseId]?.title ?? '', points, dueInDays, retentionNow });
  }
  lines.sort((a, b) => a.dueInDays - b.dueInDays || a.retentionNow - b.retentionNow);
  return { lines, dueSoon: lines.filter((l) => l.dueInDays <= 5).slice(0, 4) };
}

// ---------- 12. strategy fingerprint ----------
export function strategyFingerprint(sts: Statement[]): StrategyFingerprint {
  const videos = new Set(sts.filter((s) => s.objectType === 'video').map((s) => `${s.sessionId}|${s.objectId}`));
  const nVideo = Math.max(1, videos.size);
  const rewinds = sts.filter((s) => s.verb === 'seeked' && s.dir === 'back').length;
  const hints = sts.filter((s) => s.verb === 'hinted').length;
  const completed = sts.filter((s) => s.verb === 'completed').length;
  const abandoned = sts.filter((s) => s.verb === 'abandoned').length;
  const answers = sts.filter((s) => s.verb === 'answered');
  const acc = answers.length ? answers.filter((a) => a.correct).length / answers.length : 0.5;
  const activeDays = new Set(sts.map((s) => dayOf(s.t))).size;
  const sess = sessionsOf(sts);
  const focusRate = mean(sess.map((s) => focusSeconds(s) / Math.max(1, Math.min(s.end - s.start, 3 * 3600))));

  const axes = [
    { key: 'rewatch', label: 'Xem lại kỹ', value: clamp01(rewinds / nVideo / 3) },
    { key: 'pace', label: 'Nhịp đều', value: clamp01(activeDays / SPAN_DAYS / 0.7) },
    { key: 'grit', label: 'Kiên trì', value: clamp01(completed / (completed + abandoned || 1)) },
    { key: 'accuracy', label: 'Làm đúng', value: clamp01(acc) },
    { key: 'help', label: 'Chủ động hỏi', value: clamp01(hints / nVideo / 1.2) },
    { key: 'focus', label: 'Tập trung', value: clamp01(focusRate) },
  ];
  const top = [...axes].sort((a, b) => b.value - a.value)[0];
  const LABELS: Record<string, { label: string; blurb: string }> = {
    rewatch: { label: 'Người xem lại kỹ', blurb: 'Bạn hay tua lại chỗ khó cho tới khi hiểu — chậm mà chắc.' },
    pace: { label: 'Người học đều', blurb: 'Bạn giữ nhịp học ổn định qua từng ngày, ít bỏ quãng.' },
    grit: { label: 'Người bền bỉ', blurb: 'Bạn ít bỏ dở, thường theo bài đến cùng.' },
    accuracy: { label: 'Người chắc kiến thức', blurb: 'Bạn làm bài đúng cao — nắm bài khá vững.' },
    help: { label: 'Người chủ động hỏi', blurb: 'Bạn hay mở gợi ý khi bí — biết tìm trợ giúp đúng lúc.' },
    focus: { label: 'Người tập trung', blurb: 'Khi đã học là học thật, ít bị phân tâm.' },
  };
  return { axes, label: LABELS[top.key].label, blurb: LABELS[top.key].blurb };
}

// ---------- 13. concept map ----------
export function conceptMapOf(sts: Statement[], courseId?: string): ConceptMap | null {
  const counts = new Map<string, number>();
  for (const s of sts) if (s.courseId) counts.set(s.courseId, (counts.get(s.courseId) ?? 0) + 1);
  const cid = courseId ?? [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!cid) return null;
  const mastery = masteryByConcept(sts);
  const concepts = CONCEPTS_OF(cid);
  const nodes = concepts.map((c) => ({ id: c.id, label: c.label, mastery: mastery.get(c.id) ?? 0.3, col: c.col, row: c.row }));
  const edges = concepts.flatMap((c) => c.prereq.map((p) => ({ from: p, to: c.id })));
  const blocked = concepts.filter((c) => c.prereq.some((p) => (mastery.get(p) ?? 0) < 0.45)).map((c) => c.id);
  return { courseTitle: COURSE_BY_ID[cid]?.title ?? '', nodes, edges, blocked };
}

// ---------- 14. twin forecast ----------
export function twinForecast(sts: Statement[]): TwinForecast {
  const recent = sts.filter((s) => dayOf(s.t) >= TODAY_DAY - 9);
  const prior = sts.filter((s) => dayOf(s.t) >= TODAY_DAY - 19 && dayOf(s.t) < TODAY_DAY - 9);
  const daysSince = TODAY_DAY - Math.max(0, ...sts.map((s) => dayOf(s.t)));
  const rAns = recent.filter((s) => s.verb === 'answered');
  const acc = rAns.length ? rAns.filter((a) => a.correct).length / rAns.length : 0.5;
  const abandons = recent.filter((s) => s.verb === 'abandoned').length;
  const videos = new Set(recent.filter((s) => s.objectType === 'video').map((s) => `${s.sessionId}|${s.objectId}`)).size || 1;
  const activeDaysRecent = new Set(recent.map((s) => dayOf(s.t))).size;
  const { open } = struggleTally(sts);

  const fInactivity = clamp01(daysSince / 4);
  const fAccuracy = clamp01((0.7 - acc) / 0.5);
  const fAbandon = clamp01(abandons / videos / 0.4);
  const fRhythm = clamp01((6 - activeDaysRecent) / 6);
  const fOpen = clamp01(open / 5);
  const risk = clamp01(0.34 * fInactivity + 0.24 * fAccuracy + 0.18 * fAbandon + 0.14 * fRhythm + 0.1 * fOpen);

  const factors: TwinFactor[] = [
    { label: 'Số ngày chưa học lại', weight: fInactivity, dir: 'up' as const },
    { label: 'Tỉ lệ làm đúng gần đây', weight: fAccuracy, dir: (acc < 0.7 ? 'up' : 'down') as 'up' | 'down' },
    { label: 'Hay bỏ dở bài', weight: fAbandon, dir: 'up' as const },
    { label: 'Học đều hay ngắt quãng', weight: fRhythm, dir: 'up' as const },
  ];
  factors.sort((a, b) => b.weight - a.weight);

  const prevRisk = clamp01(risk - (recent.length - prior.length) / 400);
  const trend = Math.round((risk - prevRisk) * 100);

  const fg = forgetting(sts);
  const dueLine = fg.dueSoon[0] ?? fg.lines[0];
  const cmap = conceptMapOf(sts);
  const nextConcept = cmap?.nodes.find((n) => cmap.blocked.includes(n.id)) ?? cmap?.nodes.slice().sort((a, b) => a.mastery - b.mastery)[0];

  const horizon = Array.from({ length: 14 }, (_, i) => {
    const day = i + 1;
    const stuck = clamp01(((nextConcept ? 1 - nextConcept.mastery : 0.4) * Math.exp(-day / 9)) + 0.03);
    const forget = dueLine ? clamp01(1 - Math.pow(0.5, Math.max(0, day - dueLine.dueInDays) / 6)) : 0.2;
    const dropout = clamp01(risk + (risk > 0.5 ? 0.02 : -0.015) * day);
    return { day, date: dateFromT((TODAY_DAY + day) * DAY_S), stuck, forget, dropout };
  });

  const sg = slipGap(sts);
  const abandonedVideo = [...sts].reverse().find((s) => s.verb === 'abandoned');
  const actions: NextAction[] = [];
  if (dueLine) actions.push({ id: 'review', kind: 'review', minutes: 8, impact: 0.9, label: `Ôn nhanh “${dueLine.conceptLabel}”`, why: `Kiến thức này sắp mờ (còn nhớ ~${Math.round(dueLine.retentionNow * 100)}%).` });
  if (nextConcept && cmap?.blocked.includes(nextConcept.id)) actions.push({ id: 'unblock', kind: 'next', minutes: 15, impact: 0.75, label: `Gỡ nút thắt “${nextConcept.label}”`, why: 'Phần trước chưa vững đang chặn bạn đi tiếp.' });
  if (sg.slipShare > 0.4) actions.push({ id: 'slip', kind: 'redo', minutes: 6, impact: 0.6, label: 'Làm lại vài câu hay sai do vội', why: 'Nhiều lỗi là do bấm nhanh chứ không phải chưa hiểu.' });
  if (abandonedVideo) {
    const v = VIDEO_BY_ID[abandonedVideo.objectId];
    if (v) actions.push({ id: 'resume', kind: 'resume', minutes: 10, impact: 0.55, label: `Xem nốt “${v.title}”`, why: 'Bạn đang bỏ dở ở đoạn khó — xem nốt sẽ liền mạch hơn.', courseSlug: COURSE_BY_ID[v.courseId]?.slug });
  }
  if (activeDaysRecent < 4) actions.push({ id: 'habit', kind: 'habit', minutes: 12, impact: 0.5, label: 'Đặt một buổi học ngắn tối nay', why: 'Học đều mỗi ngày giữ nhịp tốt hơn học dồn.' });

  return {
    dropoutRisk: risk,
    trend,
    factors,
    horizon,
    nextConceptLabel: nextConcept?.label ?? '—',
    forgetConceptLabel: dueLine?.conceptLabel ?? '—',
    actions: actions.sort((a, b) => b.impact - a.impact).slice(0, 4),
  };
}
