/**
 * Overview / cross-course / longitudinal selectors — the "how I learn across a
 * whole year and many courses" layer. Pure reducers over the (already scoped)
 * event log, same as selectors.ts. `scope()` slices the log by time range /
 * course / lesson so one page can re-answer everything for any filter.
 */
import type { Statement } from './events';
import {
  CONCEPTS_OF,
  CONCEPT_BY_ID,
  COURSE_BY_ID,
  COURSES,
  DAY_S,
  dateFromT,
  NOW,
  SPAN_DAYS,
  START,
  TOPIC_NAME,
  TOPICS,
  type TopicSlug,
} from './catalog';
import { ahaMoments, focusSeconds, masteryByConcept, sessionsOf } from './selectors';
import type { CourseRow, HeatDay, LessonRow, MonthPoint, OverviewStats, RecurringStumble, TopicStrength } from './types';

const TODAY = SPAN_DAYS;
const dayOf = (t: number): number => Math.floor(t / DAY_S);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface ScopeFilter {
  fromDay: number; // inclusive day-index since START (0 = START)
  toDay: number; // inclusive
  courseId: string | null;
}

/** Slice the log by [fromDay, toDay] window and (optional) course. */
export function scope(sts: Statement[], f: ScopeFilter): Statement[] {
  return sts.filter((x) => {
    const d = dayOf(x.t);
    if (d < f.fromDay || d > f.toDay) return false;
    if (f.courseId && x.courseId !== f.courseId) return false;
    return true;
  });
}

export interface SpanMonth {
  key: string;
  label: string; // "Th8/25"
  startDay: number;
  endDay: number;
}

/** The calendar months the data spans, oldest → newest, with day-index bounds. */
export function spanMonths(): SpanMonth[] {
  const out: SpanMonth[] = [];
  let d = new Date(START.getFullYear(), START.getMonth(), 1);
  const end = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  const dayIndex = (dt: Date) => Math.round((dt.getTime() - new Date(START.getFullYear(), START.getMonth(), START.getDate()).getTime()) / (DAY_S * 1000));
  while (d.getTime() <= end.getTime()) {
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const startDay = Math.max(0, dayIndex(d));
    const endDay = Math.min(TODAY, dayIndex(next) - 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `Th${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`, startDay, endDay });
    d = next;
  }
  return out;
}

function struggleOf(arr: Statement[]): number {
  let n = 0;
  for (const s of arr) {
    if (s.verb === 'seeked' && s.dir === 'back') n += 1;
    else if (s.verb === 'paused') n += 0.5;
    else if (s.verb === 'hinted') n += 0.8;
    else if (s.verb === 'abandoned') n += 1.5;
  }
  return n;
}

