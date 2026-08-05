import { dateOf, TOPICS, type LearnerData, type TopicSlug } from '../mock/analytics';

export interface Win {
  from: number; // older bound (daysAgo, inclusive)
  to: number; // newer bound (daysAgo, inclusive, 0 = today)
  topic: TopicSlug | null;
}

export const windowDays = (w: Win): number => w.from - w.to + 1;

const topicsOf = (w: Win): TopicSlug[] => (w.topic ? [w.topic] : TOPICS.map((t) => t.slug));

export function sumMinutes(data: LearnerData, w: Win): number {
  let s = 0;
  for (const ts of topicsOf(w)) {
    const arr = data.dailyByTopic[ts];
    for (let d = w.to; d <= w.from; d++) s += arr[d] || 0;
  }
  return s;
}

export function activeDays(data: LearnerData, w: Win): number {
  let n = 0;
  for (let d = w.to; d <= w.from; d++) {
    const v = w.topic ? data.dailyByTopic[w.topic][d] || 0 : data.daily[d];
    if (v > 0) n += 1;
  }
  return n;
}

export function weeklyAvgMinutes(data: LearnerData, w: Win): number {
  return Math.round(sumMinutes(data, w) / Math.max(1, windowDays(w) / 7));
}

/** Consecutive days from today with any study (topic-agnostic). */
export function streak(data: LearnerData): number {
  let s = 0;
  for (let d = 0; d < data.daily.length; d++) {
    if (data.daily[d] > 0) s += 1;
    else break;
  }
  return s;
}

function sumSlice(arr: number[], a: number, b: number): number {
  let s = 0;
  for (let d = a; d <= b && d < arr.length; d++) s += arr[d];
  return s;
}

/** % change of last 7 days vs the previous 7 days. */
export function momentum(data: LearnerData, w: Win): number {
  const arr = w.topic ? data.dailyByTopic[w.topic] : data.daily;
  const last = sumSlice(arr, 0, 6);
  const prev = sumSlice(arr, 7, 13);
  if (prev === 0) return last > 0 ? 100 : 0;
  return Math.round(((last - prev) / prev) * 100);
}

export interface TopicShareRow {
  slug: TopicSlug;
  name: string;
  minutes: number;
  share: number;
}
export function topicShare(data: LearnerData, w: Win): TopicShareRow[] {
  const rows = TOPICS.map((t) => {
    const arr = data.dailyByTopic[t.slug];
    let m = 0;
    for (let d = w.to; d <= w.from; d++) m += arr[d] || 0;
    return { slug: t.slug, name: t.name, minutes: m };
  });
  const total = rows.reduce((n, r) => n + r.minutes, 0) || 1;
  return rows.map((r) => ({ ...r, share: Math.round((r.minutes / total) * 100) })).sort((a, b) => b.minutes - a.minutes);
}

export interface Bucket {
  label: string;
  values: number[]; // per topic, in TOPICS order
}
/** Buckets minutes across the window (weekly ≤ ~13 wks, else monthly), oldest→newest. */
export function minutesByBucket(data: LearnerData, w: Win): Bucket[] {
  const days = windowDays(w);
  const monthly = days > 92;
  const size = monthly ? 30 : 7;
  const nB = Math.max(1, Math.min(monthly ? 12 : 13, Math.ceil(days / size)));
  const slugs = TOPICS.map((t) => t.slug);
  const buckets: Bucket[] = [];
  for (let b = nB - 1; b >= 0; b--) {
    const startAgo = w.to + b * size;
    const endAgo = Math.min(w.from, startAgo + size - 1);
    const values = slugs.map((ts) => {
      let m = 0;
      for (let d = startAgo; d <= endAgo; d++) m += data.dailyByTopic[ts][d] || 0;
      return m;
    });
    const dt = dateOf(startAgo);
    const label = monthly ? `Th${dt.getMonth() + 1}` : `${dt.getDate()}/${dt.getMonth() + 1}`;
    buckets.push({ label, values });
  }
  return buckets;
}

/** Weeks (in window) whose minutes met the weekly goal, for the "đúng nhịp" reading. */
export function weeksOnGoal(data: LearnerData, w: Win, goal: number): { met: number; total: number } {
  const weekly = minutesByBucket(data, { ...w, topic: null });
  const wk = windowDays(w) > 92 ? null : weekly;
  const buckets = wk ?? minutesByBucket(data, w);
  const total = buckets.length;
  const met = buckets.filter((b) => b.values.reduce((n, v) => n + v, 0) >= goal).length;
  return { met, total };
}

export interface FilteredCourse {
  slug: string;
  title: string;
  topic: TopicSlug;
  level: string;
  status: LearnerData['courses'][number]['status'];
  progress: number;
  mastery: number;
  lessonsDone: number;
  lessonsTotal: number;
  lastActiveDaysAgo: number;
  page: boolean;
}
export function filterCourses(data: LearnerData, opts: { topic?: TopicSlug | null; status?: 'all' | 'active' | 'done' | 'paused'; search?: string }): FilteredCourse[] {
  const q = (opts.search || '').trim().toLowerCase();
  return data.courses.filter((c) => {
    if (opts.topic && c.topic !== opts.topic) return false;
    if (opts.status && opts.status !== 'all' && c.status !== opts.status) return false;
    if (q && !c.title.toLowerCase().includes(q)) return false;
    return true;
  });
}

/** Rough ETA to finish active courses at the current weekly pace. */
export function etaActiveCourses(data: LearnerData, w: Win): { daysLeft: number; label: string; remainingLessons: number } {
  const active = data.courses.filter((c) => c.status === 'active' && (!w.topic || c.topic === w.topic));
  const remainingLessons = active.reduce((n, c) => n + (c.lessonsTotal - c.lessonsDone), 0);
  const weekly = weeklyAvgMinutes(data, { ...w });
  const lessonsPerWeek = Math.max(0.5, weekly / 18); // ~18 min per lesson
  const weeksLeft = remainingLessons / lessonsPerWeek;
  const daysLeft = Math.round(weeksLeft * 7);
  const dt = dateOf(-daysLeft);
  const label = `${dt.getDate()}/${dt.getMonth() + 1}`;
  return { daysLeft, label, remainingLessons };
}