function longestStreak(sts: Statement[]): number {
  const days = [...new Set(sts.map((s) => dayOf(s.t)))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev = -99;
  for (const d of days) {
    run = d === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

// ---------- headline over the whole scope ----------
export function overviewStats(scoped: Statement[]): OverviewStats {
  const sess = sessionsOf(scoped);
  const focusHours = Math.round((sess.reduce((n, s) => n + focusSeconds(s), 0) / 3600) * 10) / 10;
  const activeDays = new Set(scoped.map((s) => dayOf(s.t))).size;
  const touched = [...new Set(scoped.map((s) => s.courseId))];
  const mastery = masteryByConcept(scoped);
  const coursesDone = touched.filter((cid) => {
    const cs = CONCEPTS_OF(cid);
    return cs.length > 0 && cs.every((c) => (mastery.get(c.id) ?? 0) >= 0.5);
  }).length;
  return {
    focusHours,
    coursesTouched: touched.length,
    coursesDone,
    activeDays,
    ahaCount: ahaMoments(scoped).length,
    longestStreak: longestStreak(scoped),
  };
}

// ---------- year rhythm (calendar heatmap) ----------
export function rhythm(scoped: Statement[], fromDay: number, toDay: number): HeatDay[] {
  const byDay = new Map<number, number>();
  for (const s of sessionsOf(scoped)) byDay.set(dayOf(s.start), (byDay.get(dayOf(s.start)) ?? 0) + focusSeconds(s) / 60);
  const out: HeatDay[] = [];
  for (let d = Math.max(0, fromDay); d <= toDay; d++) {
    out.push({ daysAgo: TODAY - d, minutes: Math.round(byDay.get(d) ?? 0) });
  }
  return out;
}

// ---------- progress over months (rising accuracy) ----------
export function masteryOverMonths(scoped: Statement[]): MonthPoint[] {
  const answers = scoped.filter((s) => s.verb === 'answered').sort((a, b) => a.t - b.t);
  if (answers.length === 0) return [];
  const focusByMonth = new Map<string, number>();
  for (const s of sessionsOf(scoped)) {
    const d = dateFromT(s.start);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    focusByMonth.set(key, (focusByMonth.get(key) ?? 0) + focusSeconds(s) / 60);
  }
  const months = [...new Set(answers.map((s) => { const d = dateFromT(s.t); return `${d.getFullYear()}-${d.getMonth()}`; }))];
  const nowKey = `${NOW.getFullYear()}-${NOW.getMonth()}`;
  const points: MonthPoint[] = [];
  let ema: number | null = null;
  for (const key of months) {
    if (key === nowKey) continue; // tháng này chưa xong nên chưa tính vào đường tiến bộ
    const monthAnswers = answers.filter((s) => { const d = dateFromT(s.t); return `${d.getFullYear()}-${d.getMonth()}` === key; });
    // skip months with too little data so a sparse point doesn't fake a dip
    if (monthAnswers.length < 5) continue;
    const raw = monthAnswers.filter((a) => a.correct).length / monthAnswers.length;
    ema = ema == null ? raw : ema * 0.5 + raw * 0.5;
    const monthNum = Number(key.split('-')[1]) + 1;
    points.push({ label: `Th${monthNum}`, mastery: clamp01(ema), minutes: Math.round(focusByMonth.get(key) ?? 0) });
  }
  return points;
}

// ---------- strength by topic ----------
export function topicStrength(scoped: Statement[]): TopicStrength[] {
  const mastery = masteryByConcept(scoped);
  const focusByCourse = new Map<string, number>();
  for (const s of sessionsOf(scoped)) focusByCourse.set(s.statements[0].courseId, (focusByCourse.get(s.statements[0].courseId) ?? 0) + focusSeconds(s) / 60);
  const touchedCourses = new Set(scoped.map((s) => s.courseId));
  const rows: TopicStrength[] = [];
  for (const t of TOPICS) {
    const courses = COURSES.filter((c) => c.topic === t.slug && touchedCourses.has(c.id));
    if (courses.length === 0) continue;
    const concepts = courses.flatMap((c) => CONCEPTS_OF(c.id)).filter((c) => mastery.has(c.id));
    if (concepts.length === 0) continue;
    const m = concepts.reduce((n, c) => n + (mastery.get(c.id) ?? 0), 0) / concepts.length;
    const minutes = courses.reduce((n, c) => n + (focusByCourse.get(c.id) ?? 0), 0);
    rows.push({ topic: t.slug, name: TOPIC_NAME[t.slug], mastery: clamp01(m), minutes: Math.round(minutes), courses: courses.length });
  }
  return rows.sort((a, b) => b.mastery - a.mastery);
}

// ---------- per-course table ----------
export function courseTable(scoped: Statement[]): CourseRow[] {
  const mastery = masteryByConcept(scoped);
  const byCourse = new Map<string, Statement[]>();
  for (const s of scoped) (byCourse.get(s.courseId) ?? byCourse.set(s.courseId, []).get(s.courseId)!).push(s);
  const focusByCourse = new Map<string, number>();
  for (const s of sessionsOf(scoped)) focusByCourse.set(s.statements[0].courseId, (focusByCourse.get(s.statements[0].courseId) ?? 0) + focusSeconds(s) / 60);
  const ahaByCourse = new Map<string, number>();
  for (const a of ahaMoments(scoped)) ahaByCourse.set(a.courseTitle, (ahaByCourse.get(a.courseTitle) ?? 0) + 1);

  const rows: CourseRow[] = [];
  for (const [cid, arr] of byCourse) {
    const course = COURSE_BY_ID[cid];
    if (!course) continue;
    const concepts = CONCEPTS_OF(cid);
    const passed = concepts.filter((c) => (mastery.get(c.id) ?? 0) >= 0.5).length;
    const touched = concepts.filter((c) => mastery.has(c.id));
    const m = touched.length ? touched.reduce((n, c) => n + (mastery.get(c.id) ?? 0), 0) / touched.length : 0;
    const lastActiveDaysAgo = TODAY - Math.max(...arr.map((s) => dayOf(s.t)));
    const progress = concepts.length ? passed / concepts.length : 0;
    const status: CourseRow['status'] = progress >= 0.99 ? 'done' : lastActiveDaysAgo <= 21 ? 'active' : 'paused';
    rows.push({
      id: cid,
      slug: course.slug,
      title: course.title,
      topic: course.topic,
      page: !!course.page,
      progress: clamp01(progress),
      mastery: clamp01(m),
      minutes: Math.round(focusByCourse.get(cid) ?? 0),
      ahaCount: ahaByCourse.get(course.title) ?? 0,
      status,
      lastActiveDaysAgo,
      conceptsTotal: concepts.length,
    });
  }
  const order: Record<CourseRow['status'], number> = { active: 0, paused: 1, done: 2 };
  return rows.sort((a, b) => order[a.status] - order[b.status] || a.lastActiveDaysAgo - b.lastActiveDaysAgo);
}

// ---------- recurring stumbles across courses ----------
export function recurringStumbles(scoped: Statement[]): RecurringStumble[] {
  const byConcept = new Map<string, Statement[]>();
  for (const s of scoped) if (s.concept) (byConcept.get(s.concept) ?? byConcept.set(s.concept, []).get(s.concept)!).push(s);
  const rows: RecurringStumble[] = [];
  for (const [cid, arr] of byConcept) {
    const score = struggleOf(arr);
    if (score < 2) continue;
    const c = CONCEPT_BY_ID[cid];
    const course = COURSE_BY_ID[c?.courseId ?? ''];
    if (!c || !course) continue;
    rows.push({ conceptLabel: c.label, courseTitle: course.title, topic: course.topic, score });
  }
  return rows.sort((a, b) => b.score - a.score).slice(0, 6);
}

// ---------- lessons of a course (for the course-scope view) ----------
export function lessonRows(scoped: Statement[], courseId: string): LessonRow[] {
  const mastery = masteryByConcept(scoped);
  const byConcept = new Map<string, Statement[]>();
  for (const s of scoped) if (s.concept) (byConcept.get(s.concept) ?? byConcept.set(s.concept, []).get(s.concept)!).push(s);
  return CONCEPTS_OF(courseId).map((c) => {
    const arr = byConcept.get(c.id) ?? [];
    return {
      conceptId: c.id,
      label: c.label,
      order: c.col,
      mastery: clamp01(mastery.get(c.id) ?? 0),
      watched: arr.some((s) => s.verb === 'completed'),
      struggle: struggleOf(arr),
    };
  });
}

/** the video id for a concept (a "bài" = one video + its quiz on that concept) */
export const videoIdOfConcept = (conceptId: string): string => `v:${conceptId}`;

/** the most-struggled concept within a scope (for a sensible default lesson pick) */
export function topStruggleConcept(scoped: Statement[]): string | null {
  const byConcept = new Map<string, Statement[]>();
  for (const s of scoped) if (s.concept && s.objectType === 'video') (byConcept.get(s.concept) ?? byConcept.set(s.concept, []).get(s.concept)!).push(s);
  let best: string | null = null;
  let bestScore = 0;
  for (const [cid, arr] of byConcept) {
    const sc = struggleOf(arr);
    if (sc > bestScore) { bestScore = sc; best = cid; }
  }
  return best;
}
